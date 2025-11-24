import JSZip from 'jszip';
import { MeasurementData, Sheet } from '../types';

export const exportSheetData = async (sheet: Sheet) => {
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

  // Create CSV content (One row for the current sheet)
  const headerRow = '사이트명,' + Object.values(headers).join(',') + '\n';
  
  const rowData = Object.keys(headers).map(key => {
    const value = sheet.data[key as keyof MeasurementData];
    // Escape quotes and wrap in quotes to handle commas in data
    return `"${String(value || '').replace(/"/g, '""')}"`;
  }).join(',');
  
  const dataRow = `"${sheet.name}",${rowData}`;

  const csvContent = "\uFEFF" + headerRow + dataRow; // Add BOM for Excel utf-8 compatibility
  
  // Filename base: ReceptionNumber_Model_SerialNumber
  const sanitize = (str: string) => (str || '').trim().replace(/[\\/:*?"<>|\s]/g, '_');
  
  const fReception = sanitize(sheet.data.receptionNumber) || '접수번호미입력';
  const fModel = sanitize(sheet.data.model) || '모델미입력';
  const fSerial = sanitize(sheet.data.serialNumber) || '제조번호미입력';

  const fileNameBase = `${fReception}_${fModel}_${fSerial}`;

  // 1. Always download CSV directly
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `${fileNameBase}.csv`);

  // 2. If attachments exist for this sheet, zip them
  if (sheet.files && sheet.files.length > 0) {
    const zip = new JSZip();
    
    // Add files to the root of the zip
    sheet.files.forEach((file) => {
      zip.file(file.name, file);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Download ZIP with a slight delay to ensure browser handles both downloads
    setTimeout(() => {
      downloadFile(zipBlob, `${fileNameBase}_images.zip`);
    }, 500);
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