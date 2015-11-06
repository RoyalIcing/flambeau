import callAction from './callAction';
import { INTROSPECTION_TYPE } from './types';
import notFoundValue from './notFoundValue';

export function consensusForResults(allResults) {
  return {
    some(callback = Boolean) {
      return allResults.some(callback);
    },

    every(callback = Boolean) {
      return allResults.every(callback);
    },

    reduce(callback, initialValue) {
      if (allResults.length === 0 && (typeof initialValue === 'undefined')) {
        // Do not allow TypeError to be thrown.
        return;
      }

      return allResults.reduce(callback, initialValue);
    },

    singleton() {
      if (allResults.length === 1) {
        return allResults[0];
      }
      else {
        throw (
          "`.singleton()` requires that only one reducer responds to this introspection method. "
          + `${allResults.length} actually responded.`
        );
      }
    },

    toArray() {
      return allResults
    }
  };
}

export default ({ responder, props, state, actionSetID, introspectionID, payload = {} }) => {
  let allResults = callAction({
    responder,
    type: INTROSPECTION_TYPE,
    initialState: state,
    props,
    actionID: introspectionID,
    actionSetID,
    payload,
    notFoundValue: []
  });

  // Ensure is an array
  allResults = [].concat(allResults);
  
  return consensusForResults(allResults);
}
