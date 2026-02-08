
export interface YearlyData {
  year: number;
  investment: number;
  return: number;
  writeOff: number;
}

export interface AppraisalInputs {
  costOfCapital: number;
  taxRate: number;
  inflationRate: number;
  yearlyData: YearlyData[];
}

export interface AppraisalResults {
  irr: number | null;
  cashPayback: number | null;
  npv: number;
  totalNetIncome: number;
  totalCashFlow: number;
  cashFlows: number[];
  netIncomes: number[];
  cumulativeCashFlows: number[];
}

export interface GeminiInsight {
  analysis: string;
  recommendation: 'APPROVE' | 'REJECT' | 'NEUTRAL';
  risks: string[];
}

export type SensitivityLevel = -20 | -15 | -10 | -5 | 0 | 5 | 10 | 15 | 20;

export interface SensitivityScenario {
  label: string;
  value: SensitivityLevel;
  type: 'base' | 'lower' | 'boost';
}
