# Reducers

## Props

Reducers in Flambeau are differentiated from the standard Redux reducer by a
number of modest features. One of these is the addition of props for reducers.

These props allow both the initial state and the state transformation during an
action to be customized. Like React’s props, their use is encouraged to enable
reducers to be less hard-coded and more reusable.

## Initial State

The initial state in Flambeau is determined by a declaration of the exported
function `getInitialState`. The props are passed as the first argument.

```javascript
export function getInitialState({ initialTodos = [] }) {
  return initialTodos;
}
```

## Implementing Action Responders

Responding to actions is done in a similar manner to action creators: by
declaring functions. The name of the function mirrors that of the action
creator. The functions are declared in a vanilla JavaScript object, named the
same as the action set.

The only difference from action creators is the current state is passed as the
first argument.

```javascript
export const TodoActions = {
  addTodo(state, { text }) {
    return state.concat({ text });
  }
}
```

## Composing

Reducers can be easily composed within each other. This allows you to break your
reducers into multiple pieces.

Forwarding actions is possible, especially easily done in bulk per action set.
To forward an action, declare an action set as a function instead of an object.
When an action from this set is dispatched, this function will be called with
the following parameters.
- `type`
- `actionID`
- `payload`
- `props`
- `forwardTo()`
