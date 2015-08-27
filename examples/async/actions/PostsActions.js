import fetch from 'isomorphic-fetch';


export function invalidateReddit({ reddit }) {
  return arguments[0];
}

function requestPosts({ reddit }) {
  return arguments[0];
}

function receivePosts({ reddit, json }) {
  return {
    reddit,
    posts: json.data.children.map(child => child.data),
    receivedAt: Date.now()
  };
}

function fetchPosts({ reddit }, { dispatch }) {
  dispatch({
    actionID: 'requestPosts',
    payload: requestPosts({ reddit })
  });

  fetch(`http://www.reddit.com/r/${reddit}.json`)
    .then(response => response.json())
    .then(json => dispatch({
      actionID: 'receivePosts',
      payload: receivePosts({ reddit, json })
    }));
}

export const introspection = {
  shouldFetchPosts({ reddit }) {
    return arguments[0];
  }
}

export function fetchPostsIfNeeded({ reddit }, { dispatch, getConsensus }) {
  if (getConsensus({
    introspectionID: 'shouldFetchPosts',
    payload: { reddit },
    booleanOr: true
  })) {
    //currentActionSet.fetchPosts({ reddit });

    fetchPosts({ reddit }, { dispatch });
  };
}
