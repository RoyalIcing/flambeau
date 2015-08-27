import Flambeau from 'flambeau';
import reducers from './reducers';
import actions from './actions';


const flambeau = new Flambeau();

// REDUCERS
flambeau.attachReducers(reducers, {
  selectedReddit: {
    defaultReddit: 'reactjs'
  }
});

// ACTIONS
export const connectedActions = flambeau.registerAndConnectActionSets(actions);

export function subscribe(id) {
  return flambeau.subscribe(id);
}

export function get(id) {
  return flambeau.get(id);
}

export function getGraph() {
  return flambeau.graph;
}
