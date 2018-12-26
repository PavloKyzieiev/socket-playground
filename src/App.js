import React from "react";

class App extends React.Component {
  state = {
    storageUrl: localStorage.getItem("storageUrl") || "",
    authToken: localStorage.getItem("authToken") || "",
    authorized: false,
    loading: false,
    socket: null,
    consoleData: [],
    instruments: [],
    activeInstrument: null
  };

  handleInputChange = (event, key) => {
    const { value } = event.target;
    localStorage.setItem(key, value);
    this.setState({ [key]: value });
  };

  handleConnectButtonClick = () => {
    const { authorized, storageUrl } = this.state;
    let { socket } = this.state;
    if (!authorized) {

      try {
        socket = new WebSocket(storageUrl);
      } catch (e) {
        return this.setState({ consoleData: [e.message] });
      }

      this.setState({ socket, loading: true });
    } else if (socket && authorized) {
      this.setState({ instruments: [], activeInstrument: null });
      socket.close();
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.socket && this.state.socket) {
      this.initWebSocket();
    }
  }

  initWebSocket = () => {
    let { socket, authToken } = this.state;

    socket.onopen = () => {
      this.setState(prevState => ({
        ...prevState,
        consoleData: [...prevState.consoleData, "Соединение установлено."]
      }));

      socket.send(JSON.stringify({ name: "auth", authToken }));
    };

    socket.onclose = event => {
      let reason = "";

      if (event.wasClean) {
        reason = "Соединение закрыто";
      } else {
        reason = "Обрыв соединения";
      }

      this.setState(prevState => ({
        ...prevState,
        consoleData: [...prevState.consoleData, reason],
        authorized: false,
        socket: null,
        loading: false,
        order: null
      }));
    };

    socket.onmessage = message => {
      const { name, status, instruments, order } = JSON.parse(message.data);

      let { authorized } = this.state;

      switch (name) {
        case "authRequest": {
          if (status === "OK") {
            authorized = true;
            socket.send(JSON.stringify({ name: "instruments" }));
          } else {
            authorized = false;
          }
          break;
        }
        case "instruments": {
          if (status === "OK") {
            this.setState(prevState => ({ ...prevState, instruments }));
          }
          break;
        }
        case "order": {
          if (status === "OK") {
            this.setState(prevState => ({ ...prevState, order }));
          }
          break;
        }

        default:
          break;
      }

      if (!authorized) socket = null;

      this.setState(prevState => ({
        ...prevState,
        consoleData: [...prevState.consoleData, message.data],
        authorized,
        loading: false,
        socket
      }));
    };

    socket.onerror = error => {
      this.setState(prevState => ({
        ...prevState,
        consoleData: [...prevState.consoleData, "Ошибка " + error.message],
        authorized: false,
        socket: null,
        loading: false
      }));
    };
  };

  subscribe = brokerId => {
    const { socket, activeInstrument } = this.state;
    if (activeInstrument !== brokerId) {
      socket.send(JSON.stringify({ name: "subscribe", brokerId }));
      this.setState({ activeInstrument: brokerId });
    }
  };

  render() {
    var {
      authorized,
      consoleData,
      loading,
      instruments,
      activeInstrument
    } = this.state;
    const button = loading ? (
      <span>Loading</span>
    ) : (
      <button type="button" onClick={this.handleConnectButtonClick}>
        {authorized ? "Disconnect" : "Connect"}
      </button>
    );
    return (
      <div>

        <div className="form-group">
          <label>Ендпоінт (ws[s]://...)</label>
          <input
            value={this.state.storageUrl}
            onChange={e => this.handleInputChange(e, "storageUrl")}
          />
        </div>
        
        <div className="form-group">
          <label>Токен</label>
          <input
            value={this.state.authToken}
            onChange={e => this.handleInputChange(e, "authToken")}
          />
        </div>
        {button}

        {instruments.length ? (
          <div className="instruments">
            {instruments.map((el, index) => (
              <button
                key={index}
                className={activeInstrument === el.id ? "active" : ""}
                onClick={() => this.subscribe(el.id)}
              >
                {el.name}
              </button>
            ))}
          </div>
        ) : null}

        {consoleData.length ? (
          <div className="console-wrap">
            <button onClick={() => this.setState({ consoleData: [] })}>
              Clear
            </button>
            {consoleData.map((el, index) => (
              <p className="console" key={index}>
                {el}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
}

export default App;
