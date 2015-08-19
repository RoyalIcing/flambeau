/**
 * Designed to be compatible with Immutable.js
 */
export default class SimpleGraphController {
  constructor() {
    this.graph = {};
  }

  get(id) {
    return graph[id];
  }

  set(id, value) {
    this.graph[id] = value;

    return this;
  }
}
