import callAction from './callAction';
import { INTROSPECTION_TYPE } from './types';
import notFoundValue from './notFoundValue';

function consensusForReducerResults(allResults) {
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

export default ({ resources, getStates }) => (actionSetID) => (introspectionID) => (payload = {}) => {
  const states = getStates();
  const allResults = Object.keys(resources).reduce((allResults, resourceID) => {
    const { reducer, props } = resources[resourceID];

    const currentValue = callAction({
      responder: reducer,
      type: INTROSPECTION_TYPE,
      initialState: states[resourceID],
      props,
      actionID: introspectionID,
      actionSetID,
      payload,
      notFoundValue
    });

    if (currentValue !== notFoundValue) {
      allResults.push(currentValue);
    }

    return allResults;
  }, []);

  return consensusForReducerResults(allResults);
}
