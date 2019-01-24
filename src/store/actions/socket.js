import Pbf from "pbf";
import { Quote } from "../../proto/awesome";
import { deepClone } from "../../utils/objects";

import * as actionTypes from "./actionTypes";

import { fetchInstrumentsSuccess, setSubscriptions } from "./market";

export function initSocket(socketUrl) {
  return (dispatch, getState) => {
    dispatch(initSocketStart());

    let socket = new WebSocket(socketUrl);

    socket.binaryType = "arraybuffer";

    socket.onerror = error => {
      dispatch(initSocketError(error));
    };

    socket.onopen = () => {
      dispatch(initSocketSuccess(socket));
    };

    socket.onmessage = message => {
      let data;
      let { subscriptions } = getState().market;

      let subscriptionsObj = null;

      if (typeof message.data !== "string") {
        let pbf = new Pbf(message.data);

        data = Quote.read(pbf);

        const { instrumentId, bid, ask, time } = data;

        subscriptionsObj = deepClone(subscriptions);

        if (!subscriptionsObj[instrumentId])
          subscriptionsObj[instrumentId] = {
            instrumentId
          };

        let sub = subscriptionsObj[instrumentId];

        if (sub) {
          sub.instrumentId = instrumentId;
          sub.bid = bid;
          sub.ask = ask;
          sub.time = time;
        }

        dispatch(setSubscriptions(subscriptionsObj));
      } else {
        data = JSON.parse(message.data);
      }

      const { type } = data;

      switch (type) {
        case 7: {
          return dispatch(fetchInstrumentsSuccess(data.instruments));
        }
        default: {
          break;
        }
      }
    };
  };
}

function initSocketStart() {
  return {
    type: actionTypes.SOCKET_CONNECT_START
  };
}

function initSocketSuccess(socket) {
  return {
    type: actionTypes.SOCKET_CONNECT_SUCCESS,
    socket
  };
}

function initSocketError(error) {
  return {
    type: actionTypes.SOCKET_CONNECT_ERROR,
    error
  };
}
