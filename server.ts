import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { SAMPLE_TEMPLATES, SAMPLE_OPTIONS } from './server/sampleTemplates.js';
import { parseUploadedDocx } from './server/templateParser.js';
import { analyzeTemplateWithGemini, populateDocumentWithGemini } from './server/geminiService.js';
import { generateDocxBuffer } from './server/docxGenerator.js';
import { PopulatedDocument, TemplateAnalysis } from './src/types.js';


function getErrorHttpStatus(error: any): number {
  const status = Number(error?.status);
  return Number.isInteger(status) && status >= 400 && status <= 599 ? status : 500;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for large base64 file payloads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      geminiModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    });
  });

  // 1. Get List of Sample Templates
  app.get('/api/sample-templates', (req, res) => {
    res.json({
      samples: SAMPLE_OPTIONS,
      templates: SAMPLE_TEMPLATES,
    });
  });

  // 2. Download a sample template as a real .docx file
  app.get('/api/download-sample-template/:id', async (req, res) => {
    try {
      const templateId = req.params.id;
      const template = SAMPLE_TEMPLATES[templateId];
      if (!template) {
        return res.status(404).json({ error: 'Sample template not found' });
      }

      // Convert template into a PopulatedDocument representation
      const mockDoc: PopulatedDocument = {
        id: `template-${templateId}`,
        title: template.title,
        subtitle: `[TEMPLATE SPECIFICATION: ${template.documentCategory.toUpperCase()}]`,
        metadata: {
          Template_Type: template.documentCategory,
          Formatting_Font: template.styling.fontFamily,
          Theme_Color: template.styling.primaryColor,
          Status: 'MASTER TEMPLATE',
        },
        sections: template.sections.map((s) => ({
          id: s.id,
          heading: s.heading,
          type: s.type,
          content: s.originalContent,
          tableData: s.tableSchema ? { headers: s.tableSchema.headers, rows: s.tableSchema.sampleRows || [] } : undefined,
          calloutText: s.type === 'callout' ? s.originalContent : undefined,
          signatures: s.type === 'signatures' ? [
            { label: 'Authorized Client Signatory', name: '[Client Name]', title: '[Client Title]' },
            { label: 'Authorized Vendor Signatory', name: '[Vendor Name]', title: '[Vendor Title]' },
          ] : undefined,
        })),
        styling: template.styling,
        diffHighlights: [],
        generationNotes: 'Master source template with placeholders and layout guidelines.',
        docxFileName: template.fileName || `${templateId}_Template.docx`,
        timestamp: new Date().toISOString(),
      };

      const buffer = await generateDocxBuffer(mockDoc);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${template.fileName || `${templateId}_Template.docx`}"`);
      res.send(buffer);
    } catch (err: any) {
      console.error('Error downloading sample template:', err);
      res.status(500).json({ error: err.message || 'Failed to download sample template' });
    }
  });

  // 3. Analyze uploaded Word Document template or preset
  app.post('/api/analyze-template', async (req, res) => {
    try {
      const { templateBase64, fileName, sampleId } = req.body;

      if (sampleId && SAMPLE_TEMPLATES[sampleId]) {
        return res.json({
          success: true,
          template: SAMPLE_TEMPLATES[sampleId],
        });
      }

      if (!templateBase64) {
        return res.status(400).json({ error: 'No template provided. Please upload a .docx file or pick a sample.' });
      }

      const buffer = Buffer.from(templateBase64, 'base64');
      const { text, html, detectedStyling } = await parseUploadedDocx(buffer);

      // Call Gemini to memorize structure and analyze styling
      const analysis = await analyzeTemplateWithGemini(
        text,
        html,
        detectedStyling,
        fileName || 'Uploaded_Template.docx'
      );

      res.json({
        success: true,
        template: analysis,
      });
    } catch (err: any) {
      console.error('Error analyzing template:', err);
      res.status(getErrorHttpStatus(err)).json({
        error: err.message || 'Failed to analyze template document',
      });
    }
  });

  // 4. Populate Document from Content & Memorized Template
  app.post('/api/generate-document', async (req, res) => {
    try {
      const { template, rawContent, instructions } = req.body;

      if (!template || !template.sections) {
        return res.status(400).json({ error: 'Missing template specification. Please analyze a template first.' });
      }

      if (!rawContent || !rawContent.trim()) {
        return res.status(400).json({ error: 'Please provide content in any form (raw notes, text, JSON, or uploaded file).' });
      }

      // 1. Synthesize with Gemini
      const populatedDoc = await populateDocumentWithGemini(template, rawContent, instructions);

      // 2. Generate actual .docx binary Buffer
      const docxBuffer = await generateDocxBuffer(populatedDoc);

      populatedDoc.docxBase64 = docxBuffer.toString('base64');

      res.json({
        success: true,
        document: populatedDoc,
      });
    } catch (err: any) {
      console.error('Error generating populated document:', err);
      res.status(getErrorHttpStatus(err)).json({
        error: err.message || 'Failed to populate document with provided content',
      });
    }
  });

  // 5. Re-export .docx from edited populated document model
  app.post('/api/export-docx', async (req, res) => {
    try {
      const { document: docData } = req.body;
      if (!docData) {
        return res.status(400).json({ error: 'No document data provided' });
      }

      const docxBuffer = await generateDocxBuffer(docData);
      res.json({
        success: true,
        docxBase64: docxBuffer.toString('base64'),
        fileName: docData.docxFileName || 'Populated_Document.docx',
      });
    } catch (err: any) {
      console.error('Error exporting docx:', err);
      res.status(500).json({ error: err.message || 'Failed to generate .docx' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DocuMorph AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
