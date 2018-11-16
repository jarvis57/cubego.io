import {combineReducers} from "redux";
import {CubegonActions} from "../actions/cubegon";


export const info = (state={}, action) => {
  switch (action.type) {
    case CubegonActions.LOAD_CUBEGON_INFO.success.key:
      return {
        ...state,
        [action.gonId]: action.response
      };
    default:
      return state;
  }
};

export const cubegon = combineReducers({
  info,
});