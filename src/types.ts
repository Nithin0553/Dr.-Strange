export interface TemplateStyling {
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  heading1Size: number; // in pt
  heading2Size: number; // in pt
  bodySize: number;     // in pt
  lineSpacing: number;
  hasHeader: boolean;
  headerText?: string;
  hasFooter: boolean;
  footerText?: string;
  pageMargins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export type SectionType =
  | 'title_block'
  | 'metadata_grid'
  | 'paragraph'
  | 'bullet_list'
  | 'table'
  | 'callout'
  | 'signatures';

export interface TemplateSection {
  id: string;
  heading: string;
  type: SectionType;
  originalContent: string;
  placeholders: string[];
  instructions?: string;
  tableSchema?: {
    headers: string[];
    sampleRows?: string[][];
  };
}

export interface TemplateAnalysis {
  id: string;
  title: string;
  description: string;
  documentCategory: string;
  styling: TemplateStyling;
  sections: TemplateSection[];
  detectedPlaceholders: string[];
  rawText?: string;
  rawHtml?: string;
  fileName?: string;
}

export interface PopulatedSection {
  id: string;
  heading: string;
  type: SectionType;
  content?: string;
  items?: string[];
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  calloutText?: string;
  calloutType?: 'info' | 'warning' | 'note' | 'highlight';
  signatures?: Array<{
    label: string;
    name: string;
    title: string;
    date?: string;
  }>;
}

export interface DiffHighlight {
  fieldOrSection: string;
  sourceFromInput: string;
  populatedValue: string;
  action: 'replaced_placeholder' | 'synthesized_section' | 'populated_table' | 'preserved_boilerplate';
}

export interface PopulatedDocument {
  id: string;
  title: string;
  subtitle?: string;
  metadata: Record<string, string>;
  sections: PopulatedSection[];
  styling: TemplateStyling;
  diffHighlights: DiffHighlight[];
  generationNotes: string;
  docxBase64?: string;
  docxFileName: string;
  timestamp: string;
}

export interface SampleTemplateOption {
  id: string;
  name: string;
  category: string;
  description: string;
  accentColor: string;
  previewSnippet: string;
  sampleContent: string;
  sampleContentLabel: string;
}
