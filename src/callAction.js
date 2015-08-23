import isFunction from './isFunction';
import { ACTION_TYPE, INTROSPECTION_TYPE } from './types';


export default function callAction({ responder, type, initialValue, notFoundValue, actionSetID, actionID, payload, context }) {
  const responderFunction = findActionResponder({ responder, type, actionSetID, actionID });
  if (responderFunction) {
    return responderFunction(initialValue, payload, { context });
  }
  else {
    return notFoundValue;
  }
}


function findActionResponder({ responder, type, actionSetID, actionID }) {
  if (responder[actionSetID]) {
    let typeResponder;
    if (type === ACTION_TYPE) {
      typeResponder = responder[actionSetID];
    }
    else if (responder[actionSetID][type]) {
      typeResponder = responder[actionSetID][type];
    }
    else {
      return;
    }

    // Has forwarding function for entire type
    if (isFunction(typeResponder)) {
      return (initialValue, payload, context) => {
        function forwardTo(responder, initialValue) {
          return callAction({
            responder, type, initialValue, notFoundValue: initialValue, actionSetID, actionID, context
          });
        }

        return responder[actionSetID](initialValue, { type, actionID, payload, context, forwardTo });
      };
    }
    else if (typeResponder[actionID]) {
      return typeResponder[actionID];
    }
  }
}
