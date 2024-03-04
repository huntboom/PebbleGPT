#include <pebble.h>
#include <messages.h>
#include <settings.h>

static Settings settings = {
  .vibrate = true, 
  .apiKeySet = false
};

void on_settings_received(DictionaryIterator *iter) {
  Tuple *vibrate_tuple = dict_find(iter, AppKeyVibrate);

  if (vibrate_tuple) {
    settings.vibrate = (vibrate_tuple->value->int32 == 1);
  }

  Tuple *apiKey_tuple = dict_find(iter, AppKeyApiKey);

  if (apiKey_tuple) {
    settings.apiKeySet = strlen(apiKey_tuple->value->cstring) != 0;
  }

  persist_write_data(SETTINGS_KEY, &settings, sizeof(settings));
}

void init_settings() {
  persist_read_data(SETTINGS_KEY, &settings, sizeof(settings));
}

Settings get_settings() {
  return settings;
}
