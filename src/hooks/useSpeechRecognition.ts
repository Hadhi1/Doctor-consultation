import { useState, useRef, useCallback, useEffect } from 'react';
import { TranscriptionEntry, SUPPORTED_LANGUAGES } from '@/types/prescription';

// Type definitions for Web Speech API
type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onerror: ((event: { error: string; message?: string }) => void) | null;
  onresult: ((event: {
    resultIndex: number;
    results: {
      length: number;
      [index: number]: {
        isFinal: boolean;
        [index: number]: { transcript: string; confidence: number };
      };
    };
  }) => void) | null;
};

interface UseSpeechRecognitionProps {
  languageCode: string;
  onTranscription?: (entry: TranscriptionEntry) => void;
}

export function useSpeechRecognition({ languageCode, onTranscription }: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const isManualStop = useRef(false);
  const restartTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    const win = window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionClass);
  }, []);

  const getSpeechCode = useCallback((code: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang?.speechCode || 'en-IN';
  }, []);

  const startListening = useCallback(() => {
    const win = window as Window & { SpeechRecognition?: new () => SpeechRecognitionType; webkitSpeechRecognition?: new () => SpeechRecognitionType };
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getSpeechCode(languageCode);
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      isListeningRef.current = true;
      setError(null);
      isManualStop.current = false;
    };

    recognition.onresult = (event) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      setInterimTranscript(interimText);

      if (finalText.trim() && onTranscription) {
        const entry: TranscriptionEntry = {
          id: `trans-${Date.now()}`,
          text: finalText.trim(),
          timestamp: new Date(),
          language: languageCode,
        };
        onTranscription(entry);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access.');
        setIsListening(false);
        isListeningRef.current = false;
      } else if (event.error === 'no-speech') {
        // Auto-restart on no-speech error if not manually stopped
        if (!isManualStop.current && isListeningRef.current) {
          restartTimeout.current = setTimeout(() => {
            if (!isManualStop.current) {
              startListening();
            }
          }, 100);
        }
      } else if (event.error !== 'aborted') {
        setError(`Recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      
      // Auto-restart if not manually stopped
      if (!isManualStop.current && isListeningRef.current) {
        restartTimeout.current = setTimeout(() => {
          if (!isManualStop.current && isListeningRef.current) {
            try {
              recognition.start();
            } catch (e) {
              console.log('Could not restart recognition');
            }
          }
        }, 100);
      } else {
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
      setError('Failed to start speech recognition');
    }
  }, [languageCode, getSpeechCode, onTranscription]);

  const stopListening = useCallback(() => {
    isManualStop.current = true;
    isListeningRef.current = false;
    
    if (restartTimeout.current) {
      clearTimeout(restartTimeout.current);
      restartTimeout.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
      recognitionRef.current = null;
    }
    
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  useEffect(() => {
    return () => {
      isManualStop.current = true;
      isListeningRef.current = false;
      if (restartTimeout.current) {
        clearTimeout(restartTimeout.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    error,
    interimTranscript,
    startListening,
    stopListening,
  };
}
