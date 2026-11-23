import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NumberFormat from "react-number-format";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingDown, Landmark, ArrowRight } from "lucide-react";

export default function Jangkauan() {
  const navigate = useNavigate();
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
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Cek Jangkauan KPR Anda</h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Hitung harga properti maksimal yang bisa Anda ajukan berdasarkan penghasilan bulanan dan
            komitmen cicilan saat ini.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Form */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            <Card className="border shadow-sm bg-card p-8 sm:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="income"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Penghasilan Bersih Bulanan (Take Home Pay)
                  </Label>
                  <NumberFormat
                    id="income"
                    customInput={Input}
                    className="h-14 text-xl font-bold border border-input bg-background shadow-sm tabular-nums"
                    value={form.income}
                    prefix="Rp. "
                    thousandSeparator="."
                    decimalSeparator=","
                    onValueChange={(v) => handleChange(v, "income")}
                  />
                  <p className="text-xs text-muted-foreground italic">
                    Gabungan penghasilan suami & istri jika joint income.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="debts"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cicilan Lain Saat Ini
                  </Label>
                  <NumberFormat
                    id="debts"
                    customInput={Input}
                    className="h-12 text-sm border border-input bg-background shadow-sm tabular-nums"
                    value={form.debts}
                    prefix="Rp. "
                    thousandSeparator="."
                    decimalSeparator=","
                    onValueChange={(v) => handleChange(v, "debts")}
                    placeholder="Contoh: Cicilan Mobil, HP, dll"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="dp"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Uang Muka (Down Payment)
                  </Label>
                  <NumberFormat
                    id="dp"
                    customInput={Input}
                    className="h-12 text-sm border border-input bg-background shadow-sm tabular-nums"
                    value={form.dp}
                    prefix="Rp. "
                    thousandSeparator="."
                    decimalSeparator=","
                    onValueChange={(v) => handleChange(v, "dp")}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="rate"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Estimasi Suku Bunga
                  </Label>
                  <NumberFormat
                    id="rate"
                    customInput={Input}
                    className="h-12 text-sm border border-input bg-background shadow-sm tabular-nums"
                    value={form.rate}
                    suffix=" %"
                    decimalScale={2}
                    onValueChange={(v) => handleChange(v, "rate")}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="tenor"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Tenor KPR (Tahun)
                  </Label>
                  <NumberFormat
                    id="tenor"
                    customInput={Input}
                    className="h-12 text-sm border border-input bg-background shadow-sm tabular-nums"
                    value={form.tenor}
                    suffix=" Tahun"
                    onValueChange={(v) => handleChange(v, "tenor")}
                  />
                </div>
              </div>
            </Card>

            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex gap-4 items-start">
              <AlertCircle
                className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                  Catatan Perbankan
                </p>
                <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200/90">
                  Bank di Indonesia umumnya memberikan toleransi cicilan maksimal{" "}
                  <strong>30–35%</strong> dari total penghasilan. Jika Anda memiliki cicilan lain,
                  porsi KPR Anda akan mengecil.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-8">
            <Card className="border shadow-sm bg-card">
              <div className="p-7 sm:p-8 space-y-6">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Harga Properti Maksimal
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-foreground">
                    {formatter.format(results.maxPropertyPrice)}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-5 border-t">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-end">
                      <p className="text-xs font-medium text-muted-foreground">
                        Kesehatan Finansial (DTI)
                      </p>
                      <p className="text-xs font-bold text-primary tabular-nums">
                        {results.dti.toFixed(1)}%
                      </p>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ease-out ${results.dti > 35 ? "bg-rose-500" : results.dti > 30 ? "bg-amber-500" : "bg-primary"}`}
                        style={{ width: `${Math.min(100, (results.dti / 40) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground text-right">
                      Batas Aman Bank: 30%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-5 border-t">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
                      Plafon Pinjaman
                    </p>
                    <p className="text-lg font-semibold tabular-nums text-foreground">
                      {formatter.format(results.maxLoan)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                      Cicilan Ideal
                    </p>
                    <p className="text-lg font-semibold tabular-nums text-foreground">
                      {formatter.format(results.maxInstallment)}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    className="w-full h-11 font-semibold gap-2"
                    disabled={results.maxLoan <= 0}
                    onClick={() => {
                      const params = new URLSearchParams({
                        jumlah: String(Math.round(results.maxLoan)),
                        fixRate: String(form.rate),
                        tenor: String(form.tenor),
                        per: "year",
                      });
                      void navigate(`/?${params.toString()}`);
                    }}
                  >
                    Simulasikan Plafon Ini
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </Card>

            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-foreground">Tips Meningkatkan Jangkauan</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    title: "Kurangi Cicilan Lain",
                    desc: "Melunasi utang kecil (HP/Motor) akan meningkatkan 'Cicilan Ideal' Anda di mata bank.",
                  },
                  {
                    title: "Perbesar Uang Muka",
                    desc: "Setiap kenaikan DP 10jt akan langsung menaikkan harga properti yang bisa dijangkau.",
                  },
                  {
                    title: "Ubah Tenor Lebih Lama",
                    desc: "Menambah masa kredit (msal 15 ke 20th) memperkecil cicilan tapi total bunga membengkak.",
                  },
                ].map((tip, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border bg-white dark:bg-slate-900 group transition-all hover:border-primary/50"
                  >
                    <h4 className="text-xs font-bold mb-1 text-slate-800 dark:text-slate-200">
                      {tip.title}
                    </h4>
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
