import * as actionTypes from "../actions/actionTypes";

const initialState = {
  loading: false,
  instruments: [],
  orders: {},
  subscriptions: {}
};

export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_SUBSCRIPTIONS: {
      return {
        ...state,
        subscriptions: action.subscriptions
      };
    }
    case actionTypes.FETCH_INSTRUMENTS_START: {
      return {
        ...state,
        loading: true
      };
    }
    case actionTypes.FETCH_INSTRUMENTS_SUCCESS: {
      return {
        ...state,
        instruments: action.instruments,
        loading: false
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
