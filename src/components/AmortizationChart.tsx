import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface YearlyBreakdown {
  year: number;
  totalAngsuran: number;
  totalPokok: number;
  totalBunga: number;
  endingSaldo: number;
  phase: "fixed" | "floating" | "mixed";
}

interface AmortizationChartProps {
  data: YearlyBreakdown[];
  formatter: Intl.NumberFormat;
}

function formatCompactIdr(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}Jt`;
  return `${Math.round(value / 1_000)}Rb`;
}

export function AmortizationChart({ data, formatter }: AmortizationChartProps) {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const maxAnnualPayment = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map((d) => d.totalPokok + d.totalBunga), 1);
  }, [data]);

  const floatingStartYear = useMemo(() => {
    const firstFloatingIdx = data.findIndex((d) => d.phase === "floating" || d.phase === "mixed");
    return firstFloatingIdx > 0 ? data[firstFloatingIdx].year : null;
  }, [data]);

  const activeItem = useMemo(() => {
    if (hoveredYear !== null) {
      return data.find((d) => d.year === hoveredYear) || data[0];
    }
    return data[0];
  }, [data, hoveredYear]);

  if (data.length === 0) return null;

  return (
    <Card className="border shadow-sm bg-card">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4 flex-wrap">
        <div>
          <CardTitle className="text-base font-bold">Porsi Pokok vs. Bunga per Tahun</CardTitle>
          {floatingStartYear && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Lonjakan pada tahun ke-{floatingStartYear} menandai dimulainya masa bunga floating.
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary inline-block" aria-hidden="true" />
            Pokok
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-500 inline-block" aria-hidden="true" />
            Bunga
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <figure className="space-y-2.5">
          <div className="flex gap-3">
            {/* Y-axis reference labels */}
            <div
              className="flex flex-col justify-between h-44 py-1 text-[10px] font-medium text-muted-foreground tabular-nums select-none shrink-0 text-right w-9"
              aria-hidden="true"
            >
              <span>{formatCompactIdr(maxAnnualPayment)}</span>
              <span>{formatCompactIdr(maxAnnualPayment / 2)}</span>
              <span>0</span>
            </div>

            {/* Bars + horizontal reference lines */}
            <div
              className="relative flex-1 h-44 flex items-end gap-1 sm:gap-1.5 pt-2 pb-0 border-b border-border"
              role="img"
              aria-label={`Grafik komposisi pembayaran pokok dan bunga selama ${data.length} tahun`}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-2 border-t border-dashed border-border/50"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-border/50"
                aria-hidden="true"
              />

              {data.map((item) => {
                const total = item.totalPokok + item.totalBunga;
                const totalHeightPct = Math.max(4, (total / maxAnnualPayment) * 100);
                const pokokPct = total > 0 ? (item.totalPokok / total) * 100 : 0;
                const bungaPct = total > 0 ? (item.totalBunga / total) * 100 : 0;
                const isActive = activeItem?.year === item.year;
                const isFloatingStart = item.year === floatingStartYear;

                return (
                  <button
                    key={item.year}
                    type="button"
                    onMouseEnter={() => setHoveredYear(item.year)}
                    onFocus={() => setHoveredYear(item.year)}
                    onMouseLeave={() => setHoveredYear(null)}
                    className={`relative flex-1 h-full flex flex-col justify-end items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t transition-opacity ${
                      hoveredYear !== null && !isActive ? "opacity-45" : "opacity-100"
                    }`}
                    aria-label={`Tahun ${item.year}: Pokok ${formatter.format(item.totalPokok)}, Bunga ${formatter.format(item.totalBunga)}`}
                  >
                    {isFloatingStart && (
                      <span
                        className="absolute -top-4 text-[9px] font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap"
                        aria-hidden="true"
                      >
                        Floating
                      </span>
                    )}
                    <div
                      className={`w-full max-w-[26px] flex flex-col-reverse rounded-t-sm overflow-hidden transition-all duration-300 ${
                        isFloatingStart ? "ring-1 ring-amber-500/50" : ""
                      }`}
                      style={{ height: `${totalHeightPct}%` }}
                    >
                      <div
                        className="w-full bg-primary transition-all duration-300"
                        style={{ height: `${pokokPct}%` }}
                      />
                      <div
                        className="w-full bg-amber-500 transition-all duration-300"
                        style={{ height: `${bungaPct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between text-[11px] font-medium text-muted-foreground tabular-nums pl-12">
            <span>Thn 1</span>
            {data.length > 2 && <span>Thn {Math.ceil(data.length / 2)}</span>}
            <span>Thn {data.length}</span>
          </div>

          {activeItem && (
            <figcaption className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-muted/50 text-xs tabular-nums">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Periode</p>
                <p className="font-semibold text-foreground mt-0.5">
                  Tahun ke-{activeItem.year} (
                  {activeItem.phase === "mixed"
                    ? "Transisi"
                    : activeItem.phase === "fixed"
                      ? "Fixed"
                      : "Floating"}
                  )
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Pokok / Tahun</p>
                <p className="font-semibold text-primary mt-0.5">
                  {formatter.format(activeItem.totalPokok)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Bunga / Tahun</p>
                <p className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                  {formatter.format(activeItem.totalBunga)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Sisa Pinjaman</p>
                <p className="font-semibold text-foreground mt-0.5">
                  {formatter.format(activeItem.endingSaldo)}
                </p>
              </div>
            </figcaption>
          )}
        </figure>
      </CardContent>
    </Card>
  );
}
