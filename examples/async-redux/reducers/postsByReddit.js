import * as posts from './posts';


export function getInitialState() {
  return {};
}

export function PostsActions(state, { isAction, isIntrospection, actionID, payload, forwardTo }) {
  if (isAction) {
    return Object.assign({}, state, {
      [payload.reddit]: forwardTo({ responder: posts, initialState: state[payload.reddit] || posts.getInitialState() })
    });
  }
  else if (isIntrospection) {
    return forwardTo({ responder: posts, initialState: state[payload.reddit] || posts.getInitialState() });
  }
}
