import { Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="font-semibold font-heading">
              Developed by Habsen Tech Communication
            </p>
            <p className="text-sm text-primary-foreground/70 mt-1">
              Innovative Healthcare Solutions
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
            <a 
              href="mailto:hadhi@habsentech.com" 
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <Mail className="w-4 h-4" />
              hadhi@habsentech.com
            </a>
            <a 
              href="tel:+919110593766" 
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <Phone className="w-4 h-4" />
              +91 9110593766
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} Habsen Tech Communication. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
