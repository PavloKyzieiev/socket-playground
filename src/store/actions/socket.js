import * as actionTypes from "./actionTypes";

export function initSocket(socketUrl) {
  return dispatch => {
    dispatch(initSocketStart());

    let socket = new WebSocket(socketUrl);
    socket.binaryType = "arraybuffer";

    socket.onerror = error => {
      dispatch(initSocketError(error));
    };

    socket.onopen = () => {
      dispatch(initSocketSuccess());
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
