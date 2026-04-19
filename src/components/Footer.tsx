import { Calculator, ExternalLink, Heart } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  const otherApps = [
    {
      name: "Résumé Lab",
      url: "https://deanufriana.github.io/resume-lab/",
      description: "Platform pembuat CV profesional dengan optimasi ATS."
    },
    {
      name: "Sistem Skripsi",
      url: "https://github.com/deanufriana/sistem_skripsi",
      description: "Sistem manajemen skripsi online terpadu."
    }
  ];

  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/deanufriana",
      icon: Github
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/deanufriana",
      icon: Linkedin
    }
  ];

  const handleLinkClick = (url: string, name: string) => {
    trackEvent("Footer Link", "Click", name);
  };

  return (
    <footer className="border-t bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md py-12 mt-20 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 blur-3xl rounded-full pointer-events-none"></div>
      
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand & Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center transition-transform group-hover:rotate-12">
                <Calculator className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight">Simulasi KPR</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Membantu Anda merencanakan pembiayaan hunian impian dengan kalkulasi transparan dan akurat.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/10 rounded-full"
                  onClick={() => handleLinkClick(social.url, social.name)}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Other Apps */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Aplikasi Lainnya</h3>
            <ul className="space-y-3">
              {otherApps.map((app) => (
                <li key={app.name}>
                  <a 
                    href={app.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-0.5"
                    onClick={() => handleLinkClick(app.url, app.name)}
                  >
                    <div className="flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                      {app.name}
                      <ExternalLink className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
                    </div>
                    <span className="text-xs text-muted-foreground truncate max-w-[250px]">{app.description}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Built With</h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Tailwind', 'Shadcn UI', 'ExcelJS'].map((tech) => (
                <span key={tech}
                  className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-[10px] font-semibold text-muted-foreground border border-border/50 uppercase tracking-tight shadow-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="pt-4 flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                Butuh solusi kustom atau kolaborasi?
              </p>
              <a href="mailto:devi.nufriana@gmail.com" className="text-sm font-semibold text-primary hover:underline group inline-flex items-center">
                Hubungi saya <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Area */}
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          <div className="flex items-center gap-1.5 select-none">
            <span>&copy; {currentYear} Simulasi KPR. Created with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <a 
              href="https://github.com/deanufriana" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              deanufriana
            </a>
          </div>
          <div className="flex gap-6 items-center">
            <span className="font-bold">v1.2.0</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="font-bold">Jakarta, Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
