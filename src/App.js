import React from "react";
import Pbf from "pbf";
import { Quote } from "./proto/awesome";

const defaultQuote = {
  instrumentId: 0,
  bid: 0,
  ask: 0,
  time: 0
};

class App extends React.Component {
  state = {
    storageUrl: localStorage.getItem("storageUrl") || "",
    userId: localStorage.getItem("userId") || "",
    broker: localStorage.getItem("broker") || "",
    account: localStorage.getItem("account") || "",
    authorized: false,
    loading: false,
    socket: null,
    instruments: [],
    markets: {}
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
      this.setState({ instruments: [], socket: null });

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
      this.setState({
        authorized: true
      });
    };

    socket.onmessage = async message => {
      let data;

      let { instruments, currentMarket, markets } = this.state;

      if (message.data === "1") return console.timeEnd("Ping-Pong");

      if (typeof message.data !== "string") {
        let pbf = new Pbf(message.data);

        data = Quote.read(pbf);

        const { instrumentId, bid, ask, time } = data;

        let market = markets[instrumentId];

        if (!market) {
          market = {};
          markets[instrumentId] = market;
        }

        market.instrumentId = instrumentId;
        market.bid = bid;
        market.ask = ask;
        market.time = time;
        
      } else {
        data = JSON.parse(message.data);
      }

      const { type } = data;

      switch (type) {
        case 7: {
          instruments = data.instruments;
          break;
        }
        case 10: {
          data.s.sub[0].sym.forEach(el => {
            markets[el] = {
              instrumentId: el
            };
          });
          break;
        }
        default: {
          break;
        }
      }

      this.setState(prevState => ({
        ...prevState,
        loading: false,
        socket,
        instruments,
        currentMarket,
        markets
      }));
    };

    socket.onerror = error => {
      console.log(error);
    };

    socket.onclose = () => {
      this.setState({
        authorized: false,
        socket: null,
        markets: {}
      })
    }
  };

  request = body => {
    const { socket } = this.state;
    socket.send(body);
  };

  handleInstrumentClick = ({ sym }) => {
    let { broker, account, markets } = this.state;

    let marketsObj = { ...markets };
    let syms = [],
      hashCode;

    if (marketsObj[sym]) {
      delete marketsObj[sym];
    } else {
      marketsObj[sym] = { ...defaultQuote };
    }

    Object.keys(marketsObj).forEach(el => syms.push(el));

    this.setState({ markets: marketsObj });

    hashCode = stringToHash(broker + "&" + account + "&" + syms);

    this.request(
      JSON.stringify({
        type: 1,
        s: {
          sub: [{ rec: { b: broker, a: account }, sym: syms }],
          hash: hashCode
        }
      })
    );
  };

  getInstruments = () => {
    const { broker, account, socket } = this.state;

    socket.send(JSON.stringify({ type: 2, rec: { b: broker, a: account } }));
  };

  pingPong = () => {
    const { socket } = this.state;
    console.time("Ping-Pong");
    socket.send("0");
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
            <button onClick={this.pingPong}>Ping-Pong</button>
          </div>
        )}

        {instruments.map((el, i) => (
          <button
            className={markets[el.sym] && "active"}
            key={i}
            onClick={() => this.handleInstrumentClick({ sym: el.sym })}
          >
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

function stringToHash(str) {
  var hash = 5381,
    i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  return hash >>> 0;
}

export default App;
