import React from 'react';
import { FileText, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  hasTemplate: boolean;
  hasGeneratedDoc: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onStepClick,
  hasTemplate,
  hasGeneratedDoc,
}) => {
  const steps = [
    { num: 1, title: 'Template Word Doc', subtitle: 'Upload & analyze styling' },
    { num: 2, title: 'Input Content', subtitle: 'Any format or file' },
    { num: 3, title: 'Preview & Review', subtitle: 'Verify accuracy & edit' },
    { num: 4, title: 'Download .docx', subtitle: 'Export populated file' },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 tracking-tight text-lg">DocuMorph AI</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <Sparkles className="w-3 h-3" /> Word Styler
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Exact Word layout & styling preservation from any input
              </p>
            </div>
          </div>

          {/* Stepper Navigation */}
          <nav aria-label="Workflow progress" className="hidden md:flex items-center gap-1 sm:gap-2">
            {steps.map((step, idx) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              const isClickable = (step.num === 1) || (step.num === 2 && hasTemplate) || (step.num >= 3 && hasGeneratedDoc);

              return (
                <button
                  key={step.num}
                  id={`stepper-btn-step-${step.num}`}
                  onClick={() => isClickable && onStepClick(step.num)}
                  disabled={!isClickable}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                      : isPast
                      ? 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                      : 'text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.num}
                  </span>
                  <span className="font-medium whitespace-nowrap">{step.title}</span>
                  {idx < steps.length - 1 && (
                    <span className="text-slate-300 ml-1">/</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
