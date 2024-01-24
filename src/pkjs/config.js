module.exports = [
  {
    type: "heading",
    defaultValue: "App Configuration",
  },
  {
    type: "text",
    defaultValue:
      "To use PebbleGPT you will need: <ul>" +
      "<li>your own OpenAI API key</li>" +
      "<li>a Rebble subscription (for voice transcription)</li>" +
      "</ul>",
  },
  {
    type: "input",
    messageKey: "apiKey",
    label: "OpenAI API key",
  },
  {
    type: "submit",
    defaultValue: "Save Settings",
  }
];
