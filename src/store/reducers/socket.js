import * as actionTypes from "../actions/actionTypes";

const initialState = {
  authorized: false,
  loading: false,
  error: null,
  instruments: [],
  orders: {},
  subscriptions: {}
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
        authorized: true
      };
    }
    case actionTypes.SOCKET_CONNECT_ERROR: {
      return {
        ...state,
        loading: false,
        error: action.error
      };
    }
    case actionTypes.SET_INSTRUMENTS: {
      return {
        ...state,
        instruments: action.instruments
      };
    }
    case actionTypes.SET_ORDERS: {
      return {
        ...state,
        orders: action.orders
      };
    }
    default: {
      return state;
    }
  }
};
