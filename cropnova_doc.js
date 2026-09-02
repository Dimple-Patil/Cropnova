const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  PageBreak, NumberFormat, UnderlineType, TabStopPosition, TabStopType,
  PositionalTab, PositionalTabAlignment, PositionalTabLeader,
  PageOrientation, convertInchesToTwip, LevelFormat, PageNumber,
  Header, Footer, ImageRun, TableLayoutType, VerticalAlign,
} = require('docx');
const fs = require('fs');

// ── Color constants ──────────────────────────────────────────────────────────
const C = {
  primary:   '2E7D32', primaryHover: '1B5E20', secondary: '4CAF50',
  accent:    'F9A825', bg: 'F8FAF5', card: 'FFFFFF',
  textPrim:  '263238', textSec: '607D8B', border: 'E0E0E0',
  success:   '43A047', warning: 'FB8C00', error: 'E53935',
  white:     'FFFFFF', lightGreen: 'E8F5E9', darkGreen: '1B5E20',
  tableHead: '2E7D32', tableRow1: 'F8FAF5', tableRow2: 'FFFFFF',
  callout:   'E8F5E9', calloutBorder: '2E7D32',
  gray100:   'F5F5F5', gray200: 'EEEEEE', gray600: '757575',
  accentBg:  'FFF8E1',
};

// ── Typography helpers ───────────────────────────────────────────────────────
const font = { heading: 'Poppins', body: 'Inter' };

function run(text, opts = {}) {
  return new TextRun({
    text, font: opts.font || font.body,
    size: opts.size || 22,
    bold: opts.bold || false,
    italics: opts.italic || false,
    color: opts.color || C.textPrim,
    underline: opts.underline ? { type: UnderlineType.SINGLE } : undefined,
    break: opts.break || undefined,
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, font: font.heading, size: 52, bold: true, color: C.primary })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({ text, font: font.heading, size: 40, bold: true, color: C.primary })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, font: font.heading, size: 32, bold: true, color: C.primaryHover })],
  });
}
function h4(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_4,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, font: font.heading, size: 26, bold: true, color: C.textPrim })],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 120, line: 340 },
    alignment: opts.align || AlignmentType.LEFT,
    children: [new TextRun({
      text, font: opts.font || font.body,
      size: opts.size || 22,
      bold: opts.bold || false,
      italics: opts.italic || false,
      color: opts.color || C.textPrim,
    })],
  });
}

function bullet(text, opts = {}) {
  return new Paragraph({
    bullet: { level: opts.level || 0 },
    spacing: { before: 60, after: 60, line: 300 },
    children: [new TextRun({
      text, font: font.body,
      size: opts.size || 22,
      bold: opts.bold || false,
      color: opts.color || C.textPrim,
    })],
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function spacer(before = 120, after = 120) {
  return new Paragraph({ spacing: { before, after }, children: [run('')] });
}

function divider() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.border } },
    children: [run('')],
  });
}

// ── Callout box ──────────────────────────────────────────────────────────────
function callout(title, text, type = 'info') {
  const bgMap = { info: C.callout, warning: C.accentBg, error: 'FFEBEE' };
  const borderMap = { info: C.primary, warning: C.accent, error: C.error };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 12, color: borderMap[type] },
      bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE },
    },
    rows: [new TableRow({ children: [new TableCell({
      shading: { type: ShadingType.CLEAR, fill: bgMap[type] || C.callout },
      margins: { top: 120, bottom: 120, left: 160, right: 160 },
      children: [
        new Paragraph({ spacing: { before: 40, after: 60 }, children: [new TextRun({ text: title, font: font.heading, size: 22, bold: true, color: borderMap[type] })] }),
        new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text, font: font.body, size: 20, color: C.textPrim })] }),
      ],
    })] })],
  });
}

// ── Generic table builder ────────────────────────────────────────────────────
function buildTable(headers, rows, colWidths) {
  const totalWidth = 9200;
  const numCols = headers.length;
  const widths = colWidths || headers.map(() => Math.floor(totalWidth / numCols));

  function makeCell(text, isHeader = false) {
    return new TableCell({
      width: { size: widths[0], type: WidthType.DXA },
      shading: isHeader ? { type: ShadingType.CLEAR, fill: C.tableHead } : undefined,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: String(text), font: font.body, size: 20, bold: isHeader, color: isHeader ? C.white : C.textPrim })],
      })],
    });
  }

  function makeRow(cells, isHeader = false, rowIdx = 0) {
    return new TableRow({
      tableHeader: isHeader,
      children: cells.map((cell, i) => new TableCell({
        width: { size: widths[i] || Math.floor(totalWidth / numCols), type: WidthType.DXA },
        shading: isHeader
          ? { type: ShadingType.CLEAR, fill: C.tableHead }
          : { type: ShadingType.CLEAR, fill: rowIdx % 2 === 0 ? C.tableRow1 : C.tableRow2 },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text: String(cell), font: font.body, size: 20, bold: isHeader, color: isHeader ? C.white : C.textPrim })],
        })],
      })),
    });
  }

  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      makeRow(headers, true),
      ...rows.map((r, i) => makeRow(r, false, i)),
    ],
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT SECTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function coverPage() {
  return [
    spacer(2000, 200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [new TextRun({ text: 'CropNova', font: font.heading, size: 96, bold: true, color: C.primary })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 200 },
      children: [new TextRun({ text: 'AI-Powered Smart Agriculture Management Platform', font: font.heading, size: 36, color: C.textSec })],
    }),
    divider(),
    spacer(200, 200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 80 },
      children: [new TextRun({ text: 'UI/UX DESIGN SPECIFICATION', font: font.heading, size: 44, bold: true, color: C.textPrim })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 80 },
      children: [new TextRun({ text: 'Product Design System & Implementation Guide', font: font.body, size: 26, color: C.textSec, italics: true })],
    }),
    spacer(400, 400),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 60 },
      children: [new TextRun({ text: 'Version 1.0  |  2025', font: font.body, size: 22, color: C.textSec })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 },
      children: [new TextRun({ text: 'CONFIDENTIAL — PRODUCT DESIGN TEAM', font: font.heading, size: 20, bold: true, color: C.error })],
    }),
    pageBreak(),
  ];
}

function tableOfContents() {
  const entries = [
    ['1', 'Introduction', '5'],
    ['2', 'Project Vision', '6'],
    ['3', 'Problem Statement', '7'],
    ['4', 'Objectives', '8'],
    ['5', 'Target Audience', '9'],
    ['6', 'User Personas', '10'],
    ['7', 'User Journey Maps', '13'],
    ['8', 'Information Architecture', '15'],
    ['9', 'Design Philosophy', '17'],
    ['10', 'Brand Identity', '18'],
    ['11', 'Color System', '19'],
    ['12', 'Typography System', '22'],
    ['13', 'Design Tokens', '24'],
    ['14', 'Layout System', '26'],
    ['15', 'Navigation System', '28'],
    ['16', 'UI Components Library', '31'],
    ['17', 'Dashboard Design', '42'],
    ['18', 'Stakeholders Page', '44'],
    ['19', 'Farmer Dashboard', '46'],
    ['20', 'Marketplace', '48'],
    ['21', 'Product Details Page', '50'],
    ['22', 'Weather Dashboard', '51'],
    ['23', 'AI Disease Detection Module', '53'],
    ['24', 'Crop Recommendation Module', '55'],
    ['25', 'Crop Management Module', '57'],
    ['26', 'Soil Health Module', '59'],
    ['27', 'Fertilizer Recommendation Module', '61'],
    ['28', 'Irrigation Module', '63'],
    ['29', 'Expert Consultation Module', '65'],
    ['30', 'Government Schemes Module', '67'],
    ['31', 'Reports & Analytics Module', '69'],
    ['32', 'Profile Page', '71'],
    ['33', 'Settings Page', '73'],
    ['34', 'Accessibility Guidelines', '75'],
    ['35', 'Responsive Design', '77'],
    ['36', 'UX Principles', '79'],
    ['37', 'Micro Interactions', '81'],
    ['38', 'Performance Considerations', '83'],
    ['39', 'Future Enhancements', '85'],
    ['40', 'Developer Guidelines', '87'],
    ['41', 'Design Best Practices', '89'],
    ['42', 'Conclusion', '91'],
  ];

  const tocRows = entries.map(([num, title, page]) =>
    new Paragraph({
      spacing: { before: 60, after: 60 },
      children: [
        new TextRun({ text: `${num}.  ${title}`, font: font.body, size: 22, color: C.textPrim }),
        new PositionalTab({
          alignment: PositionalTabAlignment.RIGHT,
          relativeTo: 'margin',
          leader: PositionalTabLeader.DOT,
        }),
        new TextRun({ text: page, font: font.body, size: 22, color: C.textSec }),
      ],
    })
  );

  return [
    h1('Table of Contents'),
    spacer(120, 80),
    ...tocRows,
    pageBreak(),
  ];
}

// ── Chapter 1: Introduction ──────────────────────────────────────────────────
function chIntroduction() {
  return [
    h1('1. Introduction'),
    para('CropNova is a next-generation, AI-powered Smart Agriculture Management Platform purpose-built to transform the way farmers, agricultural experts, vendors, government authorities, and researchers interact with farming data and make critical decisions. Developed with a human-centered design philosophy, CropNova brings together a comprehensive suite of digital tools — from crop monitoring and soil analysis to marketplace commerce and expert consultation — within a single, cohesive platform experience.'),
    spacer(),
    para('This document constitutes the official UI/UX Design Specification for CropNova. It has been prepared by the Product Design Team and serves as the authoritative reference for all design, development, testing, and stakeholder alignment activities. The specification covers every aspect of the product interface — from foundational design tokens and brand identity to detailed component guidelines and module-level screen specifications.'),
    spacer(),
    h3('1.1  Purpose of This Document'),
    para('This specification serves the following purposes:'),
    bullet('Provide developers with precise implementation guidelines for every UI component and screen layout.'),
    bullet('Equip QA engineers with visual acceptance criteria and interaction expectations.'),
    bullet('Align stakeholders on the product vision, design direction, and user experience principles.'),
    bullet('Serve as the single source of truth for design decisions throughout the product lifecycle.'),
    bullet('Enable design scalability by documenting a reusable component and token system.'),
    spacer(),
    h3('1.2  Scope'),
    para('This document covers the complete CropNova web application. The following are explicitly in scope:'),
    bullet('All primary modules and user-facing screens'),
    bullet('Design system: tokens, components, patterns, and grid'),
    bullet('Accessibility standards and responsive design guidelines'),
    bullet('UX principles, micro-interactions, and performance considerations'),
    bullet('Developer handoff notes and naming conventions'),
    spacer(),
    callout('Note', 'This specification is a living document. All changes must be version-controlled and reviewed by the Lead Product Designer before implementation. Developers should always refer to the latest version hosted on the team\'s shared drive.'),
    spacer(),
    h3('1.3  Document Conventions'),
    buildTable(
      ['Convention', 'Meaning'],
      [
        ['MUST', 'This requirement is mandatory and non-negotiable.'],
        ['SHOULD', 'This is a strong recommendation; deviation requires justification.'],
        ['MAY', 'This is optional but encouraged where feasible.'],
        ['NOTE', 'Supplementary information or design rationale.'],
        ['TODO', 'Placeholder for content to be defined in a future sprint.'],
      ],
      [2200, 7000]
    ),
    spacer(),
    pageBreak(),
  ];
}

// ── Chapter 2: Project Vision ────────────────────────────────────────────────
function chProjectVision() {
  return [
    h1('2. Project Vision'),
    para('CropNova envisions a future where every farmer — regardless of literacy level, farm size, or geographic location — has access to the same quality of agricultural intelligence that was previously available only to large agribusinesses with dedicated research teams. Through the thoughtful application of Artificial Intelligence, real-time data, and human-centered design, CropNova aspires to become the most trusted digital companion for the global farming community.'),
    spacer(),
    h3('2.1  Vision Statement'),
    new Paragraph({
      spacing: { before: 120, after: 120 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '"Empowering every farmer with intelligent, accessible, and sustainable agriculture technology — from seed to harvest."', font: font.heading, size: 26, bold: true, color: C.primary, italics: true })],
    }),
    spacer(),
    h3('2.2  Mission Statement'),
    para('To design and deliver an enterprise-grade smart agriculture platform that democratizes access to AI-powered insights, connects farming communities with experts and resources, and helps optimize yield while promoting environmental sustainability.'),
    spacer(),
    h3('2.3  Strategic Pillars'),
    buildTable(
      ['Pillar', 'Description', 'Design Impact'],
      [
        ['Intelligence', 'AI and ML drive core recommendations — disease detection, fertilizer, crop advice.', 'Confidence indicators, explainable AI labels, progressive disclosure.'],
        ['Accessibility', 'Platform must be usable by farmers with low digital literacy.', 'Simple navigation, icon-led UI, local language support.'],
        ['Sustainability', 'Promote eco-friendly farming practices and resource efficiency.', 'Green color language, sustainability metrics on dashboards.'],
        ['Community', 'Connect farmers, experts, vendors, and government in one ecosystem.', 'Collaborative features, consultation flows, scheme discovery.'],
        ['Transparency', 'Build trust through open data and explainable recommendations.', 'Data source labels, confidence scores, audit trails.'],
      ],
      [1800, 4200, 3200]
    ),
    spacer(),
    h3('2.4  Product Differentiators'),
    bullet('End-to-end farm management from a single dashboard, eliminating the need for multiple disconnected tools.'),
    bullet('AI-powered disease detection using computer vision, providing results in under 30 seconds.'),
    bullet('Integrated marketplace connecting farmers directly with certified input suppliers, reducing procurement costs.'),
    bullet('Government scheme discovery engine that matches farmers to available subsidies automatically.'),
    bullet('Multi-role platform supporting six distinct user types with role-appropriate interfaces and permissions.'),
    bullet('Mobile-first, offline-capable design ensuring usability in low-connectivity rural environments.'),
    spacer(),
    pageBreak(),
  ];
}

// ── Chapter 3: Problem Statement ────────────────────────────────────────────
function chProblemStatement() {
  return [
    h1('3. Problem Statement'),
    para('Agriculture is one of the world\'s most critical industries, yet it remains one of the least digitally transformed. Farmers face a unique set of interrelated challenges that compound year-on-year, leading to sub-optimal yields, economic losses, environmental degradation, and food insecurity. CropNova was conceived in direct response to these systemic problems.'),
    spacer(),
    h3('3.1  Core Problems Identified'),
    buildTable(
      ['Problem Area', 'Current State', 'Impact on Farmers'],
      [
        ['Crop Disease Management', 'Manual, expert-dependent diagnosis; delayed treatment.', 'Significant crop loss; 20–40% yield reduction on average.'],
        ['Weather Dependency', 'Farmers rely on general forecasts not calibrated to their location.', 'Poor irrigation timing; frost/drought losses.'],
        ['Fertilizer Application', 'Rule-of-thumb application without soil data.', 'Over/under-fertilization, increased costs, soil degradation.'],
        ['Market Access', 'Multiple middlemen between farmer and market.', 'Low farm-gate prices; poor income margins.'],
        ['Expert Access', 'Agricultural extension officers spread too thin.', 'Long wait times for professional advice; decisions delayed.'],
        ['Government Schemes', 'Schemes exist but awareness and enrollment is very low.', 'Farmers miss subsidies and welfare benefits they qualify for.'],
        ['Data Fragmentation', 'Farm records kept manually or in disparate apps.', 'No longitudinal insight; no data-driven decision making.'],
        ['Irrigation Efficiency', 'Fixed schedules disconnected from soil moisture data.', 'Water wastage; drought stress or root rot.'],
      ],
      [2400, 3600, 3200]
    ),
    spacer(),
    h3('3.2  Design Challenges'),
    para('Beyond the agricultural problems, the platform must also overcome significant design challenges:'),
    bullet('Designing for a highly heterogeneous user base — from tech-savvy agricultural researchers to semi-literate subsistence farmers.'),
    bullet('Ensuring cognitive accessibility: avoiding information overload while maintaining data richness.'),
    bullet('Creating a platform that is meaningful in both high-bandwidth urban environments and low-connectivity rural areas.'),
    bullet('Building trust in AI recommendations through transparent and explainable design patterns.'),
    bullet('Accommodating multiple languages and right-to-left (RTL) script support in future versions.'),
    spacer(),
    callout('Design Insight', 'Research shows that 67% of farmers in emerging markets abandon digital agriculture tools within 30 days due to poor UX, information overload, and lack of localized content. CropNova\'s design philosophy directly addresses these dropout causes through progressive disclosure, icon-first navigation, and simplified onboarding.', 'warning'),
    spacer(),
    pageBreak(),
  ];
}

// ── Chapter 4: Objectives ────────────────────────────────────────────────────
function chObjectives() {
  return [
    h1('4. Objectives'),
    h3('4.1  Product Objectives'),
    buildTable(
      ['ID', 'Objective', 'Success Metric'],
      [
        ['OBJ-01', 'Provide AI-powered crop disease detection with high accuracy.', '≥ 90% detection accuracy; result in < 30 seconds.'],
        ['OBJ-02', 'Deliver hyperlocal weather data integrated with farm management.', 'Weather data refreshed every 30 minutes per farm location.'],
        ['OBJ-03', 'Enable digital soil health monitoring and recommendations.', 'Soil reports generated within 24 hours of data input.'],
        ['OBJ-04', 'Provide personalized fertilizer recommendations.', 'Recommendations aligned with soil data and crop type.'],
        ['OBJ-05', 'Facilitate online marketplace for agricultural inputs.', 'Vendor onboarding; direct transaction capability.'],
        ['OBJ-06', 'Connect farmers with agricultural experts.', 'Consultation booking and resolution within 48 hours.'],
        ['OBJ-07', 'Automate government scheme discovery and enrollment.', 'Eligible scheme identification rate ≥ 80%.'],
        ['OBJ-08', 'Generate actionable analytics and farm performance reports.', 'Reports exportable to PDF/CSV; automated monthly summary.'],
      ],
      [900, 4500, 3800]
    ),
    spacer(),
    h3('4.2  Design Objectives'),
    bullet('Design an intuitive, consistent, and accessible user interface that requires minimal training for primary users.'),
    bullet('Build a scalable design system with reusable components, tokens, and patterns that accelerates development velocity.'),
    bullet('Achieve WCAG 2.1 Level AA compliance across all screens and interactions.'),
    bullet('Deliver a mobile-first responsive experience optimized for screens from 320px to 1920px wide.'),
    bullet('Reduce task completion time for primary user flows by at least 40% compared to current manual processes.'),
    bullet('Design an onboarding experience that achieves ≥ 70% completion rate in user testing.'),
    bullet('Ensure the interface communicates trust, growth, and innovation through deliberate visual language.'),
    spacer(),
    h3('4.3  Technical Design Objectives'),
    bullet('Define a complete design token system enabling programmatic theming and future dark mode support.'),
    bullet('Specify all components with precise measurements, states, and interaction behaviors for accurate developer implementation.'),
    bullet('Provide responsive grid specifications for desktop (1280px+), tablet (768px–1279px), and mobile (< 768px).'),
    bullet('Document performance budgets to ensure design choices do not compromise load performance.'),
    spacer(),
    pageBreak(),
  ];
}

// ── Chapter 5: Target Audience ───────────────────────────────────────────────
function chTargetAudience() {
  return [
    h1('5. Target Audience'),
    para('CropNova serves a multi-stakeholder ecosystem. Understanding each user type is fundamental to designing appropriate interfaces, navigation hierarchies, and feature prioritization. The platform accommodates six primary user roles, each with distinct goals, technical proficiency levels, and interaction patterns.'),
    spacer(),
    buildTable(
      ['User Role', 'Description', 'Primary Goals', 'Tech Proficiency'],
      [
        ['Farmer', 'Small to large-scale crop farmers managing one or more farms.', 'Crop health, weather alerts, marketplace access, scheme enrollment.', 'Low to Medium'],
        ['Agricultural Expert', 'Licensed agronomists and extension officers providing consultation.', 'Manage consultations, review farm data, provide recommendations.', 'Medium to High'],
        ['Vendor', 'Sellers of seeds, fertilizers, pesticides, and farm equipment.', 'List products, manage orders, view sales analytics.', 'Medium'],
        ['Government Authority', 'Officials managing schemes, subsidies, and policy programs.', 'Scheme management, farmer enrollment tracking, reports.', 'Medium'],
        ['Researcher', 'Agricultural scientists and university researchers.', 'Access aggregate data, disease trends, analytics.', 'High'],
        ['Administrator', 'Platform administrators managing users, content, and system health.', 'User management, platform monitoring, content moderation.', 'High'],
      ],
      [1800, 3000, 2800, 1600]
    ),
    spacer(),
    h3('5.1  Primary User: Farmer'),
    para('The farmer is the most critical and most challenged user. The platform\'s design must prioritize this persona above all others. Key characteristics:'),
    bullet('Age range: 25–65 years'),
    bullet('Education: Varies from primary school to university graduate'),
    bullet('Device: Predominantly mobile (Android smartphone, entry-level to mid-range)'),
    bullet('Connectivity: Often in areas with 2G/3G connectivity'),
    bullet('Language: May not be fluent in English; regional language support is essential'),
    bullet('Digital literacy: Comfortable with WhatsApp and basic apps; unfamiliar with complex dashboards'),
    spacer(),
    callout('Design Priority', 'Every design decision must pass the "Farmer First" test: if a feature or interaction creates friction for the primary farmer user, it must be redesigned. Complexity may be acceptable for expert and administrator roles but NEVER for the core farmer experience.'),
    spacer(),
    pageBreak(),
  ];
}

// ── Chapter 6: User Personas ─────────────────────────────────────────────────
function chUserPersonas() {
  return [
    h1('6. User Personas'),
    para('The following personas have been developed based on user research, stakeholder interviews, and field observations. Each persona represents a composite of real user archetypes and guides design decisions throughout the product.'),
    spacer(),
    h3('Persona 1 — Ravi Kumar: The Progressive Farmer'),
    buildTable(
      ['Attribute', 'Detail'],
      [
        ['Full Name', 'Ravi Kumar'],
        ['Age', '38 years'],
        ['Location', 'Pune, Maharashtra, India'],
        ['Education', 'Higher Secondary (12th Grade)'],
        ['Farm Size', '5 acres — cotton and soybean'],
        ['Device', 'Android mid-range smartphone (Redmi Note 12)'],
        ['Connectivity', '4G mobile data, intermittent'],
        ['Tech Comfort', 'Uses WhatsApp, YouTube, and UPI payments daily'],
        ['Income', '₹3–5 lakh annually (seasonal variability)'],
        ['Languages', 'Marathi (primary), Hindi (secondary)'],
      ],
      [2800, 6400]
    ),
    spacer(),
    h4('Goals'),
    bullet('Detect crop diseases early to avoid losing his entire cotton yield.'),
    bullet('Get weather alerts specific to his farm location, not the nearest city.'),
    bullet('Find better prices for his produce by bypassing local middlemen.'),
    bullet('Understand which government subsidies he qualifies for.'),
    h4('Frustrations'),
    bullet('Current apps are too complex and require constant internet connectivity.'),
    bullet('He receives generic advice that does not account for his specific soil and climate conditions.'),
    bullet('Phone calls to the agricultural extension officer take days to get a response.'),
    bullet('He learned about a government scheme only after the enrollment deadline had passed.'),
    h4('Design Implications'),
    bullet('Use icon-first design with text labels; avoid jargon.'),
    bullet('Prioritize offline capability for key features (disease detection results, farm records).'),
    bullet('Push notifications for weather alerts and scheme deadlines are critical.'),
    bullet('Onboarding must be completable in under 5 minutes with farm pre-population by geo-location.'),
    divider(),
    h3('Persona 2 — Dr. Anjali Sharma: The Agricultural Expert'),
    buildTable(
      ['Attribute', 'Detail'],
      [
        ['Full Name', 'Dr. Anjali Sharma'],
        ['Age', '42 years'],
        ['Location', 'Nagpur, Maharashtra'],
        ['Education', 'Ph.D. in Agronomy, IARI Delhi'],
        ['Role', 'Senior Agricultural Consultant, freelance'],
        ['Device', 'MacBook Pro + iPhone 14'],
        ['Connectivity', 'High-speed broadband + 5G'],
        ['Consultations', '15–20 farmers per month'],
        ['Tech Comfort', 'Power user; proficient with data tools'],
        ['Languages', 'English, Hindi, Marathi'],
      ],
      [2800, 6400]
    ),
    spacer(),
    h4('Goals'),
    bullet('Efficiently manage a large portfolio of farmer clients with structured case management.'),
    bullet('Access detailed farm data (soil, weather, crop history) before each consultation.'),
    bullet('Provide written recommendations that farmers can reference later.'),
    bullet('Track whether her recommendations were followed and the resulting outcomes.'),
    h4('Frustrations'),
    bullet('Farmers often do not have their farm data organized when they contact her.'),
    bullet('She cannot remotely monitor the progress of the interventions she recommends.'),
    bullet('There is no professional platform that manages her consulting schedule and case history.'),
    h4('Design Implications'),
    bullet('Expert dashboard must provide a unified view of all assigned farmer clients.'),
    bullet('Case notes and recommendation history must be searchable and exportable.'),
    bullet('The platform should support rich text recommendations with image attachments.'),
    divider(),
    h3('Persona 3 — Sanjay Malhotra: The Agri-Input Vendor'),
    buildTable(
      ['Attribute', 'Detail'],
      [
        ['Full Name', 'Sanjay Malhotra'],
        ['Age', '47 years'],
        ['Location', 'Nashik, Maharashtra'],
        ['Business', 'Agri-inputs wholesale and retail distributor'],
        ['Device', 'Windows laptop + Android tablet'],
        ['Monthly Revenue', '₹8–12 lakh'],
        ['Products', 'Seeds, fertilizers, pesticides, micro-irrigation kits'],
        ['Tech Comfort', 'Uses Tally, WhatsApp Business; moderately tech-savvy'],
      ],
      [2800, 6400]
    ),
    spacer(),
    h4('Goals'),
    bullet('Reach a larger customer base of farmers without relying on physical store walk-ins.'),
    bullet('Manage product listings, inventory, and order fulfillment from a single dashboard.'),
    bullet('Track sales performance and understand which products are in demand by region and season.'),
    h4('Frustrations'),
    bullet('Existing e-commerce platforms are not designed for agricultural products and do not understand seasonal demand patterns.'),
    bullet('Managing orders across WhatsApp, phone calls, and walk-ins is chaotic.'),
    h4('Design Implications'),
    bullet('Vendor dashboard must prioritize order management and inventory alerts.'),
    bullet('Product listing must support bulk upload (CSV import).'),
    bullet('Sales analytics must include seasonal trend views.'),
    spacer(),
    callout('Persona Usage', 'Personas must be referenced during every design review. When making a design decision, ask: "How does this work for Ravi? How does it work for Dr. Anjali?" Designing for the most constrained user (Ravi) typically results in a better experience for all users.'),
    spacer(),
    pageBreak(),
  ];
}

// ── Chapter 7: User Journey Maps ─────────────────────────────────────────────
function chUserJourney() {
  return [
    h1('7. User Journey Maps'),
    para('User journey maps document the end-to-end experience of key user flows, identifying touchpoints, emotions, pain points, and design opportunities at each stage. The following journeys represent the most critical paths within CropNova.'),
    spacer(),
    h3('7.1  Journey: Farmer Detects Crop Disease'),
    buildTable(
      ['Stage', 'User Action', 'Emotion', 'Pain Point', 'Design Opportunity'],
      [
        ['Awareness', 'Notices unusual spots on cotton leaves.', 'Worried', 'Does not know what is wrong.', 'Push notification: "Something wrong with your crop? Scan it now."'],
        ['Discovery', 'Opens CropNova app; sees AI Disease Detection prominently.', 'Hopeful', 'Unsure how to use the scanner.', 'Tooltip-guided onboarding; large, prominent "Scan Crop" button.'],
        ['Capture', 'Takes photo of affected leaf using in-app camera.', 'Focused', 'Poor lighting in field.', 'AI-powered lighting guidance overlay; auto-crop suggestion.'],
        ['Processing', 'Waits for AI analysis (< 30 seconds).', 'Anxious', 'Uncertainty about wait time.', 'Animated progress indicator with reassuring copy: "Analyzing your crop..."'],
        ['Results', 'Receives diagnosis: "Early Blight detected. 87% confidence."', 'Relieved / Concerned', 'Does not understand technical terms.', 'Plain-language summary; visual severity scale; recommended action cards.'],
        ['Action', 'Orders recommended fungicide from Marketplace.', 'Empowered', 'Not sure which brand to trust.', 'Expert-endorsed product badges; rating system; quick-order flow.'],
        ['Follow-up', 'Receives a 7-day monitoring reminder.', 'Reassured', 'May forget to re-scan.', 'Smart notification: "It has been 7 days. How is your crop? Scan again."'],
      ],
      [1400, 2000, 1200, 2000, 2600]
    ),
    spacer(),
    h3('7.2  Journey: Expert Consultation Booking'),
    buildTable(
      ['Stage', 'User Action', 'Emotion', 'Pain Point', 'Design Opportunity'],
      [
        ['Problem', 'Farmer identifies need for expert advice.', 'Uncertain', 'Doesn\'t know how to find a qualified expert.', 'Smart suggestion: "Based on your crop scan, consult an expert."'],
        ['Browse', 'Views expert directory filtered by specialization.', 'Evaluating', 'Too many options; hard to compare.', 'Expert cards with ratings, specialization tags, response time, and price.'],
        ['Select', 'Reviews Dr. Anjali\'s profile.', 'Interested', 'Does not know if expert understands his specific region.', 'Expert profile shows regional experience, language capability, case count.'],
        ['Book', 'Selects a time slot and pays consultation fee.', 'Committed', 'Payment anxiety.', 'Multiple payment options; clear cancellation policy.'],
        ['Consult', 'Attends video/chat consultation.', 'Engaged', 'Technical issues with video.', 'Integrated video call with fallback to voice/chat; session recording option.'],
        ['Resolution', 'Receives written recommendation report.', 'Satisfied', 'May lose the document.', 'Report auto-saved to farm profile; downloadable PDF.'],
        ['Outcome', 'Follows recommendation; crop recovers.', 'Grateful', 'No way to track impact.', 'Outcome tracking; expert notified; success badge on farmer profile.'],
      ],
      [1200, 1800, 1200, 2000, 3000]
    ),
    spacer(),
    h3('7.3  Journey: Government Scheme Enrollment'),
    buildTable(
      ['Stage', 'User Action', 'Emotion', 'Pain Point', 'Design Opportunity'],
      [
        ['Discovery', 'Farmer sees "3 Schemes Available For You" notification.', 'Curious', 'Did not know these schemes existed.', 'Proactive scheme matching based on profile; eligibility pre-check.'],
        ['Review', 'Reads scheme details: PM-KISAN ₹6,000/year.', 'Interested', 'Complex eligibility criteria in government language.', 'Plain-language summary; eligibility checklist; visual timeline.'],
        ['Apply', 'Initiates application; pre-filled form using profile data.', 'Motivated', 'Repetitive data entry across forms.', 'Auto-fill from farmer profile; document upload from device gallery.'],
        ['Submit', 'Submits application.', 'Hopeful', 'Uncertainty about what happens next.', 'Application reference number; status tracker; expected timeline.'],
        ['Track', 'Checks application status: "Under Review."', 'Patient', 'No updates for weeks.', 'SMS + push notification at each status change.'],
        ['Approval', 'Receives notification: "Scheme Approved!"', 'Delighted', 'Does not know when funds arrive.', 'Disbursement timeline displayed; bank account verification prompt.'],
      ],
      [1200, 1800, 1200, 2000, 3000]
    ),
    spacer(),
    pageBreak(),
  ];
}

// ── Chapter 8: Information Architecture ─────────────────────────────────────
function chInfoArchitecture() {
  return [
    h1('8. Information Architecture'),
    para('The Information Architecture (IA) defines how CropNova\'s content and features are organized, labeled, and navigated. A well-structured IA reduces cognitive load, enables discoverability, and ensures users can always locate what they need within three clicks or fewer from the main dashboard.'),
    spacer(),
    h3('8.1  IA Principles Applied'),
    bullet('Principle of Choices: Limit navigation items to 7 ± 2 per level to avoid cognitive overload.'),
    bullet('Principle of Growth: Structure accommodates future feature additions without architectural rework.'),
    bullet('Principle of Exemplars: Group items by category using recognizable real-world examples as labels.'),
    bullet('Principle of Front Doors: Every major section accessible from the sidebar within one click.'),
    spacer(),
    h3('8.2  Site Map — Top-Level Navigation'),
    buildTable(
      ['Level 1 (Module)', 'Level 2 (Sub-pages)', 'User Roles'],
      [
        ['Dashboard', 'Farm Overview, KPIs, Weather Summary, AI Alerts', 'All'],
        ['Crop Management', 'My Crops, Crop Calendar, Growth Stages, Harvest Tracker', 'Farmer, Expert'],
        ['Farm Management', 'Farm Profile, Field Map, Activity Log, Resource Tracking', 'Farmer, Admin'],
        ['AI Disease Detection', 'Scan Crop, Detection History, Disease Library', 'Farmer, Expert, Researcher'],
        ['Weather', 'Current Conditions, 7-Day Forecast, Historical Data, Alerts', 'All'],
        ['Soil Health', 'Soil Reports, Test Results, Soil Map, Recommendations', 'Farmer, Expert'],
        ['Fertilizer', 'Recommendations, Application Schedule, Cost Calculator', 'Farmer, Expert'],
        ['Irrigation', 'Schedule, Soil Moisture Tracker, Water Budget, Alerts', 'Farmer'],
        ['Marketplace', 'Browse Products, My Orders, Wishlist, Vendor Profiles', 'Farmer, Vendor'],
        ['Expert Consultation', 'Find Expert, My Consultations, Case History', 'Farmer, Expert'],
        ['Government Schemes', 'Available Schemes, My Applications, Eligibility Check', 'Farmer, Authority'],
        ['Reports & Analytics', 'Farm Reports, AI Insights, Export Data, Custom Reports', 'All'],
        ['Notifications', 'All Alerts, System Notifications, Reminders', 'All'],
        ['Profile', 'Personal Info, Farm Details, Documents, Verification', 'All'],
        ['Settings', 'Account, Notifications, Language, Privacy, Security', 'All'],
        ['Admin Panel', 'User Management, Content, Analytics, System Health', 'Admin'],
      ],
      [3000, 3600, 2600]
    ),
    spacer(),
    h3('8.3  Navigation Hierarchy Rules'),
    bullet('Maximum three levels of navigation depth. If content requires a fourth level, it should be redesigned into a separate section or modal.'),
    bullet('Breadcrumbs displayed on all Level 2 and Level 3 pages.'),
    bullet('The active navigation item is always visually highlighted with the primary color background.'),
    bullet('Role-based navigation: menu items not available to the current user role are hidden (not greyed out) to avoid confusion.'),
    spacer(),
    h3('8.4  Search Architecture'),
    para('CropNova implements a global search capability accessible from all screens via the top navigation bar. Search scope is role-dependent:'),
    buildTable(
      ['User Role', 'Search Scope'],
      [
        ['Farmer', 'My crops, schemes, marketplace products, diseases, expert profiles.'],
        ['Expert', 'My clients, consultation cases, disease library, research data.'],
        ['Vendor', 'My products, orders, customers.'],
        ['Admin', 'All users, all content, system logs.'],
      ],
      [2200, 7000]
    ),
    spacer(),
    pageBreak(),
  ];
}

// ── Chapter 9: Design Philosophy ─────────────────────────────────────────────
function chDesignPhilosophy() {
  return [
    h1('9. Design Philosophy'),
    para('CropNova\'s design philosophy is grounded in the intersection of agricultural reality and digital excellence. Every design decision is evaluated against three core lenses: Does it work for the farmer? Does it build trust? Does it scale?'),
    spacer(),
    h3('9.1  Core Design Principles'),
    buildTable(
      ['Principle', 'Statement', 'Application in CropNova'],
      [
        ['Clarity First', 'Information must be immediately comprehensible without explanation.', 'Plain-language labels; visual hierarchy that guides the eye; no unexplained icons.'],
        ['Progressive Disclosure', 'Show only what is needed now; reveal complexity on demand.', 'Summary cards expand to detailed views; advanced settings hidden behind "Advanced" toggle.'],
        ['Contextual Intelligence', 'The interface should adapt to what the user is doing and when.', 'Dashboard reconfigures based on season, crop stage, and pending alerts.'],
        ['Empathetic Design', 'Design for the most constrained user — low literacy, poor connectivity, small screen.', 'All features must work on a 360px screen with 3G connection and no tutorial.'],
        ['Trust Through Transparency', 'Users must understand why the AI makes recommendations.', 'Confidence scores, data source indicators, and recommendation explanations on every AI output.'],
        ['Consistent Patterns', 'Similar actions always look and behave the same way.', 'Unified component library; no one-off design exceptions without documented justification.'],
      ],
      [2000, 2800, 4400]
    ),
    spacer(),
    h3('9.2  Design Aesthetic Direction'),
    para('The visual aesthetic of CropNova is described as "Modern Agrarian Precision" — a design language that celebrates the natural world through clean digital execution. This means:'),
    bullet('Natural color palette rooted in greens and earthy accent tones, never artificial or synthetic-feeling.'),
    bullet('Generous white space that breathes — the interface should feel like a well-tended field, not a crowded market.'),
    bullet('Rounded corners (16px border-radius) that feel approachable and modern, not corporate or rigid.'),
    bullet('Photography and illustration that features real farmers in real fields — authentic, not stock-photo generic.'),
    bullet('Data visualizations that prioritize meaning over decoration; charts must answer a question, not fill space.'),
    spacer(),
    callout('Design Law', 'Hick\'s Law is the governing principle for all navigation and decision-point design in CropNova. The time to make a decision increases with the number and complexity of choices. Every screen must be audited for unnecessary choices. If a user does not need to make a decision on this screen, do not give them one.'),
    spacer(),
    pageBreak(),
  ];
}

// ── Chapter 10: Brand Identity ────────────────────────────────────────────────
function chBrandIdentity() {
  return [
    h1('10. Brand Identity'),
    h3('10.1  Brand Essence'),
    para('CropNova\'s brand is built on four brand pillars: Growth, Trust, Innovation, and Sustainability. These pillars are not marketing abstractions — they are design directives that manifest in color, typography, iconography, tone of voice, and every micro-interaction.'),
    spacer(),
    buildTable(
      ['Brand Pillar', 'Visual Expression', 'UX Expression', 'Tone of Voice'],
      [
        ['Growth', 'Upward-trending charts; lush green palette; flourishing imagery.', 'Progress indicators; achievement badges; outcome tracking.', 'Encouraging, forward-looking, action-oriented.'],
        ['Trust', 'Clean white space; consistent patterns; professional typography.', 'Confidence indicators; data source transparency; audit trails.', 'Authoritative but warm; fact-based; never alarmist.'],
        ['Innovation', 'AI/ML feature highlights; subtle gradient accents; modern iconography.', 'Smart defaults; predictive inputs; proactive alerts.', 'Intelligent, clear, never intimidating.'],
        ['Sustainability', 'Eco-green primary; water-saving metrics; responsible data use.', 'Sustainability scorecards; water and fertilizer efficiency KPIs.', 'Responsible, purposeful, long-term thinking.'],
      ],
      [1800, 2600, 2600, 2200]
    ),
    spacer(),
    h3('10.2  Logo Guidelines'),
    para('The CropNova logotype combines a stylized crop leaf mark with the wordmark "CropNova" set in Poppins Bold. Usage rules:'),
    bullet('Minimum logo size: 120px wide on digital; 30mm wide in print.'),
    bullet('Clear space: Maintain a minimum clear space equal to the height of the letter "C" in the wordmark on all four sides.'),
    bullet('Approved color versions: Primary green on white; white on primary green; monochrome on constrained backgrounds.'),
    bullet('Never stretch, rotate, recolor, or add effects (shadows, outlines) to the logo.'),
    bullet('The logo always appears in the top-left corner of the navigation header.'),
    spacer(),
    h3('10.3  Iconography System'),
    para('CropNova uses a custom icon set based on the Phosphor Icons library, extended with agriculture-specific custom icons. Icon style specifications:'),
    buildTable(
      ['Property', 'Specification'],
      [
        ['Style', 'Outlined (primary); Filled (selected/active states)'],
        ['Grid', '24×24px base grid'],
        ['Stroke Weight', '1.5px (standard); 2px (emphasized)'],
        ['Corner Radius', '2px on icon-internal corners'],
        ['Color Usage', 'Inherits text color; primary green for active states'],
        ['Minimum Touch Target', '44×44px (icon centered within touch target)'],
        ['Export Format', 'SVG (preferred); PNG @1×, @2×, @3× for fallback'],
      ],
      [2800, 6400]
    ),
    spacer(),
    h3('10.4  Illustration Style'),
    para('Where illustrations are used (empty states, onboarding, error pages), they follow the CropNova illustration language:'),
    bullet('Flat illustration style with subtle depth through layering, not shadows.'),
    bullet('Characters have diverse skin tones and feature South Asian farmer archetypes.'),
    bullet('Color palette restricted to the brand palette — no off-brand colors in illustrations.'),
    bullet('Agricultural scenes: fields, crops, soil, weather, and farming tools as primary subjects.'),
    spacer(),
    pageBreak(),
  ];
}

// ── Chapter 11: Color System ──────────────────────────────────────────────────
function chColorSystem() {
  return [
    h1('11. Color System'),
    para('The CropNova color system is designed to be purposeful, accessible, and scalable. Each color has a defined role and must only be used for its designated purpose. Arbitrary use of color outside this system is not permitted.'),
    spacer(),
    h3('11.1  Primary Color — Forest Green'),
    buildTable(
      ['Property', 'Value'],
      [
        ['Hex Code', '#2E7D32'],
        ['RGB', 'R: 46, G: 125, B: 50'],
        ['HSL', 'H: 123°, S: 46%, L: 34%'],
        ['WCAG Contrast on White', '7.24:1 — AAA Compliant'],
        ['Purpose', 'Brand identity, primary actions, active navigation, key data points'],
        ['UI Components', 'Primary buttons, sidebar active state, progress bars, chart primary series, focus rings, links'],
        ['Recommended Usage', 'Use for the single most important action on any screen. Do not use for decorative purposes.'],
        ['Avoid', 'Large background areas (use #F8FAF5 instead); body text on colored backgrounds'],
      ],
      [2800, 6400]
    ),
    spacer(),
    h3('11.2  Primary Hover — Deep Forest'),
    buildTable(
      ['Property', 'Value'],
      [
        ['Hex Code', '#1B5E20'],
        ['RGB', 'R: 27, G: 94, B: 32'],
        ['WCAG Contrast on White', '9.48:1 — AAA Compliant'],
        ['Purpose', 'Interactive state feedback on hover/press for primary elements'],
        ['UI Components', 'Button hover/pressed states, link hover, sidebar item hover'],
        ['Recommended Usage', 'Used exclusively as the hover/active transition of the primary color. Never use as a standalone color.'],
      ],
      [2800, 6400]
    ),
    spacer(),
    h3('11.3  Secondary Color — Fresh Green'),
    buildTable(
      ['Property', 'Value'],
      [
        ['Hex Code', '#4CAF50'],
        ['RGB', 'R: 76, G: 175, B: 80'],
        ['WCAG Contrast on White', '3.04:1 — AA Large Text'],
        ['Purpose', 'Secondary actions, success indicators, accent highlights, gradient fills'],
        ['UI Components', 'Secondary buttons, success badges, chart secondary series, gradient start/end, icon fills'],
        ['Recommended Usage', 'Pair with primary green in gradients; use for positive metrics and success states.'],
        ['Avoid', 'Body text on white (insufficient contrast); use #2E7D32 for text instead'],
      ],
      [2800, 6400]
    ),
    spacer(),
    h3('11.4  Accent Color — Harvest Gold'),
    buildTable(
      ['Property', 'Value'],
      [
        ['Hex Code', '#F9A825'],
        ['RGB', 'R: 249, G: 168, B: 37'],
        ['WCAG Contrast on White', '2.17:1 (background use only)'],
        ['Purpose', 'Call-outs, warnings, highlights, featured content, premium badges'],
        ['UI Components', 'Warning alerts, feature highlights, notification dots, rating stars, premium tier labels'],
        ['Recommended Usage', 'Use sparingly as an accent to draw attention. Maximum 10% of screen real estate.'],
        ['Avoid', 'Text color (insufficient contrast); overuse dilutes its attention-directing power'],
      ],
      [2800, 6400]
    ),
    spacer(),
    h3('11.5  Semantic Colors'),
    buildTable(
      ['Color', 'Hex', 'RGB', 'Usage'],
      [
        ['Success', '#43A047', 'R:67, G:160, B:71', 'Successful actions, positive confirmations, green metrics.'],
        ['Warning', '#FB8C00', 'R:251, G:140, B:0', 'Non-critical alerts, caution states, pending items.'],
        ['Error', '#E53935', 'R:229, G:57, B:53', 'Errors, destructive actions, critical alerts, form validation failures.'],
        ['Info', '#1976D2', 'R:25, G:118, B:210', 'Informational messages, help tooltips, general notifications.'],
      ],
      [1600, 1600, 2200, 3800]
    ),
    spacer(),
    h3('11.6  Neutral / Background Colors'),
    buildTable(
      ['Name', 'Hex', 'Usage'],
      [
        ['App Background', '#F8FAF5', 'Main page background; communicates a subtle natural, organic feel.'],
        ['Card Background', '#FFFFFF', 'All card surfaces, modals, panels, and input fields.'],
        ['Primary Text', '#263238', 'All headings and body text on light backgrounds.'],
        ['Secondary Text', '#607D8B', 'Placeholders, captions, metadata, help text.'],
        ['Border', '#E0E0E0', 'Dividers, card borders, input field borders, table row borders.'],
        ['Disabled', '#BDBDBD', 'Disabled input fields, inactive controls, placeholder text.'],
      ],
      [2200, 1600, 5400]
    ),
    spacer(),
    h3('11.7  Color Usage Rules'),
    callout('Critical Rule', 'The following color usage rules are mandatory. Violations discovered in design review or QA will result in the feature being blocked from release.', 'warning'),
    spacer(),
    bullet('MUST: All text/background color combinations must meet WCAG 2.1 AA minimum contrast ratio (4.5:1 for normal text; 3:1 for large text ≥ 18pt or ≥ 14pt bold).'),
    bullet('MUST: Never use color as the sole means of conveying information (e.g., use icon + color for status indicators, not color alone).'),
    bullet('MUST: Interactive elements must have a visible focus ring using the primary green (#2E7D32) at 2px offset.'),
    bullet('SHOULD: Error states use #E53935 with a supporting icon and text message — never rely solely on the red color to communicate the error.'),
    bullet('SHOULD: Warning states use #FB8C00 with supporting text; do not use for informational content.'),
    bullet('MAY: Use color to reinforce meaning in data visualizations, but always pair with pattern, shape, or label for accessibility.'),
    spacer(),
    pageBreak(),
  ];
}

// ── Chapter 12: Typography System ────────────────────────────────────────────
function chTypography() {
  return [
    h1('12. Typography System'),
    para('Typography in CropNova is a core component of the design system, not an afterthought. The type system is built for clarity, hierarchy, and accessibility — ensuring that users can effortlessly scan and read content across all device sizes and lighting conditions.'),
    spacer(),
    h3('12.1  Font Families'),
    buildTable(
      ['Role', 'Font Family', 'Weights Used', 'Rationale'],
      [
        ['Display / Headings', 'Poppins', '700 (Bold), 600 (SemiBold)', 'Geometric, modern, approachable; excellent legibility at large sizes; free via Google Fonts.'],
        ['Body / UI Text', 'Inter', '400 (Regular), 500 (Medium)', 'Designed for screen readability; superior legibility at small sizes; metric-compatible with system fonts.'],
        ['Buttons / Labels', 'Poppins', '500 (Medium)', 'Consistency with heading family; medium weight reads well at button sizes.'],
        ['Monospace / Code', 'JetBrains Mono', '400 (Regular)', 'Used in developer-facing sections, API keys, and technical data displays.'],
        ['Fallback Stack', 'system-ui, -apple-system, sans-serif', '—', 'Ensures readability if web fonts fail to load; critical for low-connectivity environments.'],
      ],
      [1800, 2000, 2000, 3400]
    ),
    spacer(),
    h3('12.2  Type Scale — Heading Hierarchy'),
    buildTable(
      ['Level', 'Tag', 'Font', 'Size', 'Weight', 'Line Height', 'Usage'],
      [
        ['Display', 'N/A', 'Poppins', '48px / 3rem', '700', '1.2', 'Hero headlines, landing page only.'],
        ['H1', '<h1>', 'Poppins', '36px / 2.25rem', '700', '1.3', 'Page titles (one per page).'],
        ['H2', '<h2>', 'Poppins', '28px / 1.75rem', '700', '1.35', 'Section titles.'],
        ['H3', '<h3>', 'Poppins', '22px / 1.375rem', '600', '1.4', 'Subsection headings, card titles.'],
        ['H4', '<h4>', 'Poppins', '18px / 1.125rem', '600', '1.45', 'Widget headings, table headers.'],
        ['H5', '<h5>', 'Poppins', '16px / 1rem', '600', '1.5', 'Small card labels, sidebar section titles.'],
        ['H6', '<h6>', 'Poppins', '14px / 0.875rem', '600', '1.5', 'Metadata labels, form group labels.'],
      ],
      [1000, 800, 1200, 1400, 1000, 1200, 2600]
    ),
    spacer(),
    h3('12.3  Type Scale — Body Text'),
    buildTable(
      ['Name', 'Font', 'Size', 'Weight', 'Line Height', 'Usage'],
      [
        ['Body Large', 'Inter', '18px / 1.125rem', '400', '1.6', 'Lead paragraphs, introductory text.'],
        ['Body', 'Inter', '16px / 1rem', '400', '1.6', 'Default body text, descriptions.'],
        ['Body Small', 'Inter', '14px / 0.875rem', '400', '1.5', 'Secondary text, captions, footnotes.'],
        ['Label', 'Inter', '14px / 0.875rem', '500', '1.4', 'Form labels, table cell text, badge text.'],
        ['Caption', 'Inter', '12px / 0.75rem', '400', '1.4', 'Timestamps, metadata, image captions.'],
        ['Button Text', 'Poppins', '14px / 0.875rem', '500', '1.2', 'All button labels.'],
        ['Input Text', 'Inter', '16px / 1rem', '400', '1.5', 'Text entered in input fields.'],
        ['Placeholder', 'Inter', '16px / 1rem', '400', '—', 'Placeholder text in inputs (color: #607D8B).'],
      ],
      [1600, 1200, 1600, 1000, 1200, 2600]
    ),
    spacer(),
    h3('12.4  Typography Rules'),
    bullet('Maximum line length (measure): 70–80 characters for body text. Use column width constraints to enforce this.'),
    bullet('Minimum body text size: 16px on desktop; 14px only for secondary/caption text. Never below 12px.'),
    bullet('Text and background must meet 4.5:1 contrast ratio at all text sizes below 18pt.'),
    bullet('Avoid fully justified text alignment — it creates uneven word spacing (rivers) that impairs readability.'),
    bullet('Use optical sizing on headings (letter-spacing: -0.01em for H1; 0 for H3 and below).'),
    bullet('Poppins must be loaded with font-display: swap to prevent FOIT (Flash of Invisible Text) on slow connections.'),
    spacer(),
    pageBreak(),
  ];
}

// ── Chapter 13: Design Tokens ─────────────────────────────────────────────────
function chDesignTokens() {
  return [
    h1('13. Design Tokens'),
    para('Design tokens are the atomic values of the CropNova design system. They are the single source of truth for all visual properties — colors, spacing, typography, shadows, and more. Tokens are defined once and referenced everywhere, ensuring consistency and enabling global changes (such as dark mode) with minimal code changes.'),
    spacer(),
    callout('Implementation Note', 'Design tokens should be implemented as CSS Custom Properties (variables) in the root stylesheet, and as a JSON/JS token file consumed by the design tool (Figma via Tokens Studio plugin). All values below are normative — developers MUST use token names, not hard-coded hex or pixel values.'),
    spacer(),
    h3('13.1  Color Tokens'),
    buildTable(
      ['Token Name', 'Value', 'Usage'],
      [
        ['--color-primary', '#2E7D32', 'Primary brand color; buttons, links, active states.'],
        ['--color-primary-hover', '#1B5E20', 'Hover/pressed state of primary elements.'],
        ['--color-secondary', '#4CAF50', 'Secondary actions; success gradients.'],
        ['--color-accent', '#F9A825', 'Highlights, warnings, premium labels.'],
        ['--color-bg-page', '#F8FAF5', 'Page-level background.'],
        ['--color-bg-card', '#FFFFFF', 'Card, modal, panel backgrounds.'],
        ['--color-text-primary', '#263238', 'Primary text across all components.'],
        ['--color-text-secondary', '#607D8B', 'Secondary, placeholder, caption text.'],
        ['--color-border', '#E0E0E0', 'All border and divider lines.'],
        ['--color-success', '#43A047', 'Success semantic color.'],
        ['--color-warning', '#FB8C00', 'Warning semantic color.'],
        ['--color-error', '#E53935', 'Error and destructive action color.'],
        ['--color-info', '#1976D2', 'Informational message color.'],
        ['--color-disabled', '#BDBDBD', 'Disabled state for all interactive elements.'],
      ],
      [3200, 2200, 3800]
    ),
    spacer(),
    h3('13.2  Spacing Tokens (8-point Grid)'),
    buildTable(
      ['Token Name', 'Value', 'Usage'],
      [
        ['--space-1', '4px', 'Micro spacing; icon-text gap; badge padding.'],
        ['--space-2', '8px', 'Component internal padding (small); icon margins.'],
        ['--space-3', '12px', 'Button padding (vertical); input internal padding.'],
        ['--space-4', '16px', 'Standard component gap; card padding (small).'],
        ['--space-5', '20px', 'Card padding (default); form field gap.'],
        ['--space-6', '24px', 'Section padding; column gap in layouts.'],
        ['--space-8', '32px', 'Large section padding; card padding (large).'],
        ['--space-10', '40px', 'Page section spacing; modal padding.'],
        ['--space-12', '48px', 'Major section breaks; hero padding.'],
        ['--space-16', '64px', 'Full-bleed section padding on desktop.'],
      ],
      [2800, 1400, 5000]
    ),
    spacer(),
    h3('13.3  Border Radius Tokens'),
    buildTable(
      ['Token Name', 'Value', 'Usage'],
      [
        ['--radius-sm', '4px', 'Tags, badges, small chips.'],
        ['--radius-md', '8px', 'Buttons, small cards, input fields.'],
        ['--radius-lg', '12px', 'Feature cards, modal corners.'],
        ['--radius-xl', '16px', 'Main content cards, primary panels.'],
        ['--radius-2xl', '24px', 'Hero cards, large feature panels.'],
        ['--radius-full', '9999px', 'Pill buttons, avatar frames, toggle switches.'],
      ],
      [2800, 1400, 5000]
    ),
    spacer(),
    h3('13.4  Shadow / Elevation Tokens'),
    buildTable(
      ['Token Name', 'CSS Value', 'Elevation', 'Usage'],
      [
        ['--shadow-none', 'none', '0', 'Flat surfaces; no elevation.'],
        ['--shadow-xs', '0 1px 2px rgba(0,0,0,0.06)', '1', 'Subtle card lift; table rows on hover.'],
        ['--shadow-sm', '0 2px 8px rgba(0,0,0,0.08)', '2', 'Default card shadow; input field focus.'],
        ['--shadow-md', '0 4px 16px rgba(0,0,0,0.10)', '4', 'Dropdown menus; popovers; tooltips.'],
        ['--shadow-lg', '0 8px 32px rgba(0,0,0,0.12)', '8', 'Modals; sidebars; drawer panels.'],
        ['--shadow-xl', '0 16px 48px rgba(0,0,0,0.14)', '16', 'Full-screen overlays; hero cards.'],
      ],
      [2200, 3200, 1000, 2800]
    ),
    spacer(),
    h3('13.5  Opacity Tokens'),
    buildTable(
      ['Token Name', 'Value', 'Usage'],
      [
        ['--opacity-disabled', '0.38', 'Disabled interactive elements.'],
        ['--opacity-medium', '0.60', 'Inactive icons; secondary imagery.'],
        ['--opacity-high', '0.87', 'Secondary text on light backgrounds.'],
        ['--opacity-overlay', '0.48', 'Modal backdrop; drawer overlay.'],
        ['--opacity-full', '1.00', 'All fully visible content.'],
      ],
      [2600, 1400, 5200]
    ),
    spacer(),
    h3('13.6  Grid System Tokens'),
    buildTable(
      ['Token', 'Desktop (≥1280px)', 'Tablet (768–1279px)', 'Mobile (<768px)'],
      [
        ['--grid-columns', '12', '8', '4'],
        ['--grid-gutter', '24px', '20px', '16px'],
        ['--grid-margin', '64px', '32px', '16px'],
        ['--grid-max-width', '1440px', '100%', '100%'],
      ],
      [2600, 2200, 2200, 2200]
    ),
    spacer(),
    pageBreak(),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE ALL SECTIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function buildDocument() {
  const allChildren = [
    ...coverPage(),
    ...tableOfContents(),
    ...chIntroduction(),
    ...chProjectVision(),
    ...chProblemStatement(),
    ...chObjectives(),
    ...chTargetAudience(),
    ...chUserPersonas(),
    ...chUserJourney(),
    ...chInfoArchitecture(),
    ...chDesignPhilosophy(),
    ...chBrandIdentity(),
    ...chColorSystem(),
    ...chTypography(),
    ...chDesignTokens(),
  ];

  const doc = new Document({
    numbering: {
      config: [{
        reference: 'bullet-list',
        levels: [{
          level: 0, format: LevelFormat.BULLET,
          text: '\u2022',
          alignment: AlignmentType.LEFT,
          style: {
            run: { font: 'Symbol', size: 20 },
            paragraph: { indent: { left: 440, hanging: 260 } },
          },
        }, {
          level: 1, format: LevelFormat.BULLET,
          text: '\u25E6',
          alignment: AlignmentType.LEFT,
          style: {
            run: { font: 'Courier New', size: 20 },
            paragraph: { indent: { left: 880, hanging: 260 } },
          },
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      children: allChildren,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('./cropnova_part1.docx', buffer);
  console.log('Part 1 written successfully');
}

buildDocument().catch(console.error);