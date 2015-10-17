import createResourcesFromReducers from './createResourcesFromReducers';
import dispatch from './dispatch';
import getConsensus from './getConsensus';
import connectActionSets from './connectActionSets';

const FLAMBEAU_ACTION_TYPE = 'flambeau';

export function createRootReducer({ reducers, idToProps }) {
  const { resources, states } = createResourcesFromReducers({ reducers, idToProps });
  const initialState = Object.assign(states, {
    _resources: resources
  });

  return (state = initialState, action) => {
    if (action.type === FLAMBEAU_ACTION_TYPE && action.actionSetID && action.actionID && action.payload) {
      const changedStates = dispatch({ resources: state._resources, states: state })(action);

      return Object.assign({}, state, changedStates);
    }

    return state;
  }
}

export function connectActionSetsToStore({ actionSets, store }) {
  return connectActionSets({
    actionSets,
    dispatch: (payload) => {
      return store.dispatch(
        Object.assign({
          type: FLAMBEAU_ACTION_TYPE
        }, payload)
      );
    },
    getConsensusForActionSet: (actionSetID) => {
      return getConsensus({
        resources: store.getState()._resources,
        getStates: store.getState
      })(actionSetID);
    }
  });
}
