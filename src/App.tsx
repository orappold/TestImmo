import React, { useEffect, useMemo, useRef, useState } from "react";
import type { CalcData, CalculationRecord } from "./calculationStorage";
import {
  createCalculation,
  exportToJson,
  importFromJson,
  listCalculations,
  upsertCalculation
} from "./calculationStorage";

type NumberInputProps = {
  label: string;
  suffix?: string;
  value: number;
  onChange: (value: number) => void;
};

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  suffix,
  value,
  onChange
}) => {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="field-input-wrapper">
        <input
          type="number"
          className="field-input"
          value={Number.isNaN(value) ? "" : value}
          onChange={(e) => onChange(Number(e.target.value || 0))}
        />
        {suffix && <span className="field-suffix">{suffix}</span>}
      </div>
    </label>
  );
};

function annuityPayment(
  principal: number,
  annualRatePercent: number,
  years: number
): number {
  const r = annualRatePercent / 100 / 12;
  const n = years * 12;
  if (r <= 0 || n <= 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

const App: React.FC = () => {
  const DEFAULT_CALC: CalcData = {
    address: "",
    objectUrl: "",
    purchasePrice: 200_000,
    area: 60,
    coldRent: 1500,
    otherIncome: 0,
    rentGrowth: 3,
    purchaseTaxRate: 5,
    notaryRate: 2,
    agentRate: 3.57,
    renovationCost: 0,
    equity: 21_140,
    interestRate: 4,
    repaymentRate: 1,
    years: 10,
    nonAllocableCosts: 90,
    maintenanceReserve: 0,
    inflationRate: 2,
    taxRate: 42,
    buildingShare: 80,
    depreciationRate: 2,
    appreciationRate: 2.5,
    benchmarkReturn: 7
  };

  const [selectedCalculationId, setSelectedCalculationId] = useState<
    string | null
  >(null);
  const [savedCalculations, setSavedCalculations] = useState<
    CalculationRecord[]
  >([]);

  const [address, setAddress] = useState(DEFAULT_CALC.address);
  const [objectUrl, setObjectUrl] = useState(DEFAULT_CALC.objectUrl);

  const [purchasePrice, setPurchasePrice] = useState(DEFAULT_CALC.purchasePrice);
  const [area, setArea] = useState(DEFAULT_CALC.area);
  const [coldRent, setColdRent] = useState(DEFAULT_CALC.coldRent);
  const [otherIncome, setOtherIncome] = useState(DEFAULT_CALC.otherIncome);
  const [rentGrowth, setRentGrowth] = useState(DEFAULT_CALC.rentGrowth);

  const [purchaseTaxRate, setPurchaseTaxRate] = useState(
    DEFAULT_CALC.purchaseTaxRate
  );
  const [notaryRate, setNotaryRate] = useState(DEFAULT_CALC.notaryRate);
  const [agentRate, setAgentRate] = useState(DEFAULT_CALC.agentRate);
  const [renovationCost, setRenovationCost] = useState(
    DEFAULT_CALC.renovationCost
  );

  const [equity, setEquity] = useState(DEFAULT_CALC.equity);
  const [interestRate, setInterestRate] = useState(DEFAULT_CALC.interestRate);
  const [repaymentRate, setRepaymentRate] = useState(
    DEFAULT_CALC.repaymentRate
  );
  const [years, setYears] = useState(DEFAULT_CALC.years);

  const [nonAllocableCosts, setNonAllocableCosts] = useState(
    DEFAULT_CALC.nonAllocableCosts
  );
  const [maintenanceReserve, setMaintenanceReserve] = useState(
    DEFAULT_CALC.maintenanceReserve
  );
  const [inflationRate, setInflationRate] = useState(DEFAULT_CALC.inflationRate);

  const [taxRate, setTaxRate] = useState(DEFAULT_CALC.taxRate);
  const [buildingShare, setBuildingShare] = useState(DEFAULT_CALC.buildingShare);
  const [depreciationRate, setDepreciationRate] = useState(
    DEFAULT_CALC.depreciationRate
  );
  const [appreciationRate, setAppreciationRate] = useState(
    DEFAULT_CALC.appreciationRate
  );
  const [benchmarkReturn, setBenchmarkReturn] = useState(
    DEFAULT_CALC.benchmarkReturn
  );

  const backupFileInputRef = useRef<HTMLInputElement | null>(null);

  const [sevAdministration, setSevAdministration] = useState(0);
  const [financeIncidental, setFinanceIncidental] = useState(true);
  const [financeRenovation, setFinanceRenovation] = useState(true);

  const currentData: CalcData = useMemo(
    () => ({
      address,
      objectUrl,
      purchasePrice,
      area,
      coldRent,
      otherIncome,
      rentGrowth,
      purchaseTaxRate,
      notaryRate,
      agentRate,
      renovationCost,
      equity,
      interestRate,
      repaymentRate,
      years,
      nonAllocableCosts,
      maintenanceReserve,
      inflationRate,
      taxRate,
      buildingShare,
      depreciationRate,
      appreciationRate,
      benchmarkReturn
    }),
    [
      address,
      agentRate,
      appreciationRate,
      area,
      benchmarkReturn,
      buildingShare,
      coldRent,
      depreciationRate,
      equity,
      inflationRate,
      interestRate,
      maintenanceReserve,
      nonAllocableCosts,
      notaryRate,
      objectUrl,
      otherIncome,
      purchasePrice,
      purchaseTaxRate,
      renovationCost,
      rentGrowth,
      repaymentRate,
      taxRate,
      years
    ]
  );

  const applyData = (data: CalcData) => {
    setAddress(data.address ?? "");
    setObjectUrl(data.objectUrl ?? "");
    setPurchasePrice(data.purchasePrice);
    setArea(data.area);
    setColdRent(data.coldRent);
    setOtherIncome(data.otherIncome);
    setRentGrowth(data.rentGrowth);
    setPurchaseTaxRate(data.purchaseTaxRate);
    setNotaryRate(data.notaryRate);
    setAgentRate(data.agentRate);
    setRenovationCost(data.renovationCost);
    setEquity(data.equity);
    setInterestRate(data.interestRate);
    setRepaymentRate(data.repaymentRate);
    setYears(data.years);
    setNonAllocableCosts(data.nonAllocableCosts);
    setMaintenanceReserve(data.maintenanceReserve);
    setInflationRate(data.inflationRate);
    setTaxRate(data.taxRate);
    setBuildingShare(data.buildingShare);
    setDepreciationRate(data.depreciationRate);
    setAppreciationRate(data.appreciationRate);
    setBenchmarkReturn(data.benchmarkReturn);
  };

  useEffect(() => {
    setSavedCalculations(listCalculations());
  }, []);

  const handleSelectCalculation = (id: string) => {
    if (!id) {
      setSelectedCalculationId(null);
      applyData(DEFAULT_CALC);
      return;
    }
    const record = savedCalculations.find((x) => x.id === id);
    if (!record) return;
    setSelectedCalculationId(record.id);
    applyData(record.data);
  };

  const handleSave = () => {
    try {
      const now = new Date().toISOString();

      if (selectedCalculationId) {
        const existing = savedCalculations.find(
          (x) => x.id === selectedCalculationId
        );
        if (!existing) {
          setSelectedCalculationId(null);
          setSavedCalculations(listCalculations());
          return;
        }
        const updated: CalculationRecord = {
          ...existing,
          updatedAt: now,
          data: currentData
        };
        upsertCalculation(updated);
        setSavedCalculations(listCalculations());
        return;
      }

      const name = window
        .prompt("Name der Kalkulation:", "Neue Kalkulation")
        ?.trim();
      if (!name) return;

      const created = createCalculation(name, currentData);
      upsertCalculation(created);
      setSelectedCalculationId(created.id);
      setSavedCalculations(listCalculations());
    } catch {
      alert("Speichern fehlgeschlagen (localStorage nicht verfügbar?).");
    }
  };

  const handleDuplicate = () => {
    try {
      const baseName =
        savedCalculations.find((x) => x.id === selectedCalculationId)?.name ??
        "Kalkulation";
      const name = window
        .prompt("Name der Kopie:", `Kopie von ${baseName}`)
        ?.trim();
      if (!name) return;
      const created = createCalculation(name, currentData);
      upsertCalculation(created);
      setSelectedCalculationId(created.id);
      setSavedCalculations(listCalculations());
    } catch {
      alert("Duplizieren fehlgeschlagen (localStorage nicht verfügbar?).");
    }
  };

  const handleBackupExport = () => {
    try {
      const json = exportToJson();
      const blob = new Blob([json], {
        type: "application/json;charset=utf-8;"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "immo-kalkulationen-backup.json");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert("Backup-Export fehlgeschlagen.");
    }
  };

  const handleBackupImportClick = () => {
    backupFileInputRef.current?.click();
  };

  const handleBackupImport: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        importFromJson(text);
        const list = listCalculations();
        setSavedCalculations(list);
        if (list.length > 0) {
          setSelectedCalculationId(list[0].id);
          applyData(list[0].data);
        }
        alert("Backup erfolgreich importiert.");
      } catch {
        alert("Backup-Import fehlgeschlagen. Bitte gültige Datei wählen.");
      } finally {
        // ermöglicht erneuten Import derselben Datei
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const results = useMemo(() => {
    const transactionCosts =
      purchasePrice * (purchaseTaxRate + notaryRate + agentRate) * 0.01;
    const incidentalCosts = transactionCosts + renovationCost;
    const totalInvestment = purchasePrice + incidentalCosts;

    const nonFinancedPart =
      (financeIncidental ? 0 : transactionCosts) +
      (financeRenovation ? 0 : renovationCost);

    const equityAfterNonFinanced = Math.max(equity - nonFinancedPart, 0);

    const financedPart =
      purchasePrice +
      (financeIncidental ? transactionCosts : 0) +
      (financeRenovation ? renovationCost : 0);

    const loanAmount = Math.max(financedPart - equityAfterNonFinanced, 0);

    const monthlyPayment = annuityPayment(
      loanAmount,
      interestRate + repaymentRate,
      30
    );

    const grossYield =
      purchasePrice > 0 ? ((coldRent * 12) / purchasePrice) * 100 : 0;

    const monthlyIncomeYear1 = coldRent + otherIncome;
    const monthlyExpensesYear1 =
      nonAllocableCosts +
      sevAdministration +
      maintenanceReserve +
      monthlyPayment;
    const monthlyCashflowBeforeTax = monthlyIncomeYear1 - monthlyExpensesYear1;

    const annualInterestYear1 = (loanAmount * interestRate) / 100;
    const annualDepreciation =
      ((purchasePrice * (buildingShare / 100)) * depreciationRate) / 100;

    const taxableIncome =
      monthlyCashflowBeforeTax * 12 -
      annualInterestYear1 -
      annualDepreciation;
    const tax =
      taxableIncome > 0 ? (taxableIncome * taxRate) / 100 : 0;
    const monthlyTax = tax / 12;

    const monthlyCashflowAfterTax = monthlyCashflowBeforeTax - monthlyTax;

    const cashOnCashReturn =
      equity > 0 ? (monthlyCashflowAfterTax * 12 * 100) / equity : 0;

    const futureValueProperty =
      purchasePrice * Math.pow(1 + appreciationRate / 100, years);
    const totalNetCashflow = monthlyCashflowAfterTax * 12 * years;
    const totalGain = futureValueProperty - purchasePrice + totalNetCashflow;

    const etfFutureValue = equity * Math.pow(1 + benchmarkReturn / 100, years);

    const points = Array.from({ length: years + 1 }, (_, year) => {
      const propertyValue =
        purchasePrice * Math.pow(1 + appreciationRate / 100, year);
      const etfValue = equity * Math.pow(1 + benchmarkReturn / 100, year);
      return {
        year,
        property: propertyValue,
        etf: etfValue
      };
    });

    return {
      incidentalCosts,
      totalInvestment,
      loanAmount,
      monthlyPayment,
      grossYield,
      monthlyCashflowBeforeTax,
      monthlyCashflowAfterTax,
      cashOnCashReturn,
      totalGain,
      futureValueProperty,
      etfFutureValue,
      points
    };
  }, [
    appreciationRate,
    benchmarkReturn,
    buildingShare,
    coldRent,
    depreciationRate,
    equity,
    interestRate,
    maintenanceReserve,
    sevAdministration,
    nonAllocableCosts,
    notaryRate,
    otherIncome,
    purchasePrice,
    purchaseTaxRate,
    renovationCost,
    repaymentRate,
    taxRate,
    years
  ]);

  const maxWealth =
    Math.max(
      ...results.points.map((p) => Math.max(p.property, p.etf, equity))
    ) || 1;

  const pricePerSqm =
    purchasePrice > 0 && area > 0 ? purchasePrice / area : 0;
  const rentPerSqm =
    coldRent > 0 && area > 0 ? coldRent / area : 0;
  const nonAllocablePerSqm =
    nonAllocableCosts > 0 && area > 0 ? nonAllocableCosts / area : 0;
  const reservePerSqm =
    maintenanceReserve > 0 && area > 0 ? maintenanceReserve / area : 0;
  const factor =
    coldRent > 0 ? purchasePrice / (coldRent * 12) : 0;

  const handleExport = () => {
    const header = ["Kategorie", "Feld", "Wert", "Einheit"];

    const rows: string[][] = [
      ["Objekt", "Adresse", address, ""],
      ["Objekt", "Link zum Objekt", objectUrl, ""],
      ["Objekt", "Kaufpreis", purchasePrice.toString(), "€"],
      ["Objekt", "Wohnfläche", area.toString(), "m²"],
      ["Objekt", "Kaltmiete", coldRent.toString(), "€ / Monat"],
      ["Objekt", "Sonstige Einnahmen", otherIncome.toString(), "€ / Monat"],
      ["Objekt", "Mietentwicklung", rentGrowth.toString(), "% p.a."],
      [],
      ["Kaufnebenkosten", "Grunderwerbsteuer", purchaseTaxRate.toString(), "%"],
      ["Kaufnebenkosten", "Notar & Grundbuch", notaryRate.toString(), "%"],
      ["Kaufnebenkosten", "Maklerprovision", agentRate.toString(), "%"],
      ["Kaufnebenkosten", "Renovierungskosten", renovationCost.toString(), "€"],
      ["Kaufnebenkosten", "Gesamte Kaufnebenkosten", results.incidentalCosts.toString(), "€"],
      [],
      ["Finanzierung", "Eigenkapital", equity.toString(), "€"],
      ["Finanzierung", "Zinssatz", interestRate.toString(), "%"],
      ["Finanzierung", "Tilgung", repaymentRate.toString(), "%"],
      ["Finanzierung", "Darlehenssumme", results.loanAmount.toString(), "€"],
      ["Finanzierung", "Monatliche Rate", results.monthlyPayment.toString(), "€"],
      [],
      ["Bewirtschaftung", "Nicht umlagefähiges Hausgeld", nonAllocableCosts.toString(), "€ / Monat"],
      ["Bewirtschaftung", "Eigene Rücklage", maintenanceReserve.toString(), "€ / Monat"],
      ["Bewirtschaftung", "Kostensteigerung (Inflation)", inflationRate.toString(), "% p.a."],
      [],
      ["Steuern & Parameter", "Betrachtungszeitraum", years.toString(), "Jahre"],
      ["Steuern & Parameter", "Persönlicher Steuersatz", taxRate.toString(), "%"],
      ["Steuern & Parameter", "Gebäudeanteil", buildingShare.toString(), "%"],
      ["Steuern & Parameter", "AfA (Abschreibung)", depreciationRate.toString(), "%"],
      ["Steuern & Parameter", "Wertsteigerung Immobilie", appreciationRate.toString(), "% p.a."],
      ["Steuern & Parameter", "ETF Benchmark Rendite", benchmarkReturn.toString(), "% p.a."],
      [],
      ["Ergebnis", "Monatlicher Cashflow (nach Steuer, Jahr 1)", results.monthlyCashflowAfterTax.toString(), "€ / Monat"],
      ["Ergebnis", "Cash on Cash Return", results.cashOnCashReturn.toString(), "% p.a."],
      ["Ergebnis", "Gesamtgewinn", results.totalGain.toString(), "€"],
      ["Ergebnis", "Bruttomietrendite", results.grossYield.toString(), "%"],
      ["Ergebnis", "Vermögenswert Immobilie am Ende", results.futureValueProperty.toString(), "€"],
      ["Ergebnis", "ETF-Vermögen am Ende", results.etfFutureValue.toString(), "€"]
    ];

    const lines = [
      header.join(";"),
      ...rows.map((r) => (r.length === 0 ? "" : r.join(";")))
    ];

    const csvContent = lines.join("\r\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "immo-kalkulation.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="logo">
          <div className="logo-icon">🏠</div>
          <div>
            <div className="logo-title">1:1 Immo-Planer</div>
            <div className="logo-subtitle">Immobilien Kalkulationstool</div>
          </div>
        </div>
        <div className="header-actions">
          <input
            ref={backupFileInputRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={handleBackupImport}
          />
          <select
            className="select"
            value={selectedCalculationId ?? ""}
            onChange={(e) => handleSelectCalculation(e.target.value)}
          >
            <option value="">Neue Kalkulation</option>
            {savedCalculations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            className="primary-button"
            type="button"
            onClick={handleExport}
          >
            Export nach Excel
          </button>
          <button
            className="icon-button"
            aria-label="Speichern (aktuelle Kalkulation)"
            type="button"
            onClick={handleSave}
          >
            💾
          </button>
          <button
            className="icon-button"
            aria-label="Duplizieren (neue Kalkulation aus aktueller)"
            type="button"
            onClick={handleDuplicate}
          >
            📄
          </button>
          <button
            className="icon-button"
            aria-label="Backup als Datei exportieren"
            type="button"
            onClick={handleBackupExport}
          >
            ⬇️
          </button>
          <button
            className="icon-button"
            aria-label="Backup-Datei importieren"
            type="button"
            onClick={handleBackupImportClick}
          >
            ⬆️
          </button>
        </div>
      </header>

      <main className="layout">
        <section className="column column-left">
          <div className="card">
            <h2>1. Objektdaten</h2>
            <div className="grid grid-2">
              <label className="field">
                <span className="field-label">Adresse</span>
                <input
                  type="text"
                  className="field-input"
                  placeholder="Musterstraße 1, 12345 Berlin"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Link zum Objekt</span>
                <input
                  type="url"
                  className="field-input"
                  placeholder="https://..."
                  value={objectUrl}
                  onChange={(e) => setObjectUrl(e.target.value)}
                />
              </label>
            </div>

            <div className="grid grid-4">
              <NumberInput
                label="Kaufpreis"
                suffix="€"
                value={purchasePrice}
                onChange={setPurchasePrice}
              />
              <div className="field">
                <span className="field-helper">
                  Faktor:{" "}
                  {factor
                    ? `${factor.toLocaleString("de-DE", {
                        maximumFractionDigits: 1
                      })}x`
                    : "–"}
                  {" | "}
                  {pricePerSqm
                    ? `~ ${pricePerSqm.toLocaleString("de-DE", {
                        maximumFractionDigits: 0
                      })} € / m²`
                    : ""}
                </span>
              </div>
              <NumberInput
                label="Wohnfläche"
                suffix="m²"
                value={area}
                onChange={setArea}
              />
              <NumberInput
                label="Kaltmiete"
                suffix="€"
                value={coldRent}
                onChange={setColdRent}
              />
              <div className="field">
                <span className="field-helper">
                  {rentPerSqm
                    ? `~ ${rentPerSqm.toLocaleString("de-DE", {
                        maximumFractionDigits: 1
                      })} € / m²`
                    : "–"}
                </span>
              </div>
              <NumberInput
                label="Sonstige Einnahmen"
                suffix="€"
                value={otherIncome}
                onChange={setOtherIncome}
              />
              <NumberInput
                label="Mietentwicklung"
                suffix="% p.a."
                value={rentGrowth}
                onChange={setRentGrowth}
              />
            </div>
          </div>

          <div className="card">
            <h2>2. Kaufnebenkosten &amp; Sanierung</h2>
            <div className="grid grid-4">
              <NumberInput
                label="Grunderwerbsteuer"
                suffix="%"
                value={purchaseTaxRate}
                onChange={setPurchaseTaxRate}
              />
              <NumberInput
                label="Notar &amp; Grundbuch"
                suffix="%"
                value={notaryRate}
                onChange={setNotaryRate}
              />
              <NumberInput
                label="Maklerprovision"
                suffix="%"
                value={agentRate}
                onChange={setAgentRate}
              />
            </div>
            <div className="grid grid-2">
              <NumberInput
                label="Renovierungskosten"
                suffix="€"
                value={renovationCost}
                onChange={setRenovationCost}
              />
              <div className="summary-line">
                <span>Gesamte Kaufnebenkosten</span>
                <span className="summary-value">
                  {results.incidentalCosts.toLocaleString("de-DE", {
                    maximumFractionDigits: 0
                  })}{" "}
                  €
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>3. Finanzierung</h2>
            <div className="grid grid-3">
              <NumberInput
                label="Eigenkapital Einsatz"
                suffix="€"
                value={equity}
                onChange={setEquity}
              />
              <NumberInput
                label="Zinssatz"
                suffix="%"
                value={interestRate}
                onChange={setInterestRate}
              />
              <NumberInput
                label="Tilgung"
                suffix="%"
                value={repaymentRate}
                onChange={setRepaymentRate}
              />
            </div>
            <div className="summary-list" style={{ marginTop: 8 }}>
              <label className="summary-line" style={{ fontSize: 12 }}>
                <span>
                  <input
                    type="checkbox"
                    checked={financeIncidental}
                    onChange={(e) => setFinanceIncidental(e.target.checked)}
                    style={{ marginRight: 6 }}
                  />
                  Kaufnebenkosten mitfinanzieren
                </span>
              </label>
              <label className="summary-line" style={{ fontSize: 12 }}>
                <span>
                  <input
                    type="checkbox"
                    checked={financeRenovation}
                    onChange={(e) => setFinanceRenovation(e.target.checked)}
                    style={{ marginRight: 6 }}
                  />
                  Sanierungskosten mitfinanzieren
                </span>
              </label>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                Hinweis: Das Darlehen deckt in der Kalkulation automatisch alle
                Kosten ab, die nicht durch das Eigenkapital gedeckt sind.
              </div>
            </div>
          </div>

          <div className="card">
            <h2>4. Bewirtschaftungskosten</h2>
            <div className="grid grid-3">
              <NumberInput
                label="Nicht umlagefähiges Hausgeld"
                suffix="€"
                value={nonAllocableCosts}
                onChange={setNonAllocableCosts}
              />
              <div className="field">
                <span className="field-helper">
                  {nonAllocablePerSqm
                    ? `~ ${nonAllocablePerSqm.toLocaleString("de-DE", {
                        maximumFractionDigits: 1
                      })} € / m²`
                    : "–"}
                </span>
              </div>
              <NumberInput
                label="SEV Verwaltung"
                suffix="€"
                value={sevAdministration}
                onChange={setSevAdministration}
              />
              <NumberInput
                label="Eigene Rücklage"
                suffix="€"
                value={maintenanceReserve}
                onChange={setMaintenanceReserve}
              />
              <div className="field">
                <span className="field-helper">
                  {reservePerSqm
                    ? `~ ${reservePerSqm.toLocaleString("de-DE", {
                        maximumFractionDigits: 1
                      })} € / m²`
                    : "–"}
                </span>
              </div>
              <NumberInput
                label="Kostensteigerung (Inflation)"
                suffix="% p.a."
                value={inflationRate}
                onChange={setInflationRate}
              />
            </div>
          </div>

          <div className="card">
            <h2>5. Steuern &amp; Parameter</h2>
            <div className="grid grid-4">
              <NumberInput
                label="Betrachtungszeitraum"
                suffix="Jahre"
                value={years}
                onChange={setYears}
              />
              <NumberInput
                label="Persönlicher Steuersatz"
                suffix="%"
                value={taxRate}
                onChange={setTaxRate}
              />
              <NumberInput
                label="Gebäudeanteil"
                suffix="%"
                value={buildingShare}
                onChange={setBuildingShare}
              />
              <NumberInput
                label="AfA (Abschreibung)"
                suffix="%"
                value={depreciationRate}
                onChange={setDepreciationRate}
              />
              <NumberInput
                label="Wertsteigerung Immobilie"
                suffix="% p.a."
                value={appreciationRate}
                onChange={setAppreciationRate}
              />
              <NumberInput
                label="ETF Benchmark Rendite"
                suffix="% p.a."
                value={benchmarkReturn}
                onChange={setBenchmarkReturn}
              />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
              Analyse-Horizont: Nach {years} Jahren ist der Verkauf steuerfrei
              (Spekulationsfrist).
            </div>
          </div>
        </section>

        <section className="column column-right">
          <div className="grid grid-2">
            <div className="card card-highlight">
              <div className="card-label">Monatlicher Cashflow (Jahr 1)</div>
              <div className="card-main-value">
                {results.monthlyCashflowAfterTax.toLocaleString("de-DE", {
                  maximumFractionDigits: 0
                })}{" "}
                €
              </div>
              <div className="card-subtext">nach Steuer</div>
            </div>

            <div className="card">
              <div className="card-label">Cash on Cash Return</div>
              <div className="card-main-value">
                {results.cashOnCashReturn.toLocaleString("de-DE", {
                  maximumFractionDigits: 2
                })}
                %
              </div>
              <div className="card-subtext">
                auf {equity.toLocaleString("de-DE", {
                  maximumFractionDigits: 0
                })}{" "}
                € Eigenkapital
              </div>
            </div>

            <div className="card">
              <div className="card-label">Gesamtgewinn</div>
              <div className="card-main-value">
                {results.totalGain.toLocaleString("de-DE", {
                  maximumFractionDigits: 0
                })}{" "}
                €
              </div>
              <div className="card-subtext">nach {years} Jahren</div>
            </div>

            <div className="card">
              <div className="card-label">Mietrendite</div>
              <div className="card-main-value">
                {results.grossYield.toLocaleString("de-DE", {
                  maximumFractionDigits: 2
                })}
                %
              </div>
              <div className="card-subtext">Bruttomietrendite</div>
            </div>
          </div>

          <div className="card">
            <h2>Monatliche Übersicht (Jahr 1)</h2>
            <div className="summary-list">
              <div className="summary-line">
                <span>Mieteinnahmen (kalt)</span>
                <span className="positive">
                  +
                  {(coldRent + otherIncome).toLocaleString("de-DE", {
                    maximumFractionDigits: 0
                  })}{" "}
                  €
                </span>
              </div>
              <div className="summary-line">
                <span>Nicht umlagefähige Kosten &amp; Rücklage</span>
                <span className="negative">
                  -
                  {(nonAllocableCosts + maintenanceReserve).toLocaleString(
                    "de-DE",
                    {
                      maximumFractionDigits: 0
                    }
                  )}{" "}
                  €
                </span>
              </div>
              <div className="summary-line">
                <span>Bankrate (Zins + Tilgung)</span>
                <span className="negative">
                  -
                  {results.monthlyPayment.toLocaleString("de-DE", {
                    maximumFractionDigits: 0
                  })}{" "}
                  €
                </span>
              </div>
              <div className="summary-divider" />
              <div className="summary-line summary-total">
                <span>Cashflow (nach Steuer)</span>
                <span>
                  {results.monthlyCashflowAfterTax.toLocaleString("de-DE", {
                    maximumFractionDigits: 0
                  })}{" "}
                  €
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h2>Investitionsbedarf</h2>
              <div className="summary-list">
                <div className="summary-line">
                  <span>Kaufpreis</span>
                  <span>
                    {purchasePrice.toLocaleString("de-DE", {
                      maximumFractionDigits: 0
                    })}{" "}
                    €
                  </span>
                </div>
                <div className="summary-line">
                  <span>Kaufnebenkosten &amp; Renovierung</span>
                  <span>
                    {results.incidentalCosts.toLocaleString("de-DE", {
                      maximumFractionDigits: 0
                    })}{" "}
                    €
                  </span>
                </div>
                <div className="summary-divider" />
                <div className="summary-line summary-total">
                  <span>Gesamtinvestitionskosten</span>
                  <span>
                    {results.totalInvestment.toLocaleString("de-DE", {
                      maximumFractionDigits: 0
                    })}{" "}
                    €
                  </span>
                </div>
                <div className="summary-line">
                  <span>Darlehenssumme</span>
                  <span>
                    {results.loanAmount.toLocaleString("de-DE", {
                      maximumFractionDigits: 0
                    })}{" "}
                    €
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Vermögensentwicklung</h2>
              <svg
                viewBox="0 0 100 60"
                className="chart"
                aria-hidden="true"
              >
                <line
                  x1="10"
                  y1="50"
                  x2="95"
                  y2="50"
                  stroke="#CBD5E1"
                  strokeWidth="0.4"
                />
                <line
                  x1="10"
                  y1="10"
                  x2="10"
                  y2="50"
                  stroke="#CBD5E1"
                  strokeWidth="0.4"
                />
                {results.points.length > 1 && (
                  <>
                    <polyline
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="1.2"
                      points={results.points
                        .map((p, idx) => {
                          const x =
                            10 +
                            ((95 - 10) * idx) /
                              (results.points.length - 1 || 1);
                          const y =
                            50 -
                            (p.property / maxWealth) * (50 - 12 || 1);
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                    <polyline
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="1.2"
                      strokeDasharray="2 2"
                      points={results.points
                        .map((p, idx) => {
                          const x =
                            10 +
                            ((95 - 10) * idx) /
                              (results.points.length - 1 || 1);
                          const y =
                            50 -
                            (p.etf / maxWealth) * (50 - 12 || 1);
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                  </>
                )}
              </svg>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-dot legend-dot-blue" />
                  Immobilienvermögen
                </span>
                <span className="legend-item">
                  <span className="legend-dot legend-dot-orange" />
                  ETF-Vermögen
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
