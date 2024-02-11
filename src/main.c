#include <pebble.h>
#include <messages.h>
#include <settings.h>
#include <ui.h>
#include <messages.h>

const uint32_t MAX_DICTATION = 20000;

static DictationSession *s_dictation_session;

static void dictation_session_callback(DictationSession *session, DictationSessionStatus status,
                                       char *transcription, void *context) {
  
  if (status != DictationSessionStatusSuccess) {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Transcription failed. Error ID: %d", (int)status);
    return;
  }

  set_text("Message sent to OpenAI, awaiting response...");

  send_to_phone(AppKeyTranscription, transcription);
}

static void start_new_prompt(ClickRecognizerRef recognizer, void *context) {
  // Reset scroll window back to the top of the app for the next message
  scroll_to_top();
  dictation_session_start(s_dictation_session);
}

static void gpt_response_handler(DictionaryIterator *iter) {
  Tuple *response_tuple = dict_find(iter, AppKeyResponse);

  if (response_tuple) {
    set_text(response_tuple->value->cstring);

    light_enable_interaction();
    
    if (get_settings().vibrate) {
      static const uint32_t const segments[] = {100};
      VibePattern pat = {segments, 1};
      vibes_enqueue_custom_pattern(pat);
    }
  }
}

static void init() {
  init_settings();
  init_ui(start_new_prompt);
  
  MessageHandler handlers[] = {gpt_response_handler, config_handler};
  init_messages(handlers);

  // On first run, if API key not set, just show message instead of starting dictation
  if (!get_settings().apiKeySet) {
    set_text("Set OpenAI API Key in Settings, then restart app");
    return;
  }

  set_text("Press Select to get input!");
  
  s_dictation_session = dictation_session_create(MAX_DICTATION, dictation_session_callback, NULL);
  
  // Don't start dictation if user opens settings on the phone
  if (launch_reason() == APP_LAUNCH_PHONE) {
    return;
  }

  // Start dictation
  dictation_session_start(s_dictation_session);
}

static void deinit() {
  dictation_session_destroy(s_dictation_session);
  cleanup_ui();
}

int main() {
  init();
  app_event_loop();
  deinit();
}
