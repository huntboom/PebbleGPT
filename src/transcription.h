#include <pebble.h>

typedef void (*TranscriptionHandler)(char*);

void start_transcription(TranscriptionHandler);
