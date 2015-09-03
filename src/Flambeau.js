
import callAction from './callAction';
import { ACTION_TYPE, INTROSPECTION_TYPE } from './types';
import SimpleGraphController from './SimpleGraphController';

const notFoundValue = {};


export default class Flambeau {
  /**
   * Creates a new Flambeau store
   * @param  {graph controller} graph The object graph that reducers are attached to.
   */
  constructor(graph = new SimpleGraphController()) {
    this.resources = {};
    this.graph = graph;
    this.actionSetIDsToActionFunctions = {};
    this.listeners = [];
  }

  /**
   * Attach a set of reducer functions.
   *
   * @param  {String} id      The unique identifier for this particular reducer
   * @param  {Object} reducer The set of reducer functions, most likely made using `import * as ...`
   * @param  {Object} props   The unique attributes to customize the reducer
   */
  attachReducer(id, reducer, props) {
    this.resources[id] = {
      reducer,
      props
    };

    this.graph = this.graph.setUp(id, {
      state: reducer.getInitialState(props)
    });
  }

  /**
   * Attach multiple reducers, with ids as keys, and reducer function sets as values.
   *
   * @param  {Object} idToReducers An object mapping identifiers to reducer function sets
   * @param  {Object} idToProps    (Optional) the unique attributes for each particular reducer
   */
  attachReducers(idToReducers, idToProps = {}) {
    Object.keys(idToReducers).forEach(id => {
      this.attachReducer(id, idToReducers[id], idToProps[id]);
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
        props: resource.props,
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

  /**
   * Add actions that will be connected to reducers.
   *
   * @param  {Object} actionSets An object mapping action set identifiers to action functions
   */
  registerActionSets(actionSets) {
    Object.keys(actionSets).forEach(actionSetID => {
      this.actionSetIDsToActionFunctions[actionSetID] = actionSets[actionSetID];
    });

    delete this.allConnectedActionSets;
  }

  /**
   * Get a set of actions, connected to this store ready to dispatch to the reducers.
   *
   * @param  {String} actionSetID The unique identifier for the action set
   * @return {Object}             The connected action functions
   */
  getConnectedActionSet(actionSetID) {
    const sourceActionFunctions = this.actionSetIDsToActionFunctions[actionSetID];
    let connectedActionFunctions = {};

    Object.keys(sourceActionFunctions).forEach(actionID => {
      if (actionID === 'introspection') {
        return;
      }

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
                props: resource.props,
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

          sourceActionFunction(payload, { currentActionSet, allActionSets, getConsensus });
        }
      };
    });

    return connectedActionFunctions;
  }

  /**
   * Get multiple actions sets, connected to this store ready to dispatch to the reducers.
   *
   * @param  {Array} actionSetIDs The unique identifiers of the action sets.
   * @return {Object}             The action set identifiers to connected action function sets.
   */
  getConnectedActionSets(actionSetIDs) {
    return actionSetIDs.reduce((connectedActionSets, actionSetID) => {
      connectedActionSets[actionSetID] = this.getConnectedActionSet(actionSetID);
      return connectedActionSets;
    }, {});
  }

  /**
   * Get all known action sets, connected to this store.
   *
   * @return {Object} The action set identifiers to action function sets.
   */
  getAllConnectedActionSets() {
    if (this.allConnectedActionSets) {
      return this.allConnectedActionSets;
    }
    else {
      this.allConnectedActionSets = this.getConnectedActionSets(Object.keys(this.actionSetIDsToActionFunctions));
      return this.allConnectedActionSets;
    }
  }

  /**
   * Convenience method to register and connect action sets in one go.
   *
   * @param  {Object} actionSets An object mapping action set identifiers to action functions
   * @return {Object}            The action set identifiers to connected action function sets.
   */
  registerAndConnectActionSets(actionSets) {
    this.registerActionSets(actionSets);
    return this.getConnectedActionSets(Object.keys(actionSets));
  }

  /**
   * Get the state for a particular reducer.
   *
   * @param  {String} id The unique identifier for a particular reducer
   * @return {Any}    The state value of the reducer at the current time
   */
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

  /**
   * Subscribe to reducer updates.
   *
   * @param  {Function} callback A function accepting an array of changed reducer identifiers
   * @return {Function}          A function used to unsubscribe when finished
   */
  subscribe(callback) {
    this.listeners.push(callback);

    return () => {
      this.listeners.splice(this.listeners.indexOf(callback), 1);
    };
  }
}
