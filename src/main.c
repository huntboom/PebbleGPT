#include <pebble.h>
#include <messages.h>
#include <settings.h>
#include <ui.h>
#include <transcription.h>

static void on_transcription(char* transcription) {
  set_text("Message sent to AI, awaiting response...");

  send_to_phone(AppKeyTranscription, transcription);
}

static void start_new_prompt() {
  scroll_to_top();
  start_transcription(on_transcription);
}

static void on_gpt_response(DictionaryIterator *iter) {
  Tuple *response_tuple = dict_find(iter, AppKeyResponse);

  if (response_tuple) {
    set_text(response_tuple->value->cstring);

    light_enable_interaction();
    
    if (get_settings().vibrate) {
      short_vibe();
    }
  }
}

static void init() {
  init_settings();
  init_ui(start_new_prompt);
  init_messages(((MessageHandler[]){on_gpt_response, on_settings_received}));

  // On first run, if API key not set, just show message instead of starting dictation
  if (!get_settings().apiKeySet) {
    set_text("Set OpenAI API Key in Settings, then restart app");
    return;
  }

  set_text("Press Select to get input!");
  
  // Don't start dictation if user opens settings on the phone
  if (launch_reason() == APP_LAUNCH_PHONE) {
    return;
  }

  // Start dictation
  start_new_prompt();
}

static void deinit() {
  cleanup_ui();
}

int main() {
  init();
  app_event_loop();
  deinit();
}
