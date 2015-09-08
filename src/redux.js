import createResourcesFromReducers from './createResourcesFromReducers';
import dispatch from './dispatch';
import getConsensus from './getConsensus';
import connectActionSets from './getConsensus';


export function createRootReducer({ reducers, idToProps }) {
  const { resources, states } = createResourcesFromReducers({ reducers, idToProps });

  return (whole = { resources, states }, action) => {
    if (action.actionSetID && action.actionID && action.payload) {
      const changedStates = dispatch(whole)(action);

      return Object.assign({}, whole, {
        states: Object.assign({}, whole.states, changedStates)
      });
    }

    return whole;
  }
}

export function connectActionSetsToStore({ actionSets, store }) {
  return connectActionSets({
    actionSets,
    dispatch(payload) {
      store.dispatch(payload);
    },
    getConsensus() {
      return getConsensus(store.getState()).apply(null, arguments);
    }
  });
}
