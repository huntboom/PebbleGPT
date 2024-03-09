var { makeOpenaiRequest } = require("./openai");

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
