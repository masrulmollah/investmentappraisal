import React, { useState, useEffect, useMemo } from 'react';
import { AppraisalInputs, AppraisalResults, YearlyData, GeminiInsight, SensitivityLevel } from './types';
import { runAppraisal } from './utils/finance';
import { getGeminiAnalysis } from './services/geminiService';
import FinancialCharts from './components/FinancialCharts';

const SENSITIVITY_OPTIONS: { label: string; value: SensitivityLevel }[] = [
  { label: '20% Lower', value: -20 },
  { label: '15% Lower', value: -15 },
  { label: '10% Lower', value: -10 },
  { label: '5% Lower', value: -5 },
  { label: 'Base Case', value: 0 },
  { label: '5% Boost', value: 5 },
  { label: '10% Boost', value: 10 },
  { label: '15% Boost', value: 15 },
  { label: '20% Boost', value: 20 },
];

const App: React.FC = () => {
  const [baseInputs, setBaseInputs] = useState<AppraisalInputs>({
    costOfCapital: 10,
    taxRate: 25,
    inflationRate: 2,
    yearlyData: [
      { year: 0, investment: 100000, return: 0, writeOff: 0 },
      { year: 1, investment: 0, return: 40000, writeOff: 20000 },
      { year: 2, investment: 0, return: 45000, writeOff: 20000 },
      { year: 3, investment: 0, return: 50000, writeOff: 20000 },
      { year: 4, investment: 0, return: 55000, writeOff: 20000 },
      { year: 5, investment: 0, return: 60000, writeOff: 20000 },
    ]
  });

  const [returnSensitivity, setReturnSensitivity] = useState<SensitivityLevel>(0);
  const [investmentSensitivity, setInvestmentSensitivity] = useState<SensitivityLevel>(0);
  
  const [results, setResults] = useState<AppraisalResults | null>(null);
  const [insight, setInsight] = useState<GeminiInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const activeInputs = useMemo(() => {
    const returnFactor = 1 + (returnSensitivity / 100);
    const investmentFactor = 1 - (investmentSensitivity / 100);
    
    return {
      ...baseInputs,
      yearlyData: baseInputs.yearlyData.map(data => ({
        ...data,
        return: data.return * returnFactor,
        investment: data.investment * investmentFactor
      }))
    };
  }, [baseInputs, returnSensitivity, investmentSensitivity]);

  useEffect(() => {
    const calcResults = runAppraisal(activeInputs);
    setResults(calcResults);
    setInsight(null);
  }, [activeInputs]);

  const handleYearlyDataChange = (index: number, field: keyof YearlyData, value: number) => {
    const newData = [...baseInputs.yearlyData];
    newData[index] = { ...newData[index], [field]: value };
    setBaseInputs(prev => ({ ...prev, yearlyData: newData }));
  };

  const addYear = () => {
    setBaseInputs(prev => ({
      ...prev,
      yearlyData: [
        ...prev.yearlyData,
        { 
          year: prev.yearlyData.length, 
          investment: 0, 
          return: 0, 
          writeOff: 0 
        }
      ]
    }));
  };

  const removeYear = (index: number) => {
    if (baseInputs.yearlyData.length <= 1) return;
    const newData = baseInputs.yearlyData.filter((_, i) => i !== index);
    setBaseInputs(prev => ({ ...prev, yearlyData: newData }));
  };

  const analyzeWithAI = async () => {
    if (!results) return;
    setLoadingInsight(true);
    try {
      const aiInsight = await getGeminiAnalysis(activeInputs, results);
      setInsight(aiInsight);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsight(false);
    }
  };

  const getSelectStyle = (val: number) => {
    if (val === 0) return 'border-gray-300 focus:ring-indigo-500';
    return val < 0 ? 'border-rose-300 text-rose-700 focus:ring-rose-500 bg-rose-50' : 'border-emerald-300 text-emerald-700 focus:ring-emerald-500 bg-emerald-50';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
          InvestPro <span className="text-indigo-600">Appraisal</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Comprehensive investment analysis tool. Input your project parameters to calculate critical performance metrics and get AI-driven feasibility insights.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-sliders-h mr-2 text-indigo-500"></i> Global Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cost of Capital (%)</label>
                <input 
                  type="number" 
                  value={baseInputs.costOfCapital} 
                  onChange={(e) => setBaseInputs(p => ({...p, costOfCapital: Number(e.target.value)}))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                <input 
                  type="number" 
                  value={baseInputs.taxRate} 
                  onChange={(e) => setBaseInputs(p => ({...p, taxRate: Number(e.target.value)}))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Inflation Rate (%)</label>
                <input 
                  type="number" 
                  value={baseInputs.inflationRate} 
                  onChange={(e) => setBaseInputs(p => ({...p, inflationRate: Number(e.target.value)}))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-chart-line mr-2 text-rose-500"></i> Sensitivity Analysis
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Stress test individual variables to see impact on project viability.
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Sensitivity</label>
                <select 
                  value={returnSensitivity}
                  onChange={(e) => setReturnSensitivity(Number(e.target.value) as SensitivityLevel)}
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-2 border transition ${getSelectStyle(returnSensitivity)}`}
                >
                  {SENSITIVITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investment Sensitivity</label>
                <select 
                  value={investmentSensitivity}
                  onChange={(e) => setInvestmentSensitivity(Number(e.target.value) as SensitivityLevel)}
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-2 border transition ${getSelectStyle(investmentSensitivity)}`}
                >
                  {SENSITIVITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1 italic">Note: Investment boost reduces cost.</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Base Projections</h2>
              <button 
                onClick={addYear}
                className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full hover:bg-indigo-100 transition"
              >
                + Add Year
              </button>
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {baseInputs.yearlyData.map((year, idx) => (
                <div key={idx} className="p-4 border border-gray-100 bg-gray-50 rounded-lg relative">
                  <button 
                    onClick={() => removeYear(idx)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  <h4 className="text-sm font-bold text-indigo-600 mb-2">Year {year.year}</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase">Investment ($)</label>
                      <input 
                        type="number" 
                        value={year.investment}
                        onChange={(e) => handleYearlyDataChange(idx, 'investment', Number(e.target.value))}
                        className="w-full text-sm p-1.5 border rounded mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase">Revenue/Return ($)</label>
                      <input 
                        type="number" 
                        value={year.return}
                        onChange={(e) => handleYearlyDataChange(idx, 'return', Number(e.target.value))}
                        className="w-full text-sm p-1.5 border rounded mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase">Asset Write-off ($)</label>
                      <input 
                        type="number" 
                        value={year.writeOff}
                        onChange={(e) => handleYearlyDataChange(idx, 'writeOff', Number(e.target.value))}
                        className="w-full text-sm p-1.5 border rounded mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="xl:col-span-2 space-y-8">
          {results && (
            <>
              {(returnSensitivity !== 0 || investmentSensitivity !== 0) && (
                <div className="bg-indigo-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md animate-pulse">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-microscope text-indigo-300"></i>
                    <span className="font-bold">Active Stress Scenario:</span>
                  </div>
                  <div className="flex gap-4 text-xs font-mono">
                    <span className={returnSensitivity >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                      Returns: {returnSensitivity > 0 ? '+' : ''}{returnSensitivity}%
                    </span>
                    <span className={investmentSensitivity >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                      Invest: {investmentSensitivity > 0 ? '-' : '+'}{Math.abs(investmentSensitivity)}% cost
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-indigo-500 flex flex-col justify-between">
                  <span className="text-sm text-gray-500 font-medium">Internal Rate of Return</span>
                  <div className="text-3xl font-bold text-indigo-600 mt-2">
                    {results.irr ? `${results.irr.toFixed(2)}%` : 'N/A'}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Hurdle: {baseInputs.costOfCapital}%</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-emerald-500 flex flex-col justify-between">
                  <span className="text-sm text-gray-500 font-medium">Cash Payback Period</span>
                  <div className="text-3xl font-bold text-emerald-600 mt-2">
                    {results.cashPayback ? `${results.cashPayback.toFixed(2)} yrs` : 'Infinite'}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Liquidity recovery estimate</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-500 mb-1">Net Present Value (NPV)</h3>
                  <p className={`text-4xl font-black ${results.npv >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${results.npv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <button 
                  onClick={analyzeWithAI}
                  disabled={loadingInsight}
                  className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {loadingInsight ? (
                    <><i className="fas fa-spinner fa-spin"></i> Analyzing...</>
                  ) : (
                    <><i className="fas fa-robot text-indigo-400"></i> Get AI Insight</>
                  )}
                </button>
              </div>

              {insight && (
                <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl border border-indigo-100 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`px-4 py-1 rounded-full text-sm font-bold border ${
                      insight.recommendation === 'APPROVE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                      insight.recommendation === 'REJECT' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {insight.recommendation} Recommendation
                    </span>
                    {(returnSensitivity !== 0 || investmentSensitivity !== 0) && (
                      <span className="text-xs text-indigo-400 italic font-medium">
                        (Analysis reflects active sensitivity shifts)
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-indigo-900 font-bold mb-3 flex items-center">
                        <i className="fas fa-brain mr-2"></i> Expert Analysis
                      </h4>
                      <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                        {insight.analysis}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-indigo-900 font-bold mb-3 flex items-center">
                        <i className="fas fa-exclamation-triangle mr-2"></i> Key Risk Factors
                      </h4>
                      <ul className="space-y-2">
                        {insight.risks.map((risk, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <i className="fas fa-circle text-[6px] mt-2 text-indigo-300"></i>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <FinancialCharts results={results} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;