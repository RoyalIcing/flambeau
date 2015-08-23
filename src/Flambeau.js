
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

  subscribe(callback) {
    this.listeners.push(callback);

    return () => {
      this.listeners.splice(this.listeners.indexOf(callback), 1);
    };
  }

  subscribeTo(id, callback) {
    this.subscribe((idChanged) => {
      if (id == idChanged) {
        callback();
      }
    });
  }

  dispatch({ actionSetID, actionID, payload }) {
    let idsChanged = [];

    Object.keys(this.resources).forEach(id => {
      const resource = this.resources[id];

      const result = callAction({
        responder: resource.reducer,
        type: ACTION_TYPE,
        initialValue: this.graph.get(id),
        context: resource.context,
        payload,
        notFoundValue,
        actionSetID,
        actionID
      });

      if (result !== notFoundValue) {
        this.graph = this.graph.set(id, result);
        idsChanged.push(id);
      }
    });

    idsChanged.forEach(id => {
      this.listeners.forEach((callback) => {
        callback(id);
      });
    });
  }

  registerActionSets(actionSets) {
    Object.keys(actionSets).forEach(actionSetID => {
      this.actionSetIDsToActionFunctions[actionSetID] = actionSets[actionSetID];
    });
  }

  getConnectedActionSet(actionSetID) {
    const sourceActionFunctions = this.actionSetIDsToActionFunctions[actionSetID];
    let connectedActionFunctions = {};

    Object.keys(sourceActionFunctions).forEach(actionID => {
      const sourceActionFunction = sourceActionFunctions[actionID];

      connectedActionFunctions[actionID] = (payload) => {
        // Synchronous, immediately dispatched
        if (sourceActionFunction.length <= 1) {
          payload = sourceActionFunction(payload);
          this.dispatch({ actionSetID, actionID, payload });
        }
        // Asychronous, delegates the dispatching
        else {
          const dispatch = ({ payload, actionSetID = actionSetID, actionID }) => {
            this.dispatch({ actionSetID, actionID, payload });
          }

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
                initialValue: this.graph.get(id),
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

          sourceActionFunction(payload, { dispatch, getConsensus });
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

  get(id) {
    return this.graph.get(id);
  }
}
