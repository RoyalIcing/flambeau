import callAction from './callAction';
import { INTROSPECTION_TYPE } from './types';
import notFoundValue from './notFoundValue';

export default ({ resources, states }) => ({ actionSetID }) => ({ introspectionID, payload, combine }) => {
  if (combine.booleanOr) {
    combine = (combined, current) => {
      return combined || current;
    };
  }
  else if (combine.booleanAnd) {
    combine = (combined, current) => {
      return combined && current;
    };
  }

  const combinedValue = Object.keys(resources).reduce((combinedValue, resourceID, i) => {
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

    // If reducer implements this introspection method
    if (currentValue !== notFoundValue) {
      // If combined value has not been set
      if (combinedValue === notFoundValue) {
        combinedValue = currentValue;
      }
      // If combinedValue has been set, ask it to be combined with the current value
      else {
        return combine(combinedValue, currentValue);
      }
    }

    return combinedValue;
  }, notFoundValue);

  if (combinedValue !== notFoundValue) {
    return combinedValue;
  }
}
