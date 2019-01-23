import { combineReducers } from "redux";
import socket from "./socket";
import market from "./market";

export default combineReducers({
  socket,
  market
});
