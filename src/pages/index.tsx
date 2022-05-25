import { useEffect, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import {
  monthToYear,
  percentToDecimal,
  yearToMonth,
} from "../constant/formula";

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

function Index() {
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<Form>({
    per: "year",
    pinjaman: {
      jumlah: 5000000,
      periode: 1,
    },
    bungaFix: {
      percentage: 12,
      periode: 1,
      total: 0,
    },
    bungaFloating: {
      percentage: 5.7,
      periode: 0,
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

  const handleChange =
    (event: any, group: keyof Form) => {
      let { name, value } = event.target;
      let customForm: any = { ...form };
      if (name !== "per") customForm[group][name] = value ? value : 0;
      if (["jumlah", "periode", "percentage"].includes(name))
        customForm[group][name] = parseFloat(
          customForm[group][name].replace("Rp. ", "").replace(/,/g, "")
        );

      if (name === "per") {
        customForm["per"] = value;
        Object.entries(customForm).forEach((item: any) => {
          const [key, values] = item;
          if (key === "per") return;
          if (!(typeof values === 'object')) return;
          const convertPeriode = value === "year" ? Math.floor(values?.periode / 12) : values?.periode * 12
          customForm[key]["periode"] = convertPeriode;
        })
      }

      if (["periode"].includes(name)) {
        customForm["bungaFloating"]["periode"] =
          monthToYear({ periode: monthToYear(customForm.pinjaman) - monthToYear(customForm.bungaFix), per: customForm.bungaFloating.per });
      }

      if (["pinjaman", "per"].includes(group)) setPage(1);
      setForm(customForm);
      tableAngsuranLoop();
    };

  const tableAngsuranLoop = () => {
    const { pinjaman, bungaFix, bungaFloating, per } = form;

    let saldoPokok = pinjaman.jumlah;
    let saldoPokokSetelahBungaFix = 0;
    debugger
    const periodeBungaFloatMonth = yearToMonth({ ...bungaFloating, per });
    const periodePinjamanMonth = yearToMonth({ ...pinjaman, per });
    const periodeBungaFixMonth = yearToMonth({ ...bungaFix, per });

    const tableArray = Array.from(Array(periodePinjamanMonth)).map(
      (item, number) => {
        const atMonth = number + 1;
        const fixOrFloat = atMonth <= periodeBungaFixMonth;

        const fixOrFloatPercent = fixOrFloat
          ? percentToDecimal(bungaFix.percentage)
          : percentToDecimal(bungaFloating.percentage);

        const fixOrFloatPeriode = fixOrFloat
          ? periodePinjamanMonth
          : periodeBungaFloatMonth;

        const pinjamanFixOrFloat = fixOrFloat
          ? pinjaman.jumlah
          : saldoPokokSetelahBungaFix;

        const jumlahAngsuran =
          (pinjamanFixOrFloat * (fixOrFloatPercent / 12)) /
          (1 - 1 / (1 + fixOrFloatPercent / 12) ** fixOrFloatPeriode);

        const angsuranBunga = (saldoPokok * fixOrFloatPercent) / 12;

        const angsuranPokok = jumlahAngsuran - angsuranBunga;
        saldoPokok = saldoPokok - angsuranPokok;

        if (atMonth === periodeBungaFixMonth) {
          saldoPokokSetelahBungaFix = saldoPokok;
        }

        return {
          atYear: (atMonth + 11) / 12,
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

  const formatter = new Intl.NumberFormat("en-ID", {
    style: "currency",
    currency: "IDR",
  });

  const { pinjaman, bungaFix, bungaFloating, per } = form;

  const periodePinjamanYear = monthToYear({ ...pinjaman, per });
  const totalBungaYangDibayar = useMemo(
    () =>
      tableAngsuran.reduce(
        (prevValue, currValue) => prevValue + currValue.angsuranBunga,
        0
      ),
    [tableAngsuran]
  );
  const totalBungaYangFix = useMemo(
    () =>
      tableAngsuran
        .filter((item) => item.atMonth <= yearToMonth({ ...bungaFix, per }))
        .reduce(
          (prevValue, currValue) => prevValue + currValue.angsuranBunga,
          0
        ),
    [tableAngsuran]
  );

  const totalBungaYangFloat = useMemo(
    () =>
      tableAngsuran
        .filter((item) => item.atMonth > yearToMonth({ ...bungaFix, per }))
        .reduce(
          (prevValue, currValue) => prevValue + currValue.angsuranBunga,
          0
        ),
    [tableAngsuran]
  );

  const tablePage = tableAngsuran.slice((page - 1) * 12, page * 12);

  return (
    <>
      <nav className="navbar navbar-dark bg-dark sticky-top mb-4">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">Simulasi KPR</span>
        </div>
      </nav>
      <div className="container-lg">
        <div className="row mb-3">
          <div className="col-md-4 col-xs-12 mb-2">
            <div className="ratio ratio-16x9">
              <iframe
                src="https://www.youtube.com/embed/LTU3UVKNQS8"
                title="KRP Rumah"
                allowFullScreen={true}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            </div>
          </div>
          <div className="col-md-8 col-xs-12">
            <form className="row g-1">
              <div className="col-md-5 col-xs-12">
                <label className="form-label">Jumlah Pokok / Pinjaman</label>
                <NumberFormat
                  name="jumlah"
                  value={pinjaman.jumlah}
                  prefix="Rp. "
                  allowNegative={false}
                  min={0}
                  onChange={(e: any) => handleChange(e, "pinjaman")}
                  thousandSeparator={true}
                  className="form-control form-control-sm"
                />
              </div>
              <div className="col-md-5 col-xs-10">
                <label className="form-label">Periode Pinjaman</label>
                <NumberFormat
                  className="form-control form-control-sm"
                  value={pinjaman.periode}
                  name="periode"
                  allowNegative={false}
                  onChange={(e: any) => handleChange(e, "pinjaman")}
                  isAllowed={({ value }) => monthToYear({ periode: +value, per }) <= 50}
                />
              </div>
              <div className="col-md-2 col-xs-12">
                <label className="form-label">Per</label>
                <select
                  name="per"
                  value={per}
                  onChange={(e: any) => handleChange(e, "per")}
                  className="form-control form-control-sm"
                >
                  <option value="year">Tahun</option>
                  <option value="month">Bulan</option>
                </select>
              </div>
              <div className="w-100"></div>
              <div className="col-md-5 col-xs-2">
                <label className="form-label">Bunga Fix</label>
                <NumberFormat
                  name="percentage"
                  value={bungaFix.percentage}
                  suffix={"%"}
                  allowNegative={false}
                  decimalSeparator="."
                  decimalScale={2}
                  min={0}
                  className="form-control form-control-sm"
                  onChange={(e: any) => handleChange(e, "bungaFix")}
                />
              </div>
              <div className="col-md-5 col-xs-2">
                <label className="form-label">Periode Bunga Fix</label>
                <NumberFormat
                  className="form-control form-control-sm"
                  value={bungaFix.periode}
                  allowNegative={false}
                  name="periode"
                  onChange={(e: any) => handleChange(e, "bungaFix")}
                  isAllowed={({ value }) => monthToYear({ periode: +value, per }) <= monthToYear({ ...pinjaman, per })}
                />
              </div>

              <div className="w-100"></div>
              <div className="col-md-5 col-xs-2">
                <label className="form-label">Bunga Floating</label>
                <NumberFormat
                  name="percentage"
                  value={bungaFloating.percentage}
                  suffix={"%"}
                  allowNegative={false}
                  decimalScale={2}
                  className="form-control form-control-sm"
                  onChange={(e: any) => handleChange(e, "bungaFloating")}
                />
              </div>
              <div className="col-md-5 col-xs-2">
                <label className="form-label">Periode Bunga Floating</label>
                <input
                  disabled
                  value={bungaFloating.periode}
                  type="number"
                  placeholder="Jumlah Periode"
                  className="form-control form-control-sm"
                  onChange={(e: any) => handleChange(e, "bungaFloating")}
                />
              </div>
            </form>
          </div>
        </div>
        <nav
          aria-label="Page navigation"
          style={{ overflow: "auto", padding: 0, margin: 0 }}
        >
          <ul className="pagination">
            <li className={`page-item ${page <= 1 && "disabled"}`}>
              <button className="page-link" onClick={() => setPage(page - 1)}>
                Previous
              </button>
            </li>
            {Array.from(Array(periodePinjamanYear)).map((item, number) => (
              <li
                key={number}
                className={`page-item ${number + 1 === page && "active"}`}
                onClick={() => setPage(number + 1)}
              >
                <button className="page-link">{number + 1}</button>
              </li>
            ))}
            <li
              className={`page-item ${page >= periodePinjamanYear && "disabled"
                }`}
            >
              <button className="page-link" onClick={() => setPage(page + 1)}>
                Next
              </button>
            </li>
          </ul>
        </nav>
        <div className="table-responsive">
          <table
            style={{
              verticalAlign: "middle",
              textAlign: "center",
            }}
            className="table table-sm table-striped table-bordered"
          >
            <thead className="table-dark">
              <tr>
                <th className="col-md-2">Tahun</th>
                <th className="col-md-2">Periode Angsuran (Bulan)</th>
                <th className="col-md-2">Jumlah Angsuran</th>
                <th className="col-md-2">Saldo Pokok</th>
                <th className="col-md-2">Angsuran Pokok</th>
                <th className="col-md-2">Angsuran Bunga</th>
              </tr>
            </thead>
            <tbody>
              {tablePage.map((item) => (
                <tr key={item.atMonth}>
                  {(item.atMonth + 11) % 12 === 0 && (
                    <td className="col-md-2" rowSpan={12}>
                      Tahun Ke {(item.atMonth + 11) / 12}
                    </td>
                  )}
                  <td className="col-md-2"> {item.atMonth} </td>
                  <td className="col-md-2">
                    {formatter.format(item.jumlahAngsuran)}
                  </td>
                  <td className="col-md-2">
                    {formatter.format(item.saldoPokok)}
                  </td>
                  <td className="col-md-2">
                    {formatter.format(item.angsuranPokok)}
                  </td>
                  <td className="col-md-2">
                    {formatter.format(item.angsuranBunga)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row g-1 mb-3 mt-1">
          <div className="col-md-3 col-xs-2">
            <label className="form-label">Sisa Saldo Setelah Bunga Fix</label>
            <NumberFormat
              disabled
              placeholder="Jumlah Pokok / Pinjaman"
              value={
                tableAngsuran[yearToMonth({ ...bungaFix, per }) - 1]?.saldoPokok
                  ? tableAngsuran[yearToMonth({ ...bungaFix, per }) - 1]?.saldoPokok
                  : 0
              }
              thousandSeparator={true}
              prefix="Rp. "
              decimalScale={2}
              className="form-control form-control-sm"
            />
          </div>
          <div className="col-md-3 col-xs-2">
            <label className="form-label">Total Bunga Fix</label>
            <NumberFormat
              name="pokok"
              disabled
              placeholder="Jumlah Pokok / Pinjaman"
              value={totalBungaYangFix}
              prefix="Rp. "
              thousandSeparator={true}
              decimalScale={2}
              className="form-control form-control-sm"
            />
          </div>
          <div className="col-md-3 col-xs-2">
            <label className="form-label">Total Bunga Floating</label>
            <NumberFormat
              disabled
              value={totalBungaYangFloat}
              prefix="Rp. "
              thousandSeparator={true}
              decimalScale={2}
              className="form-control form-control-sm"
            />
          </div>
          <div className="col-md-3 col-xs-2">
            <label className="form-label">Total Bunga Yang Dibayar</label>
            <NumberFormat
              disabled
              value={totalBungaYangDibayar}
              prefix="Rp. "
              thousandSeparator={true}
              decimalScale={1}
              className="form-control form-control-sm"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Index;
