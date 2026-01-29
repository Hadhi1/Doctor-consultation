import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Stethoscope, User, Settings, Shield, LogOut, CreditCard, LogIn } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const { user, isAdmin, credits, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="hero-gradient border-b border-border">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl medical-gradient flex items-center justify-center shadow-glow">
              <Stethoscope className="w-5 h-5 sm:w-7 sm:h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground font-heading">
                MedScribe AI
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Smart Prescription Generator
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {!loading && (
              <>
                {user ? (
                  <>
                    {/* Credits Badge */}
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <CreditCard className="w-4 h-4" />
                      <span>{credits?.remaining ?? 0} credits</span>
                    </div>

                    {/* User Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-full">
                          <User className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <div className="px-3 py-2">
                          <p className="font-medium text-sm truncate">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {credits?.remaining ?? 0} credits remaining
                          </p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/profile')}>
                          <Settings className="w-4 h-4 mr-2" />
                          Profile Settings
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem onClick={() => navigate('/admin')}>
                            <Shield className="w-4 h-4 mr-2" />
                            Admin Portal
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Button onClick={() => navigate('/auth')} size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
