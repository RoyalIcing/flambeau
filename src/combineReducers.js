import { GET_INITIAL_STATE } from './types';


/**
 * Combines several Flambeau reducers into one, taking care of introspection
 *
 * @param  {Object} reducers                The reducers to be combined together, using the keys to inform the state’s structure
 * @param  {-> Object} getPropsByID(props)  A function returning the props for each individual reducer. It is passed the combined reducer’s props.
 * @return {Flambeau Reducer}               A new reducer combining those that were passed
 */
export default function combineReducers(reducers, { getPropsByID = () => ({}), alsoAdd } = {}) {
	let alsoResponder;
	const reducerIDs = Object.keys(reducers);

	let combinedReducer = {
		[GET_INITIAL_STATE]: (masterProps) => {
			const propsByID = getPropsByID(masterProps);
			return reducerIDs.reduce((state, reducerID) => {
				const reducer = reducers[reducerID];
				if (reducer[GET_INITIAL_STATE]) {
					state[reducerID] = reducer[GET_INITIAL_STATE](propsByID[reducerID]);
				}
				return state;
			}, {});
		}
	};

	const actionSetHandlers = reducerIDs.reduce((actionSetHandlers, reducerID) => {
		const reducer = reducers[reducerID];
		Object.keys(reducer).reduce((actionSetHandlers, property) => {
			if (property === GET_INITIAL_STATE || !!actionSetHandlers[property]) {
				return actionSetHandlers;
			}

			actionSetHandlers[property] = (initialState, { isAction, isIntrospection, props, forwardTo }) => {
        function forwardToReducerWithID(reducerID) {
          return forwardTo({
            responder: reducers[reducerID],
            initialState: initialState[reducerID],
            props: propsByID[reducerID]
          });
        }

        function forwardToAlsoResponder(initialState) {
          return forwardTo({
            responder: alsoResponder,
            initialState,
            props,
            sourceResponder: combinedReducer
          });
        }

				const propsByID = getPropsByID(props);
				if (isAction) {
					let newState = reducerIDs.reduce((state, reducerID) => {
						state[reducerID] = forwardToReducerWithID(reducerID);
						return state;
					}, {});

					if (alsoResponder) {
            newState = forwardToAlsoResponder(newState);
					}

					return newState;
				}
				else if (isIntrospection) {
					if (alsoResponder) {
						// Use customized response, if one was given.
						const response = forwardToAlsoResponder(initialState);
						if (response) {
							return response;
						}
					}

          // Use first reducer that responds.
					let response;
					reducerIDs.some(reducerID => {
						response = forwardToReducerWithID(reducerID);

						return typeof response !== 'undefined';
					});
					return response;
				}
			}

			return actionSetHandlers;
		}, actionSetHandlers);

		return actionSetHandlers;
	}, {});

	Object.assign(combinedReducer, actionSetHandlers);

	if (alsoAdd) {
		alsoResponder = alsoAdd(combinedReducer);
	}

	return combinedReducer;
}
