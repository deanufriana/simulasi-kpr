import {
  FileText,
  Mail,
  Sparkles,
  Rocket,
  ExternalLink,
  Laptop,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const otherApps = [
  {
    name: "Résumé Lab",
    url: "https://deanufriana.github.io/resume-lab/",
    description:
      "Platform pembuat CV profesional dengan optimasi ATS. Dirancang untuk membantu developer dan engineer menyusun resume berkualitas tinggi berbasis data.",
    tags: ["Vue 3", "Vite", "Tailwind"],
    icon: FileText,
  },
  {
    name: "Sistem Skripsi",
    url: "https://github.com/deanufriana/sistem_skripsi",
    description:
      "Platform terintegrasi untuk mengelola alur kerja skripsi, membuat proses akademik lebih terorganisir dan aksesibel bagi mahasiswa maupun pembimbing.",
    tags: ["PHP", "MySQL", "Web"],
    icon: Laptop,
  },
];

export default function Tentang() {
  const handleContactClick = () => {
    trackEvent("Contact", "Click", "Email");
  };

  const handleExternalLinkClick = (url: string, name: string) => {
    trackEvent("External Link", "Click", name);
  };

  return (
    <div className="container py-12 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero / Vision Section */}
      <section className="max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Visi Kami
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-50">
          Menyederhanakan Perencanaan
          <span className="block bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Keuangan untuk Semua Orang
          </span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Simulasi KPR dibangun dengan tujuan sederhana: menyediakan alat yang transparan dan mudah digunakan bagi pembeli rumah di Indonesia untuk memahami komitmen KPR mereka tanpa kerumitan.
        </p>
      </section>

      {/* Projects Section --> My Other Apps */}
      <section className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
            <Rocket className="w-4 h-4" /> Portofolio
          </div>
          <h2 className="text-3xl font-bold">Aplikasi Lainnya</h2>
          <p className="text-muted-foreground">
            Lihat beberapa proyek dan alat menarik lainnya yang telah saya kembangkan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {otherApps.map((app) => (
            <Card
              key={app.name}
              className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border-2 hover:border-primary/30 bg-card/50 backdrop-blur-sm"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 bg-primary/5 flex items-center justify-center p-8 group-hover:bg-primary/10 transition-colors border-r">
                  <app.icon className="w-12 h-12 text-primary/40 group-hover:text-primary transition-colors group-hover:scale-110 duration-500" />
                </div>
                <div className="md:w-2/3 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold tracking-tight">
                        {app.name}
                      </h3>
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => handleExternalLinkClick(app.url, app.name)}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {app.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {app.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Contact CTA */}
        <Card className="bg-primary text-primary-foreground border-none shadow-2xl">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-bold">
                Tertarik untuk Berkolaborasi?
              </h3>
              <p className="text-primary-foreground/80">
                Saya selalu terbuka untuk mendiskusikan proyek baru atau ide kreatif lainnya.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-full shadow-lg font-bold"
              onClick={handleContactClick}
            >
              <a href="mailto:devi.nufriana@gmail.com">
                <Mail className="w-5 h-5 mr-2" /> Hubungi Saya
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Why Simulasi KPR? */}
      <section className="max-w-4xl mx-auto space-y-8 pt-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Mengapa saya membangun ini</h2>
          <p className="text-muted-foreground">
            Cerita di balik pengembangan alat bantu KPR modern ini.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border space-y-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-bold text-lg">Akurasi & Transparansi</h4>
            <p className="text-sm text-muted-foreground">
              Banyak kalkulator KPR di luar sana yang tidak transparan mengenai biaya bunga floating. Simulasi KPR memberikan rincian lengkap hingga akhir masa tenor.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border space-y-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Laptop className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-bold text-lg">Utamakan Pengalaman Pengguna</h4>
            <p className="text-sm text-muted-foreground">
              Dibangun dengan teknologi modern (React & Vite), aplikasi ini bukan hanya sekadar alat finansial, tetapi juga contoh implementasi UI/UX yang responsif dan cepat.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
