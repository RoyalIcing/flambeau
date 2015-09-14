import createResourcesFromReducers from './createResourcesFromReducers';
import dispatch from './dispatch';
import getConsensus from './getConsensus';
import connectActionSets from './connectActionSets';


export function createRootReducer({ reducers, idToProps }) {
  const { resources, states } = createResourcesFromReducers({ reducers, idToProps });
  const initialState = Object.assign(states, {
    _resources: resources
  });

  return (state = initialState, action) => {
    if (action.actionSetID && action.actionID && action.payload) {
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
      store.dispatch(
        Object.assign({
          type: 'flambeau'
        }, payload)
      );
    },
    getConsensusForActionSet: ({ actionSetID }) => {
      const state = store.getState();
      return getConsensus({
        resources: state._resources,
        states: state
      })({ actionSetID });
    }
  });
}
