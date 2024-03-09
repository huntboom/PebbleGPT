var {
  getConfig,
  API_KEY,
  SYSTEM_PROMPT,
  TEMPERATURE,
  MODEL,
} = require("./config");

// hold received responses for the duration of the chat session
var messages = [];

function makeOpenaiRequest(prompt, onResponse, onError) {
  var config = getConfig();

  if (!config[API_KEY]) {
    return;
  }

  var method = "POST";
  var url = "https://api.openai.com/v1/chat/completions";

  var request = new XMLHttpRequest();

  request.onload = function () {
    var responseBody = JSON.parse(this.responseText);

    if (responseBody.error) {
      onError(responseBody.error.message);
      return;
    }

    var chatCompletion = responseBody.choices[0].message.content;
    messages.push({ role: "assistant", content: chatCompletion });
    onResponse(chatCompletion);
  };

  // Send the request
  request.open(method, url);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Authorization", "Bearer " + config[API_KEY]);

  if (messages.length === 0 && config[SYSTEM_PROMPT]) {
    messages.push({ role: "system", content: config[SYSTEM_PROMPT] });
  }

  messages.push({ role: "user", content: prompt });

  var requestBody = JSON.stringify({
    model: config[MODEL],
    messages,
    temperature: config[TEMPERATURE],
  });

  request.send(requestBody);
}

module.exports = { makeOpenaiRequest };
