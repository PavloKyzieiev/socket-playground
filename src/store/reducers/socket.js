import * as actionTypes from "../actions/actionTypes";

const initialState = {
  authorized: false,
  loading: false,
  socket: null,
  error: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SOCKET_CONNECT_START: {
      return {
        ...state,
        loading: true
      };
    }
    case actionTypes.SOCKET_CONNECT_SUCCESS: {
      return {
        ...state,
        loading: false,
        authorized: true,
        socket: action.socket
      };
    }
    case actionTypes.SOCKET_CONNECT_ERROR: {
      return {
        ...state,
        loading: false,
        error: action.error
      };
    }
    default: {
      return state;
    }
  }
};
