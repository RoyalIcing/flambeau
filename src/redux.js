import createResourcesFromReducers from './createResourcesFromReducers';
import dispatch from './dispatch';
import getConsensus from './getConsensus';
import connectActionSets from './connectActionSets';
import { FLAMBEAU_ACTION_TYPE } from './types';

export function createRootReducer({ reducers, idToProps }) {
  const { resources, states } = createResourcesFromReducers({ reducers, idToProps });
  const initialState = Object.assign(states, {
    _resources: resources
  });

  return (state = initialState, action) => {
    if (action.type === FLAMBEAU_ACTION_TYPE && action.actionSetID && action.actionID && action.payload) {
      const changedStates = dispatch({ resources, states: state })(action);

      return Object.assign({}, state, changedStates);
    }

    return state;
  };
}

export function connectActionSetsToStore({ actionSets, store: { dispatch, getState } }) {
  return connectActionSets({
    actionSets,
    dispatch,
    getConsensusForActionSet: (actionSetID) => {
      return getConsensus({
        resources: getState()._resources,
        getStates: getState
      })(actionSetID);
    }
  });
}
