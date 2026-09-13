import mammoth from 'mammoth';
import JSZip from 'jszip';
import { TemplateStyling } from '../src/types.js';

export interface ExtractedDocxData {
  text: string;
  html: string;
  detectedStyling: Partial<TemplateStyling>;
  rawXmlPreview?: string;
}

export async function parseUploadedDocx(buffer: Buffer): Promise<ExtractedDocxData> {
  // 1. Mammoth text & HTML conversion
  const [textResult, htmlResult] = await Promise.all([
    mammoth.extractRawText({ buffer }),
    mammoth.convertToHtml({ buffer }),
  ]);

  const extractedText = textResult.value || '';
  const extractedHtml = htmlResult.value || '';

  // 2. OpenXML Inspection with JSZip
  const detectedStyling: Partial<TemplateStyling> = {
    fontFamily: 'Calibri',
    primaryColor: '#1e3a8a',
    secondaryColor: '#475569',
    accentColor: '#2563eb',
    backgroundColor: '#ffffff',
    heading1Size: 18,
    heading2Size: 13,
    bodySize: 11,
    lineSpacing: 1.25,
    hasHeader: false,
    hasFooter: false,
  };

  try {
    const zip = await JSZip.loadAsync(buffer);

    // Check styles.xml for font and colors
    const stylesXmlFile = zip.file('word/styles.xml');
    if (stylesXmlFile) {
      const stylesXml = await stylesXmlFile.async('text');

      // Detect font family (e.g. w:ascii="Calibri" or w:ascii="Arial")
      const fontMatch = stylesXml.match(/w:rFonts[^>]*w:ascii="([^"]+)"/);
      if (fontMatch && fontMatch[1]) {
        detectedStyling.fontFamily = fontMatch[1];
      }

      // Detect hex colors in styles (e.g. w:color w:val="1E3A8A")
      const colorMatches = stylesXml.match(/w:color[^>]*w:val="([A-Fa-f0-9]{6})"/g);
      if (colorMatches && colorMatches.length > 0) {
        const foundColors = colorMatches
          .map((m) => {
            const hexMatch = m.match(/w:val="([A-Fa-f0-9]{6})"/);
            return hexMatch ? `#${hexMatch[1]}` : null;
          })
          .filter((c): c is string => Boolean(c) && c !== '#000000' && c !== '#FFFFFF');

        if (foundColors.length > 0) {
          detectedStyling.primaryColor = foundColors[0];
          if (foundColors.length > 1) {
            detectedStyling.accentColor = foundColors[1];
          }
        }
      }
    }

    // Check header and footer
    const headerFile = zip.file('word/header1.xml');
    if (headerFile) {
      detectedStyling.hasHeader = true;
      const headerXml = await headerFile.async('text');
      const textMatches = headerXml.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
      if (textMatches) {
        detectedStyling.headerText = textMatches
          .map((m) => m.replace(/<[^>]+>/g, ''))
          .join(' ')
          .trim();
      }
    }

    const footerFile = zip.file('word/footer1.xml');
    if (footerFile) {
      detectedStyling.hasFooter = true;
      const footerXml = await footerFile.async('text');
      const textMatches = footerXml.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
      if (textMatches) {
        detectedStyling.footerText = textMatches
          .map((m) => m.replace(/<[^>]+>/g, ''))
          .join(' ')
          .trim();
      }
    }
  } catch (err) {
    console.warn('Could not parse OpenXML zip metadata, using fallback defaults:', err);
  }

  return {
    text: extractedText,
    html: extractedHtml,
    detectedStyling,
  };
}
