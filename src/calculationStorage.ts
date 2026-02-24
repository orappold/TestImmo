export type CalcData = {
  address: string;
  objectUrl: string;

  purchasePrice: number;
  area: number;
  coldRent: number;
  otherIncome: number;
  rentGrowth: number;

  purchaseTaxRate: number;
  notaryRate: number;
  agentRate: number;
  renovationCost: number;

  equity: number;
  interestRate: number;
  repaymentRate: number;
  years: number;

  nonAllocableCosts: number;
  maintenanceReserve: number;
  inflationRate: number;

  taxRate: number;
  buildingShare: number;
  depreciationRate: number;
  appreciationRate: number;
  benchmarkReturn: number;
};

export type CalculationRecord = {
  id: string;
  name: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  data: CalcData;
};

const STORAGE_KEY = "immo-calculator:calculations:v1";

type StorageV1 = {
  version: 1;
  items: CalculationRecord[];
};

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStorage(): StorageV1 {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, items: [] };
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      (parsed as { version?: unknown }).version !== 1 ||
      !Array.isArray((parsed as { items?: unknown }).items)
    ) {
      return { version: 1, items: [] };
    }
    const items = (parsed as StorageV1).items.filter(
      (x) =>
        x &&
        typeof x === "object" &&
        typeof (x as CalculationRecord).id === "string" &&
        typeof (x as CalculationRecord).name === "string" &&
        typeof (x as CalculationRecord).createdAt === "string" &&
        typeof (x as CalculationRecord).updatedAt === "string" &&
        (x as CalculationRecord).data &&
        typeof (x as CalculationRecord).data === "object"
    ) as CalculationRecord[];
    return { version: 1, items };
  } catch {
    return { version: 1, items: [] };
  }
}

function writeStorage(storage: StorageV1) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

export function listCalculations(): CalculationRecord[] {
  const { items } = readStorage();
  return [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getCalculation(id: string): CalculationRecord | null {
  const { items } = readStorage();
  return items.find((x) => x.id === id) ?? null;
}

export function createCalculation(
  name: string,
  data: CalcData
): CalculationRecord {
  const createdAt = nowIso();
  return {
    id: makeId(),
    name,
    createdAt,
    updatedAt: createdAt,
    data
  };
}

export function upsertCalculation(record: CalculationRecord): void {
  const storage = readStorage();
  const idx = storage.items.findIndex((x) => x.id === record.id);
  if (idx >= 0) {
    storage.items[idx] = record;
  } else {
    storage.items.unshift(record);
  }
  writeStorage(storage);
}

export function deleteCalculation(id: string): void {
  const storage = readStorage();
  storage.items = storage.items.filter((x) => x.id !== id);
  writeStorage(storage);
}

export function exportToJson(): string {
  const storage = readStorage();
  return JSON.stringify(storage, null, 2);
}

export function importFromJson(json: string): void {
  const parsed = JSON.parse(json) as unknown;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Ungültiges Backup-Format");
  }

  const itemsRaw =
    (parsed as { items?: unknown }).items ??
    (Array.isArray(parsed) ? parsed : null);

  if (!Array.isArray(itemsRaw)) {
    throw new Error("Ungültiges Backup-Format (items fehlen)");
  }

  const items: CalculationRecord[] = itemsRaw
    .map((x) => {
      if (
        !x ||
        typeof x !== "object" ||
        typeof (x as CalculationRecord).id !== "string" ||
        typeof (x as CalculationRecord).name !== "string" ||
        !(x as CalculationRecord).data ||
        typeof (x as CalculationRecord).data !== "object"
      ) {
        return null;
      }
      const createdAt =
        typeof (x as CalculationRecord).createdAt === "string"
          ? (x as CalculationRecord).createdAt
          : nowIso();
      const updatedAt =
        typeof (x as CalculationRecord).updatedAt === "string"
          ? (x as CalculationRecord).updatedAt
          : createdAt;
      return {
        id: (x as CalculationRecord).id,
        name: (x as CalculationRecord).name,
        createdAt,
        updatedAt,
        data: (x as CalculationRecord).data
      } as CalculationRecord;
    })
    .filter((x): x is CalculationRecord => x !== null);

  writeStorage({ version: 1, items });
}


