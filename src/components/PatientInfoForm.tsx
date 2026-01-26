import { useState } from 'react';
import { User, Calendar, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface PatientInfo {
  name: string;
  age: string;
  gender: string;
}

interface PatientInfoFormProps {
  patientInfo: PatientInfo;
  onPatientInfoChange: (info: PatientInfo) => void;
  disabled?: boolean;
}

export function PatientInfoForm({ patientInfo, onPatientInfoChange, disabled }: PatientInfoFormProps) {
  const handleChange = (field: keyof PatientInfo, value: string) => {
    onPatientInfoChange({ ...patientInfo, [field]: value });
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-heading">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Patient Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
          
          <div className="space-y-1.5 sm:space-y-2">
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
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
