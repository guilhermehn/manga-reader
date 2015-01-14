/*globals ACTIONS*/

function actionDipatcher (message, sender, sendResponse) {
  if (ACTIONS.hasOwnProperty(message.action)) {
    ACTIONS[message.action](message, sender, sendResponse);

    return true;
  }

  return false;
}
