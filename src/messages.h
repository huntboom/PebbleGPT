#ifndef MESSAGES
#define MESSAGES
typedef enum {
  AppKeyTranscription = 1,
  AppKeyResponse = 2,
  AppKeyApiKey = 3,
  AppKeyVibrate = 7,
  AppKeyApiProvider = 8,
  AppKeyClaudeApiKey = 9
} AppKey;
#endif

/// Function which handles messages (could be passed to `app_message_register_inbox_received`)
typedef void (*MessageHandler)(DictionaryIterator*);

/// Set the handlers which will process messages received from the phone
#define init_messages(array) (_init_messages((array), ARRAY_LENGTH((array))))
void _init_messages(MessageHandler[], int);

/// Send a message to PebbleKit on the phone
void send_to_phone(AppKey key, char* value);

