Pebble.addEventListener("ready", function(e) {
  console.log("PebbleKit JS ready!");
  // Notify the watchapp that it is now safe to send messages
  Pebble.sendAppMessage({ "AppKeyReady": true });
});
Pebble.addEventListener("showConfiguration", function() {
  var url = 'https://huntboom.github.io/pebble-config/';
  Pebble.openURL(url);
});
Pebble.addEventListener('webviewclosed', function(e) {
  if (e.response) {
    var configData = JSON.parse(decodeURIComponent(e.response));
    if (configData.apiKey) {
      localStorage.setItem('apiKey', configData.apiKey);
    }
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
    var displayText = response.choices[0].message.content; // Change this to extract the desired text

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
var configHtml = encodeURIComponent('<!DOCTYPE html><html><head><title>App Configuration</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><h1>Hello World</h1></body></html>');

var configUrl = 'data:text/html;charset=utf-8,' + configHtml;
