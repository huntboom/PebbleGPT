var { makeApiRequest, resetMessages } = require("./api");

// Call resetMessages() when starting a new conversation
// For example, you might do this when the app is opened or when a new chat is started
Pebble.addEventListener("ready", function(e) {
  resetMessages();
});

Pebble.addEventListener("appmessage", function (e) {
  function onError(errorText) {
    Pebble.sendAppMessage({ AppKeyResponse: "Error: " + errorText });
  }

  function onResponse(responseText) {
    Pebble.sendAppMessage({ AppKeyResponse: responseText });
  }

  if (e.payload.AppKeyTranscription) {
    makeApiRequest(e.payload.AppKeyTranscription, onResponse, onError);
  }
});