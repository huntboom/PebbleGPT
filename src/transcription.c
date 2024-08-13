#include <transcription.h>
#include <settings.h>

static DictationSession *s_dictation_session;

const uint32_t MAX_DICTATION = 20000;

TranscriptionHandler transcription_handler;

static void dictation_status_handler(DictationSession *session,
                                     DictationSessionStatus status,
                                     char *transcription,
                                     void *context) {
  if (status != DictationSessionStatusSuccess) {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Transcription failed. Error ID: %d", (int)status);
    return;
  }

  (*transcription_handler)(transcription);
  
  dictation_session_destroy(s_dictation_session);
}

void start_transcription(TranscriptionHandler handler) {
  transcription_handler = handler;
  s_dictation_session = dictation_session_create(MAX_DICTATION, dictation_status_handler, NULL);
  
  dictation_session_enable_confirmation(s_dictation_session, get_settings().confirmTranscription);
  dictation_session_start(s_dictation_session);
}
