#include <pebble.h>

static Window *s_main_window;
static TextLayer *s_output_layer;
static ScrollLayer *s_scroll_layer;
static ClickHandler select_click_handler;

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
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  s_output_layer = text_layer_create(GRect(4, 4, bounds.size.w - 8, 2000)); // Increase height to 2000 to accommodate large texts
  text_layer_set_text_alignment(s_output_layer, GTextAlignmentCenter);
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
    text_layer_enable_screen_text_flow_and_paging(s_output_layer, 0);
  #endif
}

static void window_unload(Window *window) {
  text_layer_destroy(s_output_layer);
  scroll_layer_destroy(s_scroll_layer);
}

void init_ui(ClickHandler on_select_click) {
  select_click_handler = on_select_click;
  s_main_window = window_create();
  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  window_stack_push(s_main_window, true);
}

void cleanup_ui() {
  window_destroy(s_main_window);
}

void set_text(char* text) {
  text_layer_set_text(s_output_layer, text);
}

void scroll_to_top() {
  GPoint offset = GPointZero;
  scroll_layer_set_content_offset(s_scroll_layer, offset, true);
}

void short_vibe() {
  static const uint32_t const segments[] = {100};
  VibePattern pat = {segments, 1};
  vibes_enqueue_custom_pattern(pat);
}
