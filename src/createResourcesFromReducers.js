/**
 * Attach multiple reducers, with ids as keys and reducer function sets as values.
 *
 * @param  {Object} reducers An object mapping identifiers to reducer function sets
 * @param  {Object} idToProps    (Optional) the unique attributes for each particular reducer
 */
export default function({ reducers, idToProps }) {
  let resources = {};
  let states = {};

  Object.keys(reducers).forEach(id => {
    const resource = {
      reducer: reducers[id],
      props: idToProps[id]
    };

    resources[id] = resource;
    states[id] = resource.reducer.getInitialState(resource.props);
  });

  return { resources, states };
}
