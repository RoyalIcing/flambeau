export function getInitialState() {
  return {
    isFetching: false,
    didInvalidate: true,
    items: []
  };
}

export const PostsActions = {
  invalidateReddit(state, { reddit }) {
    return Object.assign({}, state, {
      didInvalidate: true
    });
  },

  requestPosts(state, { reddit }) {
    return Object.assign({}, state, {
      isFetching: true,
      didInvalidate: false
    });
  },

  receivePosts(state, { reddit, posts, receivedAt }) {
    return Object.assign({}, state, {
      isFetching: false,
      didInvalidate: false,
      items: posts,
      lastUpdated: receivedAt
    });
  },

  introspection: {
    shouldFetchPosts(state, { reddit }) {
      if (!state) {
        return true;
      } else if (state.isFetching) {
        return false;
      } else {
        return state.didInvalidate;
      }
    }
  }
}
