var Clay = require("pebble-clay");
var clayConfig = require("./config");
var clay = new Clay(clayConfig);

Pebble.addEventListener("ready", function(e) {
  console.log("PebbleKit JS ready!");
  // Notify the watchapp that it is now safe to send messages
  Pebble.sendAppMessage({ "AppKeyReady": true });
});

Pebble.addEventListener("webviewclosed", function (e) {
  if (e && !e.response) {
    return;
  }

  // Get the keys and values from each config item
  var configData = clay.getSettings(e.response);

  if (configData.apiKey) {
    localStorage.setItem("apiKey", configData.apiKey);
  }
});

Pebble.addEventListener("appmessage", function(e) {
  console.log("Received message: " + JSON.stringify(e.payload));

  if (e.payload.AppKeyTranscription) {
    makeRequest(e.payload.AppKeyTranscription);
  }
});

function makeRequest(content) {
  var method = "POST";
  var url = "https://api.openai.com/v1/chat/completions";

  // Create the request
  var request = new XMLHttpRequest();

  // Specify the callback for when the request is completed
  request.onload = function() {
    // The request was successfully completed!
    console.log("Got response: " + this.responseText);

    // Extract the response you want to display from the API response
    var response = JSON.parse(this.responseText);
    if (response.error) {
      // If it does, print the error message
      var displayText = "Error: " + response.error.message;
    }
    else {
      // Otherwise, extract the desired text
      var displayText = response.choices[0].message.content;
    }
    // Send the response back to the watch
    Pebble.sendAppMessage({ "AppKeyResponse": displayText });
  };
  var apiKey = localStorage.getItem('apiKey');
  if (!apiKey) {
    console.log('API key not provided');
    return;
  }
  // Send the request
  request.open(method, url);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader(
    "Authorization",
    "Bearer " + apiKey
  );

  var requestBody = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: content }],
    temperature: 0.7,
  });

  request.send(requestBody);
}
