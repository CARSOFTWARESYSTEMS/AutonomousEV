import React from 'react';
import { SyllabusSection as SectionType } from '@/app/si-ems/syllabus-data';
import * as Diagrams from './Diagrams';

interface SyllabusSectionProps {
  section: SectionType;
  isMobile?: boolean;
}

const SyllabusSection: React.FC<SyllabusSectionProps> = ({ section, isMobile }) => {
  const [isExpanded, setIsExpanded] = React.useState(!isMobile);

  const renderContent = () => {
    switch (section.type) {
      case 'paragraph':
        return <p className="syllabus-paragraph">{renderMarkdown(section.content)}</p>;
      case 'subheading':
        return <h4 className="syllabus-subheading">{section.content}</h4>;
      case 'list':
        return (
          <ul className="syllabus-list">
            {section.content.map((item: string, idx: number) => (
              <li key={idx}>{renderMarkdown(item)}</li>
            ))}
          </ul>
        );
      case 'code':
        if ((section as any).isDiagram) {
          return (
            <div className="syllabus-diagram-panel">
              <div className="syllabus-diagram-label">ARCHITECTURE DIAGRAM</div>
              <pre className="syllabus-diagram-code">{section.content}</pre>
            </div>
          );
        }
        return (
          <div className="syllabus-code-wrapper">
            <pre className="syllabus-code">
              <code>{section.content}</code>
            </pre>
          </div>
        );
      case 'glossary':
        return (
          <dl className="syllabus-glossary">
            {section.content.map((entry: string, idx: number) => {
              const dashIdx = entry.indexOf(' — ');
              if (dashIdx === -1) return <div key={idx} className="syllabus-glossary-entry"><dd>{entry}</dd></div>;
              const term = entry.slice(0, dashIdx).replace(/\*\*/g, '');
              const def = entry.slice(dashIdx + 3);
              return (
                <div key={idx} className="syllabus-glossary-entry">
                  <dt>{term}</dt>
                  <dd>{def}</dd>
                </div>
              );
            })}
          </dl>
        );
      case 'formula':
        return (
          <div className="syllabus-formula">
            <code>{section.content}</code>
          </div>
        );
      case 'quote':
        return (
          <blockquote className="syllabus-quote">
            {section.content}
          </blockquote>
        );
      case 'diagram':
        const DiagramComponent = (Diagrams as any)[section.content];
        return DiagramComponent ? <DiagramComponent /> : null;
      case 'table':
        return (
          <div className="syllabus-table-wrapper">
            <table className="syllabus-table">
              <thead>
                <tr>
                  {section.content.headers.map((h: string, idx: number) => (
                    <th key={idx}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.content.rows.map((row: string[], idx: number) => (
                  <tr key={idx}>
                    {row.map((cell, cidx) => (
                      <td key={cidx}>{renderMarkdown(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  if (isMobile && !isExpanded && ['list', 'code', 'table', 'diagram'].includes(section.type)) {
    return (
      <div className="syllabus-section-collapsed">
        <button className="btn-more" onClick={() => setIsExpanded(true)}>
          Show Detailed {section.type === 'list' ? 'Points' : section.type.toUpperCase()} ↓
        </button>
      </div>
    );
  }

  return (
    <div className={`syllabus-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {renderContent()}
      {isMobile && isExpanded && ['list', 'code', 'table', 'diagram'].includes(section.type) && (
        <button className="btn-less" onClick={() => setIsExpanded(false)}>
          Show Less ↑
        </button>
      )}
    </div>
  );
};

// Simple markdown formatter for bold/italic in strings
function renderMarkdown(text: string) {
  if (typeof text !== 'string') return text;
  
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export default SyllabusSection;
