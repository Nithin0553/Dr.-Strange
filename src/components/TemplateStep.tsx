import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  Palette,
  Type,
  Layout,
  Tag,
  Download,
  ArrowRight,
  Sparkles,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { TemplateAnalysis, SampleTemplateOption } from '../types.js';
import { readFileAsBase64 } from '../utils/fileHelpers.js';

interface TemplateStepProps {
  currentTemplate: TemplateAnalysis | null;
  onTemplateLoaded: (template: TemplateAnalysis) => void;
  sampleOptions: SampleTemplateOption[];
  onProceedToContent: () => void;
}

export const TemplateStep: React.FC<TemplateStepProps> = ({
  currentTemplate,
  onTemplateLoaded,
  sampleOptions,
  onProceedToContent,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingMessage, setAnalyzingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const file = e.dataTransfer.files[0];
      await processUploadedFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processUploadedFile(file);
    }
  };

  const processUploadedFile = async (file: File) => {
    if (!file.name.match(/\.(docx|doc|dotx)$/i)) {
      setErrorMessage('Please upload a Word Document (.docx or .dotx) template.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalyzingMessage(`Unpacking OpenXML archive & styles for "${file.name}"...`);

    try {
      const base64 = await readFileAsBase64(file);
      setAnalyzingMessage('Analyzing typography, layout, placeholders, and section structure with Gemini AI...');

      const response = await fetch('/api/analyze-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateBase64: base64,
          fileName: file.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze Word template.');
      }

      onTemplateLoaded(data.template);
    } catch (err: any) {
      console.error('Template upload error:', err);
      setErrorMessage(err.message || 'Error parsing the Word template.');
    } finally {
      setIsAnalyzing(false);
      setAnalyzingMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectSample = async (sampleId: string) => {
    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalyzingMessage('Loading pre-formatted Word template specification and memorizing layout rules...');

    try {
      const response = await fetch('/api/analyze-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load sample template.');
      }
      onTemplateLoaded(data.template);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading sample template.');
    } finally {
      setIsAnalyzing(false);
      setAnalyzingMessage('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Introduction Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium mb-3 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" /> Step 1: Template Ingestion & Analysis
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
            Upload Word Document Template
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Upload any source <code className="text-blue-300 bg-slate-800/80 px-1.5 py-0.5 rounded text-xs">.docx</code> file.
            Our engine inspects the OpenXML formatting, memorizes font families, heading scales, color schemes,
            table schemas, and placeholder tokens—guaranteeing exact layout fidelity when populating content.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error analyzing template</p>
            <p className="text-red-700 text-xs mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Loading State Overlay */}
      {isAnalyzing && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-8 text-center animate-pulse">
          <div className="w-12 h-12 mx-auto rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-md">
            <Layers className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-base font-semibold text-blue-900">Memorizing Word Template Blueprint</h3>
          <p className="text-xs text-blue-700 mt-1 max-w-md mx-auto">{analyzingMessage}</p>
        </div>
      )}

      {/* Memorized Template Blueprint (Shown when template is active) */}
      {currentTemplate && !isAnalyzing && (
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 text-base">{currentTemplate.title}</h3>
                  <span className="text-2xl" title="Ready">✓</span>
                </div>
                <p className="text-xs text-slate-500">
                  Category: <span className="font-medium text-slate-700">{currentTemplate.documentCategory}</span>
                  {currentTemplate.fileName && ` · Source: ${currentTemplate.fileName}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-reupload-template"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Change Template
              </button>
              <button
                id="btn-proceed-to-content"
                onClick={onProceedToContent}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-all cursor-pointer"
              >
                Continue to Content <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Blueprint Specs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-5">
            {/* Typography */}
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
                <Type className="w-3.5 h-3.5 text-blue-600" /> Typography DNA
              </div>
              <p className="text-xs text-slate-800 font-medium font-mono">
                Font: {currentTemplate.styling.fontFamily}
              </p>
              <p className="text-2xs text-slate-500 mt-1">
                H1: {currentTemplate.styling.heading1Size}pt · H2: {currentTemplate.styling.heading2Size}pt · Body: {currentTemplate.styling.bodySize}pt
              </p>
            </div>

            {/* Colors */}
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
                <Palette className="w-3.5 h-3.5 text-blue-600" /> Palette & Theme
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0"
                  style={{ backgroundColor: currentTemplate.styling.primaryColor }}
                  title={`Primary: ${currentTemplate.styling.primaryColor}`}
                />
                <span className="text-xs font-mono text-slate-800">{currentTemplate.styling.primaryColor}</span>
                <div
                  className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0 ml-2"
                  style={{ backgroundColor: currentTemplate.styling.accentColor }}
                  title={`Accent: ${currentTemplate.styling.accentColor}`}
                />
                <span className="text-xs font-mono text-slate-500">{currentTemplate.styling.accentColor}</span>
              </div>
            </div>

            {/* Layout & Structure */}
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
                <Layout className="w-3.5 h-3.5 text-blue-600" /> Section Layout
              </div>
              <p className="text-xs text-slate-800 font-medium">
                {currentTemplate.sections.length} Structural Sections
              </p>
              <p className="text-2xs text-slate-500 mt-1">
                {currentTemplate.styling.hasHeader ? '✓ Header' : 'No Header'} · {currentTemplate.styling.hasFooter ? '✓ Footer' : 'No Footer'}
              </p>
            </div>

            {/* Placeholders */}
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
                <Tag className="w-3.5 h-3.5 text-blue-600" /> Memorized Tokens
              </div>
              <p className="text-xs text-slate-800 font-medium">
                {currentTemplate.detectedPlaceholders.length} Dynamic Placeholders
              </p>
              <p className="text-2xs text-slate-500 mt-1 truncate" title={currentTemplate.detectedPlaceholders.join(', ')}>
                {currentTemplate.detectedPlaceholders.slice(0, 3).join(', ')}
                {currentTemplate.detectedPlaceholders.length > 3 ? '...' : ''}
              </p>
            </div>
          </div>

          {/* Section Blueprint Chips */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-600 mr-2">Memorized Section Flow:</span>
            <div className="inline-flex flex-wrap gap-1.5 mt-2">
              {currentTemplate.sections.map((sec, idx) => (
                <span
                  key={sec.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-2xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  <span className="text-slate-400 font-mono">{idx + 1}.</span> {sec.heading}
                  <span className="text-3xs uppercase tracking-wider bg-slate-200 text-slate-600 px-1 py-0.2 rounded">
                    {sec.type.replace('_', ' ')}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        id="template-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 scale-[1.005]'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.dotx,.doc"
          onChange={handleFileChange}
          className="hidden"
          id="template-file-input"
        />
        <div className="w-14 h-14 mx-auto rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-blue-600 mb-3">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          Drop your Word document (.docx) template here
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          or click to browse your computer. Supports Microsoft Word (.docx, .dotx) formatted templates.
        </p>
      </div>

      {/* Preset Word Templates Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Or Select a Pre-Formatted Word Template</h3>
            <p className="text-xs text-slate-500">
              Each preset contains genuine OpenXML layout, custom font styling, color schemes, and structured tables.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleOptions.map((sample) => {
            const isSelected = currentTemplate?.id === sample.id;
            return (
              <div
                key={sample.id}
                id={`sample-card-${sample.id}`}
                className={`group rounded-2xl border p-5 transition-all relative ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/30 shadow-xs ring-1 ring-blue-600/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full border border-white shadow-2xs shrink-0"
                      style={{ backgroundColor: sample.accentColor }}
                    />
                    <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      {sample.name}
                    </h4>
                  </div>
                  <span className="text-2xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {sample.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  {sample.description}
                </p>

                <div className="text-2xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 mb-4">
                  {sample.previewSnippet}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <a
                    href={`/api/download-sample-template/${sample.id}`}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-2xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                    title="Download this original .docx template to view in Microsoft Word"
                  >
                    <Download className="w-3 h-3" /> Download .docx Template
                  </a>

                  <button
                    id={`btn-use-template-${sample.id}`}
                    onClick={() => handleSelectSample(sample.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {isSelected ? 'Selected Template' : 'Use This Template'}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
