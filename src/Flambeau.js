
import callAction from './callAction';
import { ACTION_TYPE, INTROSPECTION_TYPE } from './types';
import SimpleGraphController from './SimpleGraphController';

const notFoundValue = {};


export default class Flambeau {
  constructor(graph = new SimpleGraphController()) {
    this.resources = {};
    this.graph = graph;
    this.actionSetIDsToActionFunctions = {};
    this.listeners = [];
  }

  attachReducer(id, reducer, context) {
    this.resources[id] = {
      reducer,
      context
    };

    this.graph = this.graph.setUp(id, {
      state: reducer.getInitialState(context)
    });
  }

  attachReducers(idToReducers, idToContexts = {}) {
    Object.keys(idToReducers).forEach(id => {
      this.attachReducer(id, idToReducers[id], idToContexts[id]);
    });
  }

  dispatch({ actionSetID, actionID, payload }) {
    let idsChanged = {};

    Object.keys(this.resources).forEach(resourceID => {
      const resource = this.resources[resourceID];

      const result = callAction({
        responder: resource.reducer,
        type: ACTION_TYPE,
        initialValue: this.graph.get(resourceID),
        context: resource.context,
        payload,
        notFoundValue,
        actionSetID,
        actionID
      });

      if (result !== notFoundValue) {
        this.graph = this.graph.set(resourceID, result);
        idsChanged[resourceID] = true;
      }
    });

    this.listeners.forEach((callback) => {
      callback(idsChanged);
    });
  }

  registerActionSets(actionSets) {
    Object.keys(actionSets).forEach(actionSetID => {
      this.actionSetIDsToActionFunctions[actionSetID] = actionSets[actionSetID];
    });

    delete this.allConnectedActionSets;
  }

  getConnectedActionSet(actionSetID) {
    const sourceActionFunctions = this.actionSetIDsToActionFunctions[actionSetID];
    let connectedActionFunctions = {};

    Object.keys(sourceActionFunctions).forEach(actionID => {
      const sourceActionFunction = sourceActionFunctions[actionID];

      connectedActionFunctions[actionID] = (payload) => {
        // Synchronous, immediately dispatched
        if (sourceActionFunction.length <= 1) {
          const result = sourceActionFunction(payload);
          // Allow empty action declarations
          if (typeof result !== 'undefined') {
            payload = result;
          }
          this.dispatch({ actionSetID, actionID, payload });
        }
        // Asychronous, delegates the dispatching
        else {
          const defaultActionSetID = actionSetID;
          const dispatch = ({ actionSetID = defaultActionSetID, actionID, payload }) => {
            this.dispatch({ actionSetID, actionID, payload });
          }

          const allActionSets = this.getAllConnectedActionSets();
          const currentActionSet = allActionSets[actionSetID];

          const getConsensus = ({ viewpointID, payload, combine, booleanOr = false, booleanAnd = false }) => {
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

            return Object.keys(this.resources).reduce((combinedValue, resourceID, i) => {
              const resource = this.resources[resourceID];
              let currentValue = callAction({
                responder: resource.reducer,
                type: INTROSPECTION_TYPE,
                initialValue: this.graph.get(resourceID),
                defaultValue: notFoundValue,
                context: resource.context,
                actionID: viewpointID,
                actionSetID,
                payload,
                notFoundValue
              });

              if (i === 0) {
                combinedValue = currentValue;
              }
              else {
                combinedValue = combine(combinedValue, currentValue);
              }

              return combinedValue;
            }, undefined);
          }

          sourceActionFunction(payload, { dispatch, currentActionSet, allActionSets, getConsensus });
        }
      };
    });

    return connectedActionFunctions;
  }

  getConnectedActionSets(actionSetIDs) {
    return actionSetIDs.reduce((connectedActionSets, actionSetID) => {
      connectedActionSets[actionSetID] = this.getConnectedActionSet(actionSetID);
      return connectedActionSets;
    }, {});
  }

  getAllConnectedActionSets() {
    if (this.allConnectedActionSets) {
      return this.allConnectedActionSets;
    }
    else {
      this.allConnectedActionSets = this.getConnectedActionSets(Object.keys(this.actionSetIDsToActionFunctions));
      return this.allConnectedActionSets;
    }
  }

  registerAndConnectActionSets(actionSets) {
    this.registerActionSets(actionSets);
    return this.getConnectedActionSets(Object.keys(actionSets));
  }

  get(id) {
    if (typeof id === 'undefined') {
      return this.graph.get();
    }
    else if (typeof id === 'string') {
      return this.graph.get(id);
    }
    else {
      let idToState = {};
      Object.keys(id).forEach(id => {
        idToState[id] = this.graph.get(id);
      });
      return idToState;
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);

    return () => {
      this.listeners.splice(this.listeners.indexOf(callback), 1);
    };
  }
}
