export default class SimpleGraphController {
  constructor() {
    this._idToState = {};
    //this.introspection = {};
  }

  setUp(id, { state/*, introspection*/ }) {
    this._idToState[id] = state;

    /*for (introspectionID of Object.keys(introspection)) {
      this.introspection[introspectionID] = (payload) => {
        // Pass store’s current state along
        introspection[introspectionID](this.get(id), payload);
      );
    }*/

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
