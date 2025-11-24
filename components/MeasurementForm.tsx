import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileSpreadsheet, Send, Image as ImageIcon, Download } from 'lucide-react';
import { MeasurementData } from '../types';
import { exportData } from '../utils/exportUtils';
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
  const [formData, setFormData] = useState<MeasurementData>(INITIAL_DATA);
  const [file, setFile] = useState<File | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      alert(`파일이 선택되었습니다: ${e.target.files[0].name}`);
    }
  };

  const handleExport = async () => {
    try {
      await exportData(formData, file);
    } catch (error) {
      console.error("Export failed:", error);
      alert("파일 내보내기에 실패했습니다.");
    }
  };

  const handleSendToClaydox = () => {
    // Mock API call
    if (!formData.receptionNumber) {
      alert("접수번호를 입력해주세요.");
      return;
    }
    
    const payload = {
        ...formData,
        fileName: file ? file.name : null
    }

    console.log("Sending to Claydox:", payload);
    
    // Simulate loading
    const confirm = window.confirm("Claydox로 데이터를 전송하시겠습니까?");
    if (confirm) {
        setTimeout(() => {
        alert("Claydox 전송 완료!");
        }, 800);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // We've used the prompt, and can't use it again, throw it away
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-xl min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">
        (초)미세먼지 자동측정기 RAW DATA
      </h1>

      {/* Main Grid Container - Border Logic: Grid Gap serves as borders */}
      <div className="border-2 border-gray-800 bg-gray-300 gap-[1px] grid grid-cols-4 mb-8">
        
        {/* Row 1: Reception Number */}
        <LabelCell>접수번호</LabelCell>
        <div className="col-span-3 bg-white">
          <FormInput 
            name="receptionNumber" 
            value={formData.receptionNumber} 
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
            value={formData.inspectionDateStart} 
            onChange={handleInputChange} 
          />
        </div>
        <div className="bg-white flex items-center justify-center font-bold text-gray-500">~</div>
        <div className="bg-white">
          <FormInput 
            type="date"
            name="inspectionDateEnd" 
            value={formData.inspectionDateEnd} 
            onChange={handleInputChange} 
          />
        </div>

        {/* Row 3: Model & Serial Number */}
        <LabelCell>모델</LabelCell>
        <div className="bg-white">
          <FormInput 
            name="model" 
            value={formData.model} 
            onChange={handleInputChange} 
            placeholder="텍스트 입력"
          />
        </div>
        <LabelCell>제조번호</LabelCell>
        <div className="bg-white">
          <FormInput 
            name="serialNumber" 
            value={formData.serialNumber} 
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
            value={formData.spanFilm} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>
        <LabelCell>중간 필름</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="intermediateFilm" 
            value={formData.intermediateFilm} 
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
            value={formData.span1} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>
        <LabelCell>유량</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="flowRate" 
            value={formData.flowRate} 
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
            value={formData.repeatability1} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>
        <LabelCell>직선성</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="linearity" 
            value={formData.linearity} 
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
            value={formData.repeatability2} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>
        <LabelCell>공시험1</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="blankTest1" 
            value={formData.blankTest1} 
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
            value={formData.repeatability3} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>
        <LabelCell>공시험2</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="blankTest2" 
            value={formData.blankTest2} 
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
            value={formData.span2} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>
        <LabelCell>공시험3</LabelCell>
        <div className="bg-white">
          <FormInput 
            type="number"
            name="blankTest3" 
            value={formData.blankTest3} 
            onChange={handleInputChange} 
            placeholder="숫자 입력"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* File Upload Button - Yellow */}
        <div className="relative">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden" 
          />
          <button 
            onClick={handleFileClick}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 rounded-md shadow-sm border border-yellow-500 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <ImageIcon className="w-6 h-6" />
            <span>사진 파일 첨부 {file && `(${file.name})`}</span>
          </button>
        </div>

        {/* Excel Export Button - Orange */}
        <button 
          onClick={handleExport}
          className="w-full bg-orange-400 hover:bg-orange-500 text-black font-bold py-4 rounded-md shadow-sm border border-orange-500 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <FileSpreadsheet className="w-6 h-6" />
          <span>엑셀 파일 출력</span>
        </button>

        {/* Claydox Send Button - Blue */}
        <button 
          onClick={handleSendToClaydox}
          className="w-full bg-blue-300 hover:bg-blue-400 text-black font-bold py-4 rounded-md shadow-sm border border-blue-400 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <Send className="w-6 h-6" />
          <span>To Claydox 전송</span>
        </button>

        {/* Install PWA Button - Only visible when installable */}
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

      <div className="mt-8 text-center text-gray-500 text-xs">
        * 사진 파일(JPG, PNG 등)을 첨부해주세요.<br/>
        * 엑셀 출력 시 사진 파일이 첨부되어 있으면 CSV 데이터와 함께 압축(ZIP)하여 저장됩니다.
      </div>
    </div>
  );
};