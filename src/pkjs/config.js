var Clay = require("pebble-clay");
var CONFIG_KEY = "config";
var API_KEY = "apiKey";
var MODEL = "model";
var SYSTEM_PROMPT = "systemPrompt";
var TEMPERATURE = "temperature";
var API_PROVIDER = "apiProvider";
var clayConfig = [
  {
    type: "heading",
    defaultValue: "PebbleGPT Configuration",
  },
  {
    type: "text",
    defaultValue:
      "To use ChatGPT you will need " +
      "your <a href='https://platform.openai.com/account/api-keys'>own OpenAI API key</a> and " +
      "<a href='https://help.rebble.io/setup-subscription/#1'>a Rebble subscription</a> (for voice transcription).",
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Required for OpenAI",
      },
      {
        type: "input",
        messageKey: "apiKey",
        label: "OpenAI API key",
      },
    ],
  },
  {
    type: "select",
    messageKey: "apiProvider",
    defaultValue: "openai",
    label: "API Provider",
    options: [
      {
        label: "OpenAI",
        value: "openai",
      },
      {
        label: "Claude",
        value: "claude",
      },
      {
        label: "Gemini",
        value: "gemini",
      },
    ],
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Required for Claude",
      },
      {
        type: "input",
        messageKey: "claudeApiKey",
        label: "Claude API key",
      },
    ],
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Required for Gemini",
      },
      {
        type: "input",
        messageKey: "geminiApiKey",
        label: "Gemini API key",
      },
    ],
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Optional",
      },
      {
        type: "input",
        messageKey: "systemPrompt",
        label: "System prompt",
        description:
          "Any context for your queries – something about yourself, or how you want GPT to respond. For example: <em>Respond with one sentence.</em>",
      },
      {
        type: "select",
        messageKey: "model",
        defaultValue: "gpt-3.5-turbo",
        label: "Model",
        options: [
          {
            label: "GPT-3.5 Turbo",
            value: "gpt-3.5-turbo",
          },
          {
            label: "GPT-4",
            value: "gpt-4",
          },
        ],
      },
      {
        type: "slider",
        messageKey: "temperature",
        defaultValue: 1,
        label: "Temperature",
        description: "How creative the responses should be.",
        min: 0,
        max: 2,
        step: 0.1,
      },
      {
        type: 'toggle',
        messageKey: 'vibrate',
        label: 'Vibrate on response',
        defaultValue: true
      }
    ],
  },
  {
    type: "submit",
    defaultValue: "Save Settings",
  },
];

var clay;

Pebble.addEventListener('ready', function(e) {
  console.log('PebbleKit JS ready!');
  try {
    clay = new Clay(clayConfig);
    console.log('Clay initialized successfully');
  } catch (error) {
    console.error('Error initializing Clay:', error);
  }
});

Pebble.addEventListener('showConfiguration', function(e) {
  console.log('Showing configuration page');
  try {
    var clayUrl = clay.generateUrl();
    console.log('Generated Clay URL:', clayUrl);
    
    // Create an HTML page with an iframe
    var iframeHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>PebbleGPT Configuration</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body, html, iframe {
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
              border: none;
            }
          </style>
        </head>
        <body>
          <iframe src="${clayUrl}"></iframe>
        </body>
      </html>
    `;
    
    // Convert the HTML to a data URI
    var iframeUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(iframeHtml);
    
    // Open the URL containing the iframe
    Pebble.openURL(iframeUrl);
  } catch (error) {
    console.error('Error generating or opening Clay URL:', error);
  }
});

// Fired when the configuration is saved
Pebble.addEventListener("webviewclosed", function (e) {
  if (e && !e.response) {
    return;
  }

  var configData = JSON.parse(e.response);
  var configValues = Object.keys(configData).reduce(function (result, key) {
    result[key] = configData[key].value;
    return result;
  }, {});

  localStorage.setItem(CONFIG_KEY, JSON.stringify(configValues));
});

function getConfig() {
  return JSON.parse(localStorage.getItem(CONFIG_KEY));
}

module.exports = {
  API_KEY,
  API_PROVIDER,
  MODEL,
  SYSTEM_PROMPT,
  TEMPERATURE,
  getConfig,
};