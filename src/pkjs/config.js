const Clay = require("pebble-clay");

const CONFIG_KEY = "config";
const API_KEY = "apiKey";
const MODEL = "model";
const SYSTEM_PROMPT = "systemPrompt";
const TEMPERATURE = "temperature";

const clayConfig = [
  {
    type: "heading",
    defaultValue: "PebbleGPT Configuration",
  },
  {
    type: "text",
    defaultValue:
      "To use PebbleGPT you will need " +
      "your <a href='https://platform.openai.com/account/api-keys'>own OpenAI API key</a> and " +
      "<a href='https://help.rebble.io/setup-subscription/#1'>a Rebble subscription</a> (for voice transcription).",
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Required",
      },
      {
        type: "input",
        messageKey: "apiKey",
        label: "OpenAI API key",
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

const clay = new Clay(clayConfig);

// Fired when the configuration is saved
Pebble.addEventListener("webviewclosed", function (e) {
  if (e && !e.response) {
    return;
  }

  const configData = JSON.parse(e.response);
  const configValues = Object.keys(configData).reduce(function (result, key) {
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
  MODEL,
  SYSTEM_PROMPT,
  TEMPERATURE,
  getConfig,
};
