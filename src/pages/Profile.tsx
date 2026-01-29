import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Save, Building2, User, Settings, CreditCard } from 'lucide-react';

interface ProfileData {
  full_name: string;
  clinic_name: string;
  clinic_address: string;
  clinic_phone: string;
  doctor_name: string;
  doctor_qualifications: string;
  registration_number: string;
}

interface PreferencesData {
  show_past_history: boolean;
  show_drug_history: boolean;
  show_vaccination_history: boolean;
  show_birth_history: boolean;
  show_pregnancy_history: boolean;
  show_family_history: boolean;
  show_investigations: boolean;
  show_advice: boolean;
  show_diet_chart: boolean;
  default_follow_up_days: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading, credits } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    clinic_name: '',
    clinic_address: '',
    clinic_phone: '',
    doctor_name: '',
    doctor_qualifications: '',
    registration_number: '',
  });

  const [preferences, setPreferences] = useState<PreferencesData>({
    show_past_history: true,
    show_drug_history: true,
    show_vaccination_history: true,
    show_birth_history: true,
    show_pregnancy_history: true,
    show_family_history: true,
    show_investigations: true,
    show_advice: true,
    show_diet_chart: true,
    default_follow_up_days: 7,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    setIsLoadingProfile(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          clinic_name: profileData.clinic_name || '',
          clinic_address: profileData.clinic_address || '',
          clinic_phone: profileData.clinic_phone || '',
          doctor_name: profileData.doctor_name || '',
          doctor_qualifications: profileData.doctor_qualifications || '',
          registration_number: profileData.registration_number || '',
        });
      }

      // Fetch preferences
      const { data: prefsData } = await supabase
        .from('consultation_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (prefsData) {
        setPreferences({
          show_past_history: prefsData.show_past_history ?? true,
          show_drug_history: prefsData.show_drug_history ?? true,
          show_vaccination_history: prefsData.show_vaccination_history ?? true,
          show_birth_history: prefsData.show_birth_history ?? true,
          show_pregnancy_history: prefsData.show_pregnancy_history ?? true,
          show_family_history: prefsData.show_family_history ?? true,
          show_investigations: prefsData.show_investigations ?? true,
          show_advice: prefsData.show_advice ?? true,
          show_diet_chart: prefsData.show_diet_chart ?? true,
          default_follow_up_days: prefsData.default_follow_up_days ?? 7,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('consultation_preferences')
        .update(preferences)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground font-heading">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your clinic details and consultation preferences</p>
        </div>

        {/* Credits Card */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Consultation Credits</h3>
                  <p className="text-sm text-muted-foreground">
                    {credits?.remaining ?? 0} of {credits?.total ?? 10} credits remaining
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{credits?.remaining ?? 0}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </div>
            {credits && credits.remaining <= 2 && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                ⚠️ Low credits! Contact admin to add more credits.
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="clinic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="clinic" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clinic Info</span>
            </TabsTrigger>
            <TabsTrigger value="doctor" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Doctor Details</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          {/* Clinic Info Tab */}
          <TabsContent value="clinic">
            <Card>
              <CardHeader>
                <CardTitle>Clinic Information</CardTitle>
                <CardDescription>This information will appear on your prescription reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinic_name">Clinic Name</Label>
                    <Input
                      id="clinic_name"
                      value={profile.clinic_name}
                      onChange={(e) => setProfile({ ...profile, clinic_name: e.target.value })}
                      placeholder="ABC Medical Clinic"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic_phone">Phone Number</Label>
                    <Input
                      id="clinic_phone"
                      value={profile.clinic_phone}
                      onChange={(e) => setProfile({ ...profile, clinic_phone: e.target.value })}
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic_address">Clinic Address</Label>
                  <Input
                    id="clinic_address"
                    value={profile.clinic_address}
                    onChange={(e) => setProfile({ ...profile, clinic_address: e.target.value })}
                    placeholder="123 Medical Street, City - 500001"
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Clinic Info
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctor Details Tab */}
          <TabsContent value="doctor">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Details</CardTitle>
                <CardDescription>Your professional information for prescriptions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor_name">Doctor Name</Label>
                    <Input
                      id="doctor_name"
                      value={profile.doctor_name}
                      onChange={(e) => setProfile({ ...profile, doctor_name: e.target.value })}
                      placeholder="Dr. John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registration_number">Registration Number</Label>
                    <Input
                      id="registration_number"
                      value={profile.registration_number}
                      onChange={(e) => setProfile({ ...profile, registration_number: e.target.value })}
                      placeholder="MCI-12345"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor_qualifications">Qualifications</Label>
                  <Input
                    id="doctor_qualifications"
                    value={profile.doctor_qualifications}
                    onChange={(e) => setProfile({ ...profile, doctor_qualifications: e.target.value })}
                    placeholder="MBBS, MD, FRCP"
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Doctor Details
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Consultation Preferences</CardTitle>
                <CardDescription>Customize which sections appear in your prescription reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Report Sections</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: 'show_past_history', label: 'Past History' },
                      { key: 'show_drug_history', label: 'Drug History' },
                      { key: 'show_vaccination_history', label: 'Vaccination History' },
                      { key: 'show_birth_history', label: 'Birth History (Children)' },
                      { key: 'show_pregnancy_history', label: 'Pregnancy History (Women)' },
                      { key: 'show_family_history', label: 'Family History' },
                      { key: 'show_investigations', label: 'Investigations' },
                      { key: 'show_advice', label: 'Advice Section' },
                      { key: 'show_diet_chart', label: 'Diet Chart' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <Label htmlFor={key} className="cursor-pointer">{label}</Label>
                        <Switch
                          id={key}
                          checked={preferences[key as keyof PreferencesData] as boolean}
                          onCheckedChange={(checked) => setPreferences({ ...preferences, [key]: checked })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="default_follow_up_days">Default Follow-up (Days)</Label>
                  <Input
                    id="default_follow_up_days"
                    type="number"
                    min={1}
                    max={90}
                    value={preferences.default_follow_up_days}
                    onChange={(e) => setPreferences({ ...preferences, default_follow_up_days: parseInt(e.target.value) || 7 })}
                    className="w-32"
                  />
                </div>

                <Button onClick={handleSavePreferences} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
