import React from "react";
import Pbf from "pbf";
import { Quote } from "./proto/awesome";
import Order from "./components/Order/Order";
import Stress from "./components/Stress/Stress";

window.limits = {
  perSecond: 200,
  seconds: 60
};

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
    perSecond: localStorage.getItem("perSecond") || 10,
    seconds: localStorage.getItem("seconds") || 1,
    authorized: false,
    loading: false,
    socket: null,
    instruments: [],
    subscriptions: {},
    orders: {},
    stressEnabled: false
  };

  handleInputChange = (event, key) => {
    let { value } = event.target;

    if (key === "perSecond" && value > window.limits.perSecond)
      value = window.limits.perSecond;
    if (key === "seconds" && value > window.limits.seconds)
      value = window.limits.seconds;

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

      let { instruments, subscriptions, orders } = this.state;

      if (message.data === "1") return console.timeEnd("Ping-Pong");

      if (typeof message.data !== "string") {
        let pbf = new Pbf(message.data);

        data = Quote.read(pbf);

        const { instrumentId, bid, ask, time } = data;

        let sub = subscriptions[instrumentId];

        if (sub) {
          sub.instrumentId = instrumentId;
          sub.bid = bid;
          sub.ask = ask;
          sub.time = time;
        } else {
          orders[instrumentId] = {
            instrumentId,
            bid,
            ask,
            time
          };
        }
      } else {
        data = JSON.parse(message.data);
      }

      const { type } = data;

      let newSubscriptions = null;

      switch (type) {
        case 7: {
          instruments = data.instruments;
          break;
        }
        case 10: {
          newSubscriptions = {};

          data.s.sub[0].sym.forEach(el => {
            delete orders[el];

            if (!subscriptions[el]) {
              newSubscriptions[el] = {
                instrumentId: el
              };
            } else {
              newSubscriptions[el] = subscriptions[el];
            }
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
        instruments,
        subscriptions: newSubscriptions || subscriptions,
        orders
      }));
    };

    socket.onerror = error => {
      console.log(error);
    };

    socket.onclose = () => {
      this.setState({
        authorized: false,
        socket: null,
        subscriptions: {}
      });
    };
  };

  request = body => {
    const { socket } = this.state;
    socket.send(body);
  };

  handleInstrumentClick = ({ sym }) => {
    let { broker, account, subscriptions } = this.state;

    let subsObj = { ...subscriptions };
    let syms = [],
      hashCode;

    if (subsObj[sym]) {
      delete subsObj[sym];
    } else {
      subsObj[sym] = { ...defaultQuote };
    }

    Object.keys(subsObj).forEach(el => syms.push(el));

    this.setState(prevState => ({ ...prevState, subscriptions: subsObj }));

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

  handleStressTest = async () => {
    const { perSecond, seconds, instruments } = this.state;

    this.setState({ stressEnabled: true });

    const stress = sym => {
      return new Promise((res, rej) => {
        this.handleInstrumentClick({ sym });
        setTimeout(res, 1000 / +perSecond);
      });
    };

    for (let i = 0; i < +seconds; i++) {
      for (let j = 0; j < +perSecond; j++) {
        let randIndex = Math.floor(Math.random() * instruments.length);
        await stress(instruments[randIndex].sym);
      }
    }

    this.setState({ stressEnabled: false });
  };

  render() {
    var {
      authorized,
      loading,
      instruments,
      subscriptions,
      orders,
      perSecond,
      seconds,
      stressEnabled
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
            {instruments.length ? (
              <Stress
                enabled={stressEnabled}
                inputChange={this.handleInputChange}
                perSecond={perSecond}
                seconds={seconds}
                start={this.handleStressTest}
              />
            ) : null}
          </div>
        )}
        <div className="instruments">
          {instruments.map((el, i) => (
            <button
              className={subscriptions[el.sym] && "active"}
              key={i}
              onClick={() => this.handleInstrumentClick({ sym: el.sym })}
            >
              {el.sym}
            </button>
          ))}
        </div>

        <hr />
        {authorized && (
          <div className="body_wrap">
            <div className="trading_wrap">
              <div className="tr_item">
                <h2>Subscriptions:</h2>
                {Object.keys(subscriptions).map(key => (
                  <Order key={key} sub={subscriptions[key]} />
                ))}
              </div>
              <div className="tr_item orders">
                <h2>Orders:</h2>
                {Object.keys(orders).map(key => (
                  <Order key={key} sub={orders[key]} />
                ))}
              </div>
            </div>
          </div>
        )}
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
