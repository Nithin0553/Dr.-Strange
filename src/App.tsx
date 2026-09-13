import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { TemplateStep } from './components/TemplateStep.js';
import { ContentStep } from './components/ContentStep.js';
import { DocumentPreview } from './components/DocumentPreview.js';
import { TemplateAnalysis, PopulatedDocument, SampleTemplateOption } from './types.js';
import { AlertCircle, RefreshCw, FileText } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentTemplate, setCurrentTemplate] = useState<TemplateAnalysis | null>(null);
  const [rawContent, setRawContent] = useState<string>('');
  const [userInstructions, setUserInstructions] = useState<string>('');
  const [populatedDocument, setPopulatedDocument] = useState<PopulatedDocument | null>(null);
  const [sampleOptions, setSampleOptions] = useState<SampleTemplateOption[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStepMessage, setGenerationStepMessage] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Fetch sample templates on mount
  useEffect(() => {
    async function loadSamples() {
      try {
        const res = await fetch('/api/sample-templates');
        if (res.ok) {
          const data = await res.json();
          if (data.samples) {
            setSampleOptions(data.samples);
          }
        }
      } catch (err) {
        console.warn('Could not load sample templates from backend:', err);
      }
    }
    loadSamples();
  }, []);

  const handleTemplateLoaded = (template: TemplateAnalysis) => {
    setCurrentTemplate(template);
    setGlobalError(null);
    // If we already have a sample content matching this template, offer it
    setCurrentStep(2);
  };

  const handleGenerateDocument = async () => {
    if (!currentTemplate) {
      setGlobalError('Please select or upload a template first.');
      setCurrentStep(1);
      return;
    }
    if (!rawContent.trim()) {
      setGlobalError('Please provide content in any form before generating.');
      return;
    }

    setGlobalError(null);
    setIsGenerating(true);
    setGenerationStepMessage('Analyzing content & memorizing template structure with Gemini...');

    const timer1 = setTimeout(() => {
      setGenerationStepMessage('Synthesizing sections, matching tables, and replacing placeholders...');
    }, 1500);

    const timer2 = setTimeout(() => {
      setGenerationStepMessage('Building OpenXML Word (.docx) document with exact layout & styling...');
    }, 3500);

    try {
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: currentTemplate,
          rawContent,
          instructions: userInstructions,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to populate document.');
      }

      setPopulatedDocument(data.document);
      setCurrentStep(3); // Advance to preview
    } catch (err: any) {
      console.error('Generation error:', err);
      setGlobalError(err.message || 'Error populating document.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
      setGenerationStepMessage('');
    }
  };

  const handleUpdateDocument = async (updatedDoc: PopulatedDocument) => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: updatedDoc }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to re-generate .docx file.');
      }

      setPopulatedDocument({
        ...updatedDoc,
        docxBase64: data.docxBase64,
        docxFileName: data.fileName,
      });
    } catch (err: any) {
      console.error('Export error:', err);
      setGlobalError(err.message || 'Error updating document .docx binary.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetFlow = () => {
    if (window.confirm('Start a new document session? Your current progress will be reset.')) {
      setCurrentStep(1);
      setCurrentTemplate(null);
      setRawContent('');
      setUserInstructions('');
      setPopulatedDocument(null);
      setGlobalError(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* App Header */}
      <Header
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
        hasTemplate={Boolean(currentTemplate)}
        hasGeneratedDoc={Boolean(populatedDocument)}
      />

      {/* Main App Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Error Notice */}
        {globalError && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start justify-between gap-3 text-red-900 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Notice</p>
                <p className="text-red-700 mt-0.5">{globalError}</p>
              </div>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className="text-red-500 hover:text-red-800 text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Step 1: Word Document Template Uploader & Analyzer */}
        {currentStep === 1 && (
          <TemplateStep
            currentTemplate={currentTemplate}
            onTemplateLoaded={handleTemplateLoaded}
            sampleOptions={sampleOptions}
            onProceedToContent={() => setCurrentStep(2)}
          />
        )}

        {/* Step 2: Content Ingestion (Any format) */}
        {currentStep === 2 && currentTemplate && (
          <ContentStep
            currentTemplate={currentTemplate}
            rawContent={rawContent}
            onContentChange={setRawContent}
            userInstructions={userInstructions}
            onInstructionsChange={setUserInstructions}
            sampleOptions={sampleOptions}
            onBackToTemplate={() => setCurrentStep(1)}
            onGenerateDocument={handleGenerateDocument}
            isGenerating={isGenerating}
            generationStepMessage={generationStepMessage}
          />
        )}

        {/* Step 3: Interactive Word Preview & Diff Review */}
        {currentStep >= 3 && populatedDocument && currentTemplate && (
          <DocumentPreview
            document={populatedDocument}
            template={currentTemplate}
            onUpdateDocument={handleUpdateDocument}
            onBackToEditContent={() => setCurrentStep(2)}
            isExporting={isExporting}
          />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            DocuMorph AI · Analyzes Word templates and preserves OpenXML typography, tables, and layouts
          </span>
          <div className="flex items-center gap-3">
            {currentTemplate && (
              <button
                onClick={handleResetFlow}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> New Session
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
