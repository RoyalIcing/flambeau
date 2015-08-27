import isFunction from './isFunction';
import { ACTION_TYPE, INTROSPECTION_TYPE } from './types';


export default function callAction({ responder, type, initialValue, actionSetID, actionID, payload, notFoundValue, context }) {
  const responderFunction = findActionResponder({ responder, type, actionSetID, actionID, notFoundValue });
  if (responderFunction !== notFoundValue) {
    return responderFunction(initialValue, payload, { context });
  }
  else {
    return notFoundValue;
  }
}


function findActionResponder({ responder, type, actionSetID, actionID, notFoundValue }) {
  if (responder[actionSetID]) {
    let typeResponder;
    if (type === ACTION_TYPE) {
      typeResponder = responder[actionSetID];
    }
    else if (responder[actionSetID][type]) {
      typeResponder = responder[actionSetID][type];
    }
    else {
      return notFoundValue;
    }

    // Has forwarding function for entire type
    if (isFunction(typeResponder)) {
      return (initialValue, payload, context) => {
        function forwardTo(responder, initialValue) {
          return callAction({
            notFoundValue: initialValue,
            responder, type, initialValue, actionSetID, actionID, payload, context
          });
        }

        const result = responder[actionSetID](initialValue, {
          isAction: (type === ACTION_TYPE),
          isIntrospection: (type === INTROSPECTION_TYPE),
          type, actionID, payload, context, forwardTo
        });
        if (typeof result === 'undefined') {
          return notFoundValue;
        }
        else {
          return result;
        }
      };
    }
    else if (typeResponder[actionID]) {
      return typeResponder[actionID];
    }
  }

  return notFoundValue;
}
