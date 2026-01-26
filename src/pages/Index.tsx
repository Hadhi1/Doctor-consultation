import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LanguageSelector } from '@/components/LanguageSelector';
import { AudioRecorder } from '@/components/AudioRecorder';
import { TranscriptionDisplay } from '@/components/TranscriptionDisplay';
import { PrescriptionReportComponent } from '@/components/PrescriptionReport';
import { PatientInfoForm, PatientInfo, PatientVitals } from '@/components/PatientInfoForm';
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
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    age: '',
    gender: '',
    address: '',
    occupation: '',
  });
  const [patientVitals, setPatientVitals] = useState<PatientVitals>({
    bloodPressure: '',
    pulse: '',
    temperature: '',
    weight: '',
    height: '',
    respiratoryRate: '',
    spo2: '',
  });

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

  const isChild = patientInfo.gender?.includes('child');
  const isFemale = patientInfo.gender === 'female' || patientInfo.gender === 'child-female';

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
          patientDetails: {
            name: patientInfo.name || 'Not provided',
            age: patientInfo.age || 'N/A',
            gender: patientInfo.gender || 'N/A',
            address: patientInfo.address || 'N/A',
            occupation: patientInfo.occupation || 'N/A',
          },
          vitals: patientVitals,
          isChild,
          isFemale,
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
          pastHistory: data.prescription.pastHistory || '',
          drugHistory: data.prescription.drugHistory || '',
          vaccinationHistory: data.prescription.vaccinationHistory || '',
          childrenBirthHistory: data.prescription.childrenBirthHistory || '',
          pregnancyHistory: data.prescription.pregnancyHistory || '',
          familyHistory: data.prescription.familyHistory || '',
          investigations: data.prescription.investigations || [],
          diagnosis: data.prescription.diagnosis,
          medications: data.prescription.medications || [],
          advice: data.prescription.advice || [],
          dietChart: data.prescription.dietChart || [],
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
    setPatientInfo({ name: '', age: '', gender: '', address: '', occupation: '' });
    setPatientVitals({ bloodPressure: '', pulse: '', temperature: '', weight: '', height: '', respiratoryRate: '', spo2: '' });
    toast.success('Session reset. Ready for new consultation.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Language Selection */}
        <div className="mb-4 sm:mb-8 flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground font-heading mb-0.5 sm:mb-1">
                Consultation Recorder
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Record consultations and generate detailed prescriptions
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
              />
              <Button variant="outline" size="icon" onClick={handleReset} className="h-9 w-9 sm:h-10 sm:w-10">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Patient Info Form */}
        <div className="mb-4 sm:mb-6">
          <PatientInfoForm
            patientInfo={patientInfo}
            vitals={patientVitals}
            onPatientInfoChange={setPatientInfo}
            onVitalsChange={setPatientVitals}
            disabled={isListening}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Recording & Transcription */}
          <div className="space-y-4 sm:space-y-6">
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
                className="w-full h-12 sm:h-14 text-sm sm:text-lg font-semibold"
                onClick={handleGeneratePrescription}
                disabled={isGenerating}
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Generate Prescription Report
              </Button>
            )}
          </div>

          {/* Right Column - Prescription Report */}
          <div>
            <PrescriptionReportComponent
              report={prescription}
              isGenerating={isGenerating}
              patientDetails={patientInfo}
              patientVitals={patientVitals}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 sm:mt-12 medical-card">
          <h3 className="text-base sm:text-lg font-semibold text-foreground font-heading mb-3 sm:mb-4">
            How to Use MedScribe AI
          </h3>
          <div className="grid sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 sm:mx-auto sm:mb-3">
                <span className="text-lg sm:text-xl font-bold text-primary">1</span>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-0.5 sm:mb-1 text-sm sm:text-base">Enter Patient Info</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Fill in patient details, address, occupation & vitals
                </p>
              </div>
            </div>
            <div className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 sm:mx-auto sm:mb-3">
                <span className="text-lg sm:text-xl font-bold text-primary">2</span>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-0.5 sm:mb-1 text-sm sm:text-base">Select Language</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Choose consultation language
                </p>
              </div>
            </div>
            <div className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 sm:mx-auto sm:mb-3">
                <span className="text-lg sm:text-xl font-bold text-primary">3</span>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-0.5 sm:mb-1 text-sm sm:text-base">Record Consultation</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Click the microphone and speak
                </p>
              </div>
            </div>
            <div className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 sm:mx-auto sm:mb-3">
                <span className="text-lg sm:text-xl font-bold text-primary">4</span>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-0.5 sm:mb-1 text-sm sm:text-base">Generate & Share</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Generate comprehensive prescription report
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
