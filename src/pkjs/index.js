var { makeOpenaiRequest } = require("./openai");

Pebble.addEventListener("ready", function (e) {
  console.log("PebbleKit JS ready!");
  // Notify the watchapp that it is now safe to send messages
  Pebble.sendAppMessage({ AppKeyReady: true });
});

Pebble.addEventListener("appmessage", function (e) {
  function onError(errorText) {
    Pebble.sendAppMessage({ AppKeyResponse: "Error: " + errorText });
  }

  function onResponse(responseText) {
    Pebble.sendAppMessage({ AppKeyResponse: responseText });
  }

  if (e.payload.AppKeyTranscription) {
    makeOpenaiRequest(e.payload.AppKeyTranscription, onResponse, onError);
  }
});
