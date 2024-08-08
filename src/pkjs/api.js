var {
  getConfig,
  API_KEY,
  CLAUDE_API_KEY,
  GEMINI_API_KEY,
  SYSTEM_PROMPT,
  TEMPERATURE,
  MODEL,
  API_PROVIDER,
} = require("./config");

var messages = [];

function makeApiRequest(prompt, onResponse, onError) {
  var config = getConfig();
  console.log('Full config:', JSON.stringify(config));
  console.log('API Provider:', config[API_PROVIDER]);
  
  if (config[API_PROVIDER] === "openai") {
    console.log('Making OpenAI request');
    makeOpenAIRequest(prompt, onResponse, onError);
  } else if (config[API_PROVIDER] === "claude") {
    console.log('Making Claude request');
    makeClaudeRequest(prompt, onResponse, onError);
  } else if (config[API_PROVIDER] === "gemini") {
    console.log('Making Gemini request');
    makeGeminiRequest(prompt, onResponse, onError);
  } else {
    console.log('Invalid API provider:', config[API_PROVIDER]);
    onError("Invalid API provider: " + config[API_PROVIDER]);
  }
}

function makeOpenAIRequest(prompt, onResponse, onError) {
  var config = getConfig();

  if (!config[API_KEY]) {
    onError("OpenAI API key not set");
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

function makeClaudeRequest(prompt, onResponse, onError) {
  var config = getConfig();

  if (!config[CLAUDE_API_KEY]) {
    onError("Claude API key not set");
    return;
  }

  var method = "POST";
  var url = "https://api.anthropic.com/v1/messages";

  var request = new XMLHttpRequest();

  request.onload = function () {
    if (this.status >= 200 && this.status < 300) {
      var responseBody = JSON.parse(this.responseText);
      var chatCompletion = responseBody.content[0].text;
      messages.push({ role: "assistant", content: chatCompletion });
      onResponse(chatCompletion);
    } else {
      var errorBody = JSON.parse(this.responseText);
      onError(errorBody.error ? errorBody.error.message : "Unknown error");
    }
  };

  request.onerror = function () {
    onError("Network error");
  };

  request.open(method, url);
  request.setRequestHeader("x-api-key", config[CLAUDE_API_KEY]);
  request.setRequestHeader("anthropic-version", "2023-06-01");
  request.setRequestHeader("content-type", "application/json");

  // Ensure the first message is always a user message
  var claudeMessages = [];
  if (messages.length === 0 || messages[0].role !== "user") {
    claudeMessages.push({ role: "user", content: prompt });
  } else {
    claudeMessages = messages.slice();
    claudeMessages.push({ role: "user", content: prompt });
  }

  var requestBody = JSON.stringify({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 1024,
    messages: claudeMessages
  });

  request.send(requestBody);
}

function makeGeminiRequest(prompt, onResponse, onError) {
  var config = getConfig();

  if (!config[GEMINI_API_KEY]) {
    onError("Gemini API key not set");
    return;
  }

  var method = "POST";
  var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  var request = new XMLHttpRequest();

  request.onload = function () {
    if (this.status >= 200 && this.status < 300) {
      var responseBody = JSON.parse(this.responseText);
      var chatCompletion = responseBody.candidates[0].content.parts[0].text;
      messages.push({ role: "model", content: chatCompletion });
      onResponse(chatCompletion);
    } else {
      var errorBody = JSON.parse(this.responseText);
      onError(errorBody.error ? errorBody.error.message : "Unknown error");
    }
  };

  request.onerror = function () {
    onError("Network error");
  };

  request.open(method, url + "?key=" + config[GEMINI_API_KEY]);
  request.setRequestHeader("Content-Type", "application/json");

  var requestBody = JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: config[TEMPERATURE],
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    }
  });

  request.send(requestBody);
}

function resetMessages() {
  messages = [];
}

// Call this function at the start of each new conversation
function startNewConversation(prompt, onResponse, onError) {
  resetMessages();
  makeApiRequest(prompt, onResponse, onError);
}

module.exports = { makeApiRequest, resetMessages, startNewConversation };