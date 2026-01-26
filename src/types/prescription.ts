export interface Language {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', speechCode: 'hi-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN' },
];

export interface TranscriptionEntry {
  id: string;
  text: string;
  timestamp: Date;
  language: string;
}

export interface PatientBasicInfo {
  name: string;
  age: string;
  gender: string;
  address: string;
  occupation: string;
}

export interface PatientVitals {
  bloodPressure: string;
  pulse: string;
  temperature: string;
  weight: string;
  height: string;
  respiratoryRate: string;
  spo2: string;
}

export interface PrescriptionReport {
  id: string;
  patientInfo: {
    symptoms: string[];
    medicalHistory: string;
    currentCondition: string;
  };
  pastHistory: string;
  drugHistory: string;
  vaccinationHistory: string;
  childrenBirthHistory: string;
  pregnancyHistory: string;
  familyHistory: string;
  investigations: string[];
  diagnosis: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  advice: string[];
  dietChart: string[];
  followUp: string;
  generatedAt: Date;
  consultationTranscript: string;
}
