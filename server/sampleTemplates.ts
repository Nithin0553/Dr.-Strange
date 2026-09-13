import { TemplateAnalysis, SampleTemplateOption } from '../src/types.js';

export const SAMPLE_TEMPLATES: Record<string, TemplateAnalysis> = {
  'project-proposal': {
    id: 'project-proposal',
    title: 'ENTERPRISE SOLUTION PROPOSAL & STATEMENT OF WORK',
    description: 'Corporate proposal template with executive summary, deliverables, timeline table, pricing schedule, and sign-offs.',
    documentCategory: 'Business Proposals',
    fileName: 'Enterprise_Solution_Proposal_Template.docx',
    styling: {
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
      headerText: 'CONFIDENTIAL — ENTERPRISE STATEMENT OF WORK',
      hasFooter: true,
      footerText: 'Page [Page] of [Pages] | Prepared for [Client Company]',
      pageMargins: { top: 1, bottom: 1, left: 1, right: 1 },
    },
    sections: [
      {
        id: 'sec-meta',
        heading: 'Project Engagement Metadata',
        type: 'metadata_grid',
        originalContent: 'Prepared For: [Client Company Name]\nPrepared By: [Vendor Organization]\nDate of Submission: [Date]\nProject Reference: [Project Code / Title]\nEngagement Lead: [Lead Consultant / Contact]',
        placeholders: ['[Client Company Name]', '[Vendor Organization]', '[Date]', '[Project Code / Title]', '[Lead Consultant / Contact]'],
      },
      {
        id: 'sec-exec',
        heading: '1. Executive Summary & Strategic Rationale',
        type: 'paragraph',
        originalContent: 'This Statement of Work outlines the engagement scope, strategic goals, and technical methodology for delivering [Core Solution Name]. The objective is to modernize and streamline [Business Problem / Focus Area] while ensuring high performance, security compliance, and measurable ROI within [Target Timeframe].',
        placeholders: ['[Core Solution Name]', '[Business Problem / Focus Area]', '[Target Timeframe]'],
      },
      {
        id: 'sec-objectives',
        heading: '2. Key Objectives & Success Criteria',
        type: 'bullet_list',
        originalContent: '- Deliver scalable, production-grade infrastructure meeting enterprise SLA requirements.\n- Implement end-to-end security compliance according to industry benchmarks.\n- Provide hands-on knowledge transfer, operational runbooks, and staff enablement.\n- Ensure milestone transitions adhere to defined acceptance criteria.',
        placeholders: ['[Objective 1]', '[Objective 2]', '[Objective 3]'],
      },
      {
        id: 'sec-scope-table',
        heading: '3. Project Phases & Deliverables Breakdown',
        type: 'table',
        originalContent: 'Table of project phases, key deliverables, target duration, and responsible parties.',
        placeholders: ['[Phase Name]', '[Deliverables]', '[Duration]', '[Responsible Party]'],
        tableSchema: {
          headers: ['Phase #', 'Phase Name & Scope', 'Key Deliverables', 'Duration', 'Owner'],
          sampleRows: [
            ['Phase 1', 'Discovery & Architecture Assessment', 'Architecture design document, requirements matrix', '3 Weeks', 'Lead Architect'],
            ['Phase 2', 'Core Engineering & Implementation', 'Functional MVP, backend pipelines, API integration', '6 Weeks', 'Engineering Team'],
            ['Phase 3', 'Testing, Security Audit & Staging', 'QA test report, vulnerability remediation, UAT sign-off', '3 Weeks', 'QA / Security'],
            ['Phase 4', 'Production Rollout & Enablement', 'Live deployment, staff training workshops, handover docs', '2 Weeks', 'Joint Team'],
          ],
        },
      },
      {
        id: 'sec-financial-table',
        heading: '4. Investment Schedule & Payment Milestones',
        type: 'table',
        originalContent: 'Milestone-based compensation structure and disbursement schedule.',
        placeholders: ['[Milestone Description]', '[Payment %]', '[Amount]'],
        tableSchema: {
          headers: ['Milestone ID', 'Payment Trigger / Milestone', 'Disbursement %', 'Amount (USD)'],
          sampleRows: [
            ['M-01', 'Project Kickoff & Execution of SOW', '20%', '$20,000.00'],
            ['M-02', 'Completion of Architecture & Prototype Approval', '30%', '$30,000.00'],
            ['M-03', 'Completion of Core Implementation & Staging UAT', '30%', '$30,000.00'],
            ['M-04', 'Final Production Acceptance & Training Handover', '20%', '$20,000.00'],
          ],
        },
      },
      {
        id: 'sec-compliance-callout',
        heading: '5. Governance & Compliance Note',
        type: 'callout',
        originalContent: 'IMPORTANT NOTICE: All engineering deliverables will be executed in compliance with ISO/IEC 27001 standards and client data governance policies. Any scope changes require an agreed written Change Order prior to work commencement.',
        placeholders: ['[Compliance Standards]'],
      },
      {
        id: 'sec-signatures',
        heading: '6. Authorization & Mutual Acceptance',
        type: 'signatures',
        originalContent: 'Client and Vendor authorized representatives execute this Statement of Work as of the date indicated.',
        placeholders: ['[Client Signer Name]', '[Client Signer Title]', '[Vendor Signer Name]', '[Vendor Signer Title]'],
      },
    ],
    detectedPlaceholders: [
      '[Client Company Name]',
      '[Vendor Organization]',
      '[Date]',
      '[Project Code / Title]',
      '[Lead Consultant / Contact]',
      '[Core Solution Name]',
      '[Business Problem / Focus Area]',
      '[Target Timeframe]',
      '[Compliance Standards]',
      '[Client Signer Name]',
      '[Client Signer Title]',
    ],
  },

  'consulting-agreement': {
    id: 'consulting-agreement',
    title: 'PROFESSIONAL CONSULTING SERVICES AGREEMENT',
    description: 'Formal legal agreement for independent advisors, consulting firms, and contractor engagements.',
    documentCategory: 'Legal & Contracts',
    fileName: 'Consulting_Services_Agreement_Template.docx',
    styling: {
      fontFamily: 'Georgia',
      primaryColor: '#0f172a',
      secondaryColor: '#475569',
      accentColor: '#334155',
      backgroundColor: '#ffffff',
      heading1Size: 16,
      heading2Size: 12,
      bodySize: 10.5,
      lineSpacing: 1.3,
      hasHeader: true,
      headerText: 'STANDARD CONSULTING SERVICES AGREEMENT',
      hasFooter: true,
      footerText: 'Confidential | Subject to Non-Disclosure Terms',
      pageMargins: { top: 1, bottom: 1, left: 1, right: 1 },
    },
    sections: [
      {
        id: 'sec-parties',
        heading: 'Engagement Parties & Preamble',
        type: 'metadata_grid',
        originalContent: 'Client Entity: [Client Legal Entity Name]\nPrincipal Office: [Client Street Address, City, State]\nConsultant Entity: [Consultant Legal Name / LLC]\nEffective Date: [Effective Date]\nGoverning Law: [State / Jurisdiction]',
        placeholders: ['[Client Legal Entity Name]', '[Client Street Address, City, State]', '[Consultant Legal Name / LLC]', '[Effective Date]', '[Governing Law]'],
      },
      {
        id: 'sec-recitals',
        heading: 'Recitals & Engagement Purpose',
        type: 'paragraph',
        originalContent: 'WHEREAS, Client desires to retain Consultant to render specialized advisory and strategic services in connection with [Engagement Purpose], and Consultant possesses the requisite background, technical knowledge, and capability to perform such advisory services;',
        placeholders: ['[Engagement Purpose]'],
      },
      {
        id: 'sec-scope',
        heading: '1. Services & Performance Standards',
        type: 'paragraph',
        originalContent: 'Consultant shall provide expert guidance, technical oversight, and strategic assessments regarding [Primary Area of Expertise]. Consultant agrees to exercise reasonable commercial diligence and adhere to industry best practices.',
        placeholders: ['[Primary Area of Expertise]'],
      },
      {
        id: 'sec-deliverables-table',
        heading: '2. Schedule of Advisory Deliverables',
        type: 'table',
        originalContent: 'Detailed schedule of deliverables, completion dates, and approval criteria.',
        placeholders: ['[Deliverable Name]', '[Timeline]', '[Success Criteria]'],
        tableSchema: {
          headers: ['Item #', 'Advisory Deliverable', 'Target Due Date', 'Acceptance Benchmark'],
          sampleRows: [
            ['D-01', 'Baseline Strategy & Gap Audit', 'Month 1', 'Delivery of executive findings report'],
            ['D-02', 'Strategic Framework & Roadmap', 'Month 2', 'Presentation to Steering Committee'],
            ['D-03', 'Operational Implementation Support', 'Month 3', 'Weekly sprint coaching & reviews'],
          ],
        },
      },
      {
        id: 'sec-ip-callout',
        heading: '3. Intellectual Property & Work for Hire',
        type: 'callout',
        originalContent: 'All reports, designs, inventions, and work product developed under this Agreement shall constitute "work made for hire" and shall be the exclusive property of the Client upon payment in full.',
        placeholders: [],
      },
      {
        id: 'sec-signatures',
        heading: '4. Signatures of the Parties',
        type: 'signatures',
        originalContent: 'IN WITNESS WHEREOF, the parties hereto have executed this Agreement.',
        placeholders: ['[Client Authorized Signatory]', '[Consultant Authorized Signatory]'],
      },
    ],
    detectedPlaceholders: [
      '[Client Legal Entity Name]',
      '[Client Street Address, City, State]',
      '[Consultant Legal Name / LLC]',
      '[Effective Date]',
      '[Governing Law]',
      '[Engagement Purpose]',
      '[Primary Area of Expertise]',
    ],
  },

  'executive-memo': {
    id: 'executive-memo',
    title: 'EXECUTIVE STRATEGY MEMORANDUM & ACTION PLAN',
    description: 'Internal leadership memorandum with routing headers, problem statement, key metrics, and risk assessment.',
    documentCategory: 'Executive & Strategy',
    fileName: 'Executive_Strategy_Memorandum_Template.docx',
    styling: {
      fontFamily: 'Arial',
      primaryColor: '#312e81',
      secondaryColor: '#374151',
      accentColor: '#4f46e5',
      backgroundColor: '#ffffff',
      heading1Size: 17,
      heading2Size: 12.5,
      bodySize: 11,
      lineSpacing: 1.2,
      hasHeader: true,
      headerText: 'INTERNAL MEMORANDUM — STRICTLY CONFIDENTIAL',
      hasFooter: true,
      footerText: 'Executive Management Distribution Only',
      pageMargins: { top: 1, bottom: 1, left: 1, right: 1 },
    },
    sections: [
      {
        id: 'sec-memo-header',
        heading: 'Memorandum Routing',
        type: 'metadata_grid',
        originalContent: 'TO: [Recipient Name / Executive Committee]\nFROM: [Sender Name and Department]\nDATE: [Date]\nSUBJECT: [Strategic Initiative Subject]\nURGENCY LEVEL: [Immediate / Standard / High Priority]',
        placeholders: ['[Recipient Name / Executive Committee]', '[Sender Name and Department]', '[Date]', '[Strategic Initiative Subject]', '[Immediate / Standard / High Priority]'],
      },
      {
        id: 'sec-exec-summary',
        heading: '1. Strategic Opportunity & Problem Overview',
        type: 'paragraph',
        originalContent: 'The purpose of this memorandum is to evaluate [Initiative / Opportunity] and outline an actionable roadmap to address current bottlenecks in [Operational Area]. Immediate capital and resource allocation is recommended to capitalize on [Strategic Window].',
        placeholders: ['[Initiative / Opportunity]', '[Operational Area]', '[Strategic Window]'],
      },
      {
        id: 'sec-strategic-pillars',
        heading: '2. Priority Strategic Pillars',
        type: 'bullet_list',
        originalContent: '- Accelerate time-to-market by standardizing cross-functional tooling.\n- Modernize data pipelines to unlock real-time predictive analytics.\n- Reduce customer acquisition costs through targeted digital channel optimization.\n- Protect brand trust through comprehensive compliance automation.',
        placeholders: ['[Pillar 1]', '[Pillar 2]', '[Pillar 3]'],
      },
      {
        id: 'sec-resource-table',
        heading: '3. Proposed Budget & Resource Allocation',
        type: 'table',
        originalContent: 'Budget breakdown across departments and priority levels.',
        placeholders: ['[Department]', '[Initiative]', '[Capital Required]', '[Priority]'],
        tableSchema: {
          headers: ['Functional Team', 'Key Initiative', 'Allocated Budget', 'Projected ROI', 'Target Quarter'],
          sampleRows: [
            ['Engineering', 'Core Infrastructure Upgrades', '$180,000', '40% latency reduction', 'Q1 2027'],
            ['Growth & Marketing', 'Omnichannel Launch Campaign', '$95,000', '3.5x pipeline growth', 'Q2 2027'],
            ['Customer Success', 'Automated Onboarding Suite', '$50,000', '25% churn reduction', 'Q2 2027'],
          ],
        },
      },
      {
        id: 'sec-risk-callout',
        heading: '4. Critical Risk Factors & Mitigations',
        type: 'callout',
        originalContent: 'CRITICAL DEPENDENCY: Implementation velocity depends on vendor onboarding completion by the end of this month. Contingency plan includes deploying internal bridge engineers for Phase 1.',
        placeholders: [],
      },
      {
        id: 'sec-next-steps',
        heading: '5. Immediate Action Items & Approvals',
        type: 'bullet_list',
        originalContent: '- Schedule Steering Committee sign-off review by Friday.\n- Finalize contractual negotiations with external cloud providers.\n- Issue internal announcement to all department leads.',
        placeholders: ['[Action 1]', '[Action 2]', '[Action 3]'],
      },
    ],
    detectedPlaceholders: [
      '[Recipient Name / Executive Committee]',
      '[Sender Name and Department]',
      '[Date]',
      '[Strategic Initiative Subject]',
      '[Initiative / Opportunity]',
      '[Operational Area]',
      '[Strategic Window]',
    ],
  },

  'invoice-voucher': {
    id: 'invoice-voucher',
    title: 'PROFESSIONAL INVOICE & MILESTONE BILLING VOUCHER',
    description: 'Itemized financial invoice with bill-to credentials, line items table, payment methods, and remittance callout.',
    documentCategory: 'Financial Documents',
    fileName: 'Professional_Invoice_Voucher_Template.docx',
    styling: {
      fontFamily: 'Segoe UI',
      primaryColor: '#065f46',
      secondaryColor: '#1f2937',
      accentColor: '#059669',
      backgroundColor: '#ffffff',
      heading1Size: 20,
      heading2Size: 13,
      bodySize: 10.5,
      lineSpacing: 1.25,
      hasHeader: true,
      headerText: 'OFFICIAL BILLING INVOICE',
      hasFooter: true,
      footerText: 'Thank you for your business. Please remit payments within 30 days.',
      pageMargins: { top: 1, bottom: 1, left: 1, right: 1 },
    },
    sections: [
      {
        id: 'sec-inv-meta',
        heading: 'Billing & Invoice Details',
        type: 'metadata_grid',
        originalContent: 'Invoice Number: [INV-XXXX]\nIssue Date: [Date]\nPayment Due Date: [Due Date]\nBill To: [Client Organization & Billing Address]\nIssued By: [Supplier / Provider Company & Tax ID]',
        placeholders: ['[INV-XXXX]', '[Date]', '[Due Date]', '[Client Organization & Billing Address]', '[Supplier / Provider Company & Tax ID]'],
      },
      {
        id: 'sec-inv-summary',
        heading: '1. Services Rendered Summary',
        type: 'paragraph',
        originalContent: 'This invoice covers billable professional services, milestone deliverables, and technical consulting performed during the billing cycle for [Project Name / Engagement Scope].',
        placeholders: ['[Project Name / Engagement Scope]'],
      },
      {
        id: 'sec-inv-table',
        heading: '2. Itemized Deliverables & Billing Schedule',
        type: 'table',
        originalContent: 'Detailed line items with hours, rates, and extended totals.',
        placeholders: ['[Item Description]', '[Hours/Units]', '[Rate]', '[Subtotal]'],
        tableSchema: {
          headers: ['Item #', 'Description of Services Rendered', 'Units / Hours', 'Unit Rate ($)', 'Total Amount ($)'],
          sampleRows: [
            ['01', 'Cloud Infrastructure Migration & Setup', '40 hrs', '$175.00', '$7,000.00'],
            ['02', 'API Gateway Development & Authentication', '35 hrs', '$175.00', '$6,125.00'],
            ['03', 'System Integration & Stress Testing', '25 hrs', '$160.00', '$4,000.00'],
            ['04', 'Documentation & Knowledge Transfer Sessions', '12 hrs', '$150.00', '$1,800.00'],
          ],
        },
      },
      {
        id: 'sec-inv-callout',
        heading: '3. Remittance Instructions & Wire Details',
        type: 'callout',
        originalContent: 'PAYMENT TERMS: Net 30 days. Wire Transfer / ACH: Bank of America | Routing: 121000358 | Account: 4892019482 | SWIFT: BOFAUS3N. Please include Invoice # in wire memo.',
        placeholders: [],
      },
      {
        id: 'sec-inv-signatures',
        heading: '4. Billing Verification Sign-off',
        type: 'signatures',
        originalContent: 'Finance Controller authorization and verification.',
        placeholders: ['[Controller Name]', '[Authorized Signature]'],
      },
    ],
    detectedPlaceholders: [
      '[INV-XXXX]',
      '[Date]',
      '[Due Date]',
      '[Client Organization & Billing Address]',
      '[Supplier / Provider Company & Tax ID]',
      '[Project Name / Engagement Scope]',
    ],
  },
};

export const SAMPLE_OPTIONS: SampleTemplateOption[] = [
  {
    id: 'project-proposal',
    name: 'Enterprise Solution Proposal',
    category: 'Business & Tech',
    description: 'Statement of work with executive summary, deliverables table, pricing schedule, and sign-offs.',
    accentColor: '#1e3a8a',
    previewSnippet: 'Calibri font · Deep Navy theme · SOW Deliverables & Payment Milestones',
    sampleContentLabel: 'Cloud Modernization Project Notes',
    sampleContent: `Meeting notes with Nexus Logistics Corp:
Client: Nexus Logistics International (Contact: Elena Rostova, VP Operations)
Vendor: CloudScale Solutions Inc (Lead: Marcus Vance, Principal Cloud Architect)
Date: October 14, 2026
Project Title: Nexus Global Freight & Fleet Telematics Cloud Migration
Core objective: Migrate on-prem legacy fleet tracking servers to Google Cloud Platform, implement real-time IoT GPS telemetry processing, and reduce dispatcher dispatch latency by 65%.
Security: Must be SOC2 Type II and FedRAMP compliant for government freight contracts.

Phases & Timeline:
- Phase 1: Architecture & Cloud Readiness Audit (3 weeks) - Cloud Architecture Blueprint, legacy DB schema audit. Owned by CloudScale Architecture team.
- Phase 2: High-throughput IoT Telemetry Pipeline (7 weeks) - Kafka/PubSub stream ingestion for 12,000 delivery vehicles, BigQuery live dashboard.
- Phase 3: Driver Mobile App API & Dispatch Routing (4 weeks) - REST/gRPC backend microservices, Redis caching layer.
- Phase 4: Production Cutover, UAT & 24/7 War Room (2 weeks) - Zero-downtime database migration, dispatcher training sessions.

Investment & Pricing Schedule:
- M-01 Kickoff & SOW Execution: 20% ($36,000)
- M-02 Architecture Approval & Ingestion Benchmark: 30% ($54,000)
- M-03 Dispatch Routing API Integration & Staging Test: 30% ($54,000)
- M-04 Final Production Sign-off & Handover: 20% ($36,000)
Total Project Investment: $180,000.00 USD. Net 30 payment terms.

Signatories:
Elena Rostova, VP Global Fleet Operations (Nexus Logistics)
Marcus Vance, VP Solutions Architecture (CloudScale Solutions)`,
  },
  {
    id: 'consulting-agreement',
    name: 'Consulting Services Agreement',
    category: 'Contracts & Legal',
    description: 'Formal master consulting contract with scope, deliverables table, IP terms, and signatures.',
    accentColor: '#0f172a',
    previewSnippet: 'Georgia font · Slate formal styling · Work-for-hire and Advisory milestones',
    sampleContentLabel: 'Cybersecurity Advisory Engagement Raw Draft',
    sampleContent: `Engagement notes for legal contract:
Client: Helios BioTech Inc., located at 450 Innovation Parkway, Cambridge, MA 02142
Consultant: CyberShield Security Partners LLC, located at 120 Wall Street, New York, NY
Effective Date: November 1, 2026
Jurisdiction: Commonwealth of Massachusetts
Engagement Purpose: Comprehensive HIPAA & FDA 21 CFR Part 11 Cybersecurity Vulnerability Assessment and Zero-Trust Architecture Strategy for Helios' cloud genome sequencing platform.

Advisory Schedule of Deliverables:
- Item 1: Threat Vector & Penetration Testing Assessment | Due Dec 15, 2026 | Delivery of comprehensive red-team penetration audit and high-risk CVE report.
- Item 2: Zero-Trust Network Architecture Blueprint | Due Jan 30, 2027 | Multi-region IAM policy design, mTLS configuration between microservices.
- Item 3: Regulatory Compliance Certification Readiness Package | Due Mar 15, 2027 | Audit-ready documentation for external FDA review and SOC2 auditor signoff.

Compensation: Fixed fee retainer of $85,000 paid across milestones ($25,000 initial retainer, $35,000 on deliverable 2, $25,000 on final signoff).
Signers: Dr. Aris Thorne (CEO, Helios BioTech) and Kimberly Sterling (Managing Partner, CyberShield).`,
  },
  {
    id: 'executive-memo',
    name: 'Executive Strategy Memorandum',
    category: 'Operations & Strategy',
    description: 'Leadership memo with routing header, strategic rationale, department budget table, and risk callout.',
    accentColor: '#312e81',
    previewSnippet: 'Arial font · Indigo leadership theme · Strategic Pillars & Budget Allocation',
    sampleContentLabel: 'AI Customer Experience Transformation Brief',
    sampleContent: `Internal memo draft:
TO: Executive Leadership Team & Board of Directors
FROM: Maya Lin, Chief Technology & Product Officer
DATE: November 8, 2026
SUBJECT: Fiscal Year 2027 AI-Powered Customer Experience & Autonomous Support Initiative
URGENCY: High Priority (Immediate Board Approval Requested)

Problem & Strategic Window:
Customer support ticket volume grew 120% in the last 6 months following our international expansion to Europe and APAC. First-response time has deteriorated to 4.2 hours, causing our customer satisfaction score (CSAT) to drop from 94% to 81%. Our competitors are rolling out sub-minute conversational AI assistants.

Priority Strategic Pillars:
- Deploy autonomous Tier-1 conversational AI agent resolving 60% of common order and billing inquiries in under 30 seconds.
- Equip Tier-2 human support specialists with AI agent assist for real-time CRM synthesis and multi-language translation.
- Build automated sentiment detection in Zendesk to escalate high-value enterprise customer churn risks instantly.

Department Resource & Budget Allocation:
- AI & NLP Engineering Team | Custom Model Fine-Tuning & Prompt Safety Guardrails | $140,000 | 70% resolution speedup | Q1 2027
- Global Support Operations | Agent Training & Workflows Overhaul | $65,000 | 25% agent overtime reduction | Q1-Q2 2027
- Data & Analytics Platform | Real-time Observability & Feedback Vector Store | $45,000 | Predictive churn alerts | Q2 2027
Total Budget Request: $250,000. Projected annual labor savings: $620,000.

Critical Risk:
Integration with legacy SAP ERP billing backend might experience API rate limits. Mitigation: implement Redis caching queue and dedicated GCP connector.

Action Items:
1. Approve $250,000 capital allocation in Thursday's board meeting.
2. Sign enterprise license agreement with Google Cloud for Gemini AI endpoints.
3. Form cross-functional implementation squad by December 1.`,
  },
  {
    id: 'invoice-voucher',
    name: 'Professional Milestone Invoice',
    category: 'Finance & Billing',
    description: 'Financial document with billing credentials, itemized services table, bank wire details, and approvals.',
    accentColor: '#065f46',
    previewSnippet: 'Segoe UI font · Forest Emerald theme · Itemized line items & Remittance callout',
    sampleContentLabel: 'Mobile App Redesign Billing Data',
    sampleContent: `Invoice Details:
Invoice Number: INV-2026-8842
Date: November 12, 2026
Payment Due: December 12, 2026 (Net 30)

Bill To:
Starlight Hospitality Group
Attention: Accounts Payable & Operations
742 Grand Avenue, Suite 500, Chicago, IL 60611
Tax ID / EIN: 36-9812450

Issued By:
Vanguard Digital Studio LLC
900 North Michigan Ave, Chicago, IL 60611
Tax ID / EIN: 36-4192837
Contact: billing@vanguardstudio.design

Services Rendered Summary:
Billing for Phase 2 completion of the Starlight Mobile Guest Check-in & Keyless Room Entry iOS/Android application redesign.

Line Items:
1. Native iOS Swift & Widget Development (Guest digital room key via Apple Wallet) | 64 Hours | $185.00/hr | $11,840.00
2. Android Kotlin Implementation (NFC door lock protocol integration) | 56 Hours | $185.00/hr | $10,360.00
3. Backend Microservices Integration (PMS Opera PMS bi-directional sync) | 48 Hours | $175.00/hr | $8,400.00
4. End-to-End Hotel Property Pilot Testing at Chicago Flagship Hotel | 24 Hours | $160.00/hr | $3,840.00
Subtotal: $34,440.00
Early Payment Discount (2% for remittance within 10 days): -$688.80
Total Amount Due: $33,751.20

Wire Transfer Instructions:
JPMorgan Chase Bank, N.A.
Routing Number: 071000013
Account Number: 8492019482
Account Name: Vanguard Digital Studio LLC
SWIFT: CHASUS33
Payment Reference: INV-2026-8842

Approval Sign-off:
Marcus Sterling, Finance Director, Vanguard Digital Studio`,
  },
];
