import { Mic, MicOff, Square, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Speech Recognition Not Supported
        </h3>
        <p className="text-muted-foreground">
          Your browser does not support the Web Speech API. Please use Google Chrome or Microsoft Edge.
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
            "relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
            isListening
              ? "bg-destructive hover:bg-destructive/90 glow-effect"
              : "bg-primary hover:bg-primary/90"
          )}
        >
          {/* Pulse Animation */}
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full bg-destructive/30 recording-pulse" />
              <span className="absolute inset-0 rounded-full bg-destructive/20 recording-pulse" style={{ animationDelay: '0.5s' }} />
            </>
          )}
          
          {isListening ? (
            <Square className="w-12 h-12 text-destructive-foreground relative z-10" />
          ) : (
            <Mic className="w-12 h-12 text-primary-foreground relative z-10" />
          )}
        </button>

        {/* Status Text */}
        <div className="mt-6 text-center">
          <p className={cn(
            "text-lg font-semibold font-heading",
            isListening ? "text-destructive" : "text-foreground"
          )}>
            {isListening ? 'Recording Consultation...' : 'Start Recording'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {isListening 
              ? 'Click to stop and generate prescription' 
              : 'Click to start recording the consultation'}
          </p>
        </div>

        {/* Audio Visualizer */}
        {isListening && (
          <div className="flex items-center gap-1 mt-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-primary rounded-full wave-animation"
                style={{
                  height: `${20 + Math.random() * 20}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Interim Transcript */}
        {interimTranscript && (
          <div className="mt-6 p-4 bg-muted rounded-xl max-w-md">
            <p className="text-sm text-muted-foreground italic">
              "{interimTranscript}..."
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
