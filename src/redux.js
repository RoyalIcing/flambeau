import createResourcesFromReducers from './createResourcesFromReducers';
import combineReducers from './combineReducers';
import callAction from './callAction';
import getConsensus from './getConsensus';
import connectActionSets from './connectActionSets';
import { ACTION_TYPE, INTROSPECTION_TYPE } from './types';

const GET_CONSENSUS_TYPE = 'flambeau-consensus';
let latestConsensus;

export function createRootReducer({ reducers, idToProps }) {
  const reducer = combineReducers(reducers, { getPropsByID: () => idToProps });

  return (state = reducer.getInitialState(), action) => {
    if (action.type === ACTION_TYPE) {
      return callAction({
        responder: reducer,
        type: ACTION_TYPE,
        initialState: state,
        notFoundValue: state,
        payload: action.payload,
        actionSetID: action.actionSetID,
        actionID: action.actionID
      });
    }
    else if (action.type === GET_CONSENSUS_TYPE) {
      latestConsensus = getConsensus({
        responder: reducer,
        props: {},
        state: action.state,
        actionSetID: action.actionSetID,
        introspectionID: action.introspectionID,
        payload: action.payload
      });
    }

    return state;
  };
}

export function connectActionSetsToStore({ actionSets, store: { dispatch, getState } }) {
  return connectActionSets({
    actionSets,
    dispatch,
    getConsensusForActionSet: (actionSetID) => (introspectionID) => (payload = {}) => {
      dispatch({ type: GET_CONSENSUS_TYPE, actionSetID, introspectionID, payload, state: getState() });
      return latestConsensus;
      //return getState()._consensus;
    }
  });
}
