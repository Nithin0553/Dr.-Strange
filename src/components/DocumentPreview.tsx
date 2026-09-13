import React, { useState } from 'react';
import {
  Download,
  FileCheck,
  Edit3,
  Check,
  Eye,
  Columns,
  ListFilter,
  Save,
  RotateCcw,
  Sparkles,
  Copy,
  FileCode,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { PopulatedDocument, PopulatedSection, TemplateAnalysis } from '../types.js';
import { downloadBase64File, downloadTextFile } from '../utils/fileHelpers.js';

interface DocumentPreviewProps {
  document: PopulatedDocument;
  template: TemplateAnalysis;
  onUpdateDocument: (updated: PopulatedDocument) => Promise<void>;
  onBackToEditContent: () => void;
  isExporting: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document: initialDoc,
  template,
  onUpdateDocument,
  onBackToEditContent,
  isExporting,
}) => {
  const [docState, setDocState] = useState<PopulatedDocument>(initialDoc);
  const [activeTab, setActiveTab] = useState<'preview' | 'diff' | 'compare'>('preview');
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const styling = docState.styling;
  const primaryColor = styling.primaryColor || '#1e3a8a';
  const secondaryColor = styling.secondaryColor || '#334155';
  const accentColor = styling.accentColor || '#2563eb';
  const fontFamily = styling.fontFamily || 'Calibri, sans-serif';

  // Handling downloads
  const handleDownloadDocx = () => {
    if (docState.docxBase64) {
      downloadBase64File(
        docState.docxBase64,
        docState.docxFileName || 'Populated_Document.docx'
      );
    }
  };

  const handleDownloadHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docState.title}</title>
  <style>
    body { font-family: ${fontFamily}; margin: 40px auto; max-width: 800px; color: #1e293b; line-height: 1.6; }
    h1 { color: ${primaryColor}; font-size: 24pt; border-bottom: 2px solid ${accentColor}; padding-bottom: 8px; }
    h2 { color: ${primaryColor}; font-size: 16pt; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: ${primaryColor}; color: white; padding: 10px; text-align: left; }
    td { border: 1px solid #e2e8f0; padding: 8px 10px; }
    tr:nth-child(even) { background: #f8fafc; }
    .callout { border-left: 4px solid ${accentColor}; background: #f0f9ff; padding: 12px 16px; margin: 16px 0; }
  </style>
</head>
<body>
  <h1>${docState.title}</h1>
  ${docState.subtitle ? `<h3>${docState.subtitle}</h3>` : ''}
  ${docState.sections.map((sec) => `
    <div>
      <h2>${sec.heading}</h2>
      ${sec.content ? `<p>${sec.content.replace(/\n/g, '<br>')}</p>` : ''}
      ${sec.items ? `<ul>${sec.items.map((i) => `<li>${i}</li>`).join('')}</ul>` : ''}
      ${sec.tableData ? `
        <table>
          <thead><tr>${sec.tableData.headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${sec.tableData.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      ` : ''}
      ${sec.calloutText ? `<div class="callout">${sec.calloutText}</div>` : ''}
    </div>
  `).join('')}
</body>
</html>
    `;
    downloadTextFile(htmlContent, `${docState.docxFileName?.replace('.docx', '') || 'document'}.html`, 'text/html');
  };

  const handleCopyText = () => {
    let fullText = `${docState.title}\n${docState.subtitle || ''}\n\n`;
    for (const sec of docState.sections) {
      fullText += `## ${sec.heading}\n`;
      if (sec.content) fullText += `${sec.content}\n\n`;
      if (sec.items) fullText += `${sec.items.map((i) => `• ${i}`).join('\n')}\n\n`;
      if (sec.tableData) {
        fullText += `${sec.tableData.headers.join(' | ')}\n`;
        fullText += `${sec.tableData.rows.map((r) => r.join(' | ')).join('\n')}\n\n`;
      }
      if (sec.calloutText) fullText += `[NOTE: ${sec.calloutText}]\n\n`;
    }
    navigator.clipboard.writeText(fullText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSaveEdits = async () => {
    await onUpdateDocument(docState);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  // Section editing helpers
  const handleSectionContentChange = (sectionId: string, newContent: string) => {
    setDocState((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, content: newContent } : s)),
    }));
    setHasUnsavedChanges(true);
  };

  const handleTableCellChange = (sectionId: string, rIdx: number, cIdx: number, val: string) => {
    setDocState((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== sectionId || !s.tableData) return s;
        const newRows = [...s.tableData.rows.map((r) => [...r])];
        if (newRows[rIdx]) {
          newRows[rIdx][cIdx] = val;
        }
        return {
          ...s,
          tableData: { ...s.tableData, rows: newRows },
        };
      }),
    }));
    setHasUnsavedChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-1 border border-emerald-200">
            <FileCheck className="w-3.5 h-3.5" /> Step 3: Review Accuracy & Download
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Word Document Preview
          </h2>
          <p className="text-xs text-slate-500">
            Rendered with authentic <span className="font-semibold text-slate-800">{styling.fontFamily}</span> typography,
            page margins, and <span className="font-semibold text-slate-800">{primaryColor}</span> theme accents.
          </p>
        </div>

        {/* Primary Download Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-back-to-input"
            onClick={onBackToEditContent}
            className="px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Edit Content
          </button>

          {isEditing ? (
            <button
              id="btn-save-inline-edits"
              onClick={handleSaveEdits}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Updating .docx...' : 'Save Changes'}</span>
            </button>
          ) : (
            <button
              id="btn-toggle-inline-edit"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Edit Document</span>
            </button>
          )}

          <button
            id="btn-download-docx-main"
            onClick={handleDownloadDocx}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download Final .docx</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 rounded-xl shadow-2xs">
        <div className="flex items-center gap-1">
          <button
            id="tab-page-preview"
            onClick={() => setActiveTab('preview')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Word Document Page Replica</span>
          </button>

          <button
            id="tab-diff-audit"
            onClick={() => setActiveTab('diff')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'diff'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Changes & Accuracy Audit</span>
            {docState.diffHighlights.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-3xs font-mono">
                {docState.diffHighlights.length}
              </span>
            )}
          </button>

          <button
            id="tab-compare-view"
            onClick={() => setActiveTab('compare')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Template vs. Populated</span>
          </button>
        </div>

        {/* Secondary Export options */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            id="btn-copy-text"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1 text-2xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            title="Copy plain text"
          >
            {copiedText ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
          </button>
          <button
            id="btn-download-html"
            onClick={handleDownloadHtml}
            className="inline-flex items-center gap-1 text-2xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            title="Download as HTML"
          >
            <FileCode className="w-3 h-3" />
            <span>Export HTML</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Document Page Preview */}
      {activeTab === 'preview' && (
        <div className="flex justify-center p-2 sm:p-6 bg-slate-100/80 rounded-2xl border border-slate-200/80 overflow-x-auto">
          {/* Realistic Word 8.5" x 11" Paper Canvas */}
          <div
            id="word-document-canvas"
            className="w-full max-w-[850px] bg-white rounded-md shadow-lg border border-slate-200/90 p-8 sm:p-14 min-h-[1050px] transition-all relative"
            style={{
              fontFamily,
              color: '#334155',
              lineHeight: styling.lineSpacing || 1.25,
            }}
          >
            {/* Word Header */}
            {styling.hasHeader && (
              <div className="pb-4 mb-8 border-b border-slate-200 text-right text-3xs font-medium text-slate-400 uppercase tracking-wider">
                {styling.headerText || 'CONFIDENTIAL'}
              </div>
            )}

            {/* Document Title */}
            <div className="mb-6">
              {isEditing ? (
                <input
                  type="text"
                  value={docState.title}
                  onChange={(e) => {
                    setDocState({ ...docState, title: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full font-bold p-2 border border-blue-400 rounded-lg outline-hidden text-2xl"
                  style={{ color: primaryColor }}
                />
              ) : (
                <h1
                  className="font-bold tracking-tight text-2xl sm:text-3xl leading-tight"
                  style={{
                    color: primaryColor,
                    fontSize: `${styling.heading1Size || 18}pt`,
                  }}
                >
                  {docState.title}
                </h1>
              )}

              {docState.subtitle && (
                <p
                  className="mt-1.5 italic font-medium text-sm sm:text-base"
                  style={{ color: secondaryColor }}
                >
                  {docState.subtitle}
                </p>
              )}
            </div>

            {/* Document Metadata Table (if present) */}
            {docState.metadata && Object.keys(docState.metadata).length > 0 && (
              <div className="mb-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-50/70">
                <table className="w-full text-xs">
                  <tbody>
                    {Object.entries(docState.metadata).map(([key, val]) => (
                      <tr key={key} className="border-b border-slate-200 last:border-b-0">
                        <td
                          className="w-1/3 py-2 px-3 font-semibold uppercase tracking-wider text-2xs bg-slate-100/70"
                          style={{ color: primaryColor }}
                        >
                          {key.replace(/_/g, ' ')}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {String(val)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sections Flow */}
            <div className="space-y-7">
              {docState.sections.map((sec, secIdx) => (
                <section key={sec.id || secIdx} className="group relative">
                  {/* Section Heading */}
                  {sec.type !== 'title_block' && sec.heading && (
                    <h2
                      className="font-bold tracking-tight mb-2.5 pb-1 border-b"
                      style={{
                        color: primaryColor,
                        borderColor: `${primaryColor}25`,
                        fontSize: `${styling.heading2Size || 13}pt`,
                      }}
                    >
                      {sec.heading}
                    </h2>
                  )}

                  {/* 1. Paragraph */}
                  {sec.type === 'paragraph' && (
                    <div>
                      {isEditing ? (
                        <textarea
                          value={sec.content || ''}
                          onChange={(e) => handleSectionContentChange(sec.id, e.target.value)}
                          rows={4}
                          className="w-full text-xs font-mono p-3 border border-blue-400 rounded-lg outline-hidden bg-blue-50/20"
                        />
                      ) : (
                        <p
                          className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line"
                          style={{ fontSize: `${styling.bodySize || 11}pt` }}
                        >
                          {sec.content}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 2. Metadata Grid format */}
                  {sec.type === 'metadata_grid' && sec.content && (
                    <div className="rounded-lg p-3.5 bg-slate-50 border border-slate-200 text-xs space-y-1">
                      {sec.content.split('\n').map((line, lIdx) => (
                        <div key={lIdx} className="text-slate-800">
                          {line}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. Bullet List */}
                  {sec.type === 'bullet_list' && (
                    <ul className="space-y-1.5 pl-5 list-disc text-xs sm:text-sm text-slate-700">
                      {(sec.items || (sec.content ? sec.content.split('\n') : [])).map((item, iIdx) => (
                        <li key={iIdx} style={{ fontSize: `${styling.bodySize || 11}pt` }}>
                          {item.replace(/^[-*•]\s*/, '')}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* 4. Table */}
                  {sec.type === 'table' && sec.tableData && (
                    <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 shadow-2xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr style={{ backgroundColor: primaryColor, color: '#ffffff' }}>
                            {sec.tableData.headers.map((h, hIdx) => (
                              <th
                                key={hIdx}
                                className="py-2.5 px-3 font-semibold text-2xs uppercase tracking-wider"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {sec.tableData.rows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}
                            >
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="py-2.5 px-3 text-slate-700">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={cell}
                                      onChange={(e) => handleTableCellChange(sec.id, rIdx, cIdx, e.target.value)}
                                      className="w-full text-xs p-1 border border-blue-300 rounded bg-white outline-hidden"
                                    />
                                  ) : (
                                    <span>{cell}</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 5. Callout Box */}
                  {sec.type === 'callout' && (
                    <div
                      className="p-4 rounded-r-lg my-3 text-xs leading-relaxed bg-blue-50/60 border-y border-r border-slate-200"
                      style={{
                        borderLeftWidth: '4px',
                        borderLeftColor: accentColor,
                      }}
                    >
                      <strong className="uppercase font-semibold tracking-wider text-2xs mr-1" style={{ color: primaryColor }}>
                        Note:
                      </strong>{' '}
                      <span className="text-slate-800">{sec.calloutText || sec.content}</span>
                    </div>
                  )}

                  {/* 6. Signatures Block */}
                  {sec.type === 'signatures' && (
                    <div className="pt-6 mt-6 border-t border-slate-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                        {(sec.signatures || [
                          { label: 'Authorized Client Signatory', name: 'Client Executive', title: 'Vice President' },
                          { label: 'Authorized Vendor Signatory', name: 'Vendor Partner', title: 'Managing Director' },
                        ]).map((sig, sIdx) => (
                          <div key={sIdx} className="space-y-1">
                            <p className="font-semibold text-2xs uppercase tracking-wider" style={{ color: primaryColor }}>
                              {sig.label}
                            </p>
                            <div className="pt-8 pb-1 border-b border-slate-400 font-serif italic text-slate-400 text-sm">
                              [Signature]
                            </div>
                            <p className="font-bold text-slate-900 pt-1">Name: {sig.name}</p>
                            <p className="text-slate-600">Title: {sig.title}</p>
                            <p className="text-2xs text-slate-400">
                              Date: {sig.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Word Footer */}
            {styling.hasFooter && (
              <div className="pt-10 mt-14 border-t border-slate-200 text-center text-3xs font-medium text-slate-400">
                {styling.footerText || 'Page 1 of 1 · Generated with DocuMorph AI'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Changes & Accuracy Audit (Diff View) */}
      {activeTab === 'diff' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Accuracy & Transformation Audit
              </h3>
              <p className="text-xs text-slate-500">
                Detailed record of how your raw input facts were mapped into the Word template layout.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {docState.diffHighlights.length} Fields Verified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-2xs font-semibold">
                  <th className="py-2.5 px-3">Section / Field</th>
                  <th className="py-2.5 px-3">Source From Input</th>
                  <th className="py-2.5 px-3">Populated in Word Doc</th>
                  <th className="py-2.5 px-3">Fidelity Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docState.diffHighlights.map((diff, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {diff.fieldOrSection}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-2xs max-w-xs truncate" title={diff.sourceFromInput}>
                      {diff.sourceFromInput}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900 max-w-sm">
                      {diff.populatedValue}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-semibold uppercase tracking-wider ${
                          diff.action === 'replaced_placeholder'
                            ? 'bg-blue-100 text-blue-800'
                            : diff.action === 'populated_table'
                            ? 'bg-purple-100 text-purple-800'
                            : diff.action === 'synthesized_section'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {diff.action.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Notes */}
          {docState.generationNotes && (
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Synthesis Notes
              </span>
              <p className="text-slate-600">{docState.generationNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Side-by-Side Comparison */}
      {activeTab === 'compare' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Original Template Blueprint */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-3xs uppercase tracking-wider font-semibold text-slate-400">Original Source</span>
                <h4 className="text-sm font-bold text-slate-800">{template.title}</h4>
              </div>
              <span className="text-2xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                Template Placeholders
              </span>
            </div>

            <div className="space-y-4 text-xs font-mono max-h-[700px] overflow-y-auto pr-2">
              {template.sections.map((sec, i) => (
                <div key={sec.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-700 mb-1">{i + 1}. {sec.heading}</div>
                  <p className="text-slate-500 whitespace-pre-line text-2xs">{sec.originalContent}</p>
                  {sec.tableSchema && (
                    <div className="mt-2 text-2xs text-blue-700 bg-blue-50 p-1.5 rounded">
                      Table schema: {sec.tableSchema.headers.join(' | ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Populated Final Document */}
          <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs space-y-4 ring-1 ring-blue-500/10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-3xs uppercase tracking-wider font-semibold text-blue-600">Generated Output</span>
                <h4 className="text-sm font-bold text-slate-900">{docState.title}</h4>
              </div>
              <span className="text-2xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                ✓ Populated
              </span>
            </div>

            <div className="space-y-4 text-xs max-h-[700px] overflow-y-auto pr-2">
              {docState.sections.map((sec, i) => (
                <div key={sec.id} className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200">
                  <div className="font-bold text-slate-900 mb-1" style={{ color: primaryColor }}>
                    {i + 1}. {sec.heading}
                  </div>
                  {sec.content && <p className="text-slate-700 whitespace-pre-line">{sec.content}</p>}
                  {sec.items && (
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                      {sec.items.map((it, idx) => (
                        <li key={idx}>{it}</li>
                      ))}
                    </ul>
                  )}
                  {sec.tableData && (
                    <div className="mt-2 text-2xs bg-white p-2 rounded border border-emerald-100 overflow-x-auto">
                      <div className="font-semibold text-slate-800">{sec.tableData.headers.join(' | ')}</div>
                      {sec.tableData.rows.map((r, rIdx) => (
                        <div key={rIdx} className="text-slate-600">{r.join(' | ')}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Download Bar */}
      <div className="sticky bottom-4 z-20 bg-slate-900/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">
              {docState.docxFileName || 'Populated_Document.docx'}
            </p>
            <p className="text-2xs text-slate-400">
              Validated against source template ({styling.fontFamily} · {primaryColor})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadDocx}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download Final .docx</span>
          </button>
        </div>
      </div>
    </div>
  );
};
