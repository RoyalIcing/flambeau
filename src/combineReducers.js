import { GET_INITIAL_STATE } from './types';


export default function combineReducers(reducers, { getPropsByID = () => {}, alsoAdd } = {}) {
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
				const propsByID = getPropsByID(props);
				if (isAction) {
					let newState = reducerIDs.reduce((state, reducerID) => {
						state[reducerID] = forwardTo({
							responder: reducers[reducerID],
							initialState: initialState[reducerID],
							props: propsByID[reducerID]
						});
						return state;
					}, {});

					if (alsoResponder) {
						newState = forwardTo({
							responder: alsoResponder,
							initialState: newState,
							props: {
								props,
								propsByID
							},
							sourceResponder: combinedReducer
						});
					}

					return newState;
				}
				else if (isIntrospection) {
					if (alsoResponder) {
						// Use customized response, if one was given.
						const response = forwardTo({
							responder: alsoResponder,
							initialState: newState,
							props: {
								props,
								propsByID
							},
							sourceResponder: combinedReducer
						});

						if (response) {
							return response;
						}
					}

					// Use first reducer that responds.
					return reducerIDs.find((state, reducerID) =>
						forwardTo({
							responder: reducers[reducerID],
							initialState: initialState[reducerID],
							props: propsByID[reducerID]
						})
					);
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
