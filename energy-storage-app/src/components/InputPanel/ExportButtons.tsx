/**
 * 导出按钮组件
 */
import { useInputStore } from '../../store/inputStore';
import { useResultStore } from '../../store/resultStore';
import { exportToExcel } from '../../utils/excelExport';
import { exportToPDF } from '../../utils/pdfExport';

export function ExportButtons() {
  const { params } = useInputStore();
  const { results, yearly, isCalculated } = useResultStore();

  const handleExcelExport = () => {
    if (!isCalculated || !results) return;
    exportToExcel(params, results, yearly);
  };

  const handlePDFExport = async () => {
    if (!isCalculated) return;
    try {
      await exportToPDF('main-content', `${params.projectName}_财务分析报告`);
    } catch (error) {
      console.error('PDF导出失败:', error);
      alert('PDF导出失败，请重试');
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExcelExport}
        disabled={!isCalculated}
        className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        导出Excel
      </button>
      <button
        onClick={handlePDFExport}
        disabled={!isCalculated}
        className="flex-1 px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        导出PDF
      </button>
    </div>
  );
}