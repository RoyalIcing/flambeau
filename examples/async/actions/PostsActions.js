import fetch from 'isomorphic-fetch';


export function invalidateReddit({ reddit }) {}

export function requestPosts({ reddit }) {}

export function receivePosts({ reddit, json }) {
  return {
    reddit,
    posts: json.data.children.map(child => child.data),
    receivedAt: Date.now()
  };
}

function fetchPosts({ reddit }, { currentActionSet }) {
  currentActionSet.requestPosts({ reddit });

  fetch(`http://www.reddit.com/r/${reddit}.json`)
    .then(response => response.json())
    .then(json => currentActionSet.receivePosts({ reddit, json }))
  ;
}

export const introspection = {
  shouldFetchPosts({ reddit }) {}
}

export function fetchPostsIfNeeded({ reddit }, { currentActionSet, getConsensus }) {
  if (getConsensus({
    introspectionID: 'shouldFetchPosts',
    payload: { reddit },
    combine: { booleanOr: true }
  })) {
    fetchPosts({ reddit }, { currentActionSet });
  }
}
