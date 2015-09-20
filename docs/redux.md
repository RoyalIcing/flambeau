# Redux Support

Flambeau is built to be composable, in a style inspired from Redux.

Because Flambeau’s action creators and reducers are declarative, you don’t need
to import Flambeau into their files. The only thing you need to import is
'flambeau/redux' into your Redux store.

Two functions are provided:
- `createRootReducer({ reducers, idToProps })`: Creates a Redux compatible
reducer. Pass your props, mapping the reducer ID to specific props.
- `connectActionSetsToStore()`: Connects your action sets to the Redux store. It
is recommended that you export this object, to be used within your controller
components (in React).

```javascript
import { createStore, applyMiddleware } from 'redux';
import { createRootReducer, connectActionSetsToStore } from 'flambeau/redux';
import actionSets from '../actions';
import reducers from '../reducers';

const createStoreWithMiddleware = applyMiddleware(
  // All your favorite redux middleware
)(createStore);

const rootReducer = createRootReducer({ reducers, idToProps: {} });
export const store = createStoreWithMiddleware(rootReducer, initialState);
export const connectedActionSets = connectActionSetsToStore({ actionSets, store });
```
