var { makeApiRequest } = require("./api");

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
