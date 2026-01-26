import { Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground py-6 sm:py-8 mt-auto">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <p className="font-semibold font-heading text-sm sm:text-base">
              Developed by Habsen Tech
            </p>
            <p className="text-xs sm:text-sm text-primary-foreground/70 mt-1">
              Innovative Healthcare Solutions
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <a 
              href="mailto:hadhi@habsentech.com" 
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              hadhi@habsentech.com
            </a>
            <span className="hidden sm:inline text-primary-foreground/30">|</span>
            <a 
              href="tel:+918919247590" 
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              +91 8919247590
            </a>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-primary-foreground/10 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Habsen Tech. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
