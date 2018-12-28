import React from "react";

import protobuf from "protobufjs";

class App extends React.Component {
  state = {
    storageUrl: localStorage.getItem("storageUrl") || "",
    userId: localStorage.getItem("userId") || "",
    broker: localStorage.getItem("broker") || "",
    account: localStorage.getItem("account") || "",
    authorized: false,
    loading: false,
    socket: null,
    consoleData: [],
    protoQuotes: null
  };

  handleInputChange = (event, key) => {
    const { value } = event.target;
    localStorage.setItem(key, value);
    this.setState({ [key]: value });
  };

  handleConnectButtonClick = () => {
    const { authorized, storageUrl, userId } = this.state;
    let { socket } = this.state;
    if (!authorized) {
      try {
        socket = new WebSocket(storageUrl.split("?")[0] + "?user=" + userId);
        socket.binaryType = "arraybuffer";
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
    console.timeEnd("Buff")
    if (!prevState.socket && this.state.socket) {
      this.initWebSocket();
    }
  }

  componentDidMount() {
    protobuf.load("/proto/awesome.proto").then(root => {
      var protoQuotes = root.lookupType("protobuf.quotes.Quote");

      this.setState(prevState => ({
        ...prevState,
        protoQuotes
      }));
    });
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

    socket.onmessage = async message => {
      let data;

      let { authorized, protoQuotes } = this.state;

      if (typeof message.data !== "string") {
        console.time("Buff")
        var bytearray = new Uint8Array(message.data);
        data = protoQuotes.decode(bytearray);
      } else {
        data = JSON.parse(message.data);
      }

      const { type } = data;

      switch (type) {
        case 0: {
          authorized = true;
          break;
        }
        case 1: {
          authorized = false;
          break;
        }
        default: {
          break;
        }
      }

      if (!authorized) socket = null;

      this.setState(prevState => ({
        ...prevState,
        consoleData: [JSON.stringify(data)],
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

  subscribe = ({ brokerId }) => {
    if (brokerId === "default") brokerId = 666;

    this.request(
      JSON.stringify({
        type: 1,
        sub: [{ rec: { brk: brokerId, acc: 666 }, sym: ["EURUSD", "USDJPY"] }]
      })
    );
  };

  unsubscribe = ({ brokerId }) => {
    if (brokerId === "default") brokerId = 666;

    this.request(
      JSON.stringify({
        type: 1,
        sub: [{ rec: { brk: brokerId, acc: 666 }, sym: [] }]
      })
    );
  };

  getInstruments = () => {
    const { broker, account, socket } = this.state;
    socket.send(
      JSON.stringify({ type: 2, rec: { brk: broker, acc: account } })
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
          <div>
            <div className="form-group">
              <label>Ендпоинт (ws[s]://...)</label>
              <input
                value={this.state.storageUrl}
                onChange={e => this.handleInputChange(e, "storageUrl")}
              />
            </div>
            <div className="form-group">
              <label>Юзер</label>
              <input
                value={this.state.userId}
                onChange={e => this.handleInputChange(e, "userId")}
              />
            </div>
          </div>
          {authorized && (
            <div>
              <div className="form-group">
                <label>Брокер</label>
                <input
                  value={this.state.broker}
                  onChange={e => this.handleInputChange(e, "broker")}
                />
              </div>
              <div className="form-group">
                <label>Аккаунт</label>
                <input
                  value={this.state.account}
                  onChange={e => this.handleInputChange(e, "account")}
                />
              </div>
            </div>
          )}

          {button}
        </div>

        {authorized && (
          <div>
            <button onClick={this.getInstruments}>Get Instruments</button>
            <button onClick={() => this.subscribe({brokerId: "default"})}>Subscribe</button>
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
