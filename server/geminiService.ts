import { GoogleGenAI, Type } from '@google/genai';
import { TemplateAnalysis, PopulatedDocument, TemplateStyling } from '../src/types.js';

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}


const DEFAULT_GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
];

const RETRYABLE_GEMINI_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS_PER_MODEL = 2;
const BASE_RETRY_DELAY_MS = 800;

function getGeminiModelCandidates(): string[] {
  const primaryModel = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODELS[0];
  const configuredFallbacks = process.env.GEMINI_FALLBACK_MODELS
    ?.split(',')
    .map((model) => model.trim())
    .filter(Boolean);

  const fallbackModels =
    configuredFallbacks && configuredFallbacks.length > 0
      ? configuredFallbacks
      : DEFAULT_GEMINI_MODELS.slice(1);

  return [...new Set([primaryModel, ...fallbackModels])];
}

function getGeminiErrorStatus(error: any): number | undefined {
  if (typeof error?.status === 'number') {
    return error.status;
  }

  if (typeof error?.code === 'number') {
    return error.code;
  }

  const message = String(error?.message || '');
  const codeMatch = message.match(/"code"\s*:\s*(\d{3})/);
  return codeMatch ? Number(codeMatch[1]) : undefined;
}

function isRetryableGeminiError(error: any): boolean {
  const status = getGeminiErrorStatus(error);
  if (status && RETRYABLE_GEMINI_STATUS_CODES.has(status)) {
    return true;
  }

  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('high demand') ||
    message.includes('temporarily unavailable') ||
    message.includes('unavailable') ||
    message.includes('resource_exhausted') ||
    message.includes('rate limit')
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateContentWithResilience(ai: GoogleGenAI, request: any) {
  const models = getGeminiModelCandidates();
  let lastError: any;

  for (let modelIndex = 0; modelIndex < models.length; modelIndex += 1) {
    const model = models[modelIndex];

    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt += 1) {
      try {
        return await ai.models.generateContent({
          ...request,
          model,
        });
      } catch (error: any) {
        lastError = error;

        if (!isRetryableGeminiError(error)) {
          throw error;
        }

        const status = getGeminiErrorStatus(error);
        console.warn(
          `[Gemini] ${model} attempt ${attempt}/${MAX_ATTEMPTS_PER_MODEL} failed${status ? ` (HTTP ${status})` : ''}.`
        );

        if (attempt < MAX_ATTEMPTS_PER_MODEL) {
          await sleep(BASE_RETRY_DELAY_MS * 2 ** (attempt - 1));
        }
      }
    }

    if (modelIndex < models.length - 1) {
      console.warn(`[Gemini] Falling back from ${model} to ${models[modelIndex + 1]}.`);
    }
  }

  const status = getGeminiErrorStatus(lastError) || 503;
  const friendlyError: any = new Error(
    'Gemini is temporarily busy after automatic retries and fallback attempts. Please try again in a minute.'
  );
  friendlyError.status = status;
  throw friendlyError;
}

export async function analyzeTemplateWithGemini(
  text: string,
  html: string,
  detectedStyling: Partial<TemplateStyling>,
  fileName: string
): Promise<TemplateAnalysis> {
  const ai = getGenAI();

  const prompt = `
You are an expert Document Template Architect.
Analyze the following Word Document template extracted text and HTML.
Memorize and dissect its exact layout, formatting, styling conventions, typography, placeholder fields, section structures, and tables.

File Name: ${fileName}
Detected Font: ${detectedStyling.fontFamily || 'Calibri'}
Detected Primary Color: ${detectedStyling.primaryColor || '#1e3a8a'}

Extracted Document Text:
---
${text.slice(0, 10000)}
---

Extracted Document HTML Snippet:
---
${html.slice(0, 5000)}
---

Provide a comprehensive, highly accurate JSON analysis representing the template blueprint.
Identify:
1. The title of the template.
2. Short description and document category (e.g., Business Proposals, Legal & Contracts, Executive Memo, Financial Reports, etc.).
3. Styling rules: font family, primary accent color (hex), secondary color (hex), heading sizes, header/footer text.
4. All discrete sections (title_block, metadata_grid, paragraph, bullet_list, table, callout, signatures).
5. All placeholders found (e.g., [Client Name], <Date>, [Company], etc.).
6. For any tables found, extract column headers and sample row structure.
`;

  const response = await generateContentWithResilience(ai, {
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          documentCategory: { type: Type.STRING },
          styling: {
            type: Type.OBJECT,
            properties: {
              fontFamily: { type: Type.STRING },
              primaryColor: { type: Type.STRING },
              secondaryColor: { type: Type.STRING },
              accentColor: { type: Type.STRING },
              backgroundColor: { type: Type.STRING },
              heading1Size: { type: Type.NUMBER },
              heading2Size: { type: Type.NUMBER },
              bodySize: { type: Type.NUMBER },
              lineSpacing: { type: Type.NUMBER },
              hasHeader: { type: Type.BOOLEAN },
              headerText: { type: Type.STRING },
              hasFooter: { type: Type.BOOLEAN },
              footerText: { type: Type.STRING },
            },
            required: ['fontFamily', 'primaryColor', 'secondaryColor', 'heading1Size', 'heading2Size', 'bodySize'],
          },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                heading: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['title_block', 'metadata_grid', 'paragraph', 'bullet_list', 'table', 'callout', 'signatures'] },
                originalContent: { type: Type.STRING },
                placeholders: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.STRING },
                tableSchema: {
                  type: Type.OBJECT,
                  properties: {
                    headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    sampleRows: {
                      type: Type.ARRAY,
                      items: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                  },
                },
              },
              required: ['id', 'heading', 'type', 'originalContent', 'placeholders'],
            },
          },
          detectedPlaceholders: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['title', 'description', 'documentCategory', 'styling', 'sections', 'detectedPlaceholders'],
      },
    },
  });

  const parsed = JSON.parse(response.text || '{}');

  return {
    id: `template-${Date.now()}`,
    title: parsed.title || 'Extracted Document Template',
    description: parsed.description || 'Custom Word document template',
    documentCategory: parsed.documentCategory || 'General Document',
    fileName,
    styling: {
      fontFamily: parsed.styling?.fontFamily || detectedStyling.fontFamily || 'Calibri',
      primaryColor: parsed.styling?.primaryColor || detectedStyling.primaryColor || '#1e3a8a',
      secondaryColor: parsed.styling?.secondaryColor || detectedStyling.secondaryColor || '#475569',
      accentColor: parsed.styling?.accentColor || detectedStyling.accentColor || '#2563eb',
      backgroundColor: '#ffffff',
      heading1Size: parsed.styling?.heading1Size || 18,
      heading2Size: parsed.styling?.heading2Size || 13,
      bodySize: parsed.styling?.bodySize || 11,
      lineSpacing: parsed.styling?.lineSpacing || 1.25,
      hasHeader: parsed.styling?.hasHeader ?? detectedStyling.hasHeader ?? true,
      headerText: parsed.styling?.headerText || detectedStyling.headerText || 'CONFIDENTIAL',
      hasFooter: parsed.styling?.hasFooter ?? detectedStyling.hasFooter ?? true,
      footerText: parsed.styling?.footerText || detectedStyling.footerText || 'Page {page} | Generated with DocuMorph',
      pageMargins: { top: 1, bottom: 1, left: 1, right: 1 },
    },
    sections: parsed.sections || [],
    detectedPlaceholders: parsed.detectedPlaceholders || [],
    rawText: text,
    rawHtml: html,
  };
}

export async function populateDocumentWithGemini(
  template: TemplateAnalysis,
  rawContent: string,
  userInstructions?: string
): Promise<PopulatedDocument> {
  const ai = getGenAI();

  const prompt = `
You are an expert Executive Document Synthesizer.
Your goal is to populate a Word Document template using the provided user content while strictly preserving the template's layout, structure, formatting, styling conventions, and tone.

TEMPLATE SPECIFICATION:
Title: ${template.title}
Category: ${template.documentCategory}
Styling: Font: ${template.styling.fontFamily}, Primary: ${template.styling.primaryColor}, Accent: ${template.styling.accentColor}

TEMPLATE SECTIONS SCHEMA:
${JSON.stringify(template.sections, null, 2)}

DETECTED PLACEHOLDERS:
${JSON.stringify(template.detectedPlaceholders)}

RAW USER INPUT CONTENT (IN ANY FORM):
---
${rawContent}
---

${userInstructions ? `ADDITIONAL USER INSTRUCTIONS:\n${userInstructions}\n` : ''}

INSTRUCTIONS FOR SYNTHESIS:
1. Take every section from the template sections schema. Populate it with real, structured information extracted or synthesized from the raw user content.
2. For tables: Populate tableData with headers matching the template schema and rows filled with the specific deliverables, milestones, prices, or line items given in the user input.
3. For bullet lists: Provide items array with crisp, professional bullets matching the template's style.
4. For metadata grids: Provide formatted key-value pairs (e.g. Prepared For, Prepared By, Date, Project Code).
5. For paragraphs: Synthesize the input facts into polished corporate prose matching the template's tone and paragraph structure.
6. For callouts: Formulate the notice/disclaimer/warning relevant to the content.
7. For signatures: Extract signer names and titles from the input if present, or format realistic authorized signatory placeholders based on the organizations involved.
8. Maintain strict adherence to the facts provided in the raw content; do not invent fictional metrics or conflicting details.
9. Provide "diffHighlights" listing each major field/section populated, what source input was used, and the action taken.
`;

  const response = await generateContentWithResilience(ai, {
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          metadata: {
            type: Type.OBJECT,
            description: 'Key-value map of document metadata such as Client, Vendor, Date, Version, Status',
          },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                heading: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['title_block', 'metadata_grid', 'paragraph', 'bullet_list', 'table', 'callout', 'signatures'] },
                content: { type: Type.STRING },
                items: { type: Type.ARRAY, items: { type: Type.STRING } },
                tableData: {
                  type: Type.OBJECT,
                  properties: {
                    headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    rows: {
                      type: Type.ARRAY,
                      items: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                  },
                  required: ['headers', 'rows'],
                },
                calloutText: { type: Type.STRING },
                signatures: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      name: { type: Type.STRING },
                      title: { type: Type.STRING },
                      date: { type: Type.STRING },
                    },
                    required: ['label', 'name', 'title'],
                  },
                },
              },
              required: ['id', 'heading', 'type'],
            },
          },
          diffHighlights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                fieldOrSection: { type: Type.STRING },
                sourceFromInput: { type: Type.STRING },
                populatedValue: { type: Type.STRING },
                action: { type: Type.STRING, enum: ['replaced_placeholder', 'synthesized_section', 'populated_table', 'preserved_boilerplate'] },
              },
              required: ['fieldOrSection', 'sourceFromInput', 'populatedValue', 'action'],
            },
          },
          generationNotes: { type: Type.STRING },
        },
        required: ['title', 'sections', 'diffHighlights', 'generationNotes'],
      },
    },
  });

  const parsed = JSON.parse(response.text || '{}');

  const sanitizedFileName = (parsed.title || template.title || 'Populated_Document')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 40) + '.docx';

  return {
    id: `doc-${Date.now()}`,
    title: parsed.title || template.title,
    subtitle: parsed.subtitle,
    metadata: parsed.metadata || {},
    sections: parsed.sections || [],
    styling: template.styling,
    diffHighlights: parsed.diffHighlights || [],
    generationNotes: parsed.generationNotes || 'Document successfully generated while preserving original template styling and layout.',
    docxFileName: sanitizedFileName,
    timestamp: new Date().toISOString(),
  };
}
