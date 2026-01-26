import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LanguageSelector } from '@/components/LanguageSelector';
import { AudioRecorder } from '@/components/AudioRecorder';
import { TranscriptionDisplay } from '@/components/TranscriptionDisplay';
import { PrescriptionReportComponent } from '@/components/PrescriptionReport';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { TranscriptionEntry, PrescriptionReport, SUPPORTED_LANGUAGES } from '@/types/prescription';
import { Button } from '@/components/ui/button';
import { FileText, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [prescription, setPrescription] = useState<PrescriptionReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTranscription = useCallback((entry: TranscriptionEntry) => {
    setTranscriptions(prev => [...prev, entry]);
  }, []);

  const {
    isListening,
    isSupported,
    error,
    interimTranscript,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    languageCode: selectedLanguage,
    onTranscription: handleTranscription,
  });

  const handleClearTranscriptions = () => {
    setTranscriptions([]);
    setPrescription(null);
  };

  const getLanguageName = (code: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang?.name || code;
  };

  const handleGeneratePrescription = async () => {
    if (transcriptions.length === 0) {
      toast.error('No transcription available. Please record a consultation first.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const fullTranscript = transcriptions
        .map(t => t.text)
        .join('\n');

      const { data, error } = await supabase.functions.invoke('generate-prescription', {
        body: { 
          transcript: fullTranscript,
          language: getLanguageName(selectedLanguage),
        },
      });

      if (error) {
        console.error('Error generating prescription:', error);
        toast.error(error.message || 'Failed to generate prescription');
        return;
      }

      if (data?.prescription) {
        const report: PrescriptionReport = {
          id: `rx-${Date.now()}`,
          patientInfo: data.prescription.patientInfo,
          diagnosis: data.prescription.diagnosis,
          medications: data.prescription.medications || [],
          advice: data.prescription.advice || [],
          followUp: data.prescription.followUp,
          generatedAt: new Date(),
          consultationTranscript: fullTranscript,
        };
        setPrescription(report);
        toast.success('Prescription report generated successfully!');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to generate prescription. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setTranscriptions([]);
    setPrescription(null);
    setSelectedLanguage('en');
    toast.success('Session reset. Ready for new consultation.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Language Selection */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground font-heading mb-1">
              Consultation Recorder
            </h2>
            <p className="text-muted-foreground">
              Record patient-doctor consultations and generate detailed prescriptions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
            <Button variant="outline" size="icon" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Recording & Transcription */}
          <div className="space-y-6">
            <AudioRecorder
              isListening={isListening}
              isSupported={isSupported}
              error={error}
              interimTranscript={interimTranscript}
              onStart={startListening}
              onStop={stopListening}
            />

            <TranscriptionDisplay
              entries={transcriptions}
              onClear={handleClearTranscriptions}
            />

            {transcriptions.length > 0 && !isListening && (
              <Button
                className="w-full h-14 text-lg font-semibold"
                onClick={handleGeneratePrescription}
                disabled={isGenerating}
              >
                <FileText className="w-5 h-5 mr-2" />
                Generate Prescription Report
              </Button>
            )}
          </div>

          {/* Right Column - Prescription Report */}
          <div>
            <PrescriptionReportComponent
              report={prescription}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 medical-card">
          <h3 className="text-lg font-semibold text-foreground font-heading mb-4">
            How to Use MedScribe AI
          </h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h4 className="font-medium text-foreground mb-1">Select Language</h4>
              <p className="text-sm text-muted-foreground">
                Choose the consultation language (English, Hindi, Telugu, Tamil, Kannada, or Marathi)
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h4 className="font-medium text-foreground mb-1">Record Consultation</h4>
              <p className="text-sm text-muted-foreground">
                Click the microphone and speak clearly during the patient-doctor consultation
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h4 className="font-medium text-foreground mb-1">Generate & Share</h4>
              <p className="text-sm text-muted-foreground">
                Stop recording and click Generate to create a detailed prescription report
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
