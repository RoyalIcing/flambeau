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

export function subscribe(callback) {
  return flambeau.subscribe(callback);
}

export function get(id) {
  return flambeau.get(id);
}
