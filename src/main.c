#include <pebble.h>
#include <messages.h>
#include <settings.h>
#include <ui.h>


static DictationSession *s_dictation_session;
static char s_last_text[20000];

static void dictation_session_callback(DictationSession *session, DictationSessionStatus status,
                                       char *transcription, void *context) {
  
  if (status != DictationSessionStatusSuccess) {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Transcription failed. Error ID: %d", (int)status);
    return;
  }

  // Add loading message
  set_text("Message sent to OpenAI, awaiting response...");

  // Send the transcribed text to PebbleKit JS
  DictionaryIterator *out_iter;
  AppMessageResult result = app_message_outbox_begin(&out_iter);

  if (result != APP_MSG_OK) {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Error preparing outbound message: %d", (int)result);
    return;
  }
  
  dict_write_cstring(out_iter, AppKeyTranscription, transcription);
  result = app_message_outbox_send();

  if (result != APP_MSG_OK) {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Error sending transcription to PebbleKit JS: %d", (int)result);
  }
}

static void start_new_prompt(ClickRecognizerRef recognizer, void *context) {
  // Reset scroll window back to the top of the app for the next message
  scroll_to_top();
  dictation_session_start(s_dictation_session);
}


static void response_handler(DictionaryIterator *iter) {
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

static void inbox_received_handler(DictionaryIterator *iter, void *context) {
  response_handler(iter);
  config_handler(iter);
}

static void init() {
  init_settings();
  init_ui(start_new_prompt);

  set_text("Press Select to get input!");

  // Open AppMessage communication
  app_message_register_inbox_received(inbox_received_handler);
  app_message_open(4096, 4096);

  // On first run, if API key not set, just show message instead of starting dictation
  if (!get_settings().apiKeySet) {
    set_text("Set OpenAI API Key in Settings, then restart app");
    return;
  }

  s_dictation_session = dictation_session_create(sizeof(s_last_text), dictation_session_callback, NULL);
  
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
