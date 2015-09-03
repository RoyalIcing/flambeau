import * as posts from './posts';


export function getInitialState() {
  return {};
}

export function PostsActions(state, { isAction, isIntrospection, actionID, payload, forwardTo }) {
  if (isAction) {
    return Object.assign({}, state, {
      [payload.reddit]: forwardTo(posts, state[payload.reddit] || posts.getInitialState())
    });
  }
  else if (isIntrospection) {
    return shouldFetchPosts(state, payload);
  }
}

function shouldFetchPosts(state, { reddit }) {
  const posts = state.postsByReddit[reddit];
  if (!posts) {
    return true;
  } else if (posts.isFetching) {
    return false;
  } else {
    return posts.didInvalidate;
  }
}
