
import findActionResponder from './findActionResponder';
import SimpleGraphController from './SimpleGraphController';


export default class Flambeau {
  constructor(graphController = new SimpleGraphController()) {
    this.resources = {};
    this.graphController = graphController;
    this.actionSetIDsToActionFunctions = {};
    this.listeners = [];
  }

  attachReducer(id, reducer, context) {
    this.resources[id] = {
      reducer,
      context
    };

    this.graphController.set = this.graphController.set(id, reducer.new(context));
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

  dispatch(actionSetID, actionID, actionPayload) {
    let idsChanged = [];

    function callActionResponder(actionResponder, initialValue, context) {
      return actionResponder(initialValue, actionPayload, context);
    }

    for (let id of Object.keys(this.resources)) {
      const resource = this.resources[id];

      const actionResponder = findActionResponder(resource.reducer, actionSetID, actionID, callActionResponder);
      if (actionResponder) {
        const initialValue = this.graphController.get(id);
        const newValue = callActionResponder(actionResponder, initialValue, resource.context);
        this.graphController = this.graphController.set(id, newValue);

        idsChanged.push(id);
      }
    }

    for (let id of idsChanged) {
      this.listeners.forEach((callback) => {
        callback(id);
      });
    }
  }

  registerActionSets(actionSets) {
    for (let actionSetID of Object.keys(actionSets)) {
      this.actionSetIDsToActionFunctions[actionSetID] = actionSets[actionSetID];
    }
  }

  getConnectedActionSet(actionSetID) {
    const sourceActionFunctions = this.actionSetIDsToActionFunctions[actionSetID];
    let connectedActionFunctions = {};

    for (let actionID of Object.keys(sourceActionFunctions) {
      connectedActionFunctions[actionID] = (actionPayload) => {
        this.dispatch(actionSetID, actionID, actionPayload);
      };
    }

    return connectedActionFunctions;
  }

  getConnectedActionSets(actionSetIDs) {
    let connectedActionSets = {};

    for (let actionSetID of Object.keys(actionSets)) {
      connectedActionSets[actionSetID] = this.getConnectedActionSet(actionSetID);
    }

    return connectedActionSets;
  }

  get(id) {
    this.graphController.get(id);
  }
}
