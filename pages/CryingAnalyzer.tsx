
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, RotateCcw, CheckCircle } from 'lucide-react';
import { analyzeCryingAudio, safeParseJson } from '../services/geminiService';

export const CryingAnalyzer: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        await handleAnalysis(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setResult(null);
    } catch (err) {
      console.error("無法存取麥克風:", err);
      alert("無法存取麥克風，請確認權限設定。");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleAnalysis = async (blob: Blob) => {
    setIsAnalyzing(true);
    try {
      const jsonStr = await analyzeCryingAudio(blob);
      const parsedResult = safeParseJson(jsonStr);
      setResult(parsedResult);
    } catch (error) {
      console.error(error);
      alert("分析失敗。請確認 API 金鑰正確，並嘗試更長的錄音。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="px-6 py-8 pb-24 max-w-md mx-auto min-h-screen flex flex-col">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">哭聲翻譯機</h1>
        <p className="text-gray-500 text-sm">錄下寶寶的聲音，讓 AI 幫你聽懂</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={`relative w-48 h-48 rounded-full flex items-center justify-center mb-8 transition-all duration-500 ${isRecording ? 'bg-red-50 scale-110' : 'bg-gray-50'}`}>
          {isRecording && (
             <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-ping opacity-20"></div>
          )}
          
          {isAnalyzing ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-orange-400 animate-spin mb-2" />
              <span className="text-sm text-gray-500 font-medium">AI 翻譯中...</span>
            </div>
          ) : result ? (
             <CheckCircle className="w-20 h-20 text-green-500" />
          ) : (
            <div className="text-center">
                {isRecording ? (
                    <span className="text-3xl font-mono text-red-500 font-bold">{formatTime(timer)}</span>
                ) : (
                    <Mic className="w-16 h-16 text-gray-300" />
                )}
            </div>
          )}
        </div>

        {result && (
          <div className="w-full bg-white rounded-2xl p-6 shadow-lg border border-orange-100 mb-8 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-bold">
                可能原因: {result.reason}
              </span>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              {result.explanation}
            </p>
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-bold text-gray-800 mb-2 text-sm">安撫建議：</h4>
              <ul className="space-y-2">
                {result.advice?.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold border border-gray-200 text-gray-400">{idx + 1}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="w-full">
          {!result && !isAnalyzing && (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isRecording 
                  ? 'bg-red-500 text-white shadow-red-200' 
                  : 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-orange-200'
              }`}
            >
              {isRecording ? <><Square fill="currentColor" size={20} /> 停止錄製</> : <><Mic size={24} /> 開始翻譯哭聲</>}
            </button>
          )}

          {result && (
            <button
              onClick={reset}
              className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <RotateCcw size={20} /> 再次錄音
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
