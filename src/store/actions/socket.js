import Pbf from "pbf";
import { Quote } from "../../proto/awesome";
import { deepClone } from "../../utils/objects";

import * as actionTypes from "./actionTypes";

import { fetchInstrumentsSuccess, setSubscriptions, setOrders } from "./market";

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
      let { subscriptions, orders } = getState().market;
      let ordersObj = null;
      let newSubscriptions = null;
      let subscriptionsObj = null;

      if (typeof message.data !== "string") {

        let pbf = new Pbf(message.data);

        data = Quote.read(pbf);

        const { instrumentId, bid, ask, time } = data;

        subscriptionsObj = deepClone(subscriptions);
        let sub = subscriptionsObj[instrumentId];

        if (sub) {
          sub.instrumentId = instrumentId;
          sub.bid = bid;
          sub.ask = ask;
          sub.time = time;
        } else {
          ordersObj = deepClone(orders);
          ordersObj[instrumentId] = {
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

      switch (type) {
        case 7: {
          return dispatch(fetchInstrumentsSuccess(data.instruments));
        }
        case 10: {
          newSubscriptions = {};

          data.s.sub[0].sym.forEach(el => {
            if (!ordersObj) ordersObj = deepClone(orders);

            delete ordersObj[el];

            if (!subscriptions[el]) {
              newSubscriptions[el] = {
                instrumentId: el
              };
            } else {
              if (!subscriptionsObj)
                subscriptionsObj = deepClone(subscriptions);

              newSubscriptions[el] = subscriptionsObj[el];
            }
          });

          break;
        }
        default: {
          break;
        }
      }

      if (newSubscriptions) dispatch(setSubscriptions(newSubscriptions));
      if (ordersObj) dispatch(setOrders(ordersObj));
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
