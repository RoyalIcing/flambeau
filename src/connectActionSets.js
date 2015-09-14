import { INTROSPECTION_TYPE } from './types';

/**
 * Get a set of actions, connected to this store ready to dispatch to the reducers.
 *
 * @param  {String} actionSetID The unique identifier for the action set
 * @return {Object}             The connected action functions
 */
function getConnectedActionSet({ actionSet, actionSetID, getAllConnectedActionSets, dispatch, getConsensus }) {
  let connectedActionSet = {};

  Object.keys(actionSet).forEach(actionID => {
    if (actionID === INTROSPECTION_TYPE) {
      return;
    }

    const sourceActionFunction = actionSet[actionID];

    connectedActionSet[actionID] = (payload) => {
      // Synchronous, immediately dispatched
      if (sourceActionFunction.length <= 1) {
        const result = sourceActionFunction(payload);
        // Allow empty action declarations
        if (typeof result !== 'undefined') {
          payload = result;
        }
        dispatch({ actionSetID, actionID, payload });
      }
      // Asychronous, delegates the dispatching
      else {
        sourceActionFunction(payload, {
          currentActionSet: connectedActionSet,
          allActionSets: getAllConnectedActionSets(),
          getConsensus
        });
      }
    };
  });

  return connectedActionSet;
}

/**
 * Get multiple actions sets, connected to this store ready to dispatch to the reducers.
 *
 * @param  {Array} actionSetIDs The unique identifiers of the action sets.
 * @return {Object}             The action set identifiers to connected action function sets.
 */
export default function connectActionSets({ actionSets, dispatch, getConsensusForActionSet }) {
  return Object.keys(actionSets).reduce((connectedActionSets, actionSetID) => {
    connectedActionSets[actionSetID] = getConnectedActionSet({
      actionSet: actionSets[actionSetID],
      actionSetID,
      getAllConnectedActionSets() {
        return connectedActionSets
      },
      dispatch,
      getConsensus: getConsensusForActionSet({ actionSetID })
    });

    return connectedActionSets;
  }, {});
}