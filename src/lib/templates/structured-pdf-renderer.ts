/**
 * Convert structured markdown content to PDF-optimized HTML
 */
export function renderStructuredContentToHTML(
  structuredContent: string,
  options: {
    template?: 'emineon' | 'antaes' | 'professional';
    logoUrl?: string;
    clientName?: string;
    candidateName?: string;
  } = {}
): string {
  const { template = 'professional', logoUrl, clientName, candidateName } = options;
  
  // Convert markdown to HTML with specific styling for PDF
  const htmlContent = convertStructuredMarkdownToHTML(structuredContent);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Competence File - ${candidateName || 'Professional'}</title>
    <style>
        ${getStructuredPDFStyles(template)}
    </style>
</head>
<body>
    <div class="competence-document">
        ${logoUrl ? `
        <div class="document-header">
            <img src="${logoUrl}" alt="Company Logo" class="company-logo">
            ${clientName ? `<div class="client-name">${clientName}</div>` : ''}
        </div>
        ` : ''}
        
        <div class="content-wrapper">
            ${htmlContent}
        </div>
    </div>
</body>
</html>`;
}

/**
 * Convert structured markdown to HTML with PDF-specific formatting
 */
function convertStructuredMarkdownToHTML(markdown: string): string {
  return markdown
    // Main headers (H1)
    .replace(/^# (.*$)/gm, '<h1 class="candidate-name">$1</h1>')
    
    // Section headers (H2)
    .replace(/^## (.*$)/gm, '<h2 class="section-header">$1</h2>')
    
    // Subsection headers (H3)
    .replace(/^### (.*$)/gm, '<h3 class="subsection-header">$1</h3>')
    
    // Strong emphasis with metrics
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="metric-emphasis">$1</strong>')
    
    // Technology tags (inline code)
    .replace(/`([^`]+)`/g, '<code class="tech-tag">$1</code>')
    
    // Bold labels
    .replace(/\*\*([^:]+):\*\*/g, '<strong class="label">$1:</strong>')
    
    // Bullet points
    .replace(/^- (.*$)/gm, '<li class="bullet-item">$1</li>')
    
    // Wrap consecutive list items in ul tags
    .replace(/(<li class="bullet-item">.*?<\/li>(\s*<li class="bullet-item">.*?<\/li>)*)/gs, '<ul class="structured-list">$1</ul>')
    
    // Horizontal rules (section dividers)
    .replace(/^---$/gm, '<hr class="section-divider">')
    
    // Regular paragraphs
    .replace(/^([^<#\-\n*].*)$/gm, '<p class="content-paragraph">$1</p>')
    
    // Clean up extra whitespace and merge consecutive lists
    .replace(/\n\s*\n/g, '\n')
    .replace(/(<\/ul>)\s*(<ul[^>]*>)/g, '$1$2');
}

/**
 * Get PDF-optimized styles for structured content
 */
function getStructuredPDFStyles(template: string): string {
  const baseStyles = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
      font-size: 11px;
      -webkit-font-smoothing: antialiased;
    }
    
    .competence-document {
      max-width: 210mm;
      margin: 0 auto;
      padding: 15mm;
      background: white;
      min-height: 297mm;
    }
    
    .document-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e1e5e9;
    }
    
    .company-logo {
      max-height: 35px;
      max-width: 140px;
      object-fit: contain;
    }
    
    .client-name {
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      text-align: right;
    }
    
    .content-wrapper {
      line-height: 1.5;
    }
    
    .candidate-name {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
      letter-spacing: 0.3px;
      text-align: center;
    }
    
    .section-header {
      font-size: 14px;
      font-weight: 600;
      color: #2563eb;
      margin-top: 20px;
      margin-bottom: 12px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e1e5e9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .subsection-header {
      font-size: 12px;
      font-weight: 600;
      color: #1e293b;
      margin-top: 15px;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    
    .content-paragraph {
      margin-bottom: 6px;
      line-height: 1.5;
      color: #374151;
    }
    
    .structured-list {
      margin-left: 16px;
      margin-bottom: 10px;
      padding-left: 0;
    }
    
    .bullet-item {
      margin-bottom: 3px;
      line-height: 1.4;
      color: #374151;
      list-style-type: disc;
    }
    
    .label {
      color: #1e293b;
      font-weight: 600;
    }
    
    .metric-emphasis {
      color: #dc2626;
      font-weight: 600;
      background: rgba(239, 68, 68, 0.1);
      padding: 1px 3px;
      border-radius: 2px;
    }
    
    .tech-tag {
      background: #f1f5f9;
      padding: 2px 5px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: 500;
      color: #475569;
      border: 1px solid #cbd5e1;
      font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
    }
    
    .section-divider {
      margin: 15px 0;
      border: none;
      border-top: 1px solid #e1e5e9;
    }
    
    /* Improved spacing for professional sections */
    .section-header + .subsection-header {
      margin-top: 10px;
    }
    
    .subsection-header + .structured-list {
      margin-top: 5px;
    }
    
    /* Enhanced print optimizations */
    @media print {
      .competence-document {
        margin: 0;
        padding: 12mm;
      }
      
      .section-header {
        page-break-after: avoid;
      }
      
      .subsection-header {
        page-break-after: avoid;
      }
      
      .structured-list {
        page-break-inside: avoid;
      }
      
      .metric-emphasis {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .tech-tag {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `;

  const templateStyles = {
    emineon: `
      .section-header {
        color: #0066cc;
      }
      
      .metric-emphasis {
        color: #0066cc;
        background: rgba(0, 102, 204, 0.1);
      }
      
      .tech-tag {
        background: #e6f3ff;
        border-color: #b3d9ff;
        color: #0066cc;
      }
    `,
    antaes: `
      .section-header {
        color: #8b5a3c;
      }
      
      .metric-emphasis {
        color: #8b5a3c;
        background: rgba(139, 90, 60, 0.1);
      }
      
      .tech-tag {
        background: #f5f0eb;
        border-color: #d4c4b0;
        color: #8b5a3c;
      }
    `,
    professional: ''
  };

  return baseStyles + (templateStyles[template as keyof typeof templateStyles] || '');
} 