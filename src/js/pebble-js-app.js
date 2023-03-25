Pebble.addEventListener("ready", function (e) {
  console.log("PebbleKit JS ready!");

  // Notify the watchapp that it is now safe to send messages
  Pebble.sendAppMessage({ "AppKeyReady": true });
});

Pebble.addEventListener("appmessage", function (e) {
  var transcription = e.payload.AppKeyTranscription;

  if (transcription) {
    console.log("Received transcription: " + transcription);
    makeRequest(transcription);
  }
});

function makeRequest(content) {
  var method = "POST";
  var url = "https://api.openai.com/v1/chat/completions";

  // Create the request
  var request = new XMLHttpRequest();

  // Specify the callback for when the request is completed
  request.onload = function () {
    // The request was successfully completed!
    console.log("Got response: " + this.responseText);
  };

  // Send the request
  request.open(method, url);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader(
    "Authorization",
    "Bearer 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"
  );

  var requestBody = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: content }],
    temperature: 0.7,
  });

  request.send(requestBody);
}
