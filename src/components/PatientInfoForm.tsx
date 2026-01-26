import { User, Calendar, Users, MapPin, Briefcase, Heart, Activity, Thermometer, Scale } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export interface PatientInfo {
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

interface PatientInfoFormProps {
  patientInfo: PatientInfo;
  vitals: PatientVitals;
  onPatientInfoChange: (info: PatientInfo) => void;
  onVitalsChange: (vitals: PatientVitals) => void;
  disabled?: boolean;
}

export function PatientInfoForm({ patientInfo, vitals, onPatientInfoChange, onVitalsChange, disabled }: PatientInfoFormProps) {
  const handleChange = (field: keyof PatientInfo, value: string) => {
    onPatientInfoChange({ ...patientInfo, [field]: value });
  };

  const handleVitalsChange = (field: keyof PatientVitals, value: string) => {
    onVitalsChange({ ...vitals, [field]: value });
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-heading">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Patient Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="patient-name" className="text-xs sm:text-sm flex items-center gap-1.5">
              <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Patient Name
            </Label>
            <Input
              id="patient-name"
              placeholder="Enter patient name"
              value={patientInfo.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={disabled}
              className="h-9 sm:h-10 text-sm"
              maxLength={100}
            />
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="patient-age" className="text-xs sm:text-sm flex items-center gap-1.5">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Age
            </Label>
            <Input
              id="patient-age"
              type="number"
              placeholder="Age"
              value={patientInfo.age}
              onChange={(e) => handleChange('age', e.target.value)}
              disabled={disabled}
              className="h-9 sm:h-10 text-sm"
              min={0}
              max={150}
            />
          </div>
          
          <div className="space-y-1.5 sm:space-y-2 col-span-2 sm:col-span-1">
            <Label htmlFor="patient-gender" className="text-xs sm:text-sm flex items-center gap-1.5">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Gender
            </Label>
            <Select 
              value={patientInfo.gender} 
              onValueChange={(value) => handleChange('gender', value)}
              disabled={disabled}
            >
              <SelectTrigger id="patient-gender" className="h-9 sm:h-10 text-sm">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="child-male">Child (Male)</SelectItem>
                <SelectItem value="child-female">Child (Female)</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Basic Info Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="patient-occupation" className="text-xs sm:text-sm flex items-center gap-1.5">
              <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Occupation
            </Label>
            <Input
              id="patient-occupation"
              placeholder="Enter occupation"
              value={patientInfo.occupation}
              onChange={(e) => handleChange('occupation', e.target.value)}
              disabled={disabled}
              className="h-9 sm:h-10 text-sm"
              maxLength={100}
            />
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="patient-address" className="text-xs sm:text-sm flex items-center gap-1.5">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Address
            </Label>
            <Input
              id="patient-address"
              placeholder="Enter address"
              value={patientInfo.address}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={disabled}
              className="h-9 sm:h-10 text-sm"
              maxLength={200}
            />
          </div>
        </div>

        {/* Vitals Section */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="vitals" className="border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Heart className="w-4 h-4 text-red-500" />
                Vitals
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bp" className="text-xs flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    BP (mmHg)
                  </Label>
                  <Input
                    id="bp"
                    placeholder="120/80"
                    value={vitals.bloodPressure}
                    onChange={(e) => handleVitalsChange('bloodPressure', e.target.value)}
                    disabled={disabled}
                    className="h-8 text-sm"
                    maxLength={20}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="pulse" className="text-xs flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Pulse (bpm)
                  </Label>
                  <Input
                    id="pulse"
                    placeholder="72"
                    value={vitals.pulse}
                    onChange={(e) => handleVitalsChange('pulse', e.target.value)}
                    disabled={disabled}
                    className="h-8 text-sm"
                    maxLength={10}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="temp" className="text-xs flex items-center gap-1">
                    <Thermometer className="w-3 h-3" />
                    Temp (°F)
                  </Label>
                  <Input
                    id="temp"
                    placeholder="98.6"
                    value={vitals.temperature}
                    onChange={(e) => handleVitalsChange('temperature', e.target.value)}
                    disabled={disabled}
                    className="h-8 text-sm"
                    maxLength={10}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="spo2" className="text-xs flex items-center gap-1">
                    SpO2 (%)
                  </Label>
                  <Input
                    id="spo2"
                    placeholder="98"
                    value={vitals.spo2}
                    onChange={(e) => handleVitalsChange('spo2', e.target.value)}
                    disabled={disabled}
                    className="h-8 text-sm"
                    maxLength={10}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="weight" className="text-xs flex items-center gap-1">
                    <Scale className="w-3 h-3" />
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    placeholder="70"
                    value={vitals.weight}
                    onChange={(e) => handleVitalsChange('weight', e.target.value)}
                    disabled={disabled}
                    className="h-8 text-sm"
                    maxLength={10}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="height" className="text-xs flex items-center gap-1">
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    placeholder="170"
                    value={vitals.height}
                    onChange={(e) => handleVitalsChange('height', e.target.value)}
                    disabled={disabled}
                    className="h-8 text-sm"
                    maxLength={10}
                  />
                </div>
                
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="rr" className="text-xs flex items-center gap-1">
                    Resp. Rate (/min)
                  </Label>
                  <Input
                    id="rr"
                    placeholder="16"
                    value={vitals.respiratoryRate}
                    onChange={(e) => handleVitalsChange('respiratoryRate', e.target.value)}
                    disabled={disabled}
                    className="h-8 text-sm"
                    maxLength={10}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
