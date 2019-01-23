import React from "react";
import { connect } from "react-redux";

const instruments = props => {
  const { instruments, subscriptions, handleClick } = props;
  return (
    <div className="instruments">
      {instruments.map((el, i) => (
        <button
          className={subscriptions[el.sym] && "active"}
          key={i}
          onClick={() => handleClick(el.sym)}
        >
          {el.sym}
        </button>
      ))}
    </div>
  );
};

const mapStateToProps = state => {
  return {
    subscriptions: state.market.subscriptions,
    instruments: state.market.instruments
  };
};

export default connect(mapStateToProps)(instruments);
