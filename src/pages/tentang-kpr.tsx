import { Card } from "@/components/ui/card";
import { Home, ShieldCheck, ClipboardCheck, CheckCircle2 } from "lucide-react";

export default function TentangKPR() {
  return (
    <section className="container py-12 md:py-24">
      <div className="max-w-6xl mx-auto space-y-16">
          <div className="space-y-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                  <Home className="h-3 w-3" />
                  Wawasan Properti
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mengenal Dasar KPR</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                  Kredit Pemilikan Rumah (KPR) adalah solusi finansial untuk mewujudkan impian memiliki hunian pribadi dengan sistem cicilan yang terencana.
              </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                  <div className="space-y-6">
                      <h3 className="text-2xl font-bold flex items-center gap-3">
                          <ShieldCheck className="h-6 w-6 text-primary" />
                          Bagaimana KPR Bekerja?
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          Secara sederhana, Bank akan melunasi harga rumah kepada penjual atau pengembang, dan Anda akan membayar kembali pinjaman tersebut kepada Bank dalam bentuk angsuran bulanan selama jangka waktu (tenor) tertentu. Rumah tersebut akan menjadi agunan (jaminan) hingga masa kredit selesai.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                          {[
                              { title: "Pengajuan", desc: "Menyerahkan dokumen & verifikasi skor kredit." },
                              { title: "Persetujuan", desc: "Bank menyetujui plafon & suku bunga." },
                              { title: "Akad Kredit", desc: "Penandatanganan resmi & serah terima rumah." }
                          ].map((step, i) => (
                              <div key={i} className="p-5 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 relative">
                                  <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-white dark:bg-slate-950 border flex items-center justify-center font-bold text-sm shadow-sm">{i+1}</div>
                                  <h4 className="font-bold mb-2 pt-2">{step.title}</h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="space-y-6 pt-6">
                      <h3 className="text-2xl font-bold">Jenis KPR di Indonesia</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <Card className="p-6 border shadow-none space-y-3">
                              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Konvensional</div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                  Menggunakan sistem suku bunga pasar (Fixed & Floating). Paling umum digunakan dengan fleksibilitas fitur yang beragam.
                              </p>
                          </Card>
                          <Card className="p-6 border shadow-none space-y-3">
                              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Syariah</div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                  Menggunakan akad jual-beli (Murabahah) atau bagi hasil. Cicilan biasanya tetap dari awal hingga lunas tanpa fluktuasi bunga.
                              </p>
                          </Card>
                      </div>
                  </div>
              </div>

              <Card className="bg-slate-900 text-slate-50 border-none shadow-xl p-8 space-y-6 h-fit">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                      <ClipboardCheck className="h-6 w-6 text-indigo-400" />
                      Persyaratan Umum
                  </h3>
                  <div className="space-y-6">
                      <div className="space-y-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Kriteria Pemohon</p>
                          <ul className="space-y-3">
                              {[
                                  "Warga Negara Indonesia (WNI)",
                                  "Usia minimal 21 tahun",
                                  "Karyawan tetap min. 2 tahun",
                                  "Penghasilan minimum yang stabil"
                              ].map((item, i) => (
                                  <li key={i} className="flex gap-3 text-sm opacity-80">
                                      <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                                      {item}
                                  </li>
                              ))}
                          </ul>
                      </div>
                      
                      <div className="space-y-4 pt-4 border-t border-white/10">
                          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Dokumen Utama</p>
                          <ul className="space-y-3">
                              {[
                                  "KTP, KK, & NPWP",
                                  "Slip Gaji 3 bulan terakhir",
                                  "Rekening Koran 3-6 bulan",
                                  "Surat Keterangan Kerja (SKK)"
                              ].map((item, i) => (
                                  <li key={i} className="flex gap-3 text-sm opacity-80">
                                      <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                                      {item}
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </div>
                  <div className="pt-4">
                      <p className="text-[10px] opacity-40 leading-relaxed italic">
                          *Setiap bank memiliki kebijakan detail dokumen yang berbeda-beda.
                      </p>
                  </div>
              </Card>
          </div>
      </div>
    </section>
  );
}
