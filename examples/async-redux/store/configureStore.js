import { createStore, applyMiddleware } from 'redux';
import loggerMiddleware from 'redux-logger';
import { createRootReducer, connectActionSetsToStore } from 'flambeau/redux';
import actionSets from '../actions';
import reducers from '../reducers';


const createStoreWithMiddleware = applyMiddleware(
  loggerMiddleware
)(createStore);

export default function configureStore(initialState) {
  const idToProps = {
    selectedReddit: {
      defaultReddit: 'reactjs'
    }
  };

  const rootReducer = createRootReducer({ reducers, idToProps });
  const store = createStoreWithMiddleware(rootReducer, initialState);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const reducers = require('../reducers');
      store.replaceReducer(createRootReducer({ reducers, idToProps }));
    });
  }

  const connectedActionSets = connectActionSetsToStore({ actionSets, store });

  return {
    store,
    connectedActionSets
  };
}
