import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  convertInchesToTwip,
} from 'docx';
import { PopulatedDocument, PopulatedSection, TemplateStyling } from '../src/types.js';

function cleanHex(color?: string, fallback = '1e3a8a'): string {
  if (!color) return fallback;
  return color.replace(/^#/, '').trim();
}

export async function generateDocxBuffer(docData: PopulatedDocument): Promise<Buffer> {
  const styling = docData.styling || {
    fontFamily: 'Calibri',
    primaryColor: '#1e3a8a',
    secondaryColor: '#334155',
    accentColor: '#2563eb',
    backgroundColor: '#ffffff',
    heading1Size: 18,
    heading2Size: 13,
    bodySize: 11,
    lineSpacing: 1.25,
    hasHeader: true,
    headerText: 'CONFIDENTIAL',
    hasFooter: true,
    footerText: 'Page {page} | Generated with DocuMorph',
  };

  const font = styling.fontFamily || 'Calibri';
  const primaryHex = cleanHex(styling.primaryColor, '1e3a8a');
  const secondaryHex = cleanHex(styling.secondaryColor, '334155');
  const accentHex = cleanHex(styling.accentColor, '2563eb');
  const lightBgHex = 'f8fafc';
  const borderHex = 'cbd5e1';

  // In docx font sizes are in half-points (e.g. 11pt = 22, 18pt = 36)
  const titleSize = (styling.heading1Size || 18) * 2 + 4;
  const h1Size = (styling.heading1Size || 18) * 2;
  const h2Size = (styling.heading2Size || 13) * 2;
  const bodySize = (styling.bodySize || 11) * 2;
  const metaKeySize = (styling.bodySize || 11) * 2;
  const smallSize = Math.max(16, (styling.bodySize || 11) * 2 - 4);

  const documentChildren: (Paragraph | Table)[] = [];

  // 1. Document Title
  documentChildren.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 200, after: 160 },
      children: [
        new TextRun({
          text: docData.title || 'Populated Document',
          font,
          size: titleSize,
          bold: true,
          color: primaryHex,
        }),
      ],
    })
  );

  if (docData.subtitle) {
    documentChildren.push(
      new Paragraph({
        spacing: { before: 0, after: 240 },
        children: [
          new TextRun({
            text: docData.subtitle,
            font,
            size: h2Size,
            color: secondaryHex,
            italics: true,
          }),
        ],
      })
    );
  }

  // 2. Document Metadata (if any)
  if (docData.metadata && Object.keys(docData.metadata).length > 0) {
    const metaEntries = Object.entries(docData.metadata);
    const metaRows = metaEntries.map(([key, value]) => {
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            shading: { type: ShadingType.CLEAR, fill: lightBgHex },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: borderHex },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: borderHex },
              left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: key.replace(/_/g, ' ').toUpperCase(),
                    font,
                    size: metaKeySize - 2,
                    bold: true,
                    color: primaryHex,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: borderHex },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: borderHex },
              left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: String(value),
                    font,
                    size: bodySize,
                    color: '1f2937',
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    });

    documentChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: metaRows,
      })
    );

    documentChildren.push(
      new Paragraph({
        spacing: { before: 200, after: 200 },
        children: [],
      })
    );
  }

  // 3. Document Sections
  for (const section of docData.sections || []) {
    // Section Heading (unless title_block)
    if (section.type !== 'title_block' && section.heading) {
      documentChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 320, after: 120 },
          children: [
            new TextRun({
              text: section.heading,
              font,
              size: h1Size,
              bold: true,
              color: primaryHex,
            }),
          ],
        })
      );
    }

    if (section.type === 'metadata_grid' && section.content) {
      const lines = section.content.split('\n').filter(Boolean);
      for (const line of lines) {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join(':').trim();
          documentChildren.push(
            new Paragraph({
              spacing: { before: 40, after: 40 },
              children: [
                new TextRun({ text: `${key}: `, font, size: bodySize, bold: true, color: secondaryHex }),
                new TextRun({ text: val, font, size: bodySize, color: '1f2937' }),
              ],
            })
          );
        } else {
          documentChildren.push(
            new Paragraph({
              spacing: { before: 40, after: 40 },
              children: [new TextRun({ text: line, font, size: bodySize, color: '1f2937' })],
            })
          );
        }
      }
    } else if (section.type === 'paragraph' && section.content) {
      const paragraphs = section.content.split('\n\n').filter(Boolean);
      for (const p of paragraphs) {
        documentChildren.push(
          new Paragraph({
            spacing: { before: 80, after: 140, line: 276 },
            children: [
              new TextRun({
                text: p.replace(/\n/g, ' '),
                font,
                size: bodySize,
                color: '334155',
              }),
            ],
          })
        );
      }
    } else if (section.type === 'bullet_list') {
      const items = section.items || (section.content ? section.content.split('\n').filter((l) => l.trim().length > 0) : []);
      for (const item of items) {
        const cleaned = item.replace(/^[-*•]\s*/, '');
        documentChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 40, after: 60, line: 260 },
            children: [
              new TextRun({
                text: cleaned,
                font,
                size: bodySize,
                color: '334155',
              }),
            ],
          })
        );
      }
    } else if (section.type === 'callout') {
      const text = section.calloutText || section.content || '';
      documentChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  margins: { top: 140, bottom: 140, left: 180, right: 180 },
                  shading: { type: ShadingType.CLEAR, fill: 'f0f9ff' },
                  borders: {
                    left: { style: BorderStyle.SINGLE, size: 24, color: accentHex },
                    top: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
                    right: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: 'NOTE: ',
                          font,
                          size: bodySize,
                          bold: true,
                          color: primaryHex,
                        }),
                        new TextRun({
                          text,
                          font,
                          size: bodySize,
                          color: '1e293b',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
      documentChildren.push(new Paragraph({ spacing: { before: 120, after: 120 }, children: [] }));
    } else if (section.type === 'table' && section.tableData) {
      const { headers, rows } = section.tableData;
      const colCount = Math.max(headers.length, 1);
      const colWidthPercent = Math.floor(100 / colCount);

      const tableRows: TableRow[] = [];

      // Header Row
      if (headers && headers.length > 0) {
        tableRows.push(
          new TableRow({
            tableHeader: true,
            children: headers.map((h) => {
              return new TableCell({
                width: { size: colWidthPercent, type: WidthType.PERCENTAGE },
                margins: { top: 120, bottom: 120, left: 120, right: 120 },
                shading: { type: ShadingType.CLEAR, fill: primaryHex },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: primaryHex },
                  bottom: { style: BorderStyle.SINGLE, size: 2, color: primaryHex },
                  left: { style: BorderStyle.SINGLE, size: 1, color: primaryHex },
                  right: { style: BorderStyle.SINGLE, size: 1, color: primaryHex },
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.LEFT,
                    children: [
                      new TextRun({
                        text: h,
                        font,
                        size: smallSize + 1,
                        bold: true,
                        color: 'ffffff',
                      }),
                    ],
                  }),
                ],
              });
            }),
          })
        );
      }

      // Data Rows
      for (let rIdx = 0; rIdx < rows.length; rIdx++) {
        const row = rows[rIdx];
        const isEven = rIdx % 2 === 0;
        tableRows.push(
          new TableRow({
            children: row.map((cell) => {
              return new TableCell({
                width: { size: colWidthPercent, type: WidthType.PERCENTAGE },
                margins: { top: 100, bottom: 100, left: 120, right: 120 },
                shading: { type: ShadingType.CLEAR, fill: isEven ? 'ffffff' : lightBgHex },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: borderHex },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: borderHex },
                  left: { style: BorderStyle.SINGLE, size: 1, color: borderHex },
                  right: { style: BorderStyle.SINGLE, size: 1, color: borderHex },
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: String(cell),
                        font,
                        size: bodySize - 2,
                        color: '334155',
                      }),
                    ],
                  }),
                ],
              });
            }),
          })
        );
      }

      documentChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows,
        })
      );

      documentChildren.push(new Paragraph({ spacing: { before: 160, after: 160 }, children: [] }));
    } else if (section.type === 'signatures') {
      const signatures = section.signatures || [
        { label: 'Authorized Client Signature', name: '[Client Signer]', title: 'Vice President' },
        { label: 'Authorized Vendor Signature', name: '[Vendor Signer]', title: 'Managing Partner' },
      ];

      const sigCells = signatures.map((sig) => {
        return new TableCell({
          width: { size: Math.floor(100 / Math.max(1, signatures.length)), type: WidthType.PERCENTAGE },
          margins: { top: 180, bottom: 180, left: 120, right: 120 },
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          },
          children: [
            new Paragraph({
              spacing: { after: 80 },
              children: [
                new TextRun({
                  text: sig.label,
                  font,
                  size: smallSize,
                  bold: true,
                  color: primaryHex,
                }),
              ],
            }),
            new Paragraph({
              spacing: { before: 240, after: 60 },
              children: [
                new TextRun({
                  text: '______________________________________',
                  font,
                  size: smallSize,
                  color: '94a3b8',
                }),
              ],
            }),
            new Paragraph({
              spacing: { after: 30 },
              children: [
                new TextRun({
                  text: `Name: ${sig.name}`,
                  font,
                  size: bodySize - 2,
                  bold: true,
                  color: '1e293b',
                }),
              ],
            }),
            new Paragraph({
              spacing: { after: 30 },
              children: [
                new TextRun({
                  text: `Title: ${sig.title}`,
                  font,
                  size: bodySize - 2,
                  color: secondaryHex,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Date: ${sig.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
                  font,
                  size: smallSize,
                  color: '64748b',
                }),
              ],
            }),
          ],
        });
      });

      documentChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [new TableRow({ children: sigCells })],
        })
      );
    }
  }

  // Create Header and Footer
  const docHeader = styling.hasHeader
    ? new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: styling.headerText || 'CONFIDENTIAL',
                font,
                size: 16,
                color: '94a3b8',
              }),
            ],
          }),
        ],
      })
    : undefined;

  const docFooter = styling.hasFooter
    ? new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: styling.footerText ? styling.footerText.replace('{page}', '') : 'Document generated via DocuMorph AI | Page ',
                font,
                size: 16,
                color: '94a3b8',
              }),
              new TextRun({
                children: [PageNumber.CURRENT],
                font,
                size: 16,
                color: '94a3b8',
              }),
              new TextRun({
                text: ' of ',
                font,
                size: 16,
                color: '94a3b8',
              }),
              new TextRun({
                children: [PageNumber.TOTAL_PAGES],
                font,
                size: 16,
                color: '94a3b8',
              }),
            ],
          }),
        ],
      })
    : undefined;

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font,
            size: bodySize,
            color: '334155',
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        headers: docHeader ? { default: docHeader } : undefined,
        footers: docFooter ? { default: docFooter } : undefined,
        children: documentChildren,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
