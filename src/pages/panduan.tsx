import { Card } from "@/components/ui/card";
import { TrendingUp, Lightbulb, ClipboardCheck, CheckCircle2, ShieldCheck } from "lucide-react";

export default function Panduan() {
  return (
    <section className="container py-12">
      <div className="max-w-5xl mx-auto space-y-14">
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Memahami KPR Sebelum Akad
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Ringkasan praktis mengenai cara kerja KPR, perbedaan bunga fixed &amp; floating, serta
            syarat umum pengajuan di Indonesia.
          </p>
        </div>

        {/* Fixed vs Floating & Hybrid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border shadow-sm bg-card p-6 space-y-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold">Fixed vs. Floating Rate</h2>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground">Fixed Rate (Bunga Tetap)</strong> dipatok pada
                angka promo di tahun-tahun awal (misalnya 3–5 tahun). Cicilan Anda stabil selama
                periode ini.
              </p>
              <p>
                <strong className="text-foreground">Floating Rate (Bunga Mengambang)</strong>{" "}
                berlaku setelah masa fixed berakhir dan mengikuti suku bunga pasar. Di sinilah
                cicilan berpotensi naik.
              </p>
            </div>
          </Card>

          <Card className="border shadow-sm bg-card p-6 space-y-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Lightbulb
                className="h-5 w-5 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
              />
            </div>
            <h2 className="text-xl font-bold">Antisipasi &ldquo;KPR Shock&rdquo;</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Hampir semua KPR konvensional menggunakan skema hybrid (Fixed lalu Floating). Selalu
              uji simulasi dengan bunga floating tinggi (11–13%) agar Anda siap ketika masa promo
              berakhir, atau pertimbangkan KPR Syariah jika menginginkan cicilan tetap hingga lunas.
            </p>
          </Card>
        </div>

        {/* Alur & Persyaratan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
              Alur Singkat Pengajuan KPR
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "1. Pengajuan", desc: "Menyerahkan dokumen & verifikasi skor kredit." },
                { title: "2. Persetujuan", desc: "Bank menyetujui plafon & suku bunga (SP3K)." },
                { title: "3. Akad Kredit", desc: "Penandatanganan resmi & serah terima hunian." },
              ].map((step) => (
                <Card key={step.title} className="p-5 border shadow-sm bg-card space-y-2">
                  <h3 className="font-bold text-sm">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </Card>
              ))}
            </div>

            <Card className="border shadow-sm bg-muted/40 p-7 sm:p-8">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">Tips Cerdas Mengambil KPR</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground leading-relaxed">
                  <li className="flex gap-3">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      1
                    </span>
                    Uji cicilan dengan bunga floating 12–14% untuk melihat batas aman Anda.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      2
                    </span>
                    Jaga total cicilan maksimal 30–35% dari penghasilan bersih bulanan.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      3
                    </span>
                    Siapkan dana darurat minimal 6× cicilan sebelum akad kredit.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      4
                    </span>
                    Evaluasi bunga floating berkala dan pertimbangkan take over jika perlu.
                  </li>
                </ul>
              </div>
            </Card>
          </div>

          <Card className="border shadow-sm bg-card p-6 space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2.5">
              <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              Persyaratan Umum
            </h2>
            <div className="space-y-5">
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                  Kriteria Pemohon
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "Warga Negara Indonesia (WNI)",
                    "Usia minimal 21 tahun",
                    "Karyawan tetap min. 2 tahun",
                    "Penghasilan stabil",
                  ].map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <CheckCircle2
                        className="h-4 w-4 text-primary flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2.5 pt-4 border-t">
                <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                  Dokumen Utama
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "KTP, KK, & NPWP",
                    "Slip Gaji 3 bulan terakhir",
                    "Rekening Koran 3–6 bulan",
                    "Surat Keterangan Kerja (SKK)",
                  ].map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <CheckCircle2
                        className="h-4 w-4 text-primary flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              *Kebijakan detail dokumen dapat berbeda di setiap bank.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
