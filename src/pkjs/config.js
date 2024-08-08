var CONFIG_KEY = "config";

Pebble.addEventListener("ready", function(e) {
  console.log("PebbleKit JS ready!");
  // Notify the watchapp that it is now safe to send messages
  Pebble.sendAppMessage({ "AppKeyReady": true });
});

Pebble.addEventListener("showConfiguration", function() {
  var url = 'https://huntboom.github.io/pebble-config/';
  // Load current options
  var options = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
  url += '?options=' + encodeURIComponent(JSON.stringify(options));
  console.log("Opening configuration page: " + url);
  Pebble.openURL(url);
});

Pebble.addEventListener('webviewclosed', function(e) {
  if (e.response) {
    var configData = JSON.parse(decodeURIComponent(e.response));
    localStorage.setItem(CONFIG_KEY, JSON.stringify(configData));
    console.log('Saved config:', JSON.stringify(configData));
    
    // Send the configuration to the watch
    Pebble.sendAppMessage(configData, function() {
      console.log('Sent config to Pebble successfully!');
    }, function(error) {
      console.log('Failed to send config to Pebble. Error: ' + JSON.stringify(error));
    });
  }
});

function getConfig() {
  var config = localStorage.getItem(CONFIG_KEY);
  console.log('Retrieved config:', config);
  if (config) {
    return JSON.parse(config);
  }
  return {};
}

module.exports = {
  getConfig: getConfig,
  API_KEY: 'openaiApiKey',
  CLAUDE_API_KEY: 'claudeApiKey',
  GEMINI_API_KEY: 'geminiApiKey',
  SYSTEM_PROMPT: 'systemPrompt',
  TEMPERATURE: 'temperature',
  MODEL: 'model',
  API_PROVIDER: 'apiProvider'
};