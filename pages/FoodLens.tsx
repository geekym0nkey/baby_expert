
import React, { useState, useRef } from 'react';
import { Camera, AlertCircle, CheckCircle, HelpCircle, Loader2, X } from 'lucide-react';
import { analyzeFoodImage, safeParseJson } from '../services/geminiService';

export const FoodLens: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [babyAge, setBabyAge] = useState(6);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Analyze
    setIsAnalyzing(true);
    setResult(null);
    try {
      const jsonStr = await analyzeFoodImage(file, babyAge);
      const parsedResult = safeParseJson(jsonStr);
      setResult(parsedResult);
    } catch (error) {
      console.error(error);
      alert("辨識失敗，請確認 API 金鑰是否有效，或嘗試換一張更清晰的照片。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (level: string) => {
     switch (level?.toLowerCase()) {
      case 'low': return <CheckCircle size={20} />;
      case 'medium': return <HelpCircle size={20} />;
      case 'high': return <AlertCircle size={20} />;
      default: return <HelpCircle size={20} />;
    }
  };

  return (
    <div className="px-6 py-8 pb-24 max-w-md mx-auto min-h-screen">
      <header className="mb-6 flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">副食品鏡頭</h1>
            <p className="text-gray-500 text-sm">拍下食物，確認能不能吃</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
            <span className="text-xs text-gray-500">寶寶月齡:</span>
            <select 
                value={babyAge} 
                onChange={(e) => setBabyAge(Number(e.target.value))}
                className="text-sm font-bold text-orange-500 bg-transparent outline-none"
            >
                {[4,5,6,7,8,9,10,11,12,18,24].map(m => (
                    <option key={m} value={m}>{m} 個月</option>
                ))}
            </select>
        </div>
      </header>

      {!imagePreview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-3xl h-80 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Camera className="text-orange-400" size={32} />
          </div>
          <p className="text-gray-500 font-medium">點擊拍攝或上傳照片</p>
          <p className="text-xs text-gray-400 mt-2">支援食物原型、成分標籤</p>
        </div>
      ) : (
        <div className="relative rounded-3xl overflow-hidden shadow-lg h-64 mb-6">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button 
                onClick={clearImage}
                className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
            >
                <X size={16} />
            </button>
            {isAnalyzing && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-sm">
                    <Loader2 className="text-white animate-spin mb-2" size={32} />
                    <p className="text-white font-medium">AI 辨識中...</p>
                </div>
            )}
        </div>
      )}

      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden" 
      />

      {result && (
        <div className="animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className={`p-4 flex items-center justify-between ${getRiskColor(result.riskLevel)} bg-opacity-20`}>
                    <div className="flex items-center gap-2 font-bold">
                        {getRiskIcon(result.riskLevel)}
                        <span>{result.isSafe ? '可以嘗試' : '建議避免'}</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">{result.riskLevel} Risk</span>
                </div>
                
                <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{result.itemName}</h3>
                    <p className="text-gray-600 mb-4">{result.summary}</p>
                    
                    <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-xs text-gray-400 font-bold block mb-1">詳細分析</span>
                            <p className="text-sm text-gray-700">{result.details}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <p className="text-xs text-center text-gray-400 mt-4">
                * AI 建議僅供參考，請隨時觀察寶寶實際過敏反應。
            </p>
        </div>
      )}
    </div>
  );
};
