const { getConfig, API_KEY } = require("./config");
var { makeOpenaiRequest } = require("./openai");

Pebble.addEventListener("ready", function (e) {
  console.log("PebbleKit JS ready!");

  var hasApiKey = Boolean(getConfig()[API_KEY])
  Pebble.sendAppMessage({ AppKeyReady: hasApiKey });
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
