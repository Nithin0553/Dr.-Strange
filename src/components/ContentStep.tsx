import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Sliders,
  CheckCircle,
  FileCode,
  FileSpreadsheet,
  Trash2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { TemplateAnalysis, SampleTemplateOption } from '../types.js';
import { readFileAsText, readFileAsBase64 } from '../utils/fileHelpers.js';

interface ContentStepProps {
  currentTemplate: TemplateAnalysis;
  rawContent: string;
  onContentChange: (content: string) => void;
  userInstructions: string;
  onInstructionsChange: (instructions: string) => void;
  sampleOptions: SampleTemplateOption[];
  onBackToTemplate: () => void;
  onGenerateDocument: () => Promise<void>;
  isGenerating: boolean;
  generationStepMessage: string;
}

export const ContentStep: React.FC<ContentStepProps> = ({
  currentTemplate,
  rawContent,
  onContentChange,
  userInstructions,
  onInstructionsChange,
  sampleOptions,
  onBackToTemplate,
  onGenerateDocument,
  isGenerating,
  generationStepMessage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const matchedSample = sampleOptions.find((s) => s.id === currentTemplate.id);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processContentFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processContentFile(e.target.files[0]);
    }
  };

  const processContentFile = async (file: File) => {
    setErrorMessage(null);
    try {
      if (file.name.match(/\.(docx|doc)$/i)) {
        // Parse .docx content using the server
        const base64 = await readFileAsBase64(file);
        const res = await fetch('/api/analyze-template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateBase64: base64, fileName: file.name }),
        });
        const data = await res.json();
        if (data.template && data.template.rawText) {
          onContentChange(data.template.rawText);
          setUploadedFileName(file.name);
        } else {
          throw new Error('Could not extract text from the Word document.');
        }
      } else {
        // Plain text, markdown, JSON, CSV
        const text = await readFileAsText(file);
        onContentChange(text);
        setUploadedFileName(file.name);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read content file.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLoadSampleContent = () => {
    if (matchedSample?.sampleContent) {
      onContentChange(matchedSample.sampleContent);
      setUploadedFileName(`Preset: ${matchedSample.sampleContentLabel}`);
    }
  };

  const wordCount = rawContent.trim() ? rawContent.trim().split(/\s+/).length : 0;
  const charCount = rawContent.length;

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium mb-1 border border-blue-100">
            <Sparkles className="w-3 h-3" /> Step 2: Content Ingestion
          </div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Provide Input Content in Any Form
          </h2>
          <p className="text-xs text-slate-500">
            Active Template: <span className="font-semibold text-slate-800">{currentTemplate.title}</span> ({currentTemplate.styling.fontFamily}, {currentTemplate.styling.primaryColor})
          </p>
        </div>

        <button
          id="btn-back-to-template"
          onClick={onBackToTemplate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Change Template
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Content loading issue</p>
            <p className="text-red-700 text-xs mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Content Input Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Text / File Area (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="raw-content-textarea" className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Raw Content (Text, Notes, JSON, Email, or Bullets)
              </label>

              <div className="flex items-center gap-2">
                {matchedSample && (
                  <button
                    id="btn-load-sample-content"
                    onClick={handleLoadSampleContent}
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-2xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Load Sample Notes
                  </button>
                )}

                {rawContent && (
                  <button
                    id="btn-clear-content"
                    onClick={() => {
                      onContentChange('');
                      setUploadedFileName(null);
                    }}
                    type="button"
                    className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                    title="Clear content"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {uploadedFileName && (
              <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Loaded from: <strong>{uploadedFileName}</strong></span>
              </div>
            )}

            <textarea
              id="raw-content-textarea"
              value={rawContent}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Paste or type content here in any form...
Examples:
• Rough meeting minutes or bullet notes
• Unstructured email thread or project transcript
• Key deliverables, milestones, prices, dates
• Raw JSON object or table records"
              rows={14}
              className="w-full text-sm font-mono leading-relaxed p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden bg-slate-50/50 resize-y"
            />

            <div className="flex items-center justify-between text-2xs text-slate-400 mt-2">
              <span>{wordCount} words · {charCount} characters</span>
              <span>Accepts any structure or unstructured format</span>
            </div>
          </div>

          {/* Optional Drag & Drop for Content File */}
          <div
            id="content-dropzone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer flex items-center justify-center gap-3 ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.json,.csv,.docx,.doc"
              onChange={handleFileSelect}
              className="hidden"
              id="content-file-input"
            />
            <UploadCloud className="w-5 h-5 text-slate-400" />
            <span className="text-xs text-slate-600">
              Or drop a content file here: <span className="font-medium text-slate-800">.txt, .md, .docx, .json, .csv</span>
            </span>
          </div>
        </div>

        {/* Right Column: Template Guidance & Custom Instructions */}
        <div className="space-y-4">
          {/* Target Template Mapping Blueprint */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-blue-600" /> Target Template Schema
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              The AI will automatically extract and map your data into these {currentTemplate.sections.length} sections:
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {currentTemplate.sections.map((sec, i) => (
                <div key={sec.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between font-medium text-slate-800 mb-1">
                    <span className="truncate">{i + 1}. {sec.heading}</span>
                    <span className="text-3xs uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 shrink-0 ml-1">
                      {sec.type}
                    </span>
                  </div>
                  {sec.placeholders.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sec.placeholders.slice(0, 3).map((p) => (
                        <span key={p} className="text-3xs text-blue-600 bg-blue-50 px-1 py-0.2 rounded font-mono truncate max-w-[120px]">
                          {p}
                        </span>
                      ))}
                      {sec.placeholders.length > 3 && (
                        <span className="text-3xs text-slate-400">+{sec.placeholders.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Optional Custom Instructions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <button
              id="btn-toggle-advanced-instructions"
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                Additional Formatting Instructions (Optional)
              </span>
              <span className="text-2xs text-blue-600">{showAdvancedSettings ? 'Hide' : 'Add'}</span>
            </button>

            {showAdvancedSettings && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <textarea
                  id="user-instructions-textarea"
                  value={userInstructions}
                  onChange={(e) => onInstructionsChange(e.target.value)}
                  placeholder="e.g. Ensure Net 30 payment terms are highlighted; Emphasize Q4 target deadlines; Maintain executive tone."
                  rows={3}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden bg-slate-50/50"
                />
              </div>
            )}
          </div>

          {/* Action Trigger Card */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-300" /> Ready to Populate
            </h3>
            <p className="text-xs text-blue-200 mb-4 leading-relaxed">
              Gemini will format your content to match the exact font, colors, headers, and tables memorized from the template.
            </p>

            <button
              id="btn-generate-document"
              onClick={onGenerateDocument}
              disabled={isGenerating || !rawContent.trim()}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer ${
                isGenerating || !rawContent.trim()
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-70'
                  : 'bg-blue-500 hover:bg-blue-400 text-white hover:shadow-md active:scale-[0.99]'
              }`}
            >
              {isGenerating ? (
                <>
                  <Clock className="w-4 h-4 animate-spin text-white" />
                  <span>Populating Document...</span>
                </>
              ) : (
                <>
                  <span>Populate & Generate Preview</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {isGenerating && (
              <p className="text-2xs text-center text-blue-200 mt-2.5 animate-pulse">
                {generationStepMessage || 'Analyzing sections & generating Word document...'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
