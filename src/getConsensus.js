import callAction from './callAction';
import { INTROSPECTION_TYPE } from './types';
import notFoundValue from './notFoundValue';

export default ({ resources, states }) => ({ introspectionID, payload, combine, booleanOr = false, booleanAnd = false }) => {
  if (booleanOr) {
    combine = (combined, current) => {
      return combined || current;
    };
  }
  else if (booleanAnd) {
    combine = (combined, current) => {
      return combined && current;
    };
  }

  const combinedValue = Object.keys(resources).reduce((combinedValue, resourceID, i) => {
    const { reducer, props } = resources[resourceID];

    const currentValue = callAction({
      responder: reducer,
      type: INTROSPECTION_TYPE,
      initialValue: states[resourceID],
      props,
      actionID: introspectionID,
      actionSetID,
      payload,
      notFoundValue
    });

    if (currentValue !== notFoundValue) {
      if (combinedValue === notFoundValue) {
        return currentValue;
      }
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
