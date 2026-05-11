/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './components/Logo';
import { 
  BookOpen, 
  ChevronRight, 
  CheckCircle2, 
  PenTool, 
  Layout, 
  Search, 
  Target, 
  ArrowRight,
  Loader2,
  RefreshCcw,
  GraduationCap,
  MessageSquare,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Lightbulb,
  FileText,
  ClipboardCheck,
  Award,
  BookMarked,
  Info,
  XCircle,
  CheckCircle,
  Plus,
  Trash2,
  HelpCircle,
  Download,
  Maximize2,
  XSquare,
  Sparkles
} from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { cn } from './lib/utils';
import { ieltsTutorService } from './services/geminiService';
import { 
  Stage, 
  StepSelections, 
  AnalysisMCQ, 
  Feedback, 
  MCQOption, 
  GuidedMaterial, 
  Correction,
  EssayType,
  BodyStepData,
  IdeaSelection
} from './types';
import Markdown from 'react-markdown';

const SAMPLE_PROMPTS = [
  "Some people think that it is best to work in the same organization for one's whole life. Others think that it is better to change jobs frequently. Discuss both views and give your opinion.",
  "In many countries, secondary schools aim to provide a general education across a range of subjects. Others believe focusing on a narrow range of subjects is better. Discuss both views.",
  "Plastic pollution is a growing problem globally. What are the causes of this issue and what solutions can be implemented to address it?"
];

export default function App() {
  const [stage, setStage] = useState<Stage>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [leftWidth, setLeftWidth] = useState(500);
  const [isDragging, setIsDragging] = useState(false);
  
  const [selections, setSelections] = useState<StepSelections>({
    prompt: "",
    essayType: null,
    taskAnalysis: { typeId: null, requirementsId: null },
    approach: null,
    paragraphs: { intro: "", body1: "", body2: "", conclusion: "" },
    body1Data: { selectedIdeaIds: [], developments: {} },
    body2Data: { selectedIdeaIds: [], developments: {} }
  });

  const [promptData, setPromptData] = useState<AnalysisMCQ | null>(null);
  const [approachOptions, setApproachOptions] = useState<MCQOption[]>([]);
  const [body1Data, setBody1Data] = useState<BodyStepData | null>(null);
  const [body2Data, setBody2Data] = useState<BodyStepData | null>(null);
  const [guidedMaterials, setGuidedMaterials] = useState<Record<string, GuidedMaterial>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const resetApp = () => {
    setStage(1);
    setLoading(false);
    setError(null);
    setShowIntro(true);
    setSelections({
      prompt: "",
      essayType: null,
      taskAnalysis: { typeId: null, requirementsId: null },
      approach: null,
      paragraphs: { intro: "", body1: "", body2: "", conclusion: "" },
      body1Data: { selectedIdeaIds: [], developments: {} },
      body2Data: { selectedIdeaIds: [], developments: {} }
    });
    setPromptData(null);
    setApproachOptions([]);
    setBody1Data(null);
    setBody2Data(null);
    setGuidedMaterials({});
    setFeedback(null);
  };

  const startTutor = async (p: string) => {
    if (!p || p.trim().length === 0) {
      setError("Vui lòng nhập đề bài trước khi phân tích.");
      return;
    }
    if (p.trim().length < 20) {
      setError("Đề bài chưa rõ ràng. Vui lòng nhập đầy đủ đề IELTS Writing Task 2.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await ieltsTutorService.getTaskAnalysis(p);
      if (!data || !data.essayType || data.essayType.length === 0) {
        throw new Error("Không nhận diện được dạng bài. Vui lòng kiểm tra lại đề.");
      }
      setPromptData(data);
      setSelections(prev => ({ ...prev, prompt: p }));
      setShowIntro(false);
      setStage(1);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Hệ thống đang gặp lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const nextStage = () => setStage(prev => (prev + 1) as Stage);
  const prevStage = () => setStage(prev => (prev > 1 ? prev - 1 : 1) as Stage);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newWidth = e.clientX;
      if (newWidth > 350 && newWidth < Math.min(window.innerWidth - 400, 900)) {
        setLeftWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      {showIntro ? (
        <LandingPage onSelect={startTutor} loading={loading} />
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Navigation Top Bar */}
          <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-6 lg:px-10 shrink-0 z-20 shadow-sm">
            <div className="flex items-center gap-10">
              <Logo />
              
              <div className="hidden xl:block h-8 w-px bg-slate-200" />
              
              <div className="flex items-center gap-4">
                {stage > 1 && (
                  <button 
                    onClick={prevStage}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-slate-100 hover:border-brand-blue hover:text-brand-blue transition-all font-black text-[11px] uppercase tracking-widest text-slate-400 shadow-sm"
                  >
                    <RefreshCcw className="w-4 h-4 rotate-180" /> Quay Lại
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage {stage}/10</span>
                  <div className="h-2 w-48 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div 
                      className="h-full bg-linear-to-r from-brand-navy to-brand-blue transition-all duration-700 ease-out" 
                      style={{ width: `${(stage / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em]">
                 {[
                   { s: 3, l: "Introduction" },
                   { s: 4, l: "Body 1" },
                   { s: 5, l: "Body 2" },
                   { s: 6, l: "Conclusion" },
                   { s: 7, l: "Preview Final Essay" }
                 ].map((item) => (
                   <button 
                    key={item.s}
                    onClick={() => setStage(item.s as Stage)}
                    className={cn(
                      "flex flex-col items-center gap-1 group transition-all",
                      stage === item.s ? "text-brand-blue" : "text-slate-400 hover:text-slate-600"
                    )}
                   >
                     <span>{item.l}</span>
                     <div className={cn(
                       "w-1 h-1 rounded-full transition-all",
                       stage === item.s ? "bg-brand-blue scale-150" : "bg-slate-200 group-hover:bg-slate-300"
                     )} />
                   </button>
                 ))}
               </div>
              <button 
                onClick={resetApp}
                className="flex items-center gap-2 px-4 py-2 hover:bg-brand-orange/10 rounded-xl text-slate-400 hover:text-brand-orange transition-all border-2 border-transparent hover:border-brand-orange/20 font-black text-[10px] uppercase tracking-widest"
                title="Create New Task"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Create New Task</span>
              </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {stage <= 2 ? (
              <div className="flex-1 bg-white flex flex-col items-center overflow-y-auto brand-pattern relative scroll-smooth">
                <div className="max-w-4xl w-full py-12 px-8 relative z-10">
                  <StageContentLeft 
                    stage={stage} 
                    selections={selections} 
                    setSelections={setSelections}
                    promptData={promptData}
                    approachOptions={approachOptions}
                    setApproachOptions={setApproachOptions}
                    body1Data={body1Data}
                    setBody1Data={setBody1Data}
                    body2Data={body2Data}
                    setBody2Data={setBody2Data}
                    guidedMaterials={guidedMaterials}
                    setGuidedMaterials={setGuidedMaterials}
                    feedback={feedback}
                    setStage={setStage}
                    setFeedback={setFeedback}
                    setLoading={setLoading}
                    isFullWidth={true}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Left Column: LEARN / SELECT / UNDERSTAND */}
                <div 
                  className="border-r border-slate-200 bg-white flex flex-col h-full overflow-y-auto relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
                  style={{ width: `${leftWidth}px` }}
                >
                  <StageContentLeft 
                    stage={stage} 
                    selections={selections} 
                    setSelections={setSelections}
                    promptData={promptData}
                    approachOptions={approachOptions}
                    setApproachOptions={setApproachOptions}
                    body1Data={body1Data}
                    setBody1Data={setBody1Data}
                    body2Data={body2Data}
                    setBody2Data={setBody2Data}
                    guidedMaterials={guidedMaterials}
                    setGuidedMaterials={setGuidedMaterials}
                    feedback={feedback}
                    setStage={setStage}
                    setFeedback={setFeedback}
                    setLoading={setLoading}
                    isFullWidth={false}
                  />
                </div>

                {/* Draggable Divider */}
                <div 
                  className={cn(
                    "w-1.5 h-full bg-slate-100 hover:bg-brand-blue cursor-col-resize transition-colors flex items-center justify-center z-20 group relative",
                    isDragging && "bg-brand-blue"
                  )}
                  onMouseDown={() => setIsDragging(true)}
                >
                  <div className="w-1 h-8 bg-slate-300 rounded-full group-hover:bg-white/50 transition-colors" />
                  <div className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize" />
                </div>

                {/* Right Column: WRITE / PRACTICE / ASSESS */}
                <div className="flex-1 bg-[#F8FAFC] flex flex-col overflow-y-auto">
                  <StageContentRight 
                    stage={stage}
                    selections={selections}
                    setSelections={setSelections}
                    guidedMaterials={guidedMaterials}
                    feedback={feedback}
                    setFeedback={setFeedback}
                    setStage={setStage}
                    setLoading={setLoading}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-brand-navy/20 backdrop-blur-md flex items-center justify-center z-[100]">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-4 h-4 bg-brand-orange rounded-full animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="font-black text-brand-navy text-sm uppercase tracking-[0.2em] animate-pulse">Đang phân tích...</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white border-2 border-rose-500 text-rose-600 px-8 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4 z-[100] animate-in slide-in-from-bottom-6 min-w-[400px]">
          <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg">
            <XCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Lỗi hệ thống</p>
            <p className="font-bold text-[15px]">{error}</p>
          </div>
          <button 
            onClick={() => {
               setError(null);
               if (showIntro) {
                 // stay on intro
               } else {
                 // maybe retry trigger?
               }
            }} 
            className="p-3 hover:bg-rose-50 rounded-2xl transition-colors text-rose-400"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function LandingPage({ onSelect, loading }: { onSelect: (p: string) => void; loading: boolean }) {
  const [custom, setCustom] = useState("");
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-start xl:justify-center p-6 md:p-12 lg:p-16 brand-pattern overflow-y-auto">
      <div className="max-w-[1700px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start lg:items-center relative z-10 py-8 lg:py-16">
        <div className="space-y-8 lg:space-y-12">
          <Logo className="scale-110 md:scale-125 lg:scale-140 origin-left mb-6" />
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-brand-navy rounded-xl border border-brand-orange/30 shadow-xl">
              <span className="text-[12px] font-black text-white uppercase tracking-[0.4em]">Viet Nam Edition</span>
            </div>
            <h1 className="text-[2.2rem] leading-[1.05] sm:text-4xl md:text-5xl lg:text-6xl xl:text-[5.5rem] 2xl:text-[6.5rem] font-black text-brand-navy tracking-tighter drop-shadow-sm">
              BREAK THE<br />
              <span className="text-brand-orange inline-block my-1 px-1">IELTS BARRIER</span><br />
              LOGICALLY.
            </h1>
          </div>
          
          <p className="text-lg md:text-xl xl:text-2xl text-slate-500 font-medium leading-relaxed max-w-xl">
            Hệ sinh thái học viết IELTS thông minh. Kết hợp tư duy Linear Thinking và công nghệ AI để đạt Band 7.0+ nhanh chóng.
          </p>
          
          <div className="space-y-6 pt-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Đề xuất chủ đề HOT</p>
            <div className="flex flex-wrap gap-3 md:gap-4">
              {SAMPLE_PROMPTS.map((p, i) => (
                <button 
                  key={i} 
                  onClick={() => onSelect(p)}
                  className="px-4 py-3 md:px-6 md:py-4 bg-white border-2 border-slate-100 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black text-slate-600 hover:border-brand-blue hover:text-brand-blue hover:shadow-lg transition-all"
                >
                  TOPIC #{i+1}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="w-full flex justify-center lg:justify-end lg:h-full lg:min-h-[700px]">
          <div className="w-full max-w-3xl bg-white p-8 md:p-12 lg:p-14 rounded-[3rem] md:rounded-[4rem] shadow-[0_40px_100px_rgba(19,74,133,0.12)] border-2 border-slate-100 flex flex-col gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-orange/5 rounded-full -mr-40 -mt-40 blur-3xl" />
            <div className="space-y-4 relative z-10">
              <h3 className="font-black text-brand-navy text-3xl md:text-4xl lg:text-5xl italic uppercase tracking-tighter">Bắt đầu hành trình</h3>
              <p className="text-sm md:text-base text-slate-400 font-bold">Dán đề bài IELTS Writing Task 2 của bạn vào khung bên dưới.</p>
            </div>
            
            <div className="flex-1 min-h-[300px] lg:min-h-[400px] relative z-10">
              <textarea 
                value={custom}
                onChange={e => setCustom(e.target.value)}
                className="w-full h-full p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 focus:border-brand-blue focus:ring-8 focus:ring-brand-blue/5 outline-none transition-all font-mono text-base md:text-lg leading-relaxed text-brand-navy shadow-inner resize-none"
                placeholder="Ví dụ: Some people think that it is best to work in the same organization for one's whole life..."
              />
            </div>

            <div className="relative z-10 mt-auto">
              <button 
                disabled={!custom.trim() || loading}
                onClick={() => onSelect(custom)}
                className="w-full bg-brand-navy text-white py-6 md:py-8 rounded-2xl md:rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] shadow-xl shadow-brand-navy/20 hover:bg-black hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Đang phân tích..." : "Phân tích Logic ngay"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OriginalPromptDisplay({ prompt, isFullWidth }: { prompt: string, isFullWidth?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "px-6 py-4 border-b border-slate-200 bg-white/95 sticky top-0 z-50 backdrop-blur-md shadow-sm",
        isFullWidth ? "max-w-4xl mx-auto w-[calc(100%-3rem)] border-2 border-brand-navy/10 rounded-2xl mt-6 mb-8" : ""
      )}
    >
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-brand-navy rounded-xl shadow-lg border border-brand-orange/20">
          <FileText className="w-4 h-4 text-brand-orange" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-black text-brand-blue uppercase tracking-[0.2em] block mb-0.5 opacity-80">Original Prompt</span>
          <p className="text-[13px] font-bold text-brand-navy leading-relaxed italic line-clamp-2 hover:line-clamp-none transition-all cursor-help">
            "{prompt}"
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// --- STAGE CONTENT COMPONENTS ---

function StageContentLeft({ 
  stage, 
  selections, 
  setSelections, 
  promptData,
  approachOptions,
  setApproachOptions,
  body1Data,
  setBody1Data,
  body2Data,
  setBody2Data,
  guidedMaterials,
  setGuidedMaterials,
  feedback,
  setStage,
  setFeedback,
  setLoading,
  isFullWidth
}: any) {
  // Common instructions state
  const [expanded, setExpanded] = useState(true);

  const renderTitle = (title: string, step: string) => (
    <div className={cn("p-8 border-b border-slate-100 space-y-4", isFullWidth ? "text-center" : "")}>
      <div className={cn("flex items-center gap-5", isFullWidth ? "justify-center" : "")}>
        <div className="w-12 h-12 rounded-2xl bg-brand-navy flex items-center justify-center text-white shadow-xl shadow-brand-navy/20 border border-brand-orange/30">
          <BrainCircuit className="w-6 h-6 text-brand-orange" />
        </div>
        <div>
          <h2 className="font-black text-brand-navy text-xl uppercase tracking-tighter">{title}</h2>
          <p className="text-[10px] font-black text-brand-blue uppercase tracking-[0.3em]">{step}</p>
        </div>
      </div>
    </div>
  );

  const InstructionBox = ({ title, content }: { title: string, content: string }) => (
    <div className={cn("mx-6 my-8 bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm", isFullWidth ? "max-w-2xl mx-auto" : "")}>
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-orange/10 rounded-lg">
            <Lightbulb className="w-4 h-4 text-brand-orange" />
          </div>
          <span className="text-[11px] font-black text-brand-navy uppercase tracking-widest">{title}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden bg-slate-50/30 border-t border-slate-100"
          >
            <div className="p-6 text-sm text-slate-600 leading-relaxed font-semibold">
              <Markdown>{content}</Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const MCQGroup = ({ label, options, selectedId, onSelect }: { label: string, options: MCQOption[], selectedId: string | null, onSelect: (opt: MCQOption) => void }) => (
    <div className={cn("p-8 space-y-8", isFullWidth ? "max-w-2xl mx-auto" : "")}>
      <p className="text-base font-black text-brand-navy tracking-tight leading-tight uppercase border-l-4 border-brand-orange pl-4">{label}</p>
      <div className="space-y-4">
        {options.map((opt, i) => {
          const isSelected = selectedId === opt.text;
          return (
            <div key={i} className="space-y-3">
              <button
                onClick={() => onSelect(opt)}
                disabled={selectedId !== null && isSelected}
                className={cn(
                  "w-full text-left p-6 rounded-[1.5rem] border-2 transition-all group flex items-start gap-5",
                  isSelected 
                    ? opt.isCorrect ? "bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-500/10" : "bg-rose-50 border-rose-500 shadow-xl shadow-rose-500/10"
                    : "bg-white border-slate-100 hover:border-brand-blue/30 hover:bg-brand-blue/5"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-xl shrink-0 mt-0.5 flex items-center justify-center transition-all",
                  isSelected 
                    ? opt.isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                    : "bg-slate-100 group-hover:bg-brand-blue group-hover:text-white"
                )}>
                  {isSelected ? Math.random() > 0 ? (opt.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />) : null : <span className="text-[10px] font-black">{i + 1}</span>}
                </div>
                <span className={cn(
                  "text-[15px] font-bold leading-snug",
                  isSelected 
                    ? opt.isCorrect ? "text-emerald-900" : "text-rose-900"
                    : "text-slate-700"
                )}>{opt.text}</span>
              </button>
              {isSelected && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-6 rounded-2xl text-sm font-semibold leading-relaxed border-2",
                    opt.isCorrect ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-800" : "bg-rose-500/5 border-rose-500/10 text-rose-800"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-2 h-2 rounded-full", opt.isCorrect ? "bg-emerald-500" : "bg-rose-500")} />
                    <span className="font-black uppercase tracking-[0.2em] text-[10px]">{opt.isCorrect ? "PHÂN TÍCH CHÍNH XÁC" : "LƯU Ý QUAN TRỌNG"}</span>
                  </div>
                  {opt.explanation}
                  {opt.isCorrect && opt.extension && (
                     <div className="mt-4 pt-4 border-t border-emerald-500/10 text-emerald-900 font-bold bg-white/50 p-4 rounded-xl">
                       <span className="text-brand-blue mr-2">🚀 MỞ RỘNG:</span> {opt.extension}
                     </div>
                  )}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const nextStage = () => setStage((prev: number) => (prev + 1) as Stage);

  // STAGE BY STAGE LEFT CONTENT
  switch (stage) {
    case 1:
      const correctType = promptData?.essayType.find((o: any) => o.isCorrect)?.text || "";
      const correctReqs = promptData?.requirements.filter((o: any) => o.isCorrect).map((o: any) => o.text) || [];

      return (
        <div className="space-y-12 pb-20">
          <OriginalPromptDisplay prompt={selections.prompt} isFullWidth={isFullWidth} />
          
          {renderTitle("Phân tích đề bài", "Step 01")}
          
          <div className={cn("grid gap-6 mx-8", isFullWidth ? "max-w-4xl mx-auto" : "")}>
             {/* Analysis Summary Card */}
             <div className="p-10 bg-brand-navy rounded-[3.5rem] text-white shadow-2xl shadow-brand-navy/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative z-10 space-y-8">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                         <Search className="w-6 h-6 text-brand-orange" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">Kết quả phân tích</p>
                         <h3 className="text-2xl font-black tracking-tight">CẤU TRÚC ĐỀ BÀI</h3>
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                         <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                           <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Dạng bài (Essay Type)</span>
                         </div>
                         <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                           <p className="text-xl font-bold italic text-brand-orange">"{correctType}"</p>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                           <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Yêu cầu (Core Tasks)</span>
                         </div>
                         <ul className="space-y-3">
                            {correctReqs.map((req, i) => (
                               <li key={i} className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                  <span className="text-sm font-semibold">{req}</span>
                               </li>
                            ))}
                         </ul>
                      </div>
                   </div>
                </div>
             </div>

             <InstructionBox 
                title="Lưu ý quan trọng"
                content="Hệ thống đã tự động nhận diện dạng bài dựa trên các từ khóa (keywords) và mệnh lệnh (instructions). Hãy chắc chắn bạn đồng ý với hướng phân tích này trước khi tiếp tục."
             />

             {/* Validation MCQs (Optional check but good for pedagogy) */}
             <div className="space-y-12">
                <MCQGroup 
                  label="Xác nhận lại dạng bài của bạn:"
                  options={promptData.essayType}
                  selectedId={selections.taskAnalysis.typeId}
                  onSelect={(opt: MCQOption) => {
                    setSelections((p: any) => ({ ...p, taskAnalysis: { ...p.taskAnalysis, typeId: opt.text }, essayType: opt.isCorrect ? opt.text.toLowerCase().split(' ')[0] : null }));
                  }}
                />
                
                {selections.taskAnalysis.typeId && (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8">
                     <button 
                      onClick={async () => {
                         if (selections.essayType) {
                           setLoading(true);
                           try {
                             const options = await ieltsTutorService.getApproachOptions(selections.prompt, selections.essayType);
                             setApproachOptions(options);
                             setStage(2);
                             window.scrollTo({ top: 0, behavior: 'smooth' });
                           } finally { setLoading(false); }
                         }
                      }}
                      className="w-full py-6 bg-brand-navy text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-brand-navy/30 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-4"
                     >
                       Tiếp tục sang Bước 2 <ArrowRight className="w-5 h-5" />
                     </button>
                   </motion.div>
                )}
             </div>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="space-y-12 pb-20">
          <OriginalPromptDisplay prompt={selections.prompt} isFullWidth={isFullWidth} />
          {renderTitle("Writing Approach", "Step 02")}
          <InstructionBox 
            title="Choosing a strategy"
            content={`Dựa trên dạng bài **${selections.essayType?.toUpperCase()}**, mỗi lựa chọn sẽ dẫn đến một chuỗi lập luận khác nhau. Hãy cân nhắc hướng đi mà bạn cảm thấy dễ lập luận nhất.`}
          />
          <MCQGroup 
            label="Select your stance/approach:"
            options={approachOptions}
            selectedId={selections.approach}
            onSelect={(opt) => setSelections((p: any) => ({ ...p, approach: opt.text }))}
          />
          {selections.approach && (
            <div className="p-8 pb-4">
               <button 
                onClick={async () => {
                   setLoading(true);
                   try {
                     const material = await ieltsTutorService.getGuidedMaterial(selections.prompt, selections, "Introduction");
                     setGuidedMaterials((p: any) => ({ ...p, intro: material }));
                     nextStage();
                   } finally { setLoading(false); }
                }}
                className="w-full py-6 bg-brand-navy text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-brand-navy/20 active:scale-[0.98]"
               >
                 Tiếp tục: Viết Introduction
               </button>
            </div>
          )}
        </div>
      );
    case 3:
      return (
        <div className="space-y-8 pb-20">
          <OriginalPromptDisplay prompt={selections.prompt} isFullWidth={isFullWidth} />
          {renderTitle("Introduction", "Step 03")}
          <InstructionBox 
            title="Intro structure"
            content="Mở bài tiêu chuẩn gồm 2 câu: **Paraphrase** đề bài và **Thesis Statement** (trả lời trực tiếp yêu cầu đề). Tránh viết quá dài kéo theo lỗi sai không đáng có."
          />
          <div className="p-8 space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Support Tools</h4>
            {guidedMaterials.intro && (
               <div className="space-y-4">
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                     <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Vietnamese Guide</span>
                     <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                        {renderHighlighted(guidedMaterials.intro.vietnamese)}
                     </p>
                  </div>
               </div>
            )}
          </div>
          <div className="p-8 pb-12">
             <button 
              onClick={async () => {
                 setLoading(true);
                 try {
                   const data = await ieltsTutorService.getBodyStepData(selections.prompt, selections.essayType as EssayType, 4, selections);
                   setBody1Data(data);
                   nextStage();
                 } finally { setLoading(false); }
              }}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
             >
               Next: Body Paragraph 1
             </button>
          </div>
        </div>
      );
    case 4:
    case 5:
      const data = stage === 4 ? body1Data : body2Data;
      const bData = stage === 4 ? selections.body1Data : selections.body2Data;
      const setBData = (newData: any) => setSelections((p: any) => ({ ...p, [stage === 4 ? 'body1Data' : 'body2Data']: newData }));
      
      const isCompleteDevelopment = bData.selectedIdeaIds.length > 0 && bData.selectedIdeaIds.every((id: string) => (bData.developments[id] || []).length === 3);

      return (
        <div className="space-y-8 pb-20">
          <OriginalPromptDisplay prompt={selections.prompt} isFullWidth={isFullWidth} />
          {renderTitle(`Body Paragraph ${stage - 3}`, `Step 0${stage}`)}
          <InstructionBox 
            title="Mục tiêu đoạn văn"
            content={data?.role || ""}
          />
          <div className="p-8 space-y-8">
             <div className="space-y-6">
               <h4 className="text-[11px] font-black text-brand-navy uppercase tracking-[0.2em] flex items-center gap-2">
                 <Target className="w-4 h-4 text-brand-orange" /> Gợi ý Topic Sentence
               </h4>
               
               <div className="space-y-6">
                 {data?.topicSentenceGuidance && (
                   <div className="space-y-6">
                     <div className="p-8 bg-brand-navy/5 border-2 border-brand-navy/10 rounded-[2.5rem] relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-5">
                          <Lightbulb className="w-12 h-12" />
                       </div>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Vietnamese Guide</span>
                             <button onClick={() => setSelections((s: any) => ({ ...s, showTopicVi: !s.showTopicVi }))} className="p-1 hover:text-brand-orange transition-colors">
                                {selections.showTopicVi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                             </button>
                          </div>
                          {selections.showTopicVi !== false && (
                            <p className="text-[15px] font-bold text-brand-navy leading-relaxed italic">{renderHighlighted(data.topicSentenceGuidance.vietnamese)}</p>
                          )}
                       </div>
                     </div>

                     <div className="p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] space-y-6 shadow-sm">
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Sentence</span>
                              <button onClick={() => setSelections((s: any) => ({ ...s, showTopicSample: !s.showTopicSample }))} className="p-1 text-slate-400 hover:text-brand-blue transition-colors">
                                {selections.showTopicSample ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                           </div>
                           {selections.showTopicSample !== false && (
                              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-[14px] leading-relaxed text-brand-navy border-l-4 border-brand-blue">
                                 {data.topicSentenceGuidance.sample}
                              </div>
                           )}
                        </div>
                        <div className="space-y-4">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linear Structure</span>
                           {data.topicSentenceGuidance.structures.map((s: any, idx: number) => (
                              <div key={idx} className="p-4 bg-brand-navy/5 rounded-xl border border-brand-navy/10 space-y-2">
                                 <p className="text-[13px] font-mono font-bold text-brand-navy italic">{s.skeleton}</p>
                                 <p className="text-[11px] text-slate-500 font-semibold italic">{s.explanation}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                   </div>
                 )}
               </div>
             </div>

             <div className="space-y-6 pt-6 border-t border-slate-100">
               <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Lựa chọn ý tưởng chính</h4>
               <div className="grid gap-4">
                 {data?.potentialIdeas.map((idea: IdeaSelection) => (
                   <button 
                    key={idea.id}
                    onClick={() => {
                        const ids = bData.selectedIdeaIds.includes(idea.id) 
                           ? bData.selectedIdeaIds.filter((id: string) => id !== idea.id)
                           : [...bData.selectedIdeaIds, idea.id];
                        setBData({ ...bData, selectedIdeaIds: ids });
                    }}
                    className={cn(
                      "w-full text-left p-6 rounded-[1.5rem] border-2 transition-all flex items-center justify-between group",
                      bData.selectedIdeaIds.includes(idea.id) 
                        ? "border-brand-navy bg-brand-navy text-white shadow-xl shadow-brand-navy/20 scale-[1.02]" 
                        : "border-slate-100 text-slate-600 hover:border-brand-blue/30 bg-white"
                    )}
                   >
                     <span className="text-[15px] font-black tracking-tight">{idea.core}</span>
                     {bData.selectedIdeaIds.includes(idea.id) 
                       ? <CheckCircle className="w-6 h-6 text-brand-orange" /> 
                       : <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-brand-blue/50 transition-colors" />}
                   </button>
                 ))}
               </div>
             </div>

             {bData.selectedIdeaIds.map((id: string) => {
               const idea = data?.potentialIdeas.find((i: any) => i.id === id);
               if (!idea) return null;
               return (
                 <div key={id} className="space-y-8 pt-10 border-t border-slate-100 animate-in fade-in slide-in-from-top-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-brand-orange rounded-full" />
                      <h4 className="text-[11px] font-black text-brand-navy uppercase tracking-[0.2em]">Phát triển ý: {idea.core}</h4>
                    </div>
                    {idea.development.map((q: any, idx: number) => (
                      <MCQGroup 
                        key={idx}
                        label={`${idx + 1}. ${q.question}`}
                        options={q.options}
                        selectedId={(bData.developments[id] || [])[idx] || null}
                        onSelect={(opt) => {
                           const dev = [...(bData.developments[id] || [])];
                           dev[idx] = opt.text;
                           setBData({ ...bData, developments: { ...bData.developments, [id]: dev } });
                        }}
                      />
                    ))}
                 </div>
               );
             })}

             {isCompleteDevelopment && (
                <div className="pt-10 border-t border-slate-100">
                   <button 
                    onClick={async () => {
                       setLoading(true);
                       try {
                         const material = await ieltsTutorService.getGuidedMaterial(selections.prompt, selections, `Body Paragraph ${stage-3}`);
                         setGuidedMaterials((p: any) => ({ ...p, [stage === 4 ? 'body1' : 'body2']: material }));
                         if (stage === 4) {
                            const data2 = await ieltsTutorService.getBodyStepData(selections.prompt, selections.essayType as EssayType, 5, selections);
                            setBody2Data(data2);
                         } else {
                            const matConcl = await ieltsTutorService.getGuidedMaterial(selections.prompt, selections, "Conclusion");
                            setGuidedMaterials((p: any) => ({ ...p, conclusion: matConcl }));
                         }
                         // Removed nextStage() so user stays on logic screen while guidance appears on right
                       } finally { setLoading(false); }
                    }}
                    className="w-full py-6 bg-brand-orange text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-orange/90 transition-all active:scale-[0.98] shadow-2xl shadow-brand-orange/20"
                   >
                     Xác nhận logic & Viết nháp
                   </button>
                </div>
             )}
          </div>
        </div>
      );
    case 6:
      return (
        <div className="space-y-8 pb-20">
          <OriginalPromptDisplay prompt={selections.prompt} isFullWidth={isFullWidth} />
          {renderTitle("Conclusion", "Step 06")}
          <InstructionBox 
            title="Closing correctly"
            content="Kết bài cần tóm tắt lại quan điểm đã nêu. TUYỆT ĐỐI không đưa ý tưởng mới vào phần này."
          />
          <div className="p-8 space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Support Tools</h4>
            {guidedMaterials.conclusion && (
               <div className="space-y-4">
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                     <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Vietnamese Guide</span>
                     <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                        {renderHighlighted(guidedMaterials.conclusion.vietnamese)}
                     </p>
                  </div>
               </div>
            )}
          </div>
          <div className="p-8 pb-12">
             <button 
              onClick={async () => {
                  setStage(7);
              }}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
             >
               Next: Preview Full Essay
             </button>
          </div>
        </div>
      );
    case 7:
    case 8:
    case 9:
    case 10:
       return (
         <div className="space-y-8 pb-20">
           <OriginalPromptDisplay prompt={selections.prompt} isFullWidth={isFullWidth} />
           {renderTitle("Final Assessment", `Step 0${stage}`)}
           <div className="p-8 space-y-4">
              <nav className="grid gap-2">
                 {[
                   { id: 7, label: "Full Completed Essay", icon: FileText },
                   { id: 8, label: "Assessment Results", icon: ClipboardCheck },
                   { id: 9, label: "Personalized Sample", icon: Award },
                   { id: 10, label: "Functional Grammar", icon: BookMarked }
                 ].map(item => (
                   <button 
                    key={item.id}
                    onClick={() => setStage(item.id as Stage)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl font-bold text-sm transition-all text-left",
                      stage === item.id ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    )}
                   >
                     <item.icon className={cn("w-5 h-5", stage === item.id ? "text-white" : "text-slate-400")} />
                     {item.label}
                   </button>
                 ))}
              </nav>
           </div>
         </div>
       );
    default:
      return null;
  }
}


function StageContentRight({ 
  stage, 
  selections, 
  setSelections, 
  guidedMaterials, 
  feedback, 
  setFeedback, 
  setStage, 
  setLoading 
}: any) {
  const [showSuggest, setShowSuggest] = useState(true);
  const [showVocab, setShowVocab] = useState(true);
  const [showStructure, setShowStructure] = useState(true);
  const [showModel, setShowModel] = useState(false);
  const [localTexts, setLocalTexts] = useState<Record<string, string>>(selections.paragraphs);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [aiFeedback, setAiFeedback] = useState("");
  const [revisedParagraph, setRevisedParagraph] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLocalTexts(selections.paragraphs);
    setCorrections([]);
    setAiFeedback("");
    setRevisedParagraph("");
  }, [stage]);

  const handleQuickCheck = async (part: keyof typeof localTexts) => {
    if (!localTexts[part]) return;
    setBusy(true);
    try {
      const currentMaterial = guidedMaterials[part];
      const context = `Stage: ${String(part)}, Stance: ${selections.approach}, Logic: ${JSON.stringify(selections)}`;
      const resp = await ieltsTutorService.correctParagraph(localTexts[part], context, currentMaterial);
      setCorrections(resp.corrections);
      setAiFeedback(resp.feedback);
      setRevisedParagraph(resp.revisedParagraph);
    } catch (err) {
    } finally {
      setBusy(false);
    }
  };

  const handleAutoSave = (part: keyof typeof localTexts, text: string) => {
    setLocalTexts((t: any) => ({ ...t, [part]: text }));
    setSelections((p: any) => ({ ...p, paragraphs: { ...p.paragraphs, [part]: text } }));
  };

  const copyEssay = () => {
    const fullText = [
      selections.paragraphs.intro,
      selections.paragraphs.body1,
      selections.paragraphs.body2,
      selections.paragraphs.conclusion
    ].filter(Boolean).join('\n\n');
    
    if (fullText) {
      navigator.clipboard.writeText(fullText);
      alert("Đã copy toàn bộ bài viết vào bộ nhớ đệm!");
    } else {
      alert("Chưa có nội dung để copy.");
    }
  };

  const isGradingLocked = !Object.values(selections.paragraphs).some(p => typeof p === 'string' && p.trim().length > 0);

  switch (stage) {
    case 3: return <WritingSection key="intro" id="intro" label="Introduction" material={guidedMaterials.intro} localTexts={localTexts} setLocalTexts={setLocalTexts} showSuggest={showSuggest} setShowSuggest={setShowSuggest} showVocab={showVocab} setShowVocab={setShowVocab} showModel={showModel} setShowModel={setShowModel} showStructure={showStructure} setShowStructure={setShowStructure} handleQuickCheck={handleQuickCheck} handleAutoSave={handleAutoSave} busy={busy} aiFeedback={aiFeedback} revisedParagraph={revisedParagraph} corrections={corrections} setStage={setStage} setSelections={setSelections} />;
    case 4: return <WritingSection key="body1" id="body1" label="Body Paragraph 1" material={guidedMaterials.body1} localTexts={localTexts} setLocalTexts={setLocalTexts} showSuggest={showSuggest} setShowSuggest={setShowSuggest} showVocab={showVocab} setShowVocab={setShowVocab} showModel={showModel} setShowModel={setShowModel} showStructure={showStructure} setShowStructure={setShowStructure} handleQuickCheck={handleQuickCheck} handleAutoSave={handleAutoSave} busy={busy} aiFeedback={aiFeedback} revisedParagraph={revisedParagraph} corrections={corrections} setStage={setStage} setSelections={setSelections} />;
    case 5: return <WritingSection key="body2" id="body2" label="Body Paragraph 2" material={guidedMaterials.body2} localTexts={localTexts} setLocalTexts={setLocalTexts} showSuggest={showSuggest} setShowSuggest={setShowSuggest} showVocab={showVocab} setShowVocab={setShowVocab} showModel={showModel} setShowModel={setShowModel} showStructure={showStructure} setShowStructure={setShowStructure} handleQuickCheck={handleQuickCheck} handleAutoSave={handleAutoSave} busy={busy} aiFeedback={aiFeedback} revisedParagraph={revisedParagraph} corrections={corrections} setStage={setStage} setSelections={setSelections} />;
    case 6: return <WritingSection key="conclusion" id="conclusion" label="Conclusion" material={guidedMaterials.conclusion} localTexts={localTexts} setLocalTexts={setLocalTexts} showSuggest={showSuggest} setShowSuggest={setShowSuggest} showVocab={showVocab} setShowVocab={setShowVocab} showModel={showModel} setShowModel={setShowModel} showStructure={showStructure} setShowStructure={setShowStructure} handleQuickCheck={handleQuickCheck} handleAutoSave={handleAutoSave} busy={busy} aiFeedback={aiFeedback} revisedParagraph={revisedParagraph} corrections={corrections} setStage={setStage} setSelections={setSelections} />;
    case 7: 
      const isAnyPartDone = Object.values(selections.paragraphs).some(p => typeof p === 'string' && p.trim().length > 0);
      return (
        <div className="flex-1 flex flex-col p-12 space-y-12 brand-pattern overflow-y-auto scrollbar-thin">
           <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4">
                 <h3 className="font-black text-brand-navy text-5xl tracking-tighter leading-none uppercase">Preview Final Essay</h3>
                 <p className="text-base text-slate-400 font-bold uppercase tracking-widest">Xem lại thành quả của bạn trước khi phân tích tổng thể.</p>
              </div>
           </div>

           <div className="grid lg:grid-cols-5 gap-12 flex-1 min-h-[600px]">
              <div className="lg:col-span-3 bg-white border-2 border-slate-100 rounded-[4rem] p-10 lg:p-16 shadow-2xl relative group">
                 {!isAnyPartDone ? (
                   <div className="h-full flex flex-col items-center justify-center text-center opacity-30 italic font-bold">
                      <p>Bạn chưa hoàn thành phần nào.<br />Vui lòng quay lại các bước trước để viết bài.</p>
                   </div>
                 ) : (
                   <div className="max-w-3xl mx-auto space-y-12 font-serif text-[21px] leading-[2.1] text-brand-navy h-full">
                      <div className="space-y-4">
                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest bg-brand-orange/10 px-3 py-1 rounded-lg">Introduction</span>
                        {selections.paragraphs.intro ? (
                          <p className="italic font-bold text-brand-blue border-l-8 border-brand-orange pl-10 bg-brand-orange/5 p-6 rounded-r-[3rem]">
                             {renderHighlighted(selections.paragraphs.intro)}
                          </p>
                        ) : (
                          <p className="text-slate-300 italic text-sm pl-10">Introduction not completed yet...</p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest bg-brand-blue/10 px-3 py-1 rounded-lg">Body Paragraph 1</span>
                        {selections.paragraphs.body1 ? (
                          <p className="pl-12">{renderHighlighted(selections.paragraphs.body1)}</p>
                        ) : (
                          <p className="text-slate-300 italic text-sm pl-12">Body 1 not completed yet...</p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest bg-brand-blue/10 px-3 py-1 rounded-lg">Body Paragraph 2</span>
                        {selections.paragraphs.body2 ? (
                          <p className="pl-12">{renderHighlighted(selections.paragraphs.body2)}</p>
                        ) : (
                          <p className="text-slate-300 italic text-sm pl-12">Body 2 not completed yet...</p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest bg-brand-orange/10 px-3 py-1 rounded-lg">Conclusion</span>
                        {selections.paragraphs.conclusion ? (
                          <p className="italic font-bold text-brand-blue border-l-8 border-brand-orange pl-10 bg-brand-orange/5 p-6 rounded-r-[3rem]">
                             {renderHighlighted(selections.paragraphs.conclusion)}
                          </p>
                        ) : (
                          <p className="text-slate-300 italic text-sm pl-10">Conclusion not completed yet...</p>
                        )}
                      </div>
                   </div>
                 )}
              </div>

              <div className="lg:col-span-2 space-y-8 flex flex-col">
                 <div className="bg-brand-navy rounded-[4rem] p-10 lg:p-12 shadow-2xl space-y-10 relative overflow-hidden border border-white/10 shrink-0">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-orange/10 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
                    <div className="relative z-10 space-y-8">
                       <h4 className="flex items-center gap-4 text-xs font-black text-brand-orange uppercase tracking-[0.3em]">
                          <Target className="w-6 h-6" /> Bài viết đã sẵn sàng?
                       </h4>
                       <p className="text-slate-300 font-bold leading-relaxed">Sau khi xem lại bài viết, bạn có thể thực hiện "Copy to Clipboard" để lưu trữ hoặc nhấn "Final Assessment" để AI bắt đầu phân tích điểm số theo 4 tiêu chuẩn IELTS.</p>
                       
                       <div className="space-y-4">
                          <button 
                            onClick={copyEssay}
                            className="w-full py-5 bg-white text-brand-navy rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-xl"
                          >
                              <ClipboardCheck className="w-5 h-5 text-brand-orange" /> Copy Full Essay
                          </button>
                          
                          <button 
                            disabled={!isAnyPartDone || busy}
                            onClick={async () => {
                              setBusy(true);
                              setFeedback(null);
                              try {
                                const res = await ieltsTutorService.getPersonalizedSample(selections.prompt, selections);
                                setFeedback(res);
                              } catch(err) {
                                console.error(err);
                                alert("Có lỗi xảy ra khi phân tích (API error). Vui lòng thử lại.");
                              } finally { setBusy(false); }
                            }}
                            className="w-full py-6 bg-brand-orange text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-orange/30 hover:bg-brand-orange/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                          >
                              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Award className="w-5 h-5" />} Final Assessment
                          </button>
                       </div>
                    </div>
                 </div>

                 {/* Display core prompt as context in the right column */}
                 <div className="flex-1 bg-white/50 backdrop-blur-md border-2 border-slate-100 rounded-[3rem] p-10 space-y-6 overflow-y-auto">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">IELTS WRITING PROMPT</h5>
                    <p className="text-sm font-bold text-brand-navy leading-relaxed italic">"{selections.prompt}"</p>
                 </div>
              </div>
           </div>

           {/* FINAL ASSESSMENT RESULTS AT BOTTOM */}
           {feedback && (
             <motion.div 
               initial={{ opacity: 0, y: 50 }} 
               animate={{ opacity: 1, y: 0 }} 
               className="pt-20 border-t-2 border-slate-100 space-y-16"
             >
                <div className="flex flex-col lg:flex-row items-center justify-between gap-16 bg-white rounded-[5rem] border-2 border-slate-100 p-10 lg:p-20 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-navy/5 rounded-full -mr-48 -mt-48 blur-3xl opacity-50"></div>
                  
                  <div className="flex-1 space-y-10 text-center lg:text-left relative z-10">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-brand-navy rounded-xl border border-brand-orange/30 shadow-xl">
                      <div className="w-3 h-3 rounded-full bg-brand-orange animate-pulse"></div>
                      <span className="text-[11px] font-black text-white uppercase tracking-[0.3em]">IELTS LOGIN Assessment Results</span>
                    </div>
                    <h3 className="text-4xl lg:text-6xl font-black text-brand-navy leading-[1] tracking-tighter uppercase">
                      KẾT QUẢ ĐÁNH GIÁ<br />
                      <span className="text-brand-orange leading-[1.3]">DỰA TRÊN LOGIC CỦA BẠN.</span>
                    </h3>
                    <p className="text-xl text-slate-500 font-semibold leading-relaxed max-w-xl">
                      Dưới đây là dự đoán Band Score và các nhận xét chuyên môn để bạn tối ưu hoá bài viết.
                    </p>
                  </div>
                  
                  <div className="shrink-0 relative group">
                     <div className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-full border-[15px] lg:border-[20px] border-brand-navy flex flex-col items-center justify-center bg-white shadow-2xl">
                        <span className="text-[9px] lg:text-[11px] font-black text-slate-400 tracking-[0.4em] uppercase mb-1">BAND SCORE</span>
                        <span className="text-6xl lg:text-8xl font-black text-brand-navy leading-none tracking-tighter italic">{feedback.score}</span>
                     </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
                   <ScoreCardSimple label="Task Response" score={feedback.criteria.tr.score} comment={feedback.criteria.tr.comment} color="#f97316" />
                   <ScoreCardSimple label="Cohesion" score={feedback.criteria.cc.score} comment={feedback.criteria.cc.comment} color="#3b82f6" />
                   <ScoreCardSimple label="Vocabulary" score={feedback.criteria.lr.score} comment={feedback.criteria.lr.comment} color="#ec4899" />
                   <ScoreCardSimple label="Grammar" score={feedback.criteria.gra.score} comment={feedback.criteria.gra.comment} color="#e11d48" />
                </div>

                <div className="flex justify-center pb-20">
                   <button 
                     onClick={() => setStage(9)}
                     className="px-16 py-8 bg-brand-navy text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] hover:bg-black transition-all shadow-2xl flex items-center gap-4"
                   >
                     Xem Bài Mẫu Cá Nhân Hoá <ArrowRight className="w-6 h-6 text-brand-orange" />
                   </button>
                </div>
             </motion.div>
           )}
        </div>
      );
    case 8:
      if (busy) {
        return (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 brand-pattern p-12 text-center">
            <div className="relative">
              <div className="w-32 h-32 border-8 border-slate-100 border-t-brand-navy rounded-full animate-spin"></div>
              <Sparkles className="w-10 h-10 text-brand-orange absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-brand-navy uppercase tracking-tighter">AI đang phân tích bài viết của bạn...</h3>
              <p className="text-slate-500 font-bold max-w-md mx-auto italic">Quá trình này có thể mất vài giây. AI Expert đang xem xét từng tiêu chí chấm điểm IELTS.</p>
            </div>
          </div>
        );
      }
      if (!feedback) {
        return (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 brand-pattern p-12 text-center">
             <div className="p-10 bg-white rounded-[4rem] border-4 border-dashed border-slate-200 space-y-8 max-w-xl shadow-2xl">
                <XCircle className="w-20 h-20 mx-auto text-rose-400" />
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-brand-navy uppercase">Không có dữ liệu đánh giá</h3>
                  <p className="text-slate-500 font-bold leading-relaxed px-10">Bài viết chưa được chấm điểm hoặc có lỗi xảy ra. Hãy quay lại bước Review để kích hoạt phân tích.</p>
                </div>
                <button 
                  onClick={() => setStage(7)}
                  className="px-12 py-5 bg-brand-navy text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                >
                  Quay lại Review
                </button>
             </div>
          </div>
        );
      }
      return (
        <div className="flex-1 flex flex-col p-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 brand-pattern overflow-y-auto scrollbar-thin">
           <div className="flex flex-col lg:flex-row items-center justify-between gap-16 bg-white rounded-[5rem] border-2 border-slate-100 p-10 lg:p-20 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-brand-navy/5 rounded-full -mr-48 -mt-48 blur-3xl opacity-50"></div>
             
             <div className="flex-1 space-y-10 text-center lg:text-left relative z-10">
               <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-brand-navy rounded-xl border border-brand-orange/30 shadow-xl">
                 <div className="w-3 h-3 rounded-full bg-brand-orange animate-pulse"></div>
                 <span className="text-[11px] font-black text-white uppercase tracking-[0.3em]">IELTS LOGIN Assessment</span>
               </div>
               <h3 className="text-4xl lg:text-6xl font-black text-brand-navy leading-[1] tracking-tighter uppercase">
                 CHIẾN THUẬT LẬP LUẬN<br />
                 <span className="text-brand-orange leading-[1.3]">ĐÃ HOÀN TẤT.</span>
               </h3>
               <p className="text-xl text-slate-500 font-semibold leading-relaxed max-w-xl">
                 Hệ thống đã phân tích bài viết của bạn theo 4 tiêu chí IELTS. Hãy xem các ưu/nhược điểm để cải thiện logic.
               </p>
             </div>
             
             <div className="shrink-0 relative group">
                <div className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-full border-[15px] lg:border-[20px] border-brand-navy flex flex-col items-center justify-center bg-white shadow-[0_32px_64px_rgba(19,74,133,0.2)]">
                   <span className="text-[9px] lg:text-[11px] font-black text-slate-400 tracking-[0.3em] uppercase mb-1">BAND SCORE</span>
                   <span className="text-6xl lg:text-8xl font-black text-brand-navy leading-none tracking-tighter italic">{feedback.score}</span>
                </div>
             </div>
           </div>

           <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
              <ScoreCardSimple label="Task Response" score={feedback.criteria.tr.score} comment={feedback.criteria.tr.comment} color="#f97316" />
              <ScoreCardSimple label="Cohesion" score={feedback.criteria.cc.score} comment={feedback.criteria.cc.comment} color="#3b82f6" />
              <ScoreCardSimple label="Vocabulary" score={feedback.criteria.lr.score} comment={feedback.criteria.lr.comment} color="#ec4899" />
              <ScoreCardSimple label="Grammar" score={feedback.criteria.gra.score} comment={feedback.criteria.gra.comment} color="#e11d48" />
           </div>

           <div className="flex justify-center pb-20">
              <button 
                onClick={() => setStage(9)}
                className="px-12 py-6 bg-brand-navy text-white rounded-3xl font-black text-sm uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl"
              >
                Xem Bài Mẫu Cá Nhân Hoá <ArrowRight className="w-5 h-5 ml-4 inline" />
              </button>
           </div>
        </div>
      );
    case 9:
      if (!feedback) {
        return (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 brand-pattern p-12 text-center">
             <div className="p-10 bg-white rounded-[4rem] border-4 border-dashed border-slate-200 space-y-8 max-w-xl shadow-2xl">
                <XCircle className="w-20 h-20 mx-auto text-rose-400" />
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-brand-navy uppercase">Không có dữ liệu bài mẫu</h3>
                  <p className="text-slate-500 font-bold leading-relaxed px-10">AI chưa tạo ra bài mẫu cho bạn. Vui lòng thử lại quá trình chấm điểm.</p>
                </div>
                <button 
                  onClick={() => setStage(7)}
                  className="px-12 py-5 bg-brand-navy text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                >
                  Quay lại Review
                </button>
             </div>
          </div>
        );
      }
      return (
        <div className="flex-1 flex flex-col p-12 space-y-10 animate-in fade-in slide-in-from-right-8 duration-700 brand-pattern overflow-y-auto scrollbar-thin">
           <div className="space-y-3">
              <h3 className="font-black text-brand-navy text-4xl tracking-tighter leading-none uppercase">Personalized Sample Essay</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">A High-Band variation based on YOUR logic flow.</p>
           </div>
           <div className="grid xl:grid-cols-5 gap-12 flex-1 min-h-[600px]">
              <div className="xl:col-span-3 bg-white border-2 border-slate-100 rounded-[4rem] p-10 lg:p-16 shadow-2xl overflow-y-auto">
                 <h4 className="flex items-center gap-4 text-xs font-black text-brand-navy uppercase tracking-[0.3em] mb-12 pb-5 border-b border-slate-100">
                    <FileText className="w-6 h-6 text-brand-orange" /> Annotated Writing
                 </h4>
                 <div className="prose prose-slate prose-xl font-serif leading-[1.9] text-brand-navy whitespace-pre-wrap italic">
                    <Markdown>{feedback.sample}</Markdown>
                 </div>
              </div>
              <div className="xl:col-span-2 bg-brand-navy rounded-[4rem] p-10 lg:p-16 shadow-2xl overflow-y-auto space-y-12 relative border border-white/10">
                 <h4 className="flex items-center gap-4 text-xs font-black text-brand-orange uppercase tracking-[0.3em] relative z-10">
                    <Award className="w-6 h-6" /> High-Value Phrases
                 </h4>
                 <div className="grid gap-6 relative z-10">
                    {feedback.highValuePhrases.map((item, i) => (
                      <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-3 group hover:bg-white/10 transition-all hover:scale-[1.02] hover:border-brand-orange/30">
                        <p className="text-brand-orange font-black text-2xl tracking-tighter leading-none">{item.phrase}</p>
                        <p className="text-[13px] text-indigo-100/60 font-semibold italic tracking-wide">{item.meaning}</p>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
           <div className="flex justify-center pb-20">
              <button 
                onClick={() => setStage(10)}
                className="px-12 py-6 bg-brand-navy text-white rounded-3xl font-black text-sm uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl"
              >
                Hệ Thống Grammar Hub <ArrowRight className="w-5 h-5 ml-4 inline" />
              </button>
           </div>
        </div>
      );

    case 10:
      return (
        <div className="flex-1 flex flex-col p-12 space-y-10 animate-in fade-in slide-in-from-right-8 duration-700 brand-pattern">
           <div className="space-y-3">
              <h3 className="font-black text-brand-navy text-4xl tracking-tighter leading-none uppercase">Functional Grammar Hub</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Key structures applied to your topic.</p>
           </div>
           <div className="grid lg:grid-cols-2 gap-10 flex-1 min-h-0">
             {['Intro', 'Body 1', 'Body 2', 'Conclusion'].map(step => {
                const mat = guidedMaterials[step.toLowerCase().replace(' ', '')];
                if (!mat) return null;
                return (
                  <div key={step} className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 shadow-sm flex flex-col space-y-8 overflow-hidden hover:shadow-xl transition-all">
                     <h4 className="font-black text-brand-navy text-[14px] uppercase tracking-[0.3em] pb-5 border-b-2 border-slate-50 flex items-center justify-between">
                        {step}
                        <div className="px-4 py-1.5 bg-brand-navy text-brand-orange text-[10px] rounded-xl border border-brand-orange/30">Linear Patterns</div>
                     </h4>
                     <div className="flex-1 overflow-y-auto space-y-8 pr-3 scroll-smooth">
                        {mat.structures.map((s: any, i: number) => (
                          <div key={i} className="space-y-5 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 group transition-all">
                             <div className="space-y-2">
                               <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Logic Skeleton</p>
                               <p className="text-[16px] font-mono font-bold text-brand-navy italic leading-relaxed border-l-4 border-brand-orange pl-6 my-2">{s.skeleton}</p>
                             </div>
                             <div className="space-y-4 pt-5 border-t border-slate-200/50">
                                <p className="text-[10px] font-black text-brand-navy uppercase tracking-widest">Model Application</p>
                                <div className="text-[15px] leading-relaxed font-bold bg-white p-6 rounded-2xl border border-slate-200 shadow-inner text-slate-700">
                                  {renderHighlighted(s.sample)}
                                </div>
                             </div>
                             <div className="flex gap-3 items-start p-4 bg-brand-navy/5 rounded-xl">
                               <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                               <p className="text-[11px] text-slate-600 font-semibold italic leading-relaxed">
                                  {s.explanation}
                               </p>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                )
             })}
           </div>
        </div>
      );
    default:
      return null;
  }
}

// --- UTILS & SUB-COMPONENTS ---

function VocabList({ vocab }: { vocab: { vi: string, en: string }[] }) {
  if (!vocab || vocab.length === 0) return null;
  return (
    <div className="p-8 bg-brand-navy rounded-[2.5rem] shadow-[0_24px_48px_rgba(19,74,133,0.3)] space-y-6 relative border border-white/10 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      <div className="flex items-center justify-between relative z-10">
        <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em]">High Band Vocabulary</h4>
        <div className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-brand-orange uppercase border border-brand-orange/20">VI ➝ EN Expansion</div>
      </div>
      <div className="grid grid-cols-2 gap-x-10 gap-y-6 relative z-10">
        {vocab.map((item, i) => (
          <div key={i} className="space-y-1.5 group">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-4 bg-brand-orange rounded-full group-hover:scale-y-150 transition-transform" />
                <p className="text-xs text-white/50 font-bold group-hover:text-white/80 transition-colors uppercase tracking-tight">{item.vi}</p>
             </div>
             <p className="text-[15px] font-black text-white pl-4 leading-tight tracking-tight group-hover:text-brand-orange transition-colors">{item.en}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreCardSimple({ label, score, comment, color }: { label: string, score: number | string, comment: string, color: string }) {
  return (
    <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8 hover:shadow-2xl hover:scale-[1.02] transition-all group overflow-hidden relative">
      <div 
        className="absolute top-0 right-0 w-24 h-24 opacity-5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150" 
        style={{ backgroundColor: color }}
      ></div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-black text-slate-400 tracking-[0.2em] uppercase">{label}</span>
        <div className="flex flex-col items-end">
          <span className="text-5xl font-black italic tracking-tighter" style={{ color: color }}>{score}</span>
        </div>
      </div>
      <div className="flex flex-col space-y-4">
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full transition-all duration-1000" style={{ width: `${(Number(score)/9)*100}%`, backgroundColor: color }} />
        </div>
        <p className="text-sm text-slate-500 font-bold leading-relaxed bulleted-feedback">
          {comment}
        </p>
      </div>
    </div>
  );
}

function renderInteractiveCorrections(text: string, corrections: Correction[]) {
  if (!text) return null;
  // Only handle GRA and SE for highlights
  const allowed = corrections.filter(c => c.criterion === 'GRA' || c.criterion === 'SE');
  
  if (allowed.length === 0) return text;

  // Simple string replacement highlighting (vulnerable to duplicate strings but good enough for sentences)
  let result: (string | React.ReactNode)[] = [text];

  allowed.forEach((c) => {
    const newResult: (string | React.ReactNode)[] = [];
    result.forEach((part) => {
      if (typeof part === 'string') {
        const index = part.indexOf(c.original);
        if (index !== -1) {
          const before = part.substring(0, index);
          const after = part.substring(index + c.original.length);
          if (before) newResult.push(before);
          
          const color = c.criterion === 'GRA' ? 'bg-rose-500/20 text-rose-700 border-rose-600/30' : 'bg-purple-500/20 text-purple-700 border-purple-600/30';
          
          newResult.push(
            <span 
              key={Math.random()} 
              className={cn("px-1 py-0.5 rounded-sm border-b-2 cursor-help transition-all hover:bg-opacity-40 group relative inline-block", color)}
            >
              {c.original}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[250px] p-4 bg-slate-900 text-white text-[11px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] shadow-2xl font-bold font-sans normal-case leading-relaxed">
                {c.explanation}
              </span>
            </span>
          );
          if (after) newResult.push(after);
        } else {
          newResult.push(part);
        }
      } else {
        newResult.push(part);
      }
    });
    result = newResult;
  });

  return <>{result}</>;
}

function renderHighlighted(txt: string, isDark: boolean = false) {
  if (!txt) return null;
  const parts = txt.split(/(\*\*.*?\*\*|\*[^*]+\*|_{3,})/g);
  return parts.map((part, i) => {
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('*') && part.endsWith('*'))) {
      const clean = part.startsWith('**') ? part.slice(2, -2) : part.slice(1, -1);
      return (
        <span key={i} className={cn(
          "font-black border-b-2 px-1 rounded-sm mx-0.5 transition-all text-[1.1em]",
          isDark 
            ? "text-brand-orange border-brand-orange/50 bg-white/5" 
            : "text-brand-blue border-brand-blue/30 bg-brand-blue/5"
        )}>
          {clean}
        </span>
      );
    }
    if (part.startsWith('___')) {
      return (
        <span key={i} className="px-2 font-mono font-black text-brand-blue border-b-2 border-brand-blue/30 mx-1 bg-brand-blue/10 rounded-sm">
          {part}
        </span>
      );
    }
    return part;
  });
}

const WritingSection = ({ 
  id, 
  label, 
  material, 
  localTexts, 
  setLocalTexts, 
  showSuggest, 
  setShowSuggest, 
  showVocab,
  setShowVocab,
  showModel, 
  setShowModel, 
  showStructure, 
  setShowStructure,
  handleQuickCheck,
  handleAutoSave,
  busy,
  aiFeedback,
  revisedParagraph,
  corrections,
  setStage,
  setSelections
}: any) => {
  return (
    <div className="flex-1 flex flex-col p-6 lg:p-14 space-y-12 max-w-[1600px] mx-auto w-full h-full overflow-y-auto scrollbar-thin">
       <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 shrink-0">
          <div className="flex items-center gap-6">
             <div className="p-5 bg-brand-navy rounded-[2rem] shadow-2xl shadow-brand-navy/20 border border-brand-orange/30">
                <PenTool className="w-8 h-8 text-brand-orange" />
             </div>
             <div>
                <h3 className="font-black text-brand-navy text-4xl tracking-tighter leading-none uppercase italic">{label}</h3>
                <p className="text-[11px] font-black text-brand-blue uppercase tracking-[0.4em] mt-2 opacity-60">Luyện tập viết logic • Tối ưu Band Score</p>
             </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-100/80 backdrop-blur-md p-2 rounded-3xl border border-slate-200">
             <button onClick={() => setShowSuggest(!showSuggest)} className={cn("px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3", showSuggest ? "bg-white text-brand-orange shadow-lg" : "text-slate-400 hover:text-slate-600")}>
                {showSuggest ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} Gợi ý Việt
             </button>
             <button onClick={() => setShowVocab(!showVocab)} className={cn("px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3", showVocab ? "bg-white text-indigo-600 shadow-lg" : "text-slate-400 hover:text-slate-600")}>
                {showVocab ? <EyeOff className="w-4 h-4" /> : <Search className="w-4 h-4" />} Từ vựng
             </button>
             <button onClick={() => setShowStructure(!showStructure)} className={cn("px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3", showStructure ? "bg-white text-brand-navy shadow-lg" : "text-slate-400 hover:text-slate-600")}>
                {showStructure ? <EyeOff className="w-4 h-4" /> : <BookMarked className="w-4 h-4" />} Grammar
             </button>
             <button onClick={() => setShowModel(!showModel)} className={cn("px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3", showModel ? "bg-white text-brand-blue shadow-lg" : "text-slate-400 hover:text-slate-600")}>
                {showModel ? <EyeOff className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />} Bài mẫu
             </button>
          </div>
       </div>

       <div className="space-y-10">
          {/* 1. VIETNAMESE SUGGESTION (TOP) */}
          {material && showSuggest && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-brand-navy border-2 border-white/10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <MessageSquare className="w-12 h-12 text-brand-orange" />
                </div>
                <div className="flex items-center gap-3 relative z-10 mb-3">
                  <div className="w-2 h-2 rounded-full bg-brand-orange" />
                  <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em]">Kịch bản Tiếng Việt (Gợi ý các ý chính)</span>
                </div>
                <p className="text-[16px] font-bold text-white leading-relaxed italic relative z-10 whitespace-pre-wrap">{renderHighlighted(material.vietnamese, true)}</p>
            </motion.div>
          )}

          {/* 2. WRITING INPUT AREA (MIDDLE) */}
          <div className="space-y-8">
             <div className="relative group">
                <TextareaAutosize 
                  value={localTexts[id]}
                  onChange={e => {
                    const val = e.target.value;
                    setLocalTexts((t: any) => ({ ...t, [id]: val }));
                  }}
                  minRows={10}
                  className="w-full p-8 lg:p-12 bg-white border-[3px] border-slate-100 rounded-[3.5rem] shadow-[0_15px_30px_rgba(0,0,0,0.03)] focus:border-brand-navy focus:ring-[20px] focus:ring-brand-navy/5 outline-none transition-all font-mono text-[19px] leading-[1.8] text-brand-navy placeholder:text-slate-300"
                  placeholder="Tiến hành chuyển ngữ từ kịch bản Tiếng Việt sang Tiếng Anh tại đây..."
                />
                <div className="absolute bottom-10 right-10 flex items-center gap-4 px-5 py-2.5 bg-brand-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/20">
                   <Target className="w-4 h-4 text-brand-orange" />
                   {localTexts[id]?.trim().split(/\s+/).filter(Boolean).length || 0} từ
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={() => handleQuickCheck(id)}
                  disabled={!localTexts[id]?.trim() || busy}
                  className="flex-1 py-5 bg-white border-2 border-brand-navy text-brand-navy rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-brand-navy hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-md disabled:opacity-50"
                >
                  {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ClipboardCheck className="w-5 h-5" />} Phân tích lỗi chính tả & Ngữ pháp
                </button>
                <button 
                  onClick={() => handleAutoSave(id, localTexts[id])}
                  className="flex-1 py-5 bg-brand-navy text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:shadow-xl transition-all active:scale-[0.98] shadow-lg"
                >
                  Lưu nháp Paragraph
                </button>
             </div>
          </div>

          {/* 3. SUPPORTING CONTENT (Vocab + Grammar + Model) (BELOW INPUT) */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
               {material && showVocab && (
                 <div className="flex flex-col">
                   <VocabList vocab={material.vocab} />
                 </div>
               )}

               {material && showStructure && (
                 <div className="bg-brand-navy/5 border-2 border-brand-navy/10 rounded-[2.5rem] p-8 space-y-6 flex flex-col">
                   <div className="flex items-center justify-between pb-4 border-b border-brand-navy/10">
                     <div className="flex items-center gap-3">
                       <BookMarked className="w-5 h-5 text-brand-navy" />
                       <span className="text-[11px] font-black text-brand-navy uppercase tracking-[0.2em]">Grammar Hub</span>
                     </div>
                     <span className="text-[9px] font-black text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-md uppercase">Structures</span>
                   </div>
                   <div className="space-y-6 flex-1 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin">
                      {material.structures.map((s: any, i: any) => (
                        <div key={i} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
                           <p className="text-[13px] font-mono font-bold text-brand-navy italic px-3 py-2 bg-slate-50 rounded-lg">
                             {renderHighlighted(s.skeleton)}
                           </p>
                           <p className="text-[10px] text-slate-500 font-bold leading-tight">{s.explanation}</p>
                        </div>
                      ))}
                   </div>
                 </div>
               )}
            </div>

            {material && showModel && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-white border-2 border-brand-blue/30 rounded-[2.5rem] shadow-lg border-dashed">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-blue/10 rounded-lg">
                      <Sparkles className="w-4 h-4 text-brand-blue" />
                    </div>
                    <span className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em]">Cấu trúc bài mẫu (Tham khảo)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                    {material.structures.map((s: any, idx: any) => (
                      <div key={idx} className="space-y-2 border-l-4 border-brand-blue/20 pl-6 pb-2">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sentence {idx + 1}</p>
                         <p className="text-[15px] font-bold text-brand-navy leading-relaxed italic">
                           {renderHighlighted(s.sample)}
                         </p>
                      </div>
                    ))}
                  </div>
              </motion.div>
            )}
          </div>

          {/* 4. RESULTS & FEEDBACK (BOTTOM) */}
          {(aiFeedback || corrections.length > 0) && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="pt-10 border-t-2 border-slate-100 animate-in fade-in slide-in-from-bottom-10 space-y-10">
               <div className="grid lg:grid-cols-2 gap-10">
                 <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl space-y-8 h-full">
                    <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                       <h5 className="text-[11px] font-black text-brand-navy uppercase tracking-[0.3em] flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-brand-orange" /> IELTS LOGIN Expert Assessment
                       </h5>
                    </div>
                    <div className="text-[16px] font-semibold text-brand-navy leading-relaxed prose prose-slate max-w-none prose-sm whitespace-pre-wrap">
                       {aiFeedback.split('\n').map((line: string, idx: number) => {
                         const l = line.trim();
                         if (!l) return <div key={idx} className="h-4" />;
                         
                         let bulletColor = "bg-brand-navy";
                         if (l.toLowerCase().includes("task response")) bulletColor = "bg-orange-500";
                         else if (l.toLowerCase().includes("coherence")) bulletColor = "bg-blue-500";
                         else if (l.toLowerCase().includes("lexical")) bulletColor = "bg-pink-500";
                         else if (l.toLowerCase().includes("gramma")) bulletColor = "bg-rose-500";
                         else if (l.includes("Strengths") || l.includes("(+)")) bulletColor = "bg-emerald-500";

                         if (l.startsWith('*')) {
                           return (
                             <div key={idx} className="flex gap-4 mt-6 first:mt-0 font-bold group">
                                <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0 transition-transform group-hover:scale-150", bulletColor)} />
                                <span className="flex-1">{l.replace('*', '').trim()}</span>
                             </div>
                           );
                         }
                         return <p key={idx} className="mt-2 pl-6 text-slate-600 font-medium">{l}</p>;
                       })}
                    </div>

                    {revisedParagraph && (
                      <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                         <h5 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Revised Paragraph (Expert Version)
                         </h5>
                         <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl text-[15px] font-bold text-slate-800 leading-relaxed italic relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                               <Award className="w-12 h-12" />
                            </div>
                            {revisedParagraph}
                         </div>
                         <button 
                           onClick={() => {
                             setLocalTexts((t: any) => ({ ...t, [id]: revisedParagraph }));
                             handleAutoSave(id, revisedParagraph);
                           }}
                           className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors flex items-center gap-2"
                         >
                           <RefreshCcw className="w-3 h-3" /> Apply this revision as my draft
                         </button>
                      </div>
                    )}
                 </div>

                 <div className="space-y-6">
                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] pl-6 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Specific Improvements
                    </h5>
                    <div className="grid gap-6">
                       {corrections.map((c: any, i: any) => (
                         <div key={i} className="p-6 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-lg space-y-4 group hover:border-brand-blue/20 transition-all">
                            <div className="flex items-center justify-between">
                               <span className={cn(
                                 "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border text-white",
                                 c.criterion === 'TR' ? "bg-orange-500 border-orange-200" :
                                 c.criterion === 'CC' ? "bg-blue-500 border-blue-200" :
                                 c.criterion === 'LR' ? "bg-pink-500 border-pink-200" :
                                 c.criterion === 'GRA' ? "bg-rose-500 border-rose-200" : 
                                 c.criterion === 'SE' ? "bg-purple-600 border-purple-200" : "bg-slate-900 border-slate-700"
                               )}>{c.criterion === 'GRA' ? 'Grammar' : c.criterion === 'LR' ? 'Lexem' : c.criterion === 'TR' ? 'Task' : c.criterion === 'CC' ? 'Cohesion' : c.criterion === 'SE' ? 'Spelling' : c.criterion}</span>
                               <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1"><Plus className="w-3 h-3" /> Improvement</span>
                            </div>
                            <div className="space-y-4">
                               <p className="text-[13px] text-slate-400 line-through font-mono leading-relaxed opacity-60 italic">"{c.original}"</p>
                               <p className="text-[15px] font-black text-brand-navy leading-relaxed font-mono border-l-4 border-slate-200 pl-4 bg-slate-50 py-3 rounded-r-xl group-hover:border-brand-blue transition-colors">
                                 {renderHighlighted(c.fixed)}
                               </p>
                            </div>
                            <div className="text-[11px] text-slate-500 font-bold italic bg-brand-navy/5 p-4 rounded-xl border border-brand-navy/5">
                              {c.explanation}
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               </div>
            </motion.div>
          )}

          <div className="pt-10 flex justify-center pb-20">
             <button 
               onClick={() => {
                 setSelections((p: any) => ({ ...p, paragraphs: { ...p.paragraphs, [id]: localTexts[id] } }));
                 const stages: any = { intro: 4, body1: 5, body2: 6, conclusion: 7 };
                 setStage(stages[id]);
               }}
               className="px-12 py-6 bg-brand-navy text-white rounded-3xl font-black text-sm uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl shadow-brand-navy/30 active:scale-95"
             >
               Tiến đến phần tiếp theo <ArrowRight className="w-5 h-5 ml-4 inline" />
             </button>
          </div>
       </div>
    </div>
  );
};

