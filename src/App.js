import React from "react";

class App extends React.Component {
  state = {
    storageUrl: localStorage.getItem("storageUrl") || "",
    authorized: false,
    loading: false,
    socket: null,
    consoleData: []
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
    let { socket } = this.state;

    socket.onopen = () => {
      this.setState(prevState => ({
        ...prevState,
        consoleData: [...prevState.consoleData, "Соединение установлено."]
      }));

      this.request(JSON.stringify({ user: { userId: 666 } }));
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
      const { type } = JSON.parse(message.data);

      let { authorized } = this.state;

      switch (type) {
        case 0: {
          authorized = true;
          break;
        }
        case 1: {
          authorized = false;
          break;
        }

        default:
          break;
      }

      if (!authorized) socket = null;

      this.setState(prevState => ({
        ...prevState,
        consoleData: [
          ...prevState.consoleData,
          "response ->   " + message.data
        ],
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

  request = body => {
    const { socket } = this.state;
    socket.send(body);
    this.setState(prevState => ({
      ...prevState,
      consoleData: [...prevState.consoleData, "request ->   " + body]
    }));
  };

  subscribe = brokerId => {
    if (brokerId === "default") brokerId = 666;

    this.request(
      JSON.stringify({
        type: 1,
        sub: [{ rec: { brk: brokerId, acc: 666 }, sym: ["EURUSD", "USDJPY"] }]
      })
    );
  };

  render() {
    var { authorized, consoleData, loading } = this.state;
    const button = loading ? (
      <span>Loading</span>
    ) : (
      <button type="button" onClick={this.handleConnectButtonClick}>
        {authorized ? "Disconnect" : "Connect"}
      </button>
    );
    return (
      <div>
        <div className="control">
          <div className="form-group">
            <label>Ендпоинт (ws[s]://...)</label>
            <input
              value={this.state.storageUrl}
              onChange={e => this.handleInputChange(e, "storageUrl")}
            />
          </div>

          {button}
        </div>

        {authorized && (
          <div>
            <button onClick={() => this.subscribe("default")}>Subscribe</button>
          </div>
        )}

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
