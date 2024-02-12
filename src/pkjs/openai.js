const {
  getConfig,
  API_KEY,
  SYSTEM_PROMPT,
  TEMPERATURE,
  MODEL,
} = require("./config");

// hold received responses for the duration of the chat session
const messages = [];

function makeOpenaiRequest(prompt, onResponse, onError) {
  const config = getConfig();

  if (!config[API_KEY]) {
    return;
  }

  const method = "POST";
  const url = "https://api.openai.com/v1/chat/completions";

  const request = new XMLHttpRequest();

  request.onload = function () {
    const responseBody = JSON.parse(this.responseText);

    if (responseBody.error) {
      onError(responseBody.error.message);
      return;
    }

    const chatCompletion = responseBody.choices[0].message.content;
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

  const requestBody = JSON.stringify({
    model: config[MODEL],
    messages,
    temperature: config[TEMPERATURE],
  });

  request.send(requestBody);
}

module.exports = { makeOpenaiRequest };
