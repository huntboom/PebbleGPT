#include <pebble.h>

typedef enum {
  AppKeyReady = 0,
  AppKeyTranscription = 1,
  AppKeyResponse = 2 // Add this line
} AppKey;

static Window *s_main_window;
static TextLayer *s_output_layer;

static DictationSession *s_dictation_session;
static char s_last_text[512];

// Dictation API
static void dictation_session_callback(DictationSession *session, DictationSessionStatus status,
                                       char *transcription, void *context) {
  if(status == DictationSessionStatusSuccess) {
    snprintf(s_last_text, sizeof(s_last_text), "Transcription:\n\n%s", transcription);
    text_layer_set_text(s_output_layer, s_last_text);

    // Send the transcribed text to PebbleKit JS
    DictionaryIterator *out_iter;
    AppMessageResult result = app_message_outbox_begin(&out_iter);

    if (result == APP_MSG_OK) {
      dict_write_cstring(out_iter, AppKeyTranscription, transcription);
      result = app_message_outbox_send();

      if (result != APP_MSG_OK) {
        APP_LOG(APP_LOG_LEVEL_ERROR, "Error sending transcription to PebbleKit JS: %d", (int)result);
      }
    } else {
      APP_LOG(APP_LOG_LEVEL_ERROR, "Error preparing outbound message: %d", (int)result);
    }

  } else {
    static char s_failed_buff[128];
    snprintf(s_failed_buff, sizeof(s_failed_buff), "Transcription failed.\n\nError ID:\n%d", (int)status);
    text_layer_set_text(s_output_layer, s_failed_buff);
  }
}

// App
static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
  dictation_session_start(s_dictation_session);
}

static void click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  s_output_layer = text_layer_create(GRect(bounds.origin.x, (bounds.size.h - 24) / 2, bounds.size.w, bounds.size.h));
  text_layer_set_text(s_output_layer, "Press Select to get input!");
  text_layer_set_text_alignment(s_output_layer, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(s_output_layer));
}

static void window_unload(Window *window) {
  text_layer_destroy(s_output_layer);
}
static void inbox_received_handler(DictionaryIterator *iter, void *context) {
  Tuple *response_tuple = dict_find(iter, AppKeyResponse);

  if (response_tuple) {
    strncpy(s_last_text, response_tuple->value->cstring, sizeof(s_last_text) - 1);
    text_layer_set_text(s_output_layer, s_last_text);
  }
}
static void init() {
  s_main_window = window_create();
  window_set_click_config_provider(s_main_window, click_config_provider);
  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  window_stack_push(s_main_window, true);

  s_dictation_session = dictation_session_create(sizeof(s_last_text), dictation_session_callback, NULL);

  // Open AppMessage communication
  app_message_register_inbox_received(inbox_received_handler);
  app_message_open(64, 64);
}

static void deinit() {
  dictation_session_destroy(s_dictation_session);
  window_destroy(s_main_window);
}

int main() {
  init();
  app_event_loop();
  deinit();
}

