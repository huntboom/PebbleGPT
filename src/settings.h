#include <pebble.h>

// Persistent storage key
#define SETTINGS_KEY 1

typedef struct Settings {
  bool vibrate;
  bool apiKeySet;
} Settings;

void config_handler(DictionaryIterator *iter);

void init_settings();

Settings get_settings();
