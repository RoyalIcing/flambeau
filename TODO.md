## Allow reducers to emit custom events

Events are global, are not stored anywhere only transmitted, and listened to by
those who wish to subscribe.

```javascript
export const events = {
  blockCannotJoinWithPrevious({ index })
};


export function joinBlockWithPrevious(state, { index }, { emit }) {
  if (index === 0) {
    emit.blockCannotJoinWithPrevious({ index });
  }

  // ...
}
```

## Declarative way to combine reducers?

```javascript
export default {
  combine: {
    byId,
    visibleIds
  },
  alsoAdd: (combined) => ({

  })
};
```
