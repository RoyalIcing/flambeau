import { GET_INITIAL_STATE } from './types';

/**
 * Attach multiple reducers, with ids as keys and reducer function sets as values.
 *
 * @param  {Object} reducers An object mapping identifiers to reducer function sets
 * @param  {Object} idToProps    (Optional) the unique attributes for each particular reducer
 */
export default function({ reducers, idToProps = {} }) {
  let resources = {};
  let states = {};

  Object.keys(reducers).forEach(id => {
    const reducer = reducers[id];
    const props = idToProps[id];

    resources[id] = { reducer, props };
    states[id] = reducer[GET_INITIAL_STATE](props);
  });

  return { resources, states };
}
