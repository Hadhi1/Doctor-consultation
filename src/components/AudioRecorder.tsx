import { Mic, Square, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  interimTranscript: string;
  onStart: () => void;
  onStop: () => void;
}

export function AudioRecorder({
  isListening,
  isSupported,
  error,
  interimTranscript,
  onStart,
  onStop,
}: AudioRecorderProps) {
  if (!isSupported) {
    return (
      <div className="medical-card text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Speech Recognition Not Supported
        </h3>
        <p className="text-sm text-muted-foreground px-4">
          Live speech recognition is not supported on this browser.
          <br />
          Please use Chrome or Edge (Android / Desktop).
        </p>
      </div>
    );
  }

  return (
    <div className="medical-card">
      <div className="flex flex-col items-center">

        {/* Recording Button */}
        <button
          onClick={isListening ? onStop : onStart}
          className={cn(
            'relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all duration-300',
            isListening
              ? 'bg-destructive hover:bg-destructive/90 glow-effect'
              : 'bg-primary hover:bg-primary/90'
          )}
        >
          {/* Pulse */}
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full recording-pulse" />
              <span
                className="absolute inset-0 rounded-full recording-pulse delay-500"
              />
            </>
          )}

          {isListening ? (
            <Square className="w-10 h-10 text-white relative z-10" />
          ) : (
            <Mic className="w-10 h-10 text-white relative z-10" />
          )}
        </button>

        {/* Status */}
        <div className="mt-5 text-center px-4">
          <p
            className={cn(
              'text-lg font-semibold',
              isListening ? 'text-destructive' : 'text-foreground'
            )}
          >
            {isListening ? 'Recording Consultation…' : 'Start Recording'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {isListening
              ? 'Tap to stop and generate prescription'
              : 'Tap to start recording the consultation'}
          </p>
        </div>

        {/* Audio Visualizer (MOBILE SAFE) */}
        {isListening && (
          <div className="flex items-center gap-1 mt-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={cn(
                  'wave-bar',
                  i === 2 && 'delay-100',
                  i === 3 && 'delay-200',
                  i === 4 && 'delay-300',
                  i === 5 && 'delay-400'
                )}
              />
            ))}
          </div>
        )}

        {/* Interim Transcript */}
        {interimTranscript && (
          <div className="mt-5 p-4 bg-muted rounded-xl max-w-md mx-4">
            <p className="text-sm text-muted-foreground italic break-words">
              “{interimTranscript}…”
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex gap-2 items-start max-w-md mx-4">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>

      {/* CSS (scoped via Tailwind utilities) */}
      <style jsx>{`
        .recording-pulse {
          background: rgba(239, 68, 68, 0.35);
          animation: pulse 1.6s ease-out infinite;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          70% {
            transform: scale(1.4);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        .wave-bar {
          width: 4px;
          height: 12px;
          background: #2563eb;
          border-radius: 9999px;
          animation: wave 1s infinite ease-in-out;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }

        @keyframes wave {
          0% { height: 12px; }
          50% { height: 28px; }
          100% { height: 12px; }
        }
      `}</style>
    </div>
  );
}
