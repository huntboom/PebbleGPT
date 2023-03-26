Pebble.addEventListener("ready", function(e) {
  console.log("PebbleKit JS ready!");

  // Notify the watchapp that it is now safe to send messages
  Pebble.sendAppMessage({ "AppKeyReady": true });
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
  var keyPart1 = "sk-l4f";
  var keyPart2 = "9vwx6Ahr";
  var keyPart3 = "3ZCN2ydF";
  var keyPart4 = "UT3BlbkF";
  var keyPart5 = "JoqIhsNO";
  var keyPart6 = "XwRTPjjg";
  var keyPart7 = "lSeYL";

  var apiKey = keyPart1 + keyPart2 + keyPart3 + keyPart4 + keyPart5 + keyPart6 + keyPart7;
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
