import { PrescriptionReport as PrescriptionReportType } from '@/types/prescription';
import { 
  FileText, 
  Pill, 
  Stethoscope, 
  Calendar, 
  ClipboardList,
  AlertCircle,
  Share2,
  Download,
  Copy,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { toast } from 'sonner';

interface PrescriptionReportProps {
  report: PrescriptionReportType | null;
  isGenerating: boolean;
}

export function PrescriptionReportComponent({ report, isGenerating }: PrescriptionReportProps) {
  const [copied, setCopied] = useState(false);

  if (isGenerating) {
    return (
      <div className="medical-card">
        <div className="flex flex-col items-center py-12">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-foreground font-heading mb-2">
            Generating Prescription Report...
          </h3>
          <p className="text-muted-foreground text-center">
            AI is analyzing the consultation and preparing a detailed prescription
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="medical-card text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2 font-heading">
          No Prescription Report Yet
        </h3>
        <p className="text-muted-foreground">
          Record and complete a consultation to generate the prescription report
        </p>
      </div>
    );
  }

  const formatReportAsText = () => {
    const lines = [
      '═══════════════════════════════════════',
      '         PRESCRIPTION REPORT',
      '        Habsen Tech Communication',
      '═══════════════════════════════════════',
      '',
      `Generated: ${report.generatedAt.toLocaleString('en-IN')}`,
      '',
      '── PATIENT SYMPTOMS ──',
      ...report.patientInfo.symptoms.map(s => `• ${s}`),
      '',
      '── MEDICAL HISTORY ──',
      report.patientInfo.medicalHistory,
      '',
      '── CURRENT CONDITION ──',
      report.patientInfo.currentCondition,
      '',
      '── DIAGNOSIS ──',
      report.diagnosis,
      '',
      '── MEDICATIONS ──',
      ...report.medications.map((med, i) => [
        `${i + 1}. ${med.name}`,
        `   Dosage: ${med.dosage}`,
        `   Frequency: ${med.frequency}`,
        `   Duration: ${med.duration}`,
        `   Instructions: ${med.instructions}`,
      ]).flat(),
      '',
      '── ADVICE ──',
      ...report.advice.map(a => `• ${a}`),
      '',
      '── FOLLOW-UP ──',
      report.followUp,
      '',
      '═══════════════════════════════════════',
      'Developed by Habsen Tech Communication',
      'Email: hadhi@habsentech.com',
      'Phone: 9110593766',
      '═══════════════════════════════════════',
    ];
    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatReportAsText());
      setCopied(true);
      toast.success('Prescription copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy prescription');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([formatReportAsText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-${report.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Prescription downloaded!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Prescription Report',
          text: formatReportAsText(),
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="medical-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground font-heading">
            Prescription Report
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <CheckCircle className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          <Button variant="default" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-6">
          {/* Symptoms */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-medical-orange" />
              <h4 className="font-semibold text-foreground">Patient Symptoms</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.patientInfo.symptoms.map((symptom, i) => (
                <span 
                  key={i}
                  className="px-3 py-1.5 bg-medical-orange/10 text-medical-orange rounded-full text-sm"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </section>

          {/* Medical History */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-4 h-4 text-medical-blue" />
              <h4 className="font-semibold text-foreground">Medical History</h4>
            </div>
            <p className="text-muted-foreground p-3 bg-muted/50 rounded-lg">
              {report.patientInfo.medicalHistory}
            </p>
          </section>

          {/* Current Condition */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-foreground">Current Condition</h4>
            </div>
            <p className="text-muted-foreground p-3 bg-muted/50 rounded-lg">
              {report.patientInfo.currentCondition}
            </p>
          </section>

          {/* Diagnosis */}
          <section className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-primary">Diagnosis</h4>
            </div>
            <p className="text-foreground font-medium">{report.diagnosis}</p>
          </section>

          {/* Medications */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-4 h-4 text-medical-green" />
              <h4 className="font-semibold text-foreground">Medications</h4>
            </div>
            <div className="space-y-3">
              {report.medications.map((med, i) => (
                <div key={i} className="p-4 bg-medical-green/5 border border-medical-green/20 rounded-xl">
                  <h5 className="font-semibold text-medical-green mb-2">{med.name}</h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Dosage:</span>
                      <span className="ml-2 text-foreground">{med.dosage}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequency:</span>
                      <span className="ml-2 text-foreground">{med.frequency}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="ml-2 text-foreground">{med.duration}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Instructions:</span>
                      <span className="ml-2 text-foreground">{med.instructions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Advice */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-foreground">Medical Advice</h4>
            </div>
            <ul className="space-y-2">
              {report.advice.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Follow-up */}
          <section className="p-4 bg-medical-blue/5 border border-medical-blue/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-medical-blue" />
              <h4 className="font-semibold text-medical-blue">Follow-up</h4>
            </div>
            <p className="text-foreground">{report.followUp}</p>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
