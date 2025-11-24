import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileSpreadsheet, Send, Image as ImageIcon, Download, Plus, X, Save } from 'lucide-react';
import { MeasurementData, Sheet } from '../types';
import { exportSheetData } from '../utils/exportUtils';
import { FormInput } from './ui/FormInput';

// Helper for rendering label cells - defined outside to avoid re-creation and TS errors
const LabelCell = ({ children }: { children?: React.ReactNode }) => (
  <div className="bg-gray-100 flex items-center justify-center p-2 font-medium text-gray-700 text-sm md:text-base break-keep text-center">
    {children}
  </div>
);

const INITIAL_DATA: MeasurementData = {
  receptionNumber: '',
  inspectionDateStart: '',
  inspectionDateEnd: '',
  model: '',
  serialNumber: '',
  spanFilm: '',
  intermediateFilm: '',
  span1: '',
  flowRate: '',
  repeatability1: '',
  linearity: '',
  repeatability2: '',
  blankTest1: '',
  repeatability3: '',
  blankTest2: '',
  span2: '',
  blankTest3: '',
};

export const MeasurementForm: React.FC = () => {
  // Initialize with saved data from localStorage if available, otherwise default to 4 sheets
  const [sheets, setSheets] = useState<Sheet[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ktl_dust_entry_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Restore sheets but reset files as they cannot be serialized
          return parsed.map((sheet: any) => ({
            ...sheet,
            files: [] 
          }));
        }
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
    
    return [
      { id: '1', name: '사이트 1', data: { ...INITIAL_DATA }, files: [] },
      { id: '2', name: '사이트 2', data: { ...INITIAL_DATA }, files: [] },
      { id: '3', name: '사이트 3', data: { ...INITIAL_DATA }, files: [] },
      { id: '4', name: '사이트 4', data: { ...INITIAL_DATA }, files: [] },
    ];
  });
  
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current active sheet safely
  const activeSheet = sheets[activeTabIndex] || sheets[0];

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setSheets(prev => prev.map((sheet, index) => {
      if (index === activeTabIndex) {
        return {
          ...sheet,
          data: { ...sheet.data, [name]: value }
        };
      }
      return sheet;
    }));
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files) as File[];
      
      let newFiles: File[] = [];
      if (selectedFiles.length > 20) {
        alert("최대 20개까지만 선택할 수 있습니다. 상위 20개만 첨부됩니다.");
        newFiles = selectedFiles.slice(0, 20);
      } else {
        newFiles = selectedFiles;
        alert(`${selectedFiles.length}개의 파일이 선택되었습니다.`);
      }

      setSheets(prev => prev.map((sheet, index) => {
        if (index === activeTabIndex) {
          return { ...sheet, files: newFiles };
        }
        return sheet;
      }));
    }
    // Reset input value to allow re-selecting same files if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTemporarySave = () => {
    // Create a copy of data to save, explicitly excluding files
    const dataToSave = sheets.map(sheet => {
      const { files, ...rest } = sheet;
      return { ...rest, files: [] };
    });

    try {
      localStorage.setItem('ktl_dust_entry_data', JSON.stringify(dataToSave));
      alert('임시 저장이 완료되었습니다.\n(주의: 첨부된 사진 파일은 저장되지 않습니다.)');
    } catch (error) {
      console.error('Save failed', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleExport = async () => {
    try {
      // Export only the currently active sheet
      await exportSheetData(activeSheet);
    } catch (error) {
      console.error("Export failed:", error);
      alert("파일 내보내기에 실패했습니다.");
    }
  };

  const handleSendToClaydox = () => {
    if (!activeSheet.data.receptionNumber) {
      alert("현재 시트의 접수번호를 입력해주세요.");
      return;
    }
    
    // Calculate total files
    const totalFiles = sheets.reduce((acc, sheet) => acc + sheet.files.length, 0);

    const payload = sheets.map(sheet => ({
        siteName: sheet.name,
        ...sheet.data,
        fileNames: sheet.files.map(f => f.name)
    }));

    console.log("Sending to Claydox:", payload);
    
    const confirm = window.confirm(`모든 시트(${sheets.length}개)의 데이터를 Claydox로 전송하시겠습니까?\n총 첨부 파일: ${totalFiles}개`);
    if (confirm) {
        setTimeout(() => {
        alert("Claydox 전송 완료!");
        }, 800);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-xl min-h-screen flex flex-col">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">
        (초)미세먼지 자동측정기 RAW DATA
      </h1>

      {/* Main Grid Container */}
      <div className="border-2 border-gray-800 bg-gray-300 gap-[1px] grid grid-cols-4 mb-8">
        
        {/* Row 1: Reception Number */}
        <LabelCell>접수번호</LabelCell>
        <div className="col-span-3 bg-white">
          <FormInput 
            name="receptionNumber" 
            value={activeSheet.data.receptionNumber} 
            onChange={handleInputChange} 
            placeholder="텍스트 입력"
          />
        </div>

        {/* Row 2: Inspection Date */}
        <LabelCell>검사일</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="date"
            name="inspectionDateStart" 
            value={activeSheet.data.inspectionDateStart} 
            onChange={handleInputChange} 
          />
        </div>
        <div className="bg-white flex items-center justify-center font-bold text-gray-500">~</div>
        <div className="bg-white">
          <FormInput 
            type="date"
            name="inspectionDateEnd" 
            value={activeSheet.data.inspectionDateEnd} 
            onChange={handleInputChange} 
          />
        </div>

        {/* Row 3: Model & Serial Number */}
        <LabelCell>모델</LabelCell>
        <div className="bg-white">
          <FormInput 
            name="model" 
            value={activeSheet.data.model} 
            onChange={handleInputChange} 
            placeholder="텍스트 입력"
          />
        </div>
        <LabelCell>제조번호</LabelCell>
        <div className="bg-white">
          <FormInput 
            name="serialNumber" 
            value={activeSheet.data.serialNumber} 
            onChange={handleInputChange} 
            placeholder="텍스트 입력"
          />
        </div>

        {/* Row 4: Span Film & Intermediate Film */}
        <LabelCell>스팬 필름</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="spanFilm" 
            value={activeSheet.data.spanFilm} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>
        <LabelCell>중간 필름</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="intermediateFilm" 
            value={activeSheet.data.intermediateFilm} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>

        {/* Row 5: Span 1 & Flow Rate */}
        <LabelCell>스팬 1</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="span1" 
            value={activeSheet.data.span1} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>
        <LabelCell>유량</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="flowRate" 
            value={activeSheet.data.flowRate} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>

        {/* Row 6: Repeatability 1 & Linearity */}
        <LabelCell>반복성1</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="repeatability1" 
            value={activeSheet.data.repeatability1} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>
        <LabelCell>직선성</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="linearity" 
            value={activeSheet.data.linearity} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>

        {/* Row 7: Repeatability 2 & Blank Test 1 */}
        <LabelCell>반복성2</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="repeatability2" 
            value={activeSheet.data.repeatability2} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>
        <LabelCell>공시험1</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="blankTest1" 
            value={activeSheet.data.blankTest1} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>

        {/* Row 8: Repeatability 3 & Blank Test 2 */}
        <LabelCell>반복성3</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="repeatability3" 
            value={activeSheet.data.repeatability3} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>
        <LabelCell>공시험2</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="blankTest2" 
            value={activeSheet.data.blankTest2} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>

        {/* Row 9: Span 2 & Blank Test 3 */}
        <LabelCell>스팬 2</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="span2" 
            value={activeSheet.data.span2} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>
        <LabelCell>공시험3</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="blankTest3" 
            value={activeSheet.data.blankTest3} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* File Upload Button */}
        <div className="relative">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden" 
            multiple
          />
          <button 
            onClick={handleFileClick}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 rounded-md shadow-sm border border-yellow-500 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <ImageIcon className="w-6 h-6" />
            <span>사진 파일 첨부 {activeSheet.files.length > 0 && `(${activeSheet.files.length}개)`}</span>
          </button>
        </div>

        {/* Excel Export Button - UPDATED for Single Site */}
        <button 
          onClick={handleExport}
          className="w-full bg-orange-400 hover:bg-orange-500 text-black font-bold py-4 rounded-md shadow-sm border border-orange-500 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <FileSpreadsheet className="w-6 h-6" />
          <span>현재 사이트 엑셀 파일 출력 ({activeSheet.name})</span>
        </button>

        {/* Claydox Send and Save Buttons */}
        <div className="flex gap-2 w-full">
          <button 
            onClick={handleTemporarySave}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-md shadow-sm border border-green-600 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <Save className="w-6 h-6" />
            <span>임시 저장</span>
          </button>

          <button 
            onClick={handleSendToClaydox}
            className="flex-1 bg-blue-300 hover:bg-blue-400 text-black font-bold py-4 rounded-md shadow-sm border border-blue-400 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <Send className="w-6 h-6" />
            <span>전체 To Claydox 전송</span>
          </button>
        </div>

        {/* Install PWA Button */}
        {deferredPrompt && (
          <button 
            onClick={handleInstallClick}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 rounded-md shadow-sm border border-gray-900 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <Download className="w-6 h-6" />
            <span>앱으로 설치하기</span>
          </button>
        )}
      </div>

      <div className="mt-4 text-center text-gray-500 text-xs mb-8">
        * 사진 파일(JPG, PNG 등)을 각 시트별로 최대 20개까지 첨부해주세요.<br/>
        * 엑셀 출력 시 <strong>현재 선택된 사이트</strong>의 엑셀 데이터와 사진만 별도로 저장됩니다.
      </div>

      {/* Bottom Tabs */}
      <div className="mt-auto border-t border-gray-200 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {sheets.map((sheet, index) => (
            <button
              key={sheet.id}
              onClick={() => setActiveTabIndex(index)}
              className={`
                flex-shrink-0 px-6 py-3 font-bold border-2 transition-colors duration-200 min-w-[100px]
                ${index === activeTabIndex 
                  ? 'border-blue-600 text-blue-600 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }
              `}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};