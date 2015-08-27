export function getInitialState() {
  return {
    isFetching: false,
    didInvalidate: false,
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
  }
}
