## Improve getConsensus API

```javascript
export function fetchPostsIfNeeded({ reddit }, { currentActionSet, getConsensus }) {
  if (getConsensus(currentActionSet.introspection.shouldFetchPosts, {
    payload: { reddit },
    booleanOr: true
  })) {
    fetchPosts({ reddit }, { currentActionSet });
  };
}
```

```javascript
export function fetchPostsIfNeeded({ reddit }, { currentActionSet }) {
  if (currentActionSet.getConsensus.shouldFetchPosts({ reddit }, { booleanOr: true })) {
    fetchPosts({ reddit }, { currentActionSet });
  };
}
```

```javascript
export function fetchPostsIfNeeded({ reddit }, { currentActionSet }) {
  if (currentActionSet.getConsensus.shouldFetchPosts({ reddit }, (combined = false, current) => { combined || current })) {
    fetchPosts({ reddit }, { currentActionSet });
  };
}
```
