const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '../Research/SI_EMS_AEV_Flagship_Research_Syllabus.md');
const outPath = path.join(__dirname, '../src/app/si-ems/syllabus-data.ts');

const md = fs.readFileSync(mdPath, 'utf8');

// --- Helpers ---
function esc(str) {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
}
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Detect if a code block looks like a diagram
const DIAGRAM_KEYWORDS = ['Level 3:', 'Level 2:', 'Level 1:', 'Level 0:', 'Layer 5', 'Layer 4', 'Tier 1', 'Tier 2', 'Tier 3', 'Battery Pack', 'BMS Master', '↕', '↓', '↑'];
function mightBeDiagram(content) {
  return DIAGRAM_KEYWORDS.some(k => content.includes(k));
}

// Parse a block of text into sections (non-recursive, always increments)
function parseSections(text) {
  const sections = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // --- Skip blank lines ---
    if (trimmed === '' || trimmed === '---') {
      i++;
      continue;
    }

    // --- Code block ---
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const codeContent = codeLines.join('\n').trimEnd();
      if (codeContent.trim()) {
        sections.push({
          type: 'code',
          content: codeContent,
          isDiagram: mightBeDiagram(codeContent)
        });
      }
      continue;
    }

    // --- Table ---
    if (trimmed.startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      // Row 0 = headers, Row 1 = separator, Row 2+ = data
      if (tableLines.length >= 3) {
        const headers = tableLines[0].split('|').map(s => s.trim()).filter(Boolean);
        const rows = tableLines.slice(2).map(r => r.split('|').map(s => s.trim()).filter(Boolean));
        sections.push({ type: 'table', content: { headers, rows } });
      }
      continue;
    }

    // --- Subheading H3 ---
    if (trimmed.startsWith('### ')) {
      sections.push({ type: 'subheading', content: trimmed.slice(4).trim() });
      i++;
      continue;
    }

    // --- Subheading H4 ---
    if (trimmed.startsWith('#### ')) {
      sections.push({ type: 'subheading', content: trimmed.slice(5).trim() });
      i++;
      continue;
    }

    // --- Blockquote ---
    if (trimmed.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^> ?/, ''));
        i++;
      }
      sections.push({ type: 'quote', content: quoteLines.join(' ').trim() });
      continue;
    }

    // --- Bullet list ---
    if (trimmed.match(/^[-*] /) || trimmed.match(/^\d+\. /)) {
      const items = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (t.match(/^[-*] /) || t.match(/^\d+\. /)) {
          items.push(t.replace(/^[-*] /, '').replace(/^\d+\. /, ''));
          i++;
        } else if (lines[i].match(/^  +[-*] /)) {
          // indent sub-bullet — attach to last item
          items.push('  ' + lines[i].trim().replace(/^[-*] /, ''));
          i++;
        } else {
          break;
        }
      }
      if (items.length > 0) {
        sections.push({ type: 'list', content: items });
      }
      continue;
    }

    // --- Glossary / definition lines: **TERM** — Definition  ---
    // Detected by: line starts with ** and contains " — "
    if (trimmed.startsWith('**') && trimmed.includes(' — ')) {
      const glossaryItems = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (t.startsWith('**') && t.includes(' — ')) {
          // Clean up trailing spaces (Markdown line-break)
          glossaryItems.push(t.replace(/  +$/, ''));
          i++;
        } else if (t === '' || t === '---') {
          // Allow blank lines between glossary entries
          i++;
          if (i < lines.length && lines[i].trim().startsWith('**') && lines[i].trim().includes(' — ')) {
            continue;
          }
          break;
        } else {
          break;
        }
      }
      if (glossaryItems.length > 0) {
        sections.push({ type: 'glossary', content: glossaryItems });
      }
      continue;
    }

    // --- Skip headings that are ## (chapter boundaries) or # (part boundaries) ---
    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      i++;
      continue;
    }

    // --- Paragraph (everything else): collect consecutive non-special lines ---
    const paraLines = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (
        t === '' || t === '---' ||
        t.startsWith('```') || t.startsWith('|') ||
        t.startsWith('### ') || t.startsWith('#### ') ||
        t.startsWith('>') ||
        t.match(/^[-*] /) || t.match(/^\d+\. /) ||
        t.startsWith('## ') || t.startsWith('# ') ||
        (t.startsWith('**') && t.includes(' — '))
      ) {
        break;
      }
      paraLines.push(lines[i]);
      i++;
    }
    const paraText = paraLines.join(' ').replace(/\s+/g, ' ').trim();
    if (paraText) {
      sections.push({ type: 'paragraph', content: paraText });
    }
  }

  return sections;
}

// Serialize a section to TypeScript string
function sectionToTS(s) {
  const ind = '        ';
  if (s.type === 'table') {
    return `${ind}{ type: 'table', content: { headers: ${JSON.stringify(s.content.headers)}, rows: ${JSON.stringify(s.content.rows)} } }`;
  }
  if (s.type === 'code') {
    const diagramFlag = s.isDiagram ? ', isDiagram: true' : '';
    return `${ind}{ type: 'code', content: \`${esc(s.content)}\`${diagramFlag} }`;
  }
  if (s.type === 'glossary') {
    const items = s.content.map(item => `          ${JSON.stringify(item)}`).join(',\n');
    return `${ind}{ type: 'glossary', content: [\n${items}\n${ind}] }`;
  }
  if (s.type === 'list') {
    const items = s.content.map(item => `          ${JSON.stringify(item)}`).join(',\n');
    return `${ind}{ type: 'list', content: [\n${items}\n${ind}] }`;
  }
  return `${ind}{ type: ${JSON.stringify(s.type)}, content: ${JSON.stringify(s.content)} }`;
}

// ----- MAIN PARSING -----
const rawParts = md.split(/\n# PART /).slice(1);

let output = `// AUTO-GENERATED by scripts/build-syllabus.js — do not edit manually
// Source: Research/SI_EMS_AEV_Flagship_Research_Syllabus.md

export interface SyllabusSection {
  type: 'paragraph' | 'list' | 'code' | 'formula' | 'diagram' | 'quote' | 'table' | 'subheading' | 'glossary';
  content: any;
  isDiagram?: boolean;
}

export interface SyllabusChapter {
  id: string;
  number: string;
  title: string;
  sections: SyllabusSection[];
}

export interface SyllabusPart {
  id: string;
  part: string;
  title: string;
  chapters: SyllabusChapter[];
}

export const syllabusData: SyllabusPart[] = [\n`;

let totalParts = 0;
let totalChapters = 0;

for (const rawPart of rawParts) {
  const lines = rawPart.split('\n');
  const header = lines[0].trim();
  const dashIdx = header.indexOf('—');
  const partNum = dashIdx > 0 ? header.slice(0, dashIdx).trim() : header;
  const partTitle = dashIdx > 0 ? header.slice(dashIdx + 1).trim() : header;
  const partId = `part${slugify(partNum)}`;
  const partLabel = `PART ${partNum}`;

  const rawChapters = rawPart.split(/\n## Chapter /).slice(1);
  const chBlocks = [];

  for (const rawCh of rawChapters) {
    const cLines = rawCh.split('\n');
    const chHeader = cLines[0].trim();
    const chDash = chHeader.indexOf('—');
    const chNum = chDash > 0 ? chHeader.slice(0, chDash).trim() : chHeader;
    const chTitle = chDash > 0 ? chHeader.slice(chDash + 1).trim() : chHeader;
    const chId = `ch${slugify(chNum)}`;
    const chBody = cLines.slice(1).join('\n');
    const sections = parseSections(chBody);
    const secTS = sections.map(sectionToTS).join(',\n');

    chBlocks.push(`    {
      id: ${JSON.stringify(chId)},
      number: ${JSON.stringify(chNum)},
      title: ${JSON.stringify(chTitle)},
      sections: [
${secTS}
      ]
    }`);
    totalChapters++;
    process.stdout.write('.');
  }

  output += `  {\n    id: ${JSON.stringify(partId)},\n    part: ${JSON.stringify(partLabel)},\n    title: ${JSON.stringify(partTitle)},\n    chapters: [\n${chBlocks.join(',\n')}\n    ]\n  },\n`;
  totalParts++;
}

output += `];\n`;

fs.writeFileSync(outPath, output, 'utf8');
const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`\n✅  Generated syllabus-data.ts`);
console.log(`   Parts: ${totalParts}`);
console.log(`   Chapters: ${totalChapters}`);
console.log(`   Output size: ${sizeKB} KB`);
