import createResourcesFromReducers from './createResourcesFromReducers';
import dispatch from './dispatch';
import getConsensus from './getConsensus';
import callAction from './callAction';
import { ACTION_TYPE, INTROSPECTION_TYPE } from './types';
import connectActionSets from './connectActionSets';


export default class Flambeau {
  /**
   * Creates a new Flambeau store
   */
  constructor() {
    this.listeners = [];
  }

  /**
   * Attach reducers, with ids as keys, and reducer function sets as values.
   *
   * @param  {Object} idToReducers An object mapping identifiers to reducer function sets
   * @param  {Object} idToProps    (Optional) the unique attributes for each particular reducer
   */
  setReducers(idToReducers, idToProps = {}) {
    const { resources, states } = createResourcesFromReducers({
      reducers: idToReducers,
      idToProps
    });

    this.resources = resources;
    this.states = states;
  }

  /**
   * Get multiple actions sets, connected to this store ready to dispatch to the reducers.
   *
   * @param  {Object} actionSets An object mapping action set identifiers to action functions
   * @return {Object}            The action set identifiers to connected action function sets.
   */
  connectActionSets(actionSets) {
    return connectActionSets({
      actionSets,
      dispatch: (action) => {
        const changesStates = dispatch({
          resources: this.resources,
          states: this.states
        })(action);

        this.states = Object.assign({}, this.states, changesStates);

        this.listeners.forEach(callback => {
          callback(changesStates);
        });
      },
      getConsensusForActionSet: getConsensus({
        resources: this.resources,
        getStates: () => this.states
      })
    });
  }

  /**
   * Get the state for a particular reducer.
   *
   * @param  {String} id The unique identifier for a particular reducer
   * @return {Any}    The state value of the reducer at the current time
   */
  get(id) {
    if (typeof id === 'undefined') {
      return this.states;
    }
    else if (typeof id === 'string') {
      return this.states[id];
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
