import { PrescriptionReport as PrescriptionReportType } from '@/types/prescription';
import { PatientInfo, PatientVitals } from '@/components/PatientInfoForm';
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
  CheckCircle,
  FileDown,
  MessageCircle,
  Printer,
  User,
  MapPin,
  Briefcase,
  Heart,
  History,
  Syringe,
  Baby,
  Users,
  FlaskConical,
  Apple
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface PrescriptionReportProps {
  report: PrescriptionReportType | null;
  isGenerating: boolean;
  patientDetails?: PatientInfo;
  patientVitals?: PatientVitals;
}

export function PrescriptionReportComponent({ report, isGenerating, patientDetails, patientVitals }: PrescriptionReportProps) {
  const [copied, setCopied] = useState(false);

  const patientName = patientDetails?.name || 'Not provided';
  const patientAge = patientDetails?.age || 'N/A';
  const patientGender = patientDetails?.gender ? patientDetails.gender.charAt(0).toUpperCase() + patientDetails.gender.slice(1) : 'N/A';
  const patientAddress = patientDetails?.address || 'N/A';
  const patientOccupation = patientDetails?.occupation || 'N/A';

  const isChild = patientDetails?.gender?.includes('child');
  const isFemale = patientDetails?.gender === 'female' || patientDetails?.gender === 'child-female';

  if (isGenerating) {
    return (
      <div className="medical-card">
        <div className="flex flex-col items-center py-8 sm:py-12">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-4 sm:mb-6">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground font-heading mb-2 text-center">
            Generating Prescription Report...
          </h3>
          <p className="text-muted-foreground text-center text-sm sm:text-base px-4">
            AI is analyzing the consultation and preparing a detailed prescription
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="medical-card text-center py-8 sm:py-12">
        <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 font-heading">
          No Prescription Report Yet
        </h3>
        <p className="text-muted-foreground text-sm sm:text-base px-4">
          Record and complete a consultation to generate the prescription report
        </p>
      </div>
    );
  }

  const formatVitals = () => {
    if (!patientVitals) return 'N/A';
    const vitals = [];
    if (patientVitals.bloodPressure) vitals.push(`BP: ${patientVitals.bloodPressure} mmHg`);
    if (patientVitals.pulse) vitals.push(`Pulse: ${patientVitals.pulse} bpm`);
    if (patientVitals.temperature) vitals.push(`Temp: ${patientVitals.temperature}°F`);
    if (patientVitals.spo2) vitals.push(`SpO2: ${patientVitals.spo2}%`);
    if (patientVitals.weight) vitals.push(`Weight: ${patientVitals.weight} kg`);
    if (patientVitals.height) vitals.push(`Height: ${patientVitals.height} cm`);
    if (patientVitals.respiratoryRate) vitals.push(`RR: ${patientVitals.respiratoryRate}/min`);
    return vitals.length > 0 ? vitals.join(' | ') : 'N/A';
  };

  const formatReportAsText = () => {
    const lines = [
      '═══════════════════════════════════════',
      '         PRESCRIPTION REPORT',
      '             Habsen Tech',
      '═══════════════════════════════════════',
      '',
      `Generated: ${report.generatedAt.toLocaleString('en-IN')}`,
      '',
      '── PATIENT DETAILS ──',
      `Name: ${patientName}`,
      `Age: ${patientAge}`,
      `Gender: ${patientGender}`,
      `Address: ${patientAddress}`,
      `Occupation: ${patientOccupation}`,
      '',
      '── VITALS ──',
      formatVitals(),
      '',
      '── PATIENT SYMPTOMS ──',
      ...report.patientInfo.symptoms.map(s => `• ${s}`),
      '',
      '── CURRENT CONDITION ──',
      report.patientInfo.currentCondition,
      '',
      '── PAST HISTORY ──',
      report.pastHistory || 'Not discussed',
      '',
      '── DRUG HISTORY ──',
      report.drugHistory || 'Not discussed',
      '',
      '── VACCINATION HISTORY ──',
      report.vaccinationHistory || 'Not discussed',
      '',
    ];

    if (isChild) {
      lines.push('── BIRTH HISTORY ──');
      lines.push(report.childrenBirthHistory || 'Not applicable');
      lines.push('');
    }

    if (isFemale && !isChild) {
      lines.push('── PREGNANCY HISTORY ──');
      lines.push(report.pregnancyHistory || 'Not applicable');
      lines.push('');
    }

    lines.push(
      '── FAMILY HISTORY ──',
      report.familyHistory || 'Not discussed',
      '',
      '── INVESTIGATIONS ──',
      ...(report.investigations?.length > 0 ? report.investigations.map(i => `• ${i}`) : ['• None advised']),
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
      '── DIET CHART ──',
      ...(report.dietChart?.length > 0 ? report.dietChart.map(d => `• ${d}`) : ['• Follow balanced diet']),
      '',
      '── FOLLOW-UP ──',
      report.followUp,
      '',
      '═══════════════════════════════════════',
      'Developed by Habsen Tech',
      'Email: hadhi@habsentech.com',
      'Phone: +91 8919247590',
      '═══════════════════════════════════════',
    );
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

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let y = 20;
    const lineHeight = 6;
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;

    // Header
    pdf.setFillColor(13, 148, 136);
    pdf.rect(0, 0, pageWidth, 35, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRESCRIPTION REPORT', pageWidth / 2, 15, { align: 'center' });
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Habsen Tech', pageWidth / 2, 24, { align: 'center' });
    pdf.text(`Generated: ${report.generatedAt.toLocaleString('en-IN')}`, pageWidth / 2, 31, { align: 'center' });

    y = 45;
    pdf.setTextColor(0, 0, 0);

    // Patient Details Box
    pdf.setFillColor(240, 253, 250);
    pdf.roundedRect(margin - 3, y - 3, maxWidth + 6, 32, 2, 2, 'F');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(13, 148, 136);
    pdf.text('PATIENT DETAILS', margin, y + 4);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    pdf.text(`Name: ${patientName}  |  Age: ${patientAge}  |  Gender: ${patientGender}`, margin, y + 12);
    pdf.text(`Address: ${patientAddress}  |  Occupation: ${patientOccupation}`, margin, y + 20);
    pdf.text(`Vitals: ${formatVitals()}`, margin, y + 28);
    y += 42;

    // Helper function to add section
    const addSection = (title: string, content: string | string[]) => {
      if (y > 260) {
        pdf.addPage();
        y = 15;
      }
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(13, 148, 136);
      pdf.text(title, margin, y);
      y += lineHeight + 1;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      
      if (Array.isArray(content)) {
        content.forEach(item => {
          const lines = pdf.splitTextToSize(`• ${item}`, maxWidth);
          lines.forEach((line: string) => {
            if (y > 275) {
              pdf.addPage();
              y = 15;
            }
            pdf.text(line, margin, y);
            y += lineHeight;
          });
        });
      } else {
        const lines = pdf.splitTextToSize(content || 'N/A', maxWidth);
        lines.forEach((line: string) => {
          if (y > 275) {
            pdf.addPage();
            y = 15;
          }
          pdf.text(line, margin, y);
          y += lineHeight;
        });
      }
      y += 3;
    };

    // Sections
    addSection('SYMPTOMS', report.patientInfo.symptoms);
    addSection('CURRENT CONDITION', report.patientInfo.currentCondition);
    addSection('PAST HISTORY', report.pastHistory || 'Not discussed');
    addSection('DRUG HISTORY', report.drugHistory || 'Not discussed');
    addSection('VACCINATION HISTORY', report.vaccinationHistory || 'Not discussed');

    if (isChild) {
      addSection('BIRTH HISTORY', report.childrenBirthHistory || 'Not applicable');
    }

    if (isFemale && !isChild) {
      addSection('PREGNANCY HISTORY', report.pregnancyHistory || 'Not applicable');
    }

    addSection('FAMILY HISTORY', report.familyHistory || 'Not discussed');
    addSection('INVESTIGATIONS', report.investigations?.length > 0 ? report.investigations : ['None advised']);
    
    // Diagnosis with highlight
    if (y > 250) {
      pdf.addPage();
      y = 15;
    }
    pdf.setFillColor(240, 253, 250);
    pdf.roundedRect(margin - 3, y - 3, maxWidth + 6, 18, 2, 2, 'F');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(13, 148, 136);
    pdf.text('DIAGNOSIS', margin, y + 4);
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text(report.diagnosis, margin, y + 12);
    y += 25;

    // Medications
    if (y > 200) {
      pdf.addPage();
      y = 15;
    }
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(13, 148, 136);
    pdf.text('MEDICATIONS', margin, y);
    y += lineHeight + 3;

    report.medications.forEach((med, index) => {
      if (y > 245) {
        pdf.addPage();
        y = 15;
      }
      
      pdf.setFillColor(240, 253, 244);
      pdf.roundedRect(margin - 3, y - 3, maxWidth + 6, 28, 2, 2, 'F');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(34, 197, 94);
      pdf.text(`${index + 1}. ${med.name}`, margin, y + 3);
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Dosage: ${med.dosage}  |  Frequency: ${med.frequency}  |  Duration: ${med.duration}`, margin, y + 11);
      pdf.text(`Instructions: ${med.instructions}`, margin, y + 18);
      
      y += 34;
    });

    addSection('MEDICAL ADVICE', report.advice);
    addSection('DIET CHART', report.dietChart?.length > 0 ? report.dietChart : ['Follow balanced diet']);
    addSection('FOLLOW-UP', report.followUp);

    // Footer
    const footerY = pdf.internal.pageSize.getHeight() - 12;
    pdf.setFillColor(30, 41, 59);
    pdf.rect(0, footerY - 8, pageWidth, 20, 'F');
    
    pdf.setFontSize(7);
    pdf.setTextColor(255, 255, 255);
    pdf.text('Developed by Habsen Tech | Email: hadhi@habsentech.com | Phone: +91 8919247590', pageWidth / 2, footerY, { align: 'center' });

    pdf.save(`prescription-${report.id}.pdf`);
    toast.success('PDF downloaded successfully!');
  };

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription Report - ${patientName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 15px; color: #333; font-size: 11px; }
          .header { background: #0D9488; color: white; padding: 15px; text-align: center; margin-bottom: 15px; border-radius: 6px; }
          .header h1 { font-size: 18px; margin-bottom: 4px; }
          .header p { font-size: 10px; opacity: 0.9; }
          .patient-box { background: #f0fdfa; border: 1px solid #0D9488; padding: 12px; border-radius: 6px; margin-bottom: 12px; }
          .patient-box h3 { color: #0D9488; margin-bottom: 6px; font-size: 11px; }
          .patient-info { font-size: 10px; line-height: 1.6; }
          .patient-info span { display: inline-block; margin-right: 15px; }
          .section { margin-bottom: 12px; }
          .section h3 { color: #0D9488; border-bottom: 1px solid #0D9488; padding-bottom: 3px; margin-bottom: 6px; font-size: 11px; }
          .section p, .section li { font-size: 10px; line-height: 1.5; }
          .symptoms { display: flex; flex-wrap: wrap; gap: 5px; }
          .symptom { background: #FEF3C7; color: #D97706; padding: 2px 8px; border-radius: 10px; font-size: 9px; }
          .medication { background: #f0fdf4; border: 1px solid #22c55e; padding: 8px; border-radius: 6px; margin-bottom: 6px; }
          .medication h4 { color: #22c55e; margin-bottom: 4px; font-size: 11px; }
          .medication-details { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; font-size: 9px; }
          .diagnosis { background: #f0fdfa; border: 1px solid #0D9488; padding: 10px; border-radius: 6px; }
          .diagnosis h3 { color: #0D9488; margin-bottom: 5px; }
          .diagnosis p { font-weight: 500; }
          .follow-up { background: #EFF6FF; border: 1px solid #3B82F6; padding: 10px; border-radius: 6px; }
          .follow-up h3 { color: #3B82F6; margin-bottom: 5px; }
          .footer { background: #1e293b; color: white; padding: 10px; text-align: center; margin-top: 20px; border-radius: 6px; font-size: 9px; }
          ul { padding-left: 15px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          @media print { body { padding: 8px; } .header, .footer { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PRESCRIPTION REPORT</h1>
          <p>Habsen Tech</p>
          <p>Generated: ${report.generatedAt.toLocaleString('en-IN')}</p>
        </div>
        
        <div class="patient-box">
          <h3>PATIENT DETAILS</h3>
          <div class="patient-info">
            <span><strong>Name:</strong> ${patientName}</span>
            <span><strong>Age:</strong> ${patientAge}</span>
            <span><strong>Gender:</strong> ${patientGender}</span>
            <span><strong>Address:</strong> ${patientAddress}</span>
            <span><strong>Occupation:</strong> ${patientOccupation}</span>
          </div>
          <div class="patient-info" style="margin-top: 5px;">
            <strong>Vitals:</strong> ${formatVitals()}
          </div>
        </div>
        
        <div class="section">
          <h3>SYMPTOMS</h3>
          <div class="symptoms">
            ${report.patientInfo.symptoms.map(s => `<span class="symptom">${s}</span>`).join('')}
          </div>
        </div>
        
        <div class="section">
          <h3>CURRENT CONDITION</h3>
          <p>${report.patientInfo.currentCondition}</p>
        </div>

        <div class="grid-2">
          <div class="section">
            <h3>PAST HISTORY</h3>
            <p>${report.pastHistory || 'Not discussed'}</p>
          </div>
          
          <div class="section">
            <h3>DRUG HISTORY</h3>
            <p>${report.drugHistory || 'Not discussed'}</p>
          </div>
        </div>

        <div class="grid-2">
          <div class="section">
            <h3>VACCINATION HISTORY</h3>
            <p>${report.vaccinationHistory || 'Not discussed'}</p>
          </div>
          
          <div class="section">
            <h3>FAMILY HISTORY</h3>
            <p>${report.familyHistory || 'Not discussed'}</p>
          </div>
        </div>

        ${isChild ? `
        <div class="section">
          <h3>BIRTH HISTORY</h3>
          <p>${report.childrenBirthHistory || 'Not applicable'}</p>
        </div>
        ` : ''}

        ${isFemale && !isChild ? `
        <div class="section">
          <h3>PREGNANCY HISTORY</h3>
          <p>${report.pregnancyHistory || 'Not applicable'}</p>
        </div>
        ` : ''}

        <div class="section">
          <h3>INVESTIGATIONS</h3>
          <ul>
            ${report.investigations?.length > 0 ? report.investigations.map(i => `<li>${i}</li>`).join('') : '<li>None advised</li>'}
          </ul>
        </div>
        
        <div class="section diagnosis">
          <h3>DIAGNOSIS</h3>
          <p>${report.diagnosis}</p>
        </div>
        
        <div class="section">
          <h3>MEDICATIONS</h3>
          ${report.medications.map((med, i) => `
            <div class="medication">
              <h4>${i + 1}. ${med.name}</h4>
              <div class="medication-details">
                <span><strong>Dosage:</strong> ${med.dosage}</span>
                <span><strong>Frequency:</strong> ${med.frequency}</span>
                <span><strong>Duration:</strong> ${med.duration}</span>
                <span><strong>Instructions:</strong> ${med.instructions}</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="grid-2">
          <div class="section">
            <h3>MEDICAL ADVICE</h3>
            <ul>
              ${report.advice.map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
          
          <div class="section">
            <h3>DIET CHART</h3>
            <ul>
              ${report.dietChart?.length > 0 ? report.dietChart.map(d => `<li>${d}</li>`).join('') : '<li>Follow balanced diet</li>'}
            </ul>
          </div>
        </div>
        
        <div class="section follow-up">
          <h3>FOLLOW-UP</h3>
          <p>${report.followUp}</p>
        </div>
        
        <div class="footer">
          <p>Developed by Habsen Tech | Email: hadhi@habsentech.com | Phone: +91 8919247590</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    toast.success('Opening print dialog...');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(formatReportAsText());
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground font-heading">
            Prescription Report
          </h3>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs sm:text-sm">
            {copied ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="text-xs sm:text-sm">
            <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">TXT</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="text-xs sm:text-sm">
            <FileDown className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs sm:text-sm">
            <Printer className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button variant="default" size="sm" onClick={handleWhatsAppShare} className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm col-span-2 sm:col-span-1">
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={handleShare} className="text-xs sm:text-sm col-span-2 sm:col-span-1">
            <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[600px] pr-2 sm:pr-4">
        <div className="space-y-4 sm:space-y-5">
          {/* Patient Details */}
          <section className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <User className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-primary text-sm sm:text-base">Patient Details</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              <div><span className="text-muted-foreground">Name:</span> <span className="text-foreground font-medium">{patientName}</span></div>
              <div><span className="text-muted-foreground">Age:</span> <span className="text-foreground font-medium">{patientAge}</span></div>
              <div><span className="text-muted-foreground">Gender:</span> <span className="text-foreground font-medium">{patientGender}</span></div>
              <div className="col-span-2 sm:col-span-1"><span className="text-muted-foreground">Occupation:</span> <span className="text-foreground font-medium">{patientOccupation}</span></div>
              <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span className="text-foreground font-medium">{patientAddress}</span></div>
            </div>
          </section>

          {/* Vitals */}
          {patientVitals && (
            <section className="p-3 sm:p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-red-500" />
                <h4 className="font-semibold text-red-600 dark:text-red-400 text-sm sm:text-base">Vitals</h4>
              </div>
              <p className="text-sm text-muted-foreground">{formatVitals()}</p>
            </section>
          )}

          {/* Symptoms */}
          <section>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <AlertCircle className="w-4 h-4 text-medical-orange" />
              <h4 className="font-semibold text-foreground text-sm sm:text-base">Patient Symptoms</h4>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {report.patientInfo.symptoms.map((symptom, i) => (
                <span key={i} className="px-2 sm:px-3 py-1 sm:py-1.5 bg-medical-orange/10 text-medical-orange rounded-full text-xs sm:text-sm">
                  {symptom}
                </span>
              ))}
            </div>
          </section>

          {/* Current Condition */}
          <section>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Stethoscope className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-foreground text-sm sm:text-base">Current Condition</h4>
            </div>
            <p className="text-muted-foreground p-2 sm:p-3 bg-muted/50 rounded-lg text-sm">
              {report.patientInfo.currentCondition}
            </p>
          </section>

          {/* Past History */}
          <section>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <History className="w-4 h-4 text-purple-500" />
              <h4 className="font-semibold text-foreground text-sm sm:text-base">Past History</h4>
            </div>
            <p className="text-muted-foreground p-2 sm:p-3 bg-muted/50 rounded-lg text-sm">
              {report.pastHistory || 'Not discussed'}
            </p>
          </section>

          {/* Drug History */}
          <section>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Pill className="w-4 h-4 text-orange-500" />
              <h4 className="font-semibold text-foreground text-sm sm:text-base">Drug History</h4>
            </div>
            <p className="text-muted-foreground p-2 sm:p-3 bg-muted/50 rounded-lg text-sm">
              {report.drugHistory || 'Not discussed'}
            </p>
          </section>

          {/* Vaccination History */}
          <section>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Syringe className="w-4 h-4 text-blue-500" />
              <h4 className="font-semibold text-foreground text-sm sm:text-base">Vaccination History</h4>
            </div>
            <p className="text-muted-foreground p-2 sm:p-3 bg-muted/50 rounded-lg text-sm">
              {report.vaccinationHistory || 'Not discussed'}
            </p>
          </section>

          {/* Birth History (for children) */}
          {isChild && (
            <section>
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Baby className="w-4 h-4 text-pink-500" />
                <h4 className="font-semibold text-foreground text-sm sm:text-base">Birth History</h4>
              </div>
              <p className="text-muted-foreground p-2 sm:p-3 bg-muted/50 rounded-lg text-sm">
                {report.childrenBirthHistory || 'Not applicable'}
              </p>
            </section>
          )}

          {/* Pregnancy History (for women) */}
          {isFemale && !isChild && (
            <section>
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Baby className="w-4 h-4 text-pink-500" />
                <h4 className="font-semibold text-foreground text-sm sm:text-base">Pregnancy History</h4>
              </div>
              <p className="text-muted-foreground p-2 sm:p-3 bg-muted/50 rounded-lg text-sm">
                {report.pregnancyHistory || 'Not applicable'}
              </p>
            </section>
          )}

          {/* Family History */}
          <section>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Users className="w-4 h-4 text-indigo-500" />
              <h4 className="font-semibold text-foreground text-sm sm:text-base">Family History</h4>
            </div>
            <p className="text-muted-foreground p-2 sm:p-3 bg-muted/50 rounded-lg text-sm">
              {report.familyHistory || 'Not discussed'}
            </p>
          </section>

          {/* Investigations */}
          <section>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <FlaskConical className="w-4 h-4 text-cyan-500" />
              <h4 className="font-semibold text-foreground text-sm sm:text-base">Investigations</h4>
            </div>
            <ul className="space-y-1.5 sm:space-y-2">
              {report.investigations?.length > 0 ? (
                report.investigations.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 sm:mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground text-sm">None advised</li>
              )}
            </ul>
          </section>

          {/* Diagnosis */}
          <section className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Stethoscope className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-primary text-sm sm:text-base">Diagnosis</h4>
            </div>
            <p className="text-foreground font-medium text-sm sm:text-base">{report.diagnosis}</p>
          </section>

          {/* Medications */}
          <section>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Pill className="w-4 h-4 text-medical-green" />
              <h4 className="font-semibold text-foreground text-sm sm:text-base">Medications</h4>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {report.medications.map((med, i) => (
                <div key={i} className="p-3 sm:p-4 bg-medical-green/5 border border-medical-green/20 rounded-xl">
                  <h5 className="font-semibold text-medical-green mb-2 text-sm sm:text-base">{med.name}</h5>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <div><span className="text-muted-foreground">Dosage:</span> <span className="text-foreground">{med.dosage}</span></div>
                    <div><span className="text-muted-foreground">Frequency:</span> <span className="text-foreground">{med.frequency}</span></div>
                    <div><span className="text-muted-foreground">Duration:</span> <span className="text-foreground">{med.duration}</span></div>
                    <div className="col-span-2"><span className="text-muted-foreground">Instructions:</span> <span className="text-foreground">{med.instructions}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Advice */}
          <section>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <ClipboardList className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-foreground text-sm sm:text-base">Medical Advice</h4>
            </div>
            <ul className="space-y-1.5 sm:space-y-2">
              {report.advice.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 sm:mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Diet Chart */}
          <section>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Apple className="w-4 h-4 text-green-600" />
              <h4 className="font-semibold text-foreground text-sm sm:text-base">Diet Chart</h4>
            </div>
            <ul className="space-y-1.5 sm:space-y-2">
              {report.dietChart?.length > 0 ? (
                report.dietChart.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 sm:mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground text-sm">Follow balanced diet as per condition</li>
              )}
            </ul>
          </section>

          {/* Follow-up */}
          <section className="p-3 sm:p-4 bg-medical-blue/5 border border-medical-blue/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-medical-blue" />
              <h4 className="font-semibold text-medical-blue text-sm sm:text-base">Follow-up</h4>
            </div>
            <p className="text-foreground text-sm sm:text-base">{report.followUp}</p>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
