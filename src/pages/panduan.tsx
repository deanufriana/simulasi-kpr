import { Card } from "@/components/ui/card";
import { BookOpen, TrendingUp, Lightbulb } from "lucide-react";

export default function Panduan() {
  return (
    <section className="container py-12 md:py-24">
      <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                  <BookOpen className="h-3 w-3" />
                  Edukasi KPR
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Apa itu Simulasi KPR?</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                  Pelajari dasar-dasar Kredit Pemilikan Rumah untuk membantu Anda merencanakan masa depan hunian dengan lebih matang.
              </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              {/* Fixed vs Floating Article */}
              <Card className="border shadow-none bg-white dark:bg-slate-950 p-6 space-y-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold">Fixed vs. Floating Rate</h3>
                  <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      <p>
                          <span className="font-bold text-slate-900 dark:text-slate-100">Fixed Rate (Bunga Tetap)</span> adalah suku bunga yang dipatok pada angka tertentu selama periode awal (misal 3-5 tahun). Cicilan Anda tidak akan berubah selama masa ini, memberikan kepastian finansial.
                      </p>
                      <p>
                          <span className="font-bold text-slate-900 dark:text-slate-100">Floating Rate (Bunga Mengambang)</span> berlaku setelah masa fixed berakhir. Suku bunga akan naik-turun mengikuti suku bunga pasar (BI Rate). Di sinilah pentingnya antisipasi karena cicilan bisa naik sewaktu-waktu.
                      </p>
                  </div>
              </Card>

              {/* Suku Bunga Hybrid */}
              <Card className="border shadow-none bg-white dark:bg-slate-950 p-6 space-y-4">
                  <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold">Masa Transisi (Hybrid)</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      Hampir semua bank di Indonesia menggunakan skema hybrid. Anda mendapatkan bunga rendah di awal sebagai promo, namun harus siap dengan "kejutan" saat memasuki masa floating. Kalkulator ini membantu Anda melihat skenario terburuk agar Anda tidak mengalami <span className="italic font-medium">KPR Shock</span>.
                  </p>
              </Card>
          </div>

          <Card className="border-none shadow-none bg-slate-900 text-slate-50 p-8 sm:p-12 relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                  <h3 className="text-2xl font-bold">Tips Cerdas Mengambil KPR</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm opacity-80 leading-loose">
                      <li className="flex gap-3">
                          <div className="mt-1 h-5 w-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">1</div>
                          Gunakan suku bunga floating yang lebih tinggi (misal 12-14%) dalam simulasi untuk melihat batas maksimal kemampuan bayar Anda.
                      </li>
                      <li className="flex gap-3">
                          <div className="mt-1 h-5 w-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">2</div>
                          Pastikan total cicilan tidak melebihi 30-35% dari pendapatan bersih bulanan Anda untuk menghindari gagal bayar.
                      </li>
                      <li className="flex gap-3">
                          <div className="mt-1 h-5 w-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">3</div>
                          Siapkan dana darurat setara 6-12 kali cicilan bulanan sebelum memutuskan untuk akad KPR.
                      </li>
                      <li className="flex gap-3">
                          <div className="mt-1 h-5 w-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">4</div>
                          Lakukan review berkala terhadap suku bunga floating Anda dan pertimbangkan "take over" jika ada penawaran bank lain yang jauh lebih rendah.
                      </li>
                  </ul>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20"></div>
          </Card>

          <div className="text-center pt-8">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                  Dibuat untuk membantu perencanaan finansial Anda
              </p>
          </div>
      </div>
    </section>
  );
}
