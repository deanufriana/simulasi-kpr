import { useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Wallet, AlertCircle, TrendingDown, Landmark } from "lucide-react";

export default function Jangkauan () {
  const [form, setForm] = useState({
    income: 15000000,
    debts: 0,
    dp: 100000000,
    rate: 5.5,
    tenor: 15,
  });

  const handleChange = (values: any, name: string) => {
    const { value } = values;
    setForm((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const results = useMemo(() => {
    // Standard banking rule: 30% of gross income
    const maxInstallmentBase = form.income * 0.3;
    const maxInstallment = Math.max(0, maxInstallmentBase - form.debts);

    // Monthly interest
    const i = form.rate / 100 / 12;
    // Total months
    const n = form.tenor * 12;

    // Formula: P = A / (i / (1 - (1 + i)^-n))
    // If interest is 0, P = A * n
    let maxLoan = 0;
    if (i > 0) {
      maxLoan = maxInstallment / (i / (1 - Math.pow(1 + i, -n)));
    } else {
      maxLoan = maxInstallment * n;
    }

    const maxPropertyPrice = maxLoan + form.dp;
    const dti = ((maxInstallment + form.debts) / form.income) * 100;

    return {
      maxInstallment,
      maxLoan,
      maxPropertyPrice,
      dti,
    };
  }, [form]);

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
            <Wallet className="h-3 w-3" />
            Analisis Finansial
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Cek Jangkauan KPR Anda</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Cari tahu harga properti maksimal yang bisa Anda beli berdasarkan penghasilan bulanan Anda saat ini.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Form */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            <Card className="border shadow-none bg-slate-50/40 dark:bg-slate-900/40 p-8 sm:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Penghasilan Bersih Bulanan (Take Home Pay)</Label>
                  <NumberFormat
                    customInput={Input}
                    className="h-14 text-xl font-bold border-none bg-white dark:bg-slate-950 shadow-sm"
                    value={form.income}
                    prefix="Rp. "
                    thousandSeparator="."
                    decimalSeparator=","
                    onValueChange={(v) => handleChange(v, "income")}
                  />
                  <p className="text-[10px] text-muted-foreground italic">Gabungan penghasilan suami & istri jika joint income.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cicilan Lain Saat Ini</Label>
                  <NumberFormat
                    customInput={Input}
                    className="h-12 text-sm border-none bg-white dark:bg-slate-950 shadow-sm"
                    value={form.debts}
                    prefix="Rp. "
                    thousandSeparator="."
                    decimalSeparator=","
                    onValueChange={(v) => handleChange(v, "debts")}
                    placeholder="Contoh: Cicilan Mobil, HP, dll"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Uang Muka (Down Payment)</Label>
                  <NumberFormat
                    customInput={Input}
                    className="h-12 text-sm border-none bg-white dark:bg-slate-950 shadow-sm"
                    value={form.dp}
                    prefix="Rp. "
                    thousandSeparator="."
                    decimalSeparator=","
                    onValueChange={(v) => handleChange(v, "dp")}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Estimasi Suku Bunga</Label>
                  <NumberFormat
                    customInput={Input}
                    className="h-12 text-sm border-none bg-white dark:bg-slate-950 shadow-sm"
                    value={form.rate}
                    suffix=" %"
                    decimalScale={2}
                    onValueChange={(v) => handleChange(v, "rate")}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tenor KPR (Tahun)</Label>
                  <NumberFormat
                    customInput={Input}
                    className="h-12 text-sm border-none bg-white dark:bg-slate-950 shadow-sm"
                    value={form.tenor}
                    suffix=" Tahun"
                    onValueChange={(v) => handleChange(v, "tenor")}
                  />
                </div>
              </div>
            </Card>

            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex gap-4 items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-amber-900 dark:text-amber-100">Catatan Perbankan</p>
                <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200 opacity-80">
                  Bank di Indonesia umumnya memberikan toleransi cicilan maksimal **30-35%** dari total penghasilan. Jika Anda memiliki cicilan lain, porsi KPR Anda akan mengecil.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-8">
            <Card className="border-none shadow-2xl bg-slate-900 text-slate-50 relative overflow-hidden">
              <div className="relative z-10 p-10 space-y-10">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-40">Harga Properti Maksimal</p>
                  <h2 className="text-5xl font-light tracking-tight">{formatter.format(results.maxPropertyPrice)}</h2>
                </div>

                <div className="grid grid-cols-1 gap-6 pt-6 border-t border-white/10">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] uppercase font-bold opacity-30 tracking-widest">Kesehatan Finansial (DTI)</p>
                      <p className="text-xs font-bold text-emerald-400">{results.dti.toFixed(1)}%</p>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-out ${results.dti > 35 ? 'bg-rose-500' : results.dti > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, (results.dti / 40) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] opacity-40 text-right italic font-medium">Batas Aman Bank: 30%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/10">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold opacity-30 tracking-widest flex items-center gap-2">
                      <Landmark className="h-3 w-3" />
                      Plafon Pinjaman
                    </p>
                    <p className="text-lg font-semibold">{formatter.format(results.maxLoan)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold opacity-30 tracking-widest flex items-center gap-2">
                      <TrendingDown className="h-3 w-3" />
                      Cicilan Ideal
                    </p>
                    <p className="text-lg font-semibold">{formatter.format(results.maxInstallment)}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10"></div>
            </Card>

            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Tips Meningkatkan Jangkauan</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { title: "Kurangi Cicilan Lain", desc: "Melunasi utang kecil (HP/Motor) akan meningkatkan 'Cicilan Ideal' Anda di mata bank." },
                  { title: "Perbesar Uang Muka", desc: "Setiap kenaikan DP 10jt akan langsung menaikkan harga properti yang bisa dijangkau." },
                  { title: "Ubah Tenor Lebih Lama", desc: "Menambah masa kredit (msal 15 ke 20th) memperkecil cicilan tapi total bunga membengkak." }
                ].map((tip, i) => (
                  <div key={i} className="p-4 rounded-xl border bg-white dark:bg-slate-900 group transition-all hover:border-primary/50">
                    <h4 className="text-xs font-bold mb-1 text-slate-800 dark:text-slate-200">{tip.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
