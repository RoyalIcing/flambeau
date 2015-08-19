
function isFunction(something) {
  return (typeof something === 'function') || (Object.prototype.toString.call(something) === `[object Function]`);
}

export default function findActionResponder(responder, actionSetID, actionID, callActionResponder) {
  if (responder[actionSetID]) {
    // Has specific function responding to action
    if (responder[actionSetID][actionID]) {
      return responder[actionSetID][actionID];
    }
    // Has forwarding function for entire action set
    else if (isFunction(responder[actionSetID])) {
      return (initialValue, actionPayload, context) => {
        function useReducer(reducer, initialValue) {
          const innerResponder = findActionResponder(reducer, actionSetID, actionID, callActionResponder);
          if (innerResponder) {
            return callActionResponder(innerResponder, initialValue, context);
          }
          else {
            return initialValue;
          }
        }

        return responder[actionSetID](initialValue, actionID, actionPayload, context, useReducer);
      };
    }
  }
}
