import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Users, FileText, CreditCard, Plus, Shield, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  credits: {
    total_credits: number;
    used_credits: number;
  } | null;
  role: 'admin' | 'user';
  consultation_count: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalConsultations: 0,
    activeUsers: 0,
    creditsUsed: 0,
  });

  // Add credits dialog
  const [addCreditsOpen, setAddCreditsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState(10);
  const [isAddingCredits, setIsAddingCredits] = useState(false);

  // Add user dialog
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (!loading && user && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      // Fetch all profiles with credits
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Fetch credits for all users
      const { data: allCredits } = await supabase
        .from('user_credits')
        .select('user_id, total_credits, used_credits');

      // Fetch roles
      const { data: allRoles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Fetch consultation counts per user
      const { data: consultations } = await supabase
        .from('consultations')
        .select('user_id');

      // Build user data
      const userData: UserData[] = (profiles || []).map(profile => {
        const userCredits = allCredits?.find(c => c.user_id === profile.id);
        const userRole = allRoles?.find(r => r.user_id === profile.id);
        const userConsultations = consultations?.filter(c => c.user_id === profile.id) || [];

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || 'N/A',
          created_at: profile.created_at,
          credits: userCredits ? {
            total_credits: userCredits.total_credits,
            used_credits: userCredits.used_credits,
          } : null,
          role: userRole?.role as 'admin' | 'user' || 'user',
          consultation_count: userConsultations.length,
        };
      });

      setUsers(userData);

      // Calculate stats
      const totalCreditsUsed = allCredits?.reduce((sum, c) => sum + c.used_credits, 0) || 0;
      const activeUsersCount = userData.filter(u => u.consultation_count > 0).length;

      setStats({
        totalUsers: userData.length,
        totalConsultations: consultations?.length || 0,
        activeUsers: activeUsersCount,
        creditsUsed: totalCreditsUsed,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAddCredits = async () => {
    if (!selectedUser) return;

    setIsAddingCredits(true);
    try {
      const newTotal = (selectedUser.credits?.total_credits || 0) + creditsToAdd;
      
      const { error } = await supabase
        .from('user_credits')
        .update({ total_credits: newTotal })
        .eq('user_id', selectedUser.id);

      if (error) throw error;

      toast.success(`Added ${creditsToAdd} credits to ${selectedUser.email}`);
      setAddCreditsOpen(false);
      setCreditsToAdd(10);
      fetchData();
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error('Failed to add credits');
    } finally {
      setIsAddingCredits(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserName || !newUserPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsAddingUser(true);
    try {
      // Use edge function to create user (requires admin service role)
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { email: newUserEmail, password: newUserPassword, full_name: newUserName },
      });

      if (error) throw error;

      toast.success(`User ${newUserEmail} created successfully!`);
      setAddUserOpen(false);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserPassword('');
      fetchData();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleMakeAdmin = async (userId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id,role' });

      if (error) throw error;

      toast.success(`${email} is now an admin`);
      fetchData();
    } catch (error) {
      console.error('Error making admin:', error);
      toast.error('Failed to update user role');
    }
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-heading">Admin Portal</h1>
            <p className="text-muted-foreground mt-1">Manage users, credits, and view analytics</p>
          </div>
          <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account with 10 free credits</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-user-name">Full Name</Label>
                  <Input
                    id="new-user-name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-user-email">Email</Label>
                  <Input
                    id="new-user-email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="doctor@clinic.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-user-password">Password</Label>
                  <Input
                    id="new-user-password"
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddUserOpen(false)}>Cancel</Button>
                <Button onClick={handleAddUser} disabled={isAddingUser}>
                  {isAddingUser && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalConsultations}</p>
                  <p className="text-sm text-muted-foreground">Consultations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.activeUsers}</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.creditsUsed}</p>
                  <p className="text-sm text-muted-foreground">Credits Used</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Consultations</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{userData.full_name}</p>
                          <p className="text-sm text-muted-foreground">{userData.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={userData.role === 'admin' ? 'default' : 'secondary'}>
                          {userData.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                          {userData.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {userData.credits ? `${userData.credits.total_credits - userData.credits.used_credits}/${userData.credits.total_credits}` : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>{userData.consultation_count}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(userData.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog open={addCreditsOpen && selectedUser?.id === userData.id} onOpenChange={(open) => {
                            setAddCreditsOpen(open);
                            if (open) setSelectedUser(userData);
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">Add Credits</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Credits</DialogTitle>
                                <DialogDescription>
                                  Add credits to {selectedUser?.email}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Label htmlFor="credits-amount">Credits to Add</Label>
                                <Input
                                  id="credits-amount"
                                  type="number"
                                  min={1}
                                  value={creditsToAdd}
                                  onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 10)}
                                  className="mt-2"
                                />
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setAddCreditsOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddCredits} disabled={isAddingCredits}>
                                  {isAddingCredits && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                  Add Credits
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          {userData.role !== 'admin' && (
                            <Button size="sm" variant="ghost" onClick={() => handleMakeAdmin(userData.id, userData.email)}>
                              <Shield className="w-3 h-3 mr-1" />
                              Make Admin
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
