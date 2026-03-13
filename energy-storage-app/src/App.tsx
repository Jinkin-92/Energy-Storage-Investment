/**
 * 储能投资分析系统 - 主应用
 */
import { useState } from 'react';
import { InputPanel } from './components/InputPanel/InputPanel';
import { MetricCards } from './components/ResultPanel/MetricCards';
import {
  InvestmentTable,
  ProfitTable,
  ProjectCFTable,
  EquityCFTable,
  LoanTable,
  CostTable,
} from './components/tables';
import {
  InvestmentPieChart,
  FundingPieChart,
  RevenueTrendChart,
  CostBreakdownChart,
  CashflowTrendChart,
  ProfitDistributionChart,
  LoanRepaymentChart,
  IRRSensitivityChart,
  PaybackPeriodChart,
  EnergyPriceChart,
} from './components/charts';
import { useResultStore } from './store/resultStore';
import './index.css';

type TabType = 'overview' | 'charts' | 'investment' | 'profit' | 'projectCF' | 'equityCF' | 'loan' | 'cost';

const tabs: { key: TabType; label: string }[] = [
  { key: 'overview', label: '核心指标' },
  { key: 'charts', label: '可视化图表' },
  { key: 'investment', label: '表1-投资计划' },
  { key: 'profit', label: '表2-利润分配' },
  { key: 'projectCF', label: '表3-项目现金流' },
  { key: 'equityCF', label: '表4-资本金现金流' },
  { key: 'loan', label: '表5-还本付息' },
  { key: 'cost', label: '表6-运营成本' },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { isCalculated } = useResultStore();

  const renderContent = () => {
    if (!isCalculated) {
      return (
        <div className="bg-gray-50 p-12 rounded-lg text-center text-gray-500">
          <p className="text-lg">请输入参数后点击"开始计算"</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <MetricCards />;
      case 'charts':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InvestmentPieChart />
            <FundingPieChart />
            <RevenueTrendChart />
            <CostBreakdownChart />
            <CashflowTrendChart />
            <ProfitDistributionChart />
            <LoanRepaymentChart />
            <IRRSensitivityChart />
            <PaybackPeriodChart />
            <EnergyPriceChart />
          </div>
        );
      case 'investment':
        return <InvestmentTable />;
      case 'profit':
        return <ProfitTable />;
      case 'projectCF':
        return <ProjectCFTable />;
      case 'equityCF':
        return <EquityCFTable />;
      case 'loan':
        return <LoanTable />;
      case 'cost':
        return <CostTable />;
      default:
        return <MetricCards />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            储能投资分析系统
          </h1>
          <p className="text-sm text-gray-500">
            Energy Storage Investment Analysis System
          </p>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧：参数输入 */}
          <div className="lg:col-span-1">
            <InputPanel />
          </div>

          {/* 右侧：结果展示 */}
          <div className="lg:col-span-3" id="main-content">
            {/* 标签页导航 */}
            <div className="bg-white rounded-lg shadow-sm border mb-4">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 内容区 */}
            <div className="min-h-[400px]">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>

      {/* 底部 */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-3 text-center text-sm text-gray-500">
          验证基准：邛崃100MW/200MWh项目 | 目标IRR: 6.38%
        </div>
      </footer>
    </div>
  );
}

export default App;