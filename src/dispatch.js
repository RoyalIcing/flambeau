import callAction from './callAction';
import notFoundValue from './notFoundValue';
import { ACTION_TYPE } from './types';

export default ({ resources, states }) => ({ actionSetID, actionID, payload }) => {
  let changedStates = {};

  Object.keys(resources).forEach(resourceID => {
    const { reducer, props } = resources[resourceID];

    const result = callAction({
      responder: reducer,
      type: ACTION_TYPE,
      initialState: states[resourceID],
      props,
      payload,
      notFoundValue,
      actionSetID,
      actionID
    });

    if (result !== notFoundValue) {
      changedStates[resourceID] = result;
    }
  });

  return changedStates;
}
