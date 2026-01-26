import { Stethoscope } from 'lucide-react';

export function Header() {
  return (
    <header className="hero-gradient border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl medical-gradient flex items-center justify-center shadow-glow">
              <Stethoscope className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-heading">
                MedScribe AI
              </h1>
              <p className="text-sm text-muted-foreground">
                Smart Prescription Generator
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
