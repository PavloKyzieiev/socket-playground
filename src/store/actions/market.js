import * as actionTypes from "./actionTypes";

import { deepClone } from "../../utils/objects";
import { stringToHash } from "../../utils/strings";

const defaultQuote = {
  instrumentId: 0,
  bid: 0,
  ask: 0,
  time: 0
};

export function fetchInstruments(broker, account) {
  return (dispatch, getState) => {
    const { socket } = getState().socket;
    dispatch(fetchInstrumentsStart());
    socket.send(JSON.stringify({ type: 2, rec: { b: broker, a: account } }));
  };
}

export function setInstrument(sym, broker, account) {
  return (dispatch, getState) => {
    let state = getState();
    let { subscriptions } = state.market;
    let { socket } = state.socket;

    let subsObj = deepClone(subscriptions);
    let syms = [],
      hashCode;

    if (subsObj[sym]) {
      delete subsObj[sym];
    } else {
      subsObj[sym] = { ...defaultQuote };
      subsObj[sym].instrumentId = sym;
    }

    Object.keys(subsObj).forEach(el => syms.push(el));

    dispatch(setSubscriptions(subsObj));

    hashCode = stringToHash(broker + "&" + account + "&" + syms);

    socket.send(
      JSON.stringify({
        type: 1,
        s: {
          rec: { b: broker, a: account },
          sym: syms,
          hash: hashCode
        }
      })
    );
  };
}

function fetchInstrumentsStart() {
  return {
    type: actionTypes.FETCH_INSTRUMENTS_START
  };
}

export function fetchInstrumentsSuccess(instruments) {
  return {
    type: actionTypes.FETCH_INSTRUMENTS_SUCCESS,
    instruments
  };
}

export function setSubscriptions(subscriptions) {
  return {
    type: actionTypes.SET_SUBSCRIPTIONS,
    subscriptions
  };
}
