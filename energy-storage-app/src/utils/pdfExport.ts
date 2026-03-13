/**
 * PDF导出工具
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * 将DOM元素导出为PDF
 */
export async function exportToPDF(
  elementId: string,
  fileName: string = '财务分析报告'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // 使用html2canvas捕获元素
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  // 计算PDF尺寸
  const imgWidth = 210; // A4宽度(mm)
  const pageHeight = 297; // A4高度(mm)
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;

  // 创建PDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  let position = 0;

  // 添加图片到PDF
  pdf.addImage(
    canvas.toDataURL('image/png'),
    'PNG',
    0,
    position,
    imgWidth,
    imgHeight
  );
  heightLeft -= pageHeight;

  // 如果内容超过一页，添加更多页
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight
    );
    heightLeft -= pageHeight;
  }

  // 保存PDF
  pdf.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * 导出完整报告PDF
 */
export async function exportReportToPDF(
  projectName: string,
  metricsHtml: string
): Promise<void> {
  // 创建临时容器
  const container = document.createElement('div');
  container.id = 'pdf-export-container';
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: 800px;
    background: white;
    padding: 20px;
  `;
  container.innerHTML = `
    <div style="font-family: sans-serif;">
      <h1 style="text-align: center; font-size: 24px; margin-bottom: 20px;">
        储能投资分析报告
      </h1>
      <h2 style="font-size: 18px; color: #666; margin-bottom: 30px;">
        ${projectName}
      </h2>
      <p style="text-align: right; color: #999; font-size: 12px;">
        生成时间: ${new Date().toLocaleString()}
      </p>
      ${metricsHtml}
    </div>
  `;
  document.body.appendChild(container);

  try {
    await exportToPDF('pdf-export-container', `${projectName}_财务分析报告`);
  } finally {
    document.body.removeChild(container);
  }
}