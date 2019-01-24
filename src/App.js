import React from "react";
import Order from "./components/Order/Order";
import Stress from "./components/Stress/Stress";
import Instruments from "./components/Instruments/Instruments";
import Input from "./components/UI/Input/Input";

import { connect } from "react-redux";
import { initSocket } from "./store/actions/socket";
import { fetchInstruments, setInstrument } from "./store/actions/market";

window.limits = {
  perSecond: 200,
  seconds: 60
};

class App extends React.Component {
  state = {
    storageUrl: localStorage.getItem("storageUrl") || "",
    userId: localStorage.getItem("userId") || "",
    broker: localStorage.getItem("broker") || "",
    account: localStorage.getItem("account") || "",
    perSecond: localStorage.getItem("perSecond") || 10,
    seconds: localStorage.getItem("seconds") || 1,
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
    const { storageUrl, userId } = this.state;
    this.props.initWebSocket(storageUrl.split("?")[0] + "?user=" + userId);
  };

  request = body => {
    const { socket } = this.state;
    socket.send(body);
  };

  handleInstrumentClick = sym => {
    const { broker, account } = this.state;
    this.props.setInstrument(sym, broker, account);
  };

  getInstruments = () => {
    const { broker, account } = this.state;
    this.props.fetchInstruments(broker, account);
  };

  handleStressTest = async () => {
    const { seconds, perSecond } = this.state;
    const { instruments } = this.props;

    this.setState({ stressEnabled: true });

    const stress = sym => {
      return new Promise((res, rej) => {
        this.handleInstrumentClick(sym);
        setTimeout(res, Math.floor(1000 / +perSecond));
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
    let { perSecond, seconds, stressEnabled } = this.state;

    let { authorized, loading, instruments, subscriptions } = this.props;

    return (
      <div>
        <div className="control">
          <>
            <Input
              label="Ендпоинт (ws[s]://...)"
              value={this.state.storageUrl}
              changeHangler={e => this.handleInputChange(e, "storageUrl")}
            />
            <Input
              label="Юзер"
              value={this.state.userId}
              changeHangler={e => this.handleInputChange(e, "userId")}
            />
          </>

          {authorized && (
            <div>
              <Input
                label="Брокер"
                value={this.state.broker}
                changeHangler={e => this.handleInputChange(e, "broker")}
              />
              <Input
                label="Аккаунт"
                value={this.state.account}
                changeHangler={e => this.handleInputChange(e, "account")}
              />
            </div>
          )}

          {loading ? (
            <span>Loading</span>
          ) : (
            !authorized && (
              <button type="button" onClick={this.handleConnectButtonClick}>
                Connect
              </button>
            )
          )}
        </div>

        {authorized && (
          <div>
            <button onClick={this.getInstruments}>Get Instruments</button>
            {instruments.length > 0 ? (
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

        <Instruments handleClick={this.handleInstrumentClick} />

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
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    loading: state.socket.loading,
    authorized: state.socket.authorized,
    instruments: state.market.instruments,
    subscriptions: state.market.subscriptions
  };
};

const mapDispatchToProps = dispatch => {
  return {
    initWebSocket: url => dispatch(initSocket(url)),
    fetchInstruments: (broker, account) =>
      dispatch(fetchInstruments(broker, account)),
    setInstrument: (sym, broker, account) =>
      dispatch(setInstrument(sym, broker, account))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
