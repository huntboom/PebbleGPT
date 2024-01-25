var {
  getConfig,
  API_KEY,
  SYSTEM_PROMPT,
  TEMPERATURE,
  MODEL,
} = require("./config");

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

    onResponse(responseBody.choices[0].message.content);
  };

  // Send the request
  request.open(method, url);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Authorization", "Bearer " + config[API_KEY]);

  var messages = [{ role: "user", content: prompt }];

  if (config[SYSTEM_PROMPT]) {
    messages.unshift({ role: "system", content: config[SYSTEM_PROMPT] });
  }

  var requestBody = JSON.stringify({
    model: config[MODEL],
    messages,
    temperature: config[TEMPERATURE],
  });

  request.send(requestBody);
}

module.exports = { makeOpenaiRequest };
