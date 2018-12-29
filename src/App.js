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
    protoQuotes: null,
    instruments: [],
    consoleContainer: React.createRef(),
    markets: {},
    selectedInstruments: []
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
        throw new Error(e);
      }

      this.setState({ socket, loading: true });
    } else if (socket && authorized) {
      this.setState({ instruments: [], activeInstrument: null });
      socket.close();
    }
  };


  componentDidUpdate(prevProps, prevState) {
    console.timeEnd("time from getting data to render");
    const { consoleContainer } = this.state;

    if (consoleContainer.current) {
      consoleContainer.current.scrollTop =
        consoleContainer.current.scrollHeight;
    }

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
    let { socket, userId } = this.state;

    socket.onopen = () => {
      this.request(JSON.stringify({ user: { userId } }));
    };

    socket.onclose = event => {
     
      this.setState(prevState => ({
        ...prevState,
        authorized: false,
        socket: null,
        loading: false,
        order: null
      }));

    };

    socket.onmessage = async message => {

      console.time("time from getting data to render");

      let data;

      let {
        authorized,
        protoQuotes,
        instruments,
        currentMarket,
        markets
      } = this.state;

      if (typeof message.data !== "string") {
        var bytearray = new Uint8Array(message.data);
        data = protoQuotes.decode(bytearray);
        markets[data.instrumentId] = data;
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
        case 7: {
          instruments = data.instruments;
          break;
        }
        default: {
          break;
        }
      }

      if (!authorized) socket = null;

      this.setState(prevState => ({
        ...prevState,
        authorized,
        loading: false,
        socket,
        instruments,
        currentMarket,
        markets
      }));
    };

    socket.onerror = error => {
      this.setState(prevState => ({
        ...prevState,
        authorized: false,
        socket: null,
        loading: false
      }));
    };
  };

  request = body => {
    const { socket } = this.state;
    socket.send(body);
  };

  checkInstrument = ({ sym }) => {
    let { broker, account, markets } = this.state;

    let marketsObj = { ...markets };
    let syms = [];

    if (marketsObj[sym]) {
      delete marketsObj[sym];
    } else {
      marketsObj[sym] = {};
    }

    Object.keys(marketsObj).forEach(el => syms.push(el));

    this.setState({ markets: marketsObj });

    this.request(
      JSON.stringify({
        type: 1,
        sub: [{ rec: { brk: broker, acc: account }, sym: syms }]
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
    var { authorized, loading, instruments, markets } = this.state;
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
          </div>
        )}

        {instruments.map((el, i) => (
          <button className={markets[el.sym] && 'active'} key={i} onClick={() => this.checkInstrument({ sym: el.sym })}>
            {el.sym}
          </button>
        ))}

        <hr />

        <div className="body_wrap">
          <div className="trading_wrap">
            {Object.keys(markets).map(key => {
              return (
                <div key={key} className="trading">
                  <ul>
                    <li>
                      <b>instrument:</b> {markets[key].instrumentId}
                    </li>
                    <li>
                      <b>bid:</b> {markets[key].bid}, <b>ask:</b>{" "}
                      {markets[key].ask}
                    </li>
                    <li>
                      <b>time:</b> {markets[key].time}
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
