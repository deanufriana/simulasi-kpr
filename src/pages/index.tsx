import { useEffect, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import {
  percentToDecimal,
  yearToMonth,
} from "../constant/formula";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calculator, Calendar, Info, FileSpreadsheet } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";

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

function Index () {
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<Form>({
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
  });

  const [tableAngsuran, setTableAngsuran] = useState<
    {
      atYear: number;
      atMonth: any;
      jumlahAngsuran: number;
      saldoPokok: number;
      angsuranPokok: number;
      angsuranBunga: number;
    }[]
  >([]);

  useEffect(() => {
    tableAngsuranLoop();
  }, []);

  const handleChange = (e: any, group: keyof Form, fieldName?: string) => {
    let name = e?.target?.name || fieldName;
    let value = e?.target?.value;

    if (typeof e === 'string') {
      value = e;
      if (!name) name = group;
    }

    let customForm: any = { ...form };

    if (name === "per") {
      customForm["per"] = value;
      Object.keys(form).forEach((key) => {
        const k = key as keyof Form;
        if (k !== "per" && typeof customForm[k] === 'object' && 'periode' in customForm[k]) {
          const currentVal = customForm[k]["periode"];
          customForm[k]["periode"] = value === "year"
            ? Math.floor(currentVal / 12)
            : currentVal * 12;
        }
      });
    } else {
      if (customForm[group] && typeof customForm[group] === 'object') {
        customForm[group][name] = value !== undefined ? value : 0;

        if (["jumlah", "periode", "percentage"].includes(name) && typeof value === 'string') {
          customForm[group][name] = parseFloat(
            value.replace("Rp. ", "").replace(/\./g, "").replace(/,/g, "").replace("%", "")
          );
        }
      }
    }

    if (group === "pinjaman" || name === "per") setPage(1);

    if (group === "pinjaman" || group === "bungaFix" || name === "per") {
      const totalPeriode = yearToMonth({ ...customForm.pinjaman, per: customForm.per });
      const fixPeriode = yearToMonth({ ...customForm.bungaFix, per: customForm.per });
      customForm.bungaFloating.periode = Math.max(0, totalPeriode - fixPeriode);
      if (customForm.per === "year") {
        customForm.bungaFloating.periode = customForm.bungaFloating.periode / 12;
      }
    }

    setForm({ ...customForm });
    setTimeout(() => tableAngsuranLoop(customForm), 0);
  };

  const tableAngsuranLoop = (currentForm = form) => {
    const { pinjaman, bungaFix, bungaFloating, per } = currentForm;

    let saldoPokok = pinjaman.jumlah;
    let saldoPokokSetelahBungaFix = 0;

    const periodePinjamanMonth = yearToMonth({ ...pinjaman, per });
    const periodeBungaFixMonth = yearToMonth({ ...bungaFix, per });
    const periodeBungaFloatMonth = Math.max(0, periodePinjamanMonth - periodeBungaFixMonth);

    const tableArray = Array.from(Array(periodePinjamanMonth)).map(
      (_, number) => {
        const atMonth = number + 1;
        const isFixPeriod = atMonth <= periodeBungaFixMonth;

        const currentPercent = isFixPeriod
          ? percentToDecimal(bungaFix.percentage)
          : percentToDecimal(bungaFloating.percentage);

        const remainingPeriode = isFixPeriod
          ? periodePinjamanMonth
          : periodeBungaFloatMonth;

        const currentBaseLoan = isFixPeriod
          ? pinjaman.jumlah
          : saldoPokokSetelahBungaFix;

        const i_per_month = currentPercent / 12;
        const n = remainingPeriode;

        const jumlahAngsuran = i_per_month > 0
          ? (currentBaseLoan * i_per_month) / (1 - Math.pow(1 + i_per_month, -n))
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
      }
    );

    setTableAngsuran(tableArray);
  };

  const formatter = useMemo(() => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }), []);

  const totalBungaYangDibayar = useMemo(() =>
    tableAngsuran.reduce((prev, curr) => prev + curr.angsuranBunga, 0),
    [tableAngsuran]);

  const totalBungaYangFix = useMemo(() =>
    tableAngsuran
      .filter((item) => item.atMonth <= yearToMonth({ ...form.bungaFix, per: form.per }))
      .reduce((prev, curr) => prev + curr.angsuranBunga, 0),
    [tableAngsuran, form]);

  const totalBungaYangFloat = useMemo(() =>
    tableAngsuran
      .filter((item) => item.atMonth > yearToMonth({ ...form.bungaFix, per: form.per }))
      .reduce((prev, curr) => prev + curr.angsuranBunga, 0),
    [tableAngsuran, form]);

  const totalBayar = form.pinjaman.jumlah + totalBungaYangDibayar;

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Simulasi KPR");

    worksheet.mergeCells("A1:E1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "SIMULASI KPR MODERN";
    titleCell.font = { name: "Inter", size: 16, bold: true };
    titleCell.alignment = { horizontal: "center" };

    worksheet.addRow(["Detail Pinjaman"]);
    worksheet.getCell(`A${worksheet.lastRow!.number}`).font = { bold: true };

    worksheet.addRow(["Plafon Pinjaman", form.pinjaman.jumlah]);
    worksheet.addRow(["Tenor", `${form.pinjaman.periode} ${form.per === "year" ? "Tahun" : "Bulan"}`]);
    worksheet.addRow(["Total Bunga", totalBungaYangDibayar]);
    worksheet.addRow(["Total Pembayaran", totalBayar]);

    const summaryRows = [3, 5, 6];
    summaryRows.forEach(rowIdx => {
      worksheet.getRow(rowIdx).getCell(2).numFmt = '"Rp"# ,##0';
    });

    worksheet.addRow([]);

    const headerRow = worksheet.addRow(["Bulan", "Angsuran", "Pokok", "Bunga", "Sisa Pinjaman"]);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F172A" }
      };
      cell.alignment = { horizontal: "center" };
    });

    tableAngsuran.forEach((item) => {
      const row = worksheet.addRow([
        item.atMonth,
        item.jumlahAngsuran,
        item.angsuranPokok,
        item.angsuranBunga,
        item.saldoPokok
      ]);

      [2, 3, 4, 5].forEach(colIdx => {
        row.getCell(colIdx).numFmt = '"Rp"# ,##0';
      });
      row.getCell(1).alignment = { horizontal: "center" };
    });

    worksheet.columns.forEach((column) => {
      column.width = 18;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `Simulasi_KPR_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border shadow-none bg-slate-50/40 dark:bg-slate-900/40">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Detail Pinjaman
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="jumlah" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Jumlah Pokok / Pinjaman</Label>
                  <div className="relative">
                    <NumberFormat
                      customInput={Input}
                      className="h-12 text-lg font-semibold border-none bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-1 px-4"
                      name="jumlah"
                      value={form.pinjaman.jumlah}
                      prefix="Rp. "
                      allowNegative={false}
                      thousandSeparator="."
                      decimalSeparator=","
                      onValueChange={(values) => {
                        const { value } = values;
                        handleChange({ target: { name: 'jumlah', value } }, 'pinjaman');
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Satuan Waktu</Label>
                  <Select
                    value={form.per}
                    onValueChange={(v) => handleChange(v, 'per', 'per')}
                  >
                    <SelectTrigger className="h-12 text-sm border-none bg-white dark:bg-slate-950 shadow-sm focus:ring-1">
                      <SelectValue placeholder="Pilih satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="year">Tahun</SelectItem>
                      <SelectItem value="month">Bulan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="periode" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tenor Pinjaman</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-4 h-4 w-4 text-muted-foreground/60" />
                    <NumberFormat
                      customInput={Input}
                      className="pl-9 h-12 text-sm border-none bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-1"
                      value={form.pinjaman.periode}
                      name="periode"
                      allowNegative={false}
                      suffix={form.per === "year" ? " Tahun" : " Bulan"}
                      onValueChange={(values) => {
                        const { value } = values;
                        handleChange({ target: { name: 'periode', value } }, 'pinjaman');
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Suku Bunga Fixed</Label>
                  <div className="relative">
                    <NumberFormat
                      customInput={Input}
                      className="h-12 text-sm px-4 border-none bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-1"
                      name="percentage"
                      value={form.bungaFix.percentage}
                      suffix=" %"
                      allowNegative={false}
                      decimalScale={2}
                      onValueChange={(values) => {
                        const { value } = values;
                        handleChange({ target: { name: 'percentage', value } }, 'bungaFix');
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Masa Fixed</Label>
                  <NumberFormat
                    customInput={Input}
                    className="h-12 text-sm border-none bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-1"
                    value={form.bungaFix.periode}
                    name="periode"
                    allowNegative={false}
                    suffix={form.per === "year" ? " Tahun" : " Bulan"}
                    onValueChange={(values) => {
                      const { value } = values;
                      handleChange({ target: { name: 'periode', value } }, 'bungaFix');
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Suku Bunga Floating</Label>
                  <div className="relative">
                    <NumberFormat
                      customInput={Input}
                      className="h-12 text-sm px-4 border-none bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-1"
                      name="percentage"
                      value={form.bungaFloating.percentage}
                      suffix=" %"
                      allowNegative={false}
                      decimalScale={2}
                      onValueChange={(values) => {
                        const { value } = values;
                        handleChange({ target: { name: 'percentage', value } }, 'bungaFloating');
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-500">Masa Floating (Otomatis)</Label>
                  <Input
                    disabled
                    value={`${form.bungaFloating.periode} ${form.per === "year" ? "Tahun" : "Bulan"}`}
                    className="h-12 text-sm bg-slate-100/50 dark:bg-slate-800/50 border-none opacity-80"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-bold tracking-tight">Jadwal Angsuran</h2>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2 border-slate-200 dark:border-slate-800 text-xs font-semibold"
                  onClick={handleExportExcel}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Ekspor Excel
                </Button>
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                  {tableAngsuran.length} Periode
                </div>
              </div>
            </div>

            <Card className="border shadow-none bg-white dark:bg-slate-950 overflow-hidden">
              <div className="max-h-[600px] overflow-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                <Table>
                  <TableHeader className="sticky top-0 bg-white dark:bg-slate-950 z-10 border-b shadow-sm">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="w-20 text-center text-[10px] uppercase font-bold text-muted-foreground/80 tracking-widest">Bulan</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-widest">Angsuran</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-widest">Pokok</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-widest">Bunga</TableHead>
                      <TableHead className="text-right pr-6 text-[10px] uppercase font-bold text-muted-foreground/80 tracking-widest">Sisa Pinjaman</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableAngsuran.map((item) => (
                      <TableRow key={item.atMonth} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors border-slate-100 dark:border-slate-800/50">
                        <TableCell className="text-center font-bold text-slate-400 py-4">{item.atMonth}</TableCell>
                        <TableCell className="font-bold text-primary text-base py-4">{formatter.format(item.jumlahAngsuran)}</TableCell>
                        <TableCell className="text-slate-500 font-medium py-4">{formatter.format(item.angsuranPokok)}</TableCell>
                        <TableCell className="text-amber-600 dark:text-amber-500 font-medium py-4">{formatter.format(item.angsuranBunga)}</TableCell>
                        <TableCell className="text-right pr-6 font-mono text-sm font-semibold py-4">{formatter.format(item.saldoPokok)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Sticky Summary & Video */}
        <div className="lg:col-span-4 space-y-8">
          <div className="sticky space-y-8">
            <Card className="border shadow-none bg-slate-900 text-slate-50 dark:bg-slate-900 overflow-hidden">
              <CardHeader className="pb-2 pt-6">
                <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">Estimasi Total Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pb-8 pt-2">
                <div className="space-y-1">
                  <p className="text-4xl font-light tracking-tight">{formatter.format(totalBayar)}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-30 tracking-widest mb-1">Rentang Bunga</p>
                    <p className="text-base font-semibold">{form.bungaFix.percentage}% → {form.bungaFloating.percentage}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-30 tracking-widest mb-1">Akumulasi Bunga</p>
                    <p className="text-base font-semibold text-amber-400">{formatter.format(totalBungaYangDibayar)}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">
                      <span>Porsi Pinjaman Pokok</span>
                      <span>{Math.round((form.pinjaman.jumlah / totalBayar) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-700 ease-out"
                        style={{ width: `${(form.pinjaman.jumlah / totalBayar) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">
                      <span>Porsi Bunga Pinjaman</span>
                      <span>{Math.round((totalBungaYangDibayar / totalBayar) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-700 ease-out"
                        style={{ width: `${(totalBungaYangDibayar / totalBayar) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-5 px-1 py-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground uppercase tracking-widest font-bold text-[10px]">Sisa Saldo Fixed</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {formatter.format(tableAngsuran[yearToMonth({ ...form.bungaFix, per: form.per }) - 1]?.saldoPokok || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground uppercase tracking-widest font-bold text-[10px]">Total Bunga (Fixed)</span>
                <span className="font-semibold text-amber-600 dark:text-amber-500">{formatter.format(totalBungaYangFix)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground uppercase tracking-widest font-bold text-[10px]">Total Bunga (Floating)</span>
                <span className="font-semibold text-amber-600 dark:text-amber-500">{formatter.format(totalBungaYangFloat)}</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border bg-slate-50 dark:bg-slate-900 transition-all hover:ring-2 hover:ring-primary/20">
              <div className="aspect-video relative group">
                <iframe
                  className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                  src="https://www.youtube.com/embed/LTU3UVKNQS8"
                  title="Panduan KPR"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
