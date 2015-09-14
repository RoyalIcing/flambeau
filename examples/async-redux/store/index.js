import configureStore from './configureStore';

const { store, connectedActionSets } = configureStore();

export { store as store }
export { connectedActionSets as connectedActionSets }
