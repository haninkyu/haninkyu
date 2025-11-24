import JSZip from 'jszip';
import { MeasurementData } from '../types';

export const exportData = async (data: MeasurementData, attachment: File | null) => {
  // Define headers mapping
  const headers = {
    receptionNumber: '접수번호',
    inspectionDateStart: '검사일 시작',
    inspectionDateEnd: '검사일 종료',
    model: '모델',
    serialNumber: '제조번호',
    spanFilm: '스팬 필름',
    intermediateFilm: '중간 필름',
    span1: '스팬 1',
    flowRate: '유량',
    repeatability1: '반복성1',
    linearity: '직선성',
    repeatability2: '반복성2',
    blankTest1: '공시험1',
    repeatability3: '반복성3',
    blankTest2: '공시험2',
    span2: '스팬 2',
    blankTest3: '공시험3'
  };

  // Create CSV content
  const headerRow = Object.values(headers).join(',') + '\n';
  const dataRow = Object.keys(headers).map(key => {
    const value = data[key as keyof MeasurementData];
    // Escape quotes and wrap in quotes to handle commas in data
    return `"${String(value).replace(/"/g, '""')}"`;
  }).join(',') + '\n';

  const csvContent = "\uFEFF" + headerRow + dataRow; // Add BOM for Excel utf-8 compatibility
  const fileNameBase = `raw_data_${data.receptionNumber || 'export'}`;

  if (attachment) {
    const zip = new JSZip();
    // Add CSV file to the zip
    zip.file(`${fileNameBase}.csv`, csvContent);
    // Add the attachment to the zip
    zip.file(attachment.name, attachment);

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, `${fileNameBase}.zip`);
  } else {
    // Create blob and download CSV directly if no attachment
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `${fileNameBase}.csv`);
  }
};

const downloadFile = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
