/**
 * A very simple object graph
 */
export default class SimpleGraphController {
  constructor() {
    this._idToState = {};
  }

  setUp(id, { state }) {
    this._idToState[id] = state;

    return this;
  }

  get(id) {
    if (typeof id === 'undefined') {
      return this._idToState;
    }
    else {
      return this._idToState[id];
    }
  }

  set(id, state) {
    this._idToState[id] = state;

    return this;
  }
}
