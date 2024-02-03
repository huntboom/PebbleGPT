#include <pebble.h>

// Persistent storage key
#define SETTINGS_KEY 1

typedef enum {
  AppKeyReady = 0,
  AppKeyTranscription = 1,
  AppKeyResponse = 2,
  AppKeyApiKey = 3,
  AppKeyVibrate = 7
} AppKey;

typedef struct Settings {
  bool vibrate;
  bool apiKeySet;
} Settings;

static Settings settings = {
  .vibrate = true,
  .apiKeySet = false
};

static Window *s_main_window;
static TextLayer *s_output_layer;
static ScrollLayer *s_scroll_layer;

static DictationSession *s_dictation_session;
static char s_last_text[20000];

static void dictation_session_callback(DictationSession *session, DictationSessionStatus status,
                                       char *transcription, void *context) {
  
  if (status != DictationSessionStatusSuccess) {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Transcription failed.\n\nError ID:\n%d", (int)status);
    return;
  }

  // Add loading message
  text_layer_set_text(s_output_layer, "Message sent to OpenAI, awaiting response...");

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

// App
static void scroll_to_top() {
  GPoint offset = GPointZero;
  scroll_layer_set_content_offset(s_scroll_layer, offset, true);
}

static void start_new_prompt(ClickRecognizerRef recognizer, void *context) {
  // Reset scroll window back to the top of the app for the next message
  scroll_to_top();
  dictation_session_start(s_dictation_session);
}

static void scroll_text_up(ClickRecognizerRef recognizer, void *context) {
  scroll_layer_scroll_up_click_handler(recognizer, s_scroll_layer);
}

static void scroll_text_down(ClickRecognizerRef recognizer, void *context) {
  scroll_layer_scroll_down_click_handler(recognizer, s_scroll_layer);
}

static void click_config_provider(void *context) {
  // Set up the up and down buttons for scrolling
  window_single_repeating_click_subscribe(BUTTON_ID_UP, 100, scroll_text_up);
  window_single_repeating_click_subscribe(BUTTON_ID_DOWN, 100, scroll_text_down);

  // Add the select button click handler
  window_single_click_subscribe(BUTTON_ID_SELECT, start_new_prompt);
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  s_output_layer = text_layer_create(GRect(0, 0, bounds.size.w, 2000)); // Increase height to 2000 to accommodate large texts
  text_layer_set_text(s_output_layer, "Press Select to get input!");
  text_layer_set_text_alignment(s_output_layer, GTextAlignmentCenter);
  //set font
  text_layer_set_font(s_output_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
  // Create the ScrollLayer and set its content size
  s_scroll_layer = scroll_layer_create(bounds);
  scroll_layer_set_content_size(s_scroll_layer, GSize(bounds.size.w, 2000));

  // Add the TextLayer to the ScrollLayer
  scroll_layer_add_child(s_scroll_layer, text_layer_get_layer(s_output_layer));

  // Set the click configuration provider 
  window_set_click_config_provider(s_main_window, click_config_provider);
  // Add the ScrollLayer to the window
  layer_add_child(window_layer, scroll_layer_get_layer(s_scroll_layer));
  #if defined(PBL_ROUND)
    text_layer_enable_screen_text_flow_and_paging(s_output_layer,0);
  #elif defined(PBL_RECT)
    printf("This is a rectangular display");
  #endif
}

static void window_unload(Window *window) {
  text_layer_destroy(s_output_layer);
  scroll_layer_destroy(s_scroll_layer);
}

static void response_handler(DictionaryIterator *iter) {
  Tuple *response_tuple = dict_find(iter, AppKeyResponse);

  if (response_tuple) {
    strncpy(s_last_text, response_tuple->value->cstring, sizeof(s_last_text) - 1);
    text_layer_set_text(s_output_layer, s_last_text);

    light_enable_interaction();
    
    if (settings.vibrate) {
      static const uint32_t const segments[] = {100};
      VibePattern pat = {segments, 1};
      vibes_enqueue_custom_pattern(pat);
    }
  }
}

static void config_handler(DictionaryIterator *iter) {
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

static void inbox_received_handler(DictionaryIterator *iter, void *context) {
  response_handler(iter);
  config_handler(iter);
}

static void init() {
  // Read settings stored on the watch
  persist_read_data(SETTINGS_KEY, &settings, sizeof(settings));
  
  s_main_window = window_create();
  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  window_stack_push(s_main_window, true);

  // Open AppMessage communication
  app_message_register_inbox_received(inbox_received_handler);
  app_message_open(4096, 4096);

  // On first run, if API key not set, just show message instead of starting dictation
  if (!settings.apiKeySet) {
    text_layer_set_text(s_output_layer, "Set OpenAI API Key in Settings, then restart app");
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
  window_destroy(s_main_window);
}

int main() {
  init();
  app_event_loop();
  deinit();
}
