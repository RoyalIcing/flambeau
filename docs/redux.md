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

Here is an example of integrating Redux with Flambeau:

```javascript
import { createStore, applyMiddleware } from 'redux';
import { createRootReducer, connectActionSetsToStore } from 'flambeau/redux';
import actionSets from '../actions';
import reducers, { idToProps } from '../reducers';

const createStoreWithMiddleware = applyMiddleware(
  // All your favorite Redux middleware
)(createStore);

const rootReducer = createRootReducer({ reducers, idToProps });
export const store = createStoreWithMiddleware(rootReducer, initialState);
export const connectedActionSets = connectActionSetsToStore({ actionSets, store });
```

It is expected that `actions` and `reducers` would be directories exporting all
action sets and reducers, like the following:

```javascript
// actions/index.js

import * as TodoItemActions from './TodoItemActions';
import * as TodoListActions from './TodoListActions';

export default {
  TodoItemActions,
  TodoListActions
};
```

```javascript
// reducers/index.js

import * as TodoListReducer from './TodoListReducer';

export default {
  list: TodoListReducer
};

export const idToProps = {
  list: {
    initialItems: [
      {
        text: 'Read Flambeau documentation',
        isCompleted: true
      }
    ]
  }
}
```

---

For any questions or suggestions for Flambeau, please
[file an issue](https://github.com/BurntCaramel/flambeau/issues) or email me
(found at my [GitHub profile](https://github.com/BurntCaramel)).
