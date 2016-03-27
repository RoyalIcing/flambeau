function runSequence({
	stepID, payload, stepCreators, connectedSteps, onFulfilled, onRejected, tap
}) {
	try {
		const result = stepCreators[stepID](payload, { current: connectedSteps });
		
		if (!result) { // Undefined, meaning this step is a completion
			onFulfilled(payload);
			return;
		}
		
		// Returned a promise
		Promise.resolve(result).then((result) => {
			if (!!tap) {
				tap(result.id, result);
			}
			onFulfilled(result);
		}, onRejected);
	}
	catch (error) {
		onRejected(error);
	}
}

export function createSequence(stepCreators) {
	const completionIDs = Object.keys(stepCreators).filter(stepID =>
		stepCreators[stepID].length === 1 
	);
	
	let connectedSteps = {};
	
	Object.keys(stepCreators).reduce((output, stepID) => {
		output[stepID] = (payload) => Object.assign(
			new Promise((onFulfilled, onRejected) => {
				Promise.resolve(payload).then(payload => {
					runSequence({
						stepID,
						payload,
						stepCreators,
						connectedSteps,
						onFulfilled,
						onRejected,
					});
				});
			}),
			id: stepID,
		);
		
		return output;
	}, connectedSteps);
	
	return connectedSteps;
}