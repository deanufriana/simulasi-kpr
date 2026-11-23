import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import NumberFormat from "react-number-format";
import { percentToDecimal, yearToMonth } from "../constant/formula";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  FileSpreadsheet,
  Trash2,
  Check,
  ArrowRightLeft,
  Save,
  Share2,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import writeXlsxFile, { type SheetData } from "write-excel-file/browser";
import { Button } from "@/components/ui/button";
import { AmortizationChart, type YearlyBreakdown } from "@/components/AmortizationChart";

interface Form {
  per: string;
  pinjaman: {
    jumlah: number;
    periode: number;
  };
  bungaFix: {
    percentage: number;
    periode: number;
    total: number;
  };
  bungaFloating: {
    percentage: number;
    periode: number;
    total: number;
  };
}

interface Scenario {
  id: string;
  name: string;
  form: Form;
  results: {
    installment: number;
    totalInterest: number;
    totalPayment: number;
  };
}

const DEFAULT_FORM: Form = {
  per: "year",
  pinjaman: {
    jumlah: 500000000,
    periode: 15,
  },
  bungaFix: {
    percentage: 5.5,
    periode: 3,
    total: 0,
  },
  bungaFloating: {
    percentage: 12,
    periode: 12,
    total: 0,
  },
};

const RATE_PRESETS = [
  { label: "Promo 3.99% (3 Thn)", fixRate: 3.99, fixYears: 3, floatRate: 11.5 },
  { label: "Umum 5.5% (3 Thn)", fixRate: 5.5, fixYears: 3, floatRate: 12 },
  { label: "Konservatif 6.5% (5 Thn)", fixRate: 6.5, fixYears: 5, floatRate: 12.5 },
];

const TENOR_PRESETS_YEARS = [10, 15, 20, 25];

function parsePositiveNumber(val: string | null, fallback: number): number {
  if (!val) return fallback;
  const parsed = parseFloat(val);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function normalizeToYears(raw: Form): Form {
  if (raw.per !== "month") return raw;
  const tenorYears = Math.max(1, Math.round(raw.pinjaman.periode / 12));
  const fixYears = Math.min(tenorYears, Math.round(raw.bungaFix.periode / 12));
  return {
    ...raw,
    per: "year",
    pinjaman: { ...raw.pinjaman, periode: tenorYears },
    bungaFix: { ...raw.bungaFix, periode: fixYears },
    bungaFloating: { ...raw.bungaFloating, periode: Math.max(0, tenorYears - fixYears) },
  };
}

function Index() {
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState<Form>(() => {
    const hasQuery =
      searchParams.has("jumlah") ||
      searchParams.has("tenor") ||
      searchParams.has("fixRate") ||
      searchParams.has("fixTenor") ||
      searchParams.has("floatRate");

    if (hasQuery) {
      const isMonth = searchParams.get("per") === "month";
      const jumlah = parsePositiveNumber(searchParams.get("jumlah"), DEFAULT_FORM.pinjaman.jumlah);
      const rawTenor = parsePositiveNumber(
        searchParams.get("tenor"),
        isMonth ? 180 : DEFAULT_FORM.pinjaman.periode,
      );
      const tenorYears = Math.max(1, isMonth ? Math.round(rawTenor / 12) : rawTenor);
      const fixRate = parsePositiveNumber(
        searchParams.get("fixRate"),
        DEFAULT_FORM.bungaFix.percentage,
      );
      const rawFixTenor = parsePositiveNumber(
        searchParams.get("fixTenor"),
        isMonth ? Math.min(36, rawTenor) : Math.min(3, tenorYears),
      );
      const fixYears = Math.min(tenorYears, isMonth ? Math.round(rawFixTenor / 12) : rawFixTenor);
      const floatRate = parsePositiveNumber(
        searchParams.get("floatRate"),
        DEFAULT_FORM.bungaFloating.percentage,
      );

      return {
        per: "year",
        pinjaman: { jumlah, periode: tenorYears },
        bungaFix: { percentage: fixRate, periode: fixYears, total: 0 },
        bungaFloating: {
          percentage: floatRate,
          periode: Math.max(0, tenorYears - fixYears),
          total: 0,
        },
      };
    }

    const saved = localStorage.getItem("kpr_simulator_form");
    if (saved) {
      try {
        return normalizeToYears(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved form", e);
      }
    }
    return DEFAULT_FORM;
  });

  // Optional Property + DP calculator mode
  const [showPropertyMode, setShowPropertyMode] = useState(false);
  const [propertyPrice, setPropertyPrice] = useState<number>(() =>
    Math.round(form.pinjaman.jumlah / 0.8),
  );
  const [dpType, setDpType] = useState<"percent" | "nominal">("percent");
  const [dpPercent, setDpPercent] = useState<number>(20);
  const [dpNominal, setDpNominal] = useState<number>(() =>
    Math.round((form.pinjaman.jumlah / 0.8) * 0.2),
  );

  // Table view defaults to Yearly for cleaner scanning
  const [tableView, setTableView] = useState<"yearly" | "monthly">("yearly");
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("kpr_simulator_form", JSON.stringify(form));
  }, [form]);

  const [scenarios, setScenarios] = useState<Scenario[]>(() => {
    const saved = localStorage.getItem("kpr_sim_scenarios");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [scenarioName, setScenarioName] = useState("");

  useEffect(() => {
    localStorage.setItem("kpr_sim_scenarios", JSON.stringify(scenarios));
  }, [scenarios]);

  const updateField = (
    group: "pinjaman" | "bungaFix" | "bungaFloating",
    name: string,
    raw: string,
  ) => {
    const val =
      parseFloat(raw.replace("Rp. ", "").replace(/\./g, "").replace(/,/g, "").replace("%", "")) ||
      0;

    setForm((prev) => {
      const next: Form = {
        ...prev,
        pinjaman: { ...prev.pinjaman },
        bungaFix: { ...prev.bungaFix },
        bungaFloating: { ...prev.bungaFloating },
      };

      (next[group] as Record<string, number>)[name] = val;

      const totalYears = Math.max(0, next.pinjaman.periode);
      const fixYears = Math.min(totalYears, Math.max(0, next.bungaFix.periode));
      next.bungaFix.periode = fixYears;
      next.bungaFloating.periode = Math.max(0, totalYears - fixYears);

      return next;
    });
  };

  const syncLoanFromProperty = (nextPrice: number, nextDpNominal: number) => {
    const loan = Math.max(0, Math.round(nextPrice - nextDpNominal));
    setForm((prev) => ({
      ...prev,
      pinjaman: { ...prev.pinjaman, jumlah: loan },
    }));
  };

  const handlePropertyPriceChange = (rawVal: string) => {
    const price = parseFloat(rawVal) || 0;
    setPropertyPrice(price);
    const nextDp = dpType === "percent" ? Math.round((price * dpPercent) / 100) : dpNominal;
    if (dpType === "percent") setDpNominal(nextDp);
    syncLoanFromProperty(price, nextDp);
  };

  const handleDpChange = (rawVal: string) => {
    const val = parseFloat(rawVal) || 0;
    if (dpType === "percent") {
      const clamped = Math.min(100, Math.max(0, val));
      setDpPercent(clamped);
      const nextDp = Math.round((propertyPrice * clamped) / 100);
      setDpNominal(nextDp);
      syncLoanFromProperty(propertyPrice, nextDp);
    } else {
      setDpNominal(val);
      const nextPct = propertyPrice > 0 ? Math.round((val / propertyPrice) * 1000) / 10 : 0;
      setDpPercent(nextPct);
      syncLoanFromProperty(propertyPrice, val);
    }
  };

  const applyTenorPreset = (years: number) => {
    setForm((prev) => {
      const fixYears = Math.min(years, prev.bungaFix.periode);
      return {
        ...prev,
        pinjaman: { ...prev.pinjaman, periode: years },
        bungaFix: { ...prev.bungaFix, periode: fixYears },
        bungaFloating: { ...prev.bungaFloating, periode: Math.max(0, years - fixYears) },
      };
    });
  };

  const applyRatePreset = (fixRate: number, fixYears: number, floatRate: number) => {
    setForm((prev) => {
      const clampedFix = Math.min(prev.pinjaman.periode, fixYears);
      return {
        ...prev,
        bungaFix: { ...prev.bungaFix, percentage: fixRate, periode: clampedFix },
        bungaFloating: {
          ...prev.bungaFloating,
          percentage: floatRate,
          periode: Math.max(0, prev.pinjaman.periode - clampedFix),
        },
      };
    });
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM);
    setPropertyPrice(Math.round(DEFAULT_FORM.pinjaman.jumlah / 0.8));
    setDpPercent(20);
    setDpNominal(Math.round((DEFAULT_FORM.pinjaman.jumlah / 0.8) * 0.2));
    localStorage.removeItem("kpr_simulator_form");
    setStatusMessage("Simulasi diatur ulang ke nilai awal.");
  };

  const handleCopyShareLink = async () => {
    const params = new URLSearchParams({
      jumlah: String(form.pinjaman.jumlah),
      per: "year",
      tenor: String(form.pinjaman.periode),
      fixRate: String(form.bungaFix.percentage),
      fixTenor: String(form.bungaFix.periode),
      floatRate: String(form.bungaFloating.percentage),
    });
    const url = `${window.location.origin}${window.location.pathname}#/?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setStatusMessage("Tautan simulasi berhasil disalin ke clipboard.");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setStatusMessage("Gagal menyalin tautan.");
    }
  };

  const tableAngsuran = useMemo(() => {
    const { pinjaman, bungaFix, bungaFloating, per } = form;
    let saldoPokok = pinjaman.jumlah;
    let saldoPokokSetelahBungaFix = 0;

    const periodePinjamanMonth = Math.max(0, Math.round(yearToMonth({ ...pinjaman, per })));
    const periodeBungaFixMonth = Math.min(
      periodePinjamanMonth,
      Math.max(0, Math.round(yearToMonth({ ...bungaFix, per }))),
    );
    const periodeBungaFloatMonth = Math.max(0, periodePinjamanMonth - periodeBungaFixMonth);

    return Array.from({ length: periodePinjamanMonth }).map((_, number) => {
      const atMonth = number + 1;
      const isFixPeriod = atMonth <= periodeBungaFixMonth;

      const currentPercent = isFixPeriod
        ? percentToDecimal(bungaFix.percentage)
        : percentToDecimal(bungaFloating.percentage);

      const remainingPeriode = isFixPeriod ? periodePinjamanMonth : periodeBungaFloatMonth;
      const currentBaseLoan = isFixPeriod ? pinjaman.jumlah : saldoPokokSetelahBungaFix;

      const iPerMonth = currentPercent / 12;
      const n = Math.max(1, remainingPeriode);

      const jumlahAngsuran =
        iPerMonth > 0
          ? (currentBaseLoan * iPerMonth) / (1 - Math.pow(1 + iPerMonth, -n))
          : currentBaseLoan / n;

      const angsuranBunga = (saldoPokok * currentPercent) / 12;
      const angsuranPokok = jumlahAngsuran - angsuranBunga;

      saldoPokok = Math.max(0, saldoPokok - angsuranPokok);

      if (atMonth === periodeBungaFixMonth) {
        saldoPokokSetelahBungaFix = saldoPokok;
      }

      return {
        atYear: Math.ceil(atMonth / 12),
        atMonth,
        jumlahAngsuran,
        saldoPokok,
        angsuranPokok,
        angsuranBunga,
      };
    });
  }, [form]);

  const fixMonthsCount = useMemo(
    () => Math.round(yearToMonth({ ...form.bungaFix, per: form.per })),
    [form.bungaFix, form.per],
  );

  const yearlyBreakdown: YearlyBreakdown[] = useMemo(() => {
    const map = new Map<number, YearlyBreakdown>();
    tableAngsuran.forEach((row) => {
      const existing = map.get(row.atYear);
      const isRowFix = row.atMonth <= fixMonthsCount;
      if (!existing) {
        map.set(row.atYear, {
          year: row.atYear,
          totalAngsuran: row.jumlahAngsuran,
          totalPokok: row.angsuranPokok,
          totalBunga: row.angsuranBunga,
          endingSaldo: row.saldoPokok,
          phase: isRowFix ? "fixed" : "floating",
        });
      } else {
        existing.totalAngsuran += row.jumlahAngsuran;
        existing.totalPokok += row.angsuranPokok;
        existing.totalBunga += row.angsuranBunga;
        existing.endingSaldo = row.saldoPokok;
        if (
          (existing.phase === "fixed" && !isRowFix) ||
          (existing.phase === "floating" && isRowFix)
        ) {
          existing.phase = "mixed";
        }
      }
    });
    return Array.from(map.values());
  }, [tableAngsuran, fixMonthsCount]);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }),
    [],
  );

  const totalBungaYangDibayar = useMemo(
    () => tableAngsuran.reduce((prev, curr) => prev + curr.angsuranBunga, 0),
    [tableAngsuran],
  );

  const totalBungaYangFix = useMemo(
    () =>
      tableAngsuran
        .filter((item) => item.atMonth <= fixMonthsCount)
        .reduce((prev, curr) => prev + curr.angsuranBunga, 0),
    [tableAngsuran, fixMonthsCount],
  );

  const totalBungaYangFloat = useMemo(
    () =>
      tableAngsuran
        .filter((item) => item.atMonth > fixMonthsCount)
        .reduce((prev, curr) => prev + curr.angsuranBunga, 0),
    [tableAngsuran, fixMonthsCount],
  );

  const totalBayar = form.pinjaman.jumlah + totalBungaYangDibayar;

  const fixedInstallment = tableAngsuran[0]?.jumlahAngsuran || 0;
  const hasFloatingPhase = fixMonthsCount < tableAngsuran.length;
  const floatingInstallment = hasFloatingPhase
    ? tableAngsuran[fixMonthsCount]?.jumlahAngsuran || 0
    : fixedInstallment;
  const installmentDelta = floatingInstallment - fixedInstallment;
  const installmentDeltaPct =
    fixedInstallment > 0 ? (installmentDelta / fixedInstallment) * 100 : 0;

  const handleSaveScenario = () => {
    if (!scenarioName.trim()) return;

    const newScenario: Scenario = {
      id: crypto.randomUUID(),
      name: scenarioName,
      form: JSON.parse(JSON.stringify(form)),
      results: {
        installment: fixedInstallment,
        totalInterest: totalBungaYangDibayar,
        totalPayment: totalBayar,
      },
    };

    setScenarios([...scenarios, newScenario]);
    setStatusMessage(`Skenario "${scenarioName}" disimpan.`);
    setScenarioName("");
    setIsSaving(false);
  };

  const handleLoadScenario = (scenario: Scenario) => {
    setForm(normalizeToYears(scenario.form));
    setShowPropertyMode(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStatusMessage(`Skenario "${scenario.name}" dimuat.`);
  };

  const handleDeleteScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
    setSelectedScenarioIds(selectedScenarioIds.filter((sid) => sid !== id));
  };

  const toggleComparison = (id: string) => {
    setSelectedScenarioIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const handleExportExcel = async () => {
    const currencyFmt = '"Rp"#,##0';
    const percentFmt = '0.00"%"';
    const totalMonths = yearToMonth({ ...form.pinjaman, per: form.per });
    const fixMonths = yearToMonth({ ...form.bungaFix, per: form.per });
    const lastTableRow = 14 + tableAngsuran.length;

    const sheetData: SheetData = [
      [
        {
          value: "SIMULASI KPR MODERN (SMART SPREADSHEET)",
          fontWeight: "bold",
          fontSize: 16,
          align: "center",
          span: 5,
        } as any,
      ],
      [{ value: "INPUT DATA PINJAMAN (Dapat diubah)", fontWeight: "bold", fontSize: 12 }],
      [
        { value: "Plafon Pinjaman", fontWeight: "bold" },
        {
          type: Number,
          value: form.pinjaman.jumlah,
          format: currencyFmt,
          backgroundColor: "#F1F5F9",
          borderStyle: "thin",
        },
      ],
      [
        { value: "Tenor Total (Bulan)", fontWeight: "bold" },
        {
          type: Number,
          value: totalMonths,
          format: "0",
          backgroundColor: "#F1F5F9",
          borderStyle: "thin",
        },
        null,
        null,
        null,
        null,
        null,
        { value: "Angsuran Fix", textColor: "#94A3B8" },
        { type: "Formula", value: "ROUND(PMT(B5/12, B4, -B3), 0)", format: currencyFmt },
      ],
      [
        { value: "Suku Bunga Fixed (%)", fontWeight: "bold" },
        {
          type: Number,
          value: form.bungaFix.percentage / 100,
          format: percentFmt,
          backgroundColor: "#F1F5F9",
          borderStyle: "thin",
        },
        null,
        null,
        null,
        null,
        null,
        { value: "Saldo Akhir Fix", textColor: "#94A3B8" },
        { type: "Formula", value: "ROUND(FV(B5/12, B6, I4, -B3), 0)", format: currencyFmt },
      ],
      [
        { value: "Masa Fixed (Bulan)", fontWeight: "bold" },
        {
          type: Number,
          value: fixMonths,
          format: "0",
          backgroundColor: "#F1F5F9",
          borderStyle: "thin",
        },
        null,
        null,
        null,
        null,
        null,
        { value: "Angsuran Floating", textColor: "#94A3B8" },
        { type: "Formula", value: "ROUND(PMT(B7/12, B4-B6, -I5), 0)", format: currencyFmt },
      ],
      [
        { value: "Suku Bunga Floating (%)", fontWeight: "bold" },
        {
          type: Number,
          value: form.bungaFloating.percentage / 100,
          format: percentFmt,
          backgroundColor: "#F1F5F9",
          borderStyle: "thin",
        },
      ],
      [],
      [{ value: "RINGKASAN ESTIMASI", fontWeight: "bold", fontSize: 12 }],
      [
        { value: "Total Bunga" },
        { type: "Formula", value: `SUM(C15:C${lastTableRow})`, format: currencyFmt },
      ],
      [
        { value: "Total Pembayaran" },
        {
          type: "Formula",
          value: "B3 + B10",
          format: currencyFmt,
          fontWeight: "bold",
          textColor: "#059669",
        },
      ],
      [
        { value: "Rasio Bunga terhadap Pokok" },
        {
          type: "Formula",
          value: "B10 / B3",
          format: "0.0%",
          fontStyle: "italic",
          textColor: "#64748B",
        },
      ],
      [],
      ["Bulan", "Angsuran", "Bunga", "Pokok", "Sisa Pinjaman"].map((header) => ({
        value: header,
        fontWeight: "bold" as const,
        textColor: "#FFFFFF",
        backgroundColor: "#0F172A",
        align: "center" as const,
      })),
    ];

    tableAngsuran.forEach((item, index) => {
      const rowIdx = 15 + index;
      const prevSaldoRef = index === 0 ? "B3" : `E${rowIdx - 1}`;
      const isTransitionRow =
        fixMonthsCount > 0 &&
        fixMonthsCount < tableAngsuran.length &&
        item.atMonth === fixMonthsCount;

      const borderProps = isTransitionRow
        ? { bottomBorderStyle: "medium" as const, bottomBorderColor: "#059669" }
        : {};

      sheetData.push([
        {
          type: Number,
          value: item.atMonth,
          align: "center",
          fontWeight: "bold",
          textColor: "#64748B",
          ...borderProps,
        },
        {
          type: "Formula",
          value: `IF(A${rowIdx}<=$B$6, $I$4, $I$6)`,
          format: currencyFmt,
          ...borderProps,
        },
        {
          type: "Formula",
          value: `ROUND(${prevSaldoRef} * (IF(A${rowIdx}<=$B$6, $B$5, $B$7) / 12), 0)`,
          format: currencyFmt,
          ...borderProps,
        },
        {
          type: "Formula",
          value: `B${rowIdx} - C${rowIdx}`,
          format: currencyFmt,
          ...borderProps,
        },
        {
          type: "Formula",
          value: `ROUND(${prevSaldoRef} - D${rowIdx}, 0)`,
          format: currencyFmt,
          ...borderProps,
        },
      ]);
    });

    await writeXlsxFile(sheetData, {
      columns: [{ width: 26 }, { width: 22 }, { width: 22 }, { width: 22 }, { width: 25 }],
    }).toFile(`Smart_KPR_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="container space-y-10">
      <div aria-live="polite" className="sr-only">
        {statusMessage}
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Inputs, Chart, & Table */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border shadow-sm bg-card">
            <CardHeader className="pb-4 flex flex-row items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-lg font-bold">Simulasi Cicilan KPR</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hitung estimasi cicilan masa fixed dan floating secara instan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !showPropertyMode;
                  setShowPropertyMode(next);
                  if (next) {
                    const estPrice = Math.round(
                      form.pinjaman.jumlah / (1 - dpPercent / 100 || 0.8),
                    );
                    setPropertyPrice(estPrice);
                    setDpNominal(Math.max(0, estPrice - form.pinjaman.jumlah));
                  }
                }}
                aria-expanded={showPropertyMode}
                className="text-xs font-semibold text-primary hover:underline underline-offset-4"
              >
                {showPropertyMode ? "Tutup hitung DP" : "+ Hitung dari harga properti & DP"}
              </button>
            </CardHeader>

            <CardContent className="space-y-6">
              {showPropertyMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border">
                  <div className="space-y-1.5">
                    <Label htmlFor="propertyPrice" className="text-xs font-semibold">
                      Harga Properti
                    </Label>
                    <NumberFormat
                      id="propertyPrice"
                      customInput={Input}
                      className="h-10 text-sm font-semibold bg-background tabular-nums"
                      value={propertyPrice}
                      prefix="Rp. "
                      allowNegative={false}
                      thousandSeparator="."
                      decimalSeparator=","
                      onValueChange={(values) => handlePropertyPriceChange(values.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dpInput" className="text-xs font-semibold">
                        Uang Muka (DP)
                      </Label>
                      <div className="inline-flex rounded border overflow-hidden text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setDpType("percent")}
                          className={`px-2 py-0.5 ${
                            dpType === "percent"
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          %
                        </button>
                        <button
                          type="button"
                          onClick={() => setDpType("nominal")}
                          className={`px-2 py-0.5 ${
                            dpType === "nominal"
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          Rp
                        </button>
                      </div>
                    </div>
                    <NumberFormat
                      id="dpInput"
                      customInput={Input}
                      className="h-10 text-sm font-semibold bg-background tabular-nums"
                      value={dpType === "percent" ? dpPercent : dpNominal}
                      prefix={dpType === "nominal" ? "Rp. " : undefined}
                      suffix={dpType === "percent" ? " %" : undefined}
                      allowNegative={false}
                      thousandSeparator={dpType === "nominal" ? "." : undefined}
                      decimalSeparator=","
                      decimalScale={dpType === "percent" ? 1 : 0}
                      onValueChange={(values) => handleDpChange(values.value)}
                    />
                  </div>
                </div>
              )}

              {/* Essential Inputs: 2 clean rows */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                <div className="space-y-2 sm:col-span-7">
                  <Label htmlFor="jumlah" className="text-sm font-semibold">
                    Plafon Pinjaman
                  </Label>
                  <NumberFormat
                    id="jumlah"
                    customInput={Input}
                    className="h-12 text-lg font-semibold border border-input bg-background shadow-sm px-4 tabular-nums"
                    name="jumlah"
                    value={form.pinjaman.jumlah}
                    prefix="Rp. "
                    allowNegative={false}
                    thousandSeparator="."
                    decimalSeparator=","
                    onValueChange={(values) => updateField("pinjaman", "jumlah", values.value)}
                  />
                </div>

                <div className="space-y-2 sm:col-span-5">
                  <Label htmlFor="periode" className="text-sm font-semibold">
                    Tenor Pinjaman
                  </Label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-4 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <NumberFormat
                      id="periode"
                      customInput={Input}
                      className="pl-9 h-12 text-sm font-semibold border border-input bg-background shadow-sm tabular-nums"
                      value={form.pinjaman.periode}
                      name="periode"
                      allowNegative={false}
                      suffix=" Tahun"
                      onValueChange={(values) => updateField("pinjaman", "periode", values.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TENOR_PRESETS_YEARS.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => applyTenorPreset(yr)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                          form.pinjaman.periode === yr
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {yr} Thn
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-4">
                  <Label htmlFor="fixRate" className="text-sm font-semibold">
                    Bunga Fixed
                  </Label>
                  <NumberFormat
                    id="fixRate"
                    customInput={Input}
                    className="h-11 text-sm font-medium px-3.5 border border-input bg-background shadow-sm tabular-nums"
                    name="percentage"
                    value={form.bungaFix.percentage}
                    suffix=" %"
                    allowNegative={false}
                    decimalScale={2}
                    onValueChange={(values) => updateField("bungaFix", "percentage", values.value)}
                  />
                </div>

                <div className="space-y-2 sm:col-span-4">
                  <Label htmlFor="fixPeriode" className="text-sm font-semibold">
                    Masa Fixed
                  </Label>
                  <NumberFormat
                    id="fixPeriode"
                    customInput={Input}
                    className="h-11 text-sm font-medium px-3.5 border border-input bg-background shadow-sm tabular-nums"
                    value={form.bungaFix.periode}
                    name="periode"
                    allowNegative={false}
                    suffix=" Tahun"
                    onValueChange={(values) => updateField("bungaFix", "periode", values.value)}
                  />
                  <p className="text-[11px] text-muted-foreground tabular-nums">
                    Sisa {form.bungaFloating.periode} thn bunga floating
                  </p>
                </div>

                <div className="space-y-2 sm:col-span-4">
                  <Label htmlFor="floatRate" className="text-sm font-semibold">
                    Bunga Floating
                  </Label>
                  <NumberFormat
                    id="floatRate"
                    customInput={Input}
                    className="h-11 text-sm font-medium px-3.5 border border-input bg-background shadow-sm tabular-nums"
                    name="percentage"
                    value={form.bungaFloating.percentage}
                    suffix=" %"
                    allowNegative={false}
                    decimalScale={2}
                    onValueChange={(values) =>
                      updateField("bungaFloating", "percentage", values.value)
                    }
                  />
                </div>
              </div>

              {/* Compact Rate Presets */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                  Preset:
                </span>
                {RATE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      applyRatePreset(preset.fixRate, preset.fixYears, preset.floatRate)
                    }
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-muted/60 hover:bg-muted text-foreground transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Principal vs Interest Chart */}
          <AmortizationChart data={yearlyBreakdown} formatter={formatter} />

          {/* Amortization Schedule */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold tracking-tight">Jadwal Angsuran</h2>
                <div
                  className="inline-flex rounded-lg bg-muted p-0.5 text-xs font-semibold"
                  role="group"
                  aria-label="Tampilan jadwal angsuran"
                >
                  <button
                    type="button"
                    onClick={() => setTableView("yearly")}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      tableView === "yearly"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Tahunan
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableView("monthly")}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      tableView === "monthly"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Bulanan
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {isSaving ? (
                  <div className="flex items-center gap-1.5 animate-in slide-in-from-right-2 duration-200">
                    <Input
                      className="h-8 w-36 text-xs font-semibold"
                      placeholder="Nama skenario..."
                      aria-label="Nama skenario"
                      value={scenarioName}
                      onChange={(e) => setScenarioName(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleSaveScenario()}
                    />
                    <Button
                      size="sm"
                      className="h-8 px-2"
                      onClick={handleSaveScenario}
                      aria-label="Simpan skenario"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => setIsSaving(false)}
                    >
                      Batal
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-semibold text-primary gap-1.5"
                    onClick={() => setIsSaving(true)}
                  >
                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                    Simpan
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={handleCopyShareLink}
                  aria-label="Salin tautan simulasi"
                  title="Salin tautan simulasi"
                >
                  {copiedLink ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                  ) : (
                    <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={handleReset}
                  aria-label="Atur ulang simulasi"
                  title="Atur ulang simulasi"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-semibold ml-1"
                  onClick={handleExportExcel}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                  Excel
                </Button>
              </div>
            </div>

            <Card className="border shadow-sm bg-card overflow-hidden">
              <div
                tabIndex={0}
                role="region"
                aria-label="Tabel Jadwal Angsuran KPR"
                className="max-h-[560px] overflow-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10 border-b shadow-sm">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead
                        scope="col"
                        className="w-24 text-center text-[10px] uppercase font-bold text-muted-foreground tracking-widest"
                      >
                        {tableView === "monthly" ? "Bulan" : "Tahun"}
                      </TableHead>
                      <TableHead
                        scope="col"
                        className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest"
                      >
                        {tableView === "monthly" ? "Angsuran" : "Total Angsuran"}
                      </TableHead>
                      <TableHead
                        scope="col"
                        className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest"
                      >
                        Pokok
                      </TableHead>
                      <TableHead
                        scope="col"
                        className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest"
                      >
                        Bunga
                      </TableHead>
                      <TableHead
                        scope="col"
                        className="text-right pr-6 text-[10px] uppercase font-bold text-muted-foreground tracking-widest"
                      >
                        Sisa Pinjaman
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableView === "monthly"
                      ? tableAngsuran.map((item) => {
                          const isTransitionStart =
                            fixMonthsCount > 0 &&
                            fixMonthsCount < tableAngsuran.length &&
                            item.atMonth === fixMonthsCount + 1;

                          return (
                            <Fragment key={item.atMonth}>
                              {isTransitionStart && (
                                <TableRow className="bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-50/80 border-y border-amber-200 dark:border-amber-900/50">
                                  <TableCell
                                    colSpan={5}
                                    className="py-2.5 px-4 text-xs font-semibold text-amber-800 dark:text-amber-300"
                                  >
                                    <div className="flex items-center justify-center gap-2">
                                      <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                                      <span>
                                        Masa Floating Dimulai (Bulan ke-{item.atMonth}):{" "}
                                        {form.bungaFix.percentage}% →{" "}
                                        {form.bungaFloating.percentage}%
                                      </span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                              <TableRow className="hover:bg-muted/40 transition-colors">
                                <TableCell className="text-center font-bold text-muted-foreground py-3.5 tabular-nums">
                                  {item.atMonth}
                                </TableCell>
                                <TableCell className="font-bold text-primary text-sm py-3.5 tabular-nums">
                                  {formatter.format(item.jumlahAngsuran)}
                                </TableCell>
                                <TableCell className="text-muted-foreground font-medium py-3.5 tabular-nums">
                                  {formatter.format(item.angsuranPokok)}
                                </TableCell>
                                <TableCell className="text-amber-600 dark:text-amber-500 font-medium py-3.5 tabular-nums">
                                  {formatter.format(item.angsuranBunga)}
                                </TableCell>
                                <TableCell className="text-right pr-6 font-mono text-sm font-semibold py-3.5 tabular-nums">
                                  {formatter.format(item.saldoPokok)}
                                </TableCell>
                              </TableRow>
                            </Fragment>
                          );
                        })
                      : yearlyBreakdown.map((item) => (
                          <TableRow key={item.year} className="hover:bg-muted/40 transition-colors">
                            <TableCell className="text-center py-3.5">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-bold tabular-nums">Thn {item.year}</span>
                                <span
                                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    item.phase === "fixed"
                                      ? "bg-primary/10 text-primary"
                                      : item.phase === "mixed"
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                        : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {item.phase === "fixed"
                                    ? "Fixed"
                                    : item.phase === "mixed"
                                      ? "Transisi"
                                      : "Floating"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold text-primary text-sm py-3.5 tabular-nums">
                              {formatter.format(item.totalAngsuran)}
                            </TableCell>
                            <TableCell className="text-muted-foreground font-medium py-3.5 tabular-nums">
                              {formatter.format(item.totalPokok)}
                            </TableCell>
                            <TableCell className="text-amber-600 dark:text-amber-500 font-medium py-3.5 tabular-nums">
                              {formatter.format(item.totalBunga)}
                            </TableCell>
                            <TableCell className="text-right pr-6 font-mono text-sm font-semibold py-3.5 tabular-nums">
                              {formatter.format(item.endingSaldo)}
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Focused Sticky Summary */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
          <Card className="border shadow-sm bg-card">
            <CardHeader className="pb-3 pt-5 border-b">
              <CardTitle className="text-sm font-semibold text-foreground">
                Ringkasan Cicilan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 py-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-muted/40 border space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Fixed / bulan</p>
                  <p className="text-lg font-bold text-foreground tabular-nums">
                    {formatter.format(fixedInstallment)}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-muted/40 border space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Floating / bulan</p>
                  <p
                    className={`text-lg font-bold tabular-nums ${
                      hasFloatingPhase && installmentDelta > 0
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-primary"
                    }`}
                  >
                    {formatter.format(floatingInstallment)}
                  </p>
                </div>
              </div>

              {hasFloatingPhase && Math.abs(installmentDelta) >= 1 && (
                <div
                  className={`flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-semibold tabular-nums ${
                    installmentDelta > 0
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                      : "bg-primary/10 text-primary border border-primary/20"
                  }`}
                >
                  <span>Kenaikan saat floating</span>
                  <span>
                    {installmentDelta > 0 ? "+" : ""}
                    {formatter.format(installmentDelta)} ({installmentDelta > 0 ? "+" : ""}
                    {installmentDeltaPct.toFixed(1)}%)
                  </span>
                </div>
              )}

              <div className="space-y-1 pt-4 border-t">
                <p className="text-xs font-medium text-muted-foreground">
                  Estimasi Total Pembayaran
                </p>
                <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
                  {formatter.format(totalBayar)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Rentang Bunga</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {form.bungaFix.percentage}% → {form.bungaFloating.percentage}%
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Total Bunga</p>
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                    {formatter.format(totalBungaYangDibayar)}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground tabular-nums">
                    <span>Porsi Pokok</span>
                    <span>
                      {totalBayar > 0 ? Math.round((form.pinjaman.jumlah / totalBayar) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-out"
                      style={{
                        width: `${totalBayar > 0 ? (form.pinjaman.jumlah / totalBayar) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground tabular-nums">
                    <span>Porsi Bunga</span>
                    <span>
                      {totalBayar > 0 ? Math.round((totalBungaYangDibayar / totalBayar) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500 ease-out"
                      style={{
                        width: `${totalBayar > 0 ? (totalBungaYangDibayar / totalBayar) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2.5 px-1 tabular-nums text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Sisa Saldo Setelah Fixed</span>
              <span className="font-semibold text-foreground">
                {formatter.format(tableAngsuran[fixMonthsCount - 1]?.saldoPokok || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Total Bunga (Fixed)</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {formatter.format(totalBungaYangFix)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Total Bunga (Floating)</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {formatter.format(totalBungaYangFloat)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Scenarios & Comparison (Only shown when user has saved at least 1) */}
      {scenarios.length > 0 && (
        <section aria-labelledby="saved-scenarios-heading" className="space-y-6 pt-6 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 id="saved-scenarios-heading" className="text-2xl font-bold tracking-tight">
                Skenario Tersimpan
              </h2>
              <p className="text-sm text-muted-foreground">
                Klik skenario untuk memuat, atau pilih 2+ skenario untuk membandingkan.
              </p>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-muted self-start">
              {scenarios.length} Skenario
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {scenarios.map((s) => (
              <Card
                key={s.id}
                className={`group shadow-sm relative overflow-hidden transition-all hover:ring-2 hover:ring-primary/50 cursor-pointer ${
                  selectedScenarioIds.includes(s.id) ? "ring-2 ring-primary border-primary/50" : ""
                }`}
                onClick={() => handleLoadScenario(s)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-sm font-bold truncate">{s.name}</CardTitle>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider tabular-nums">
                        {formatter.format(s.form.pinjaman.jumlah)} • {s.form.pinjaman.periode}{" "}
                        {s.form.per === "year" ? "Thn" : "Bln"}
                      </p>
                    </div>
                    <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Bandingkan skenario ${s.name}`}
                        aria-pressed={selectedScenarioIds.includes(s.id)}
                        className={`h-8 w-8 ${
                          selectedScenarioIds.includes(s.id)
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComparison(s.id);
                        }}
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Hapus skenario ${s.name}`}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScenario(s.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold text-primary tabular-nums">
                    {formatter.format(s.results.installment)}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">Angsuran / Bulan</p>
                </CardContent>
                {selectedScenarioIds.includes(s.id) && (
                  <div className="absolute top-0 right-0 p-1 pointer-events-none">
                    <div className="bg-primary text-primary-foreground rounded-bl-lg p-0.5">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {selectedScenarioIds.length > 1 && (
            <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-primary" aria-hidden="true" />
                Perbandingan Skenario
              </h3>

              <Card className="border shadow-sm overflow-hidden bg-card">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead
                          scope="col"
                          className="w-[220px] text-xs font-bold uppercase tracking-widest px-6 py-4"
                        >
                          Metrik Utama
                        </TableHead>
                        {scenarios
                          .filter((s) => selectedScenarioIds.includes(s.id))
                          .map((s) => (
                            <TableHead
                              scope="col"
                              key={s.id}
                              className="text-center text-xs font-bold uppercase tracking-widest px-6 py-4"
                            >
                              {s.name}
                            </TableHead>
                          ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-transparent">
                        <TableCell className="font-semibold text-muted-foreground text-sm px-6 py-4">
                          Cicilan Bulanan
                        </TableCell>
                        {scenarios
                          .filter((s) => selectedScenarioIds.includes(s.id))
                          .map((s) => (
                            <TableCell
                              key={s.id}
                              className="text-center font-bold text-primary text-base px-6 py-4 tabular-nums"
                            >
                              {formatter.format(s.results.installment)}
                            </TableCell>
                          ))}
                      </TableRow>
                      <TableRow className="hover:bg-transparent">
                        <TableCell className="font-semibold text-muted-foreground text-sm px-6 py-4">
                          Total Bunga
                        </TableCell>
                        {scenarios
                          .filter((s) => selectedScenarioIds.includes(s.id))
                          .map((s) => (
                            <TableCell
                              key={s.id}
                              className="text-center font-semibold text-amber-600 dark:text-amber-500 text-sm px-6 py-4 tabular-nums"
                            >
                              {formatter.format(s.results.totalInterest)}
                            </TableCell>
                          ))}
                      </TableRow>
                      <TableRow className="hover:bg-transparent">
                        <TableCell className="font-semibold text-muted-foreground text-sm px-6 py-4">
                          Total Pembayaran
                        </TableCell>
                        {scenarios
                          .filter((s) => selectedScenarioIds.includes(s.id))
                          .map((s) => (
                            <TableCell
                              key={s.id}
                              className="text-center font-bold text-base px-6 py-4 tabular-nums"
                            >
                              {formatter.format(s.results.totalPayment)}
                            </TableCell>
                          ))}
                      </TableRow>
                      <TableRow className="bg-muted/30 hover:bg-muted/40">
                        <TableCell className="font-bold text-sm px-6 py-5 border-none">
                          Selisih Hemat
                        </TableCell>
                        {scenarios
                          .filter((s) => selectedScenarioIds.includes(s.id))
                          .map((s) => {
                            const maxPayment = Math.max(
                              ...scenarios
                                .filter((sub) => selectedScenarioIds.includes(sub.id))
                                .map((sub) => sub.results.totalPayment),
                            );
                            const diff = maxPayment - s.results.totalPayment;
                            return (
                              <TableCell
                                key={s.id}
                                className="text-center px-6 py-5 border-none tabular-nums"
                              >
                                {diff > 0 ? (
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                                    Hemat {formatter.format(diff)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground/40 font-bold">—</span>
                                )}
                              </TableCell>
                            );
                          })}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default Index;
