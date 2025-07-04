import jsPDF from 'jspdf';
import { JSDOM } from 'jsdom';

// Clean HTML content for PDF generation
function cleanHTMLContent(html: string): string {
  // Remove HTML tags and get text content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Extract text while preserving structure
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up extra whitespace
  return textContent.replace(/\s+/g, ' ').trim();
}

// Extract structured content from HTML using jsdom
function extractStructuredContent(html: string): { 
  title: string; 
  sections: Array<{ title: string; content: string }> 
} {
  try {
    // Create a JSDOM instance for server-side HTML parsing
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Extract title
    const titleElement = document.querySelector('h1');
    const title = titleElement?.textContent || 'Competence File';
    
    // Extract sections
    const sections: Array<{ title: string; content: string }> = [];
    
    // Look for sections with class "section"
    const sectionElements = document.querySelectorAll('.section');
    
    sectionElements.forEach((section: Element) => {
      const titleEl = section.querySelector('.section-title, h2, h3');
      const contentEl = section.querySelector('.section-content');
      
      if (titleEl && contentEl) {
        sections.push({
          title: titleEl.textContent || 'Section',
          content: contentEl.textContent || ''
        });
      }
    });
    
    // If no sections found, try to extract from generic structure
    if (sections.length === 0) {
      const headings = document.querySelectorAll('h2, h3, h4');
      headings.forEach((heading: Element) => {
        const content = [];
        let nextElement = heading.nextElementSibling;
        
        while (nextElement && !nextElement.matches('h2, h3, h4')) {
          if (nextElement.textContent) {
            content.push(nextElement.textContent.trim());
          }
          nextElement = nextElement.nextElementSibling;
        }
        
        if (content.length > 0) {
          sections.push({
            title: heading.textContent || 'Section',
            content: content.join('\n\n')
          });
        }
      });
    }
    
    // If still no sections, extract all text content
    if (sections.length === 0) {
      const bodyText = document.body?.textContent || '';
      if (bodyText) {
        sections.push({
          title: 'Content',
          content: bodyText
        });
      }
    }
    
    // Clean up DOM
    dom.window.close();
    
    return { title, sections };
  } catch (error) {
    console.error('Error parsing HTML:', error);
    // Fallback: extract title and content from raw HTML
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '') : 'Competence File';
    
    // Remove HTML tags for content
    const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    return {
      title,
      sections: [{ title: 'Content', content: textContent }]
    };
  }
}

// Generate PDF using jsPDF (server-side compatible)
export async function generatePDF(htmlContent: string): Promise<Buffer> {
  try {
    console.log('🔧 Generating PDF using jsPDF (serverless-compatible)...');
    
    // Extract text content and structure from HTML
    const { title, sections } = extractStructuredContent(htmlContent);
    
    console.log(`📋 Extracted title: ${title}`);
    console.log(`📋 Extracted ${sections.length} sections`);
    
    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set fonts and colors
    doc.setFont('helvetica');
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(7, 60, 81); // Antaes blue #073C51
    doc.text(title, 20, 30);
    
    let yPosition = 50;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = doc.internal.pageSize.width - 2 * margin;
    
    // Add sections
    sections.forEach((section, index) => {
      console.log(`📝 Processing section ${index + 1}: ${section.title}`);
      
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Add section title
      doc.setFontSize(14);
      doc.setTextColor(7, 60, 81); // Antaes blue
      
      // Split title if it's too long
      const titleLines = doc.splitTextToSize(section.title, maxWidth);
      titleLines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 30;
        }
        doc.text(line, margin, yPosition);
        yPosition += 7;
      });
      
      yPosition += 3; // Small gap after title
      
      // Add section content
      doc.setFontSize(11);
      doc.setTextColor(35, 38, 41); // Dark gray
      
      // Clean and prepare content
      const cleanContent = section.content
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 3000); // Limit content length to prevent memory issues
      
      if (cleanContent) {
        // Split text to fit page width
        const lines = doc.splitTextToSize(cleanContent, maxWidth);
        
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 30;
          }
          doc.text(line, margin, yPosition);
          yPosition += 5;
        });
      }
      
      yPosition += 10; // Space between sections
    });
    
    // Add footer to all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${totalPages}`, margin, pageHeight - 10);
      doc.text('Generated by Emineon ATS', doc.internal.pageSize.width - 60, pageHeight - 10);
    }
    
    // Get PDF as buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    console.log('✅ PDF generated successfully using jsPDF');
    console.log(`📄 PDF size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`📄 Total pages: ${totalPages}`);
    
    return pdfBuffer;
    
  } catch (error) {
    console.error('❌ PDF generation failed with jsPDF:', error);
    
    // Fallback: Create a simple text-based PDF
    console.log('🔄 Creating fallback text-based PDF...');
    
    try {
      const fallbackDoc = new jsPDF();
      fallbackDoc.setFontSize(16);
      fallbackDoc.setTextColor(7, 60, 81);
      fallbackDoc.text('Competence File', 20, 30);
      
      fallbackDoc.setFontSize(12);
      fallbackDoc.setTextColor(35, 38, 41);
      fallbackDoc.text('PDF generation encountered an issue.', 20, 50);
      fallbackDoc.text('Please contact support for assistance.', 20, 65);
      
      // Add timestamp
      fallbackDoc.setFontSize(10);
      fallbackDoc.setTextColor(100, 100, 100);
      fallbackDoc.text(`Generated: ${new Date().toISOString()}`, 20, 80);
      
      const fallbackBuffer = Buffer.from(fallbackDoc.output('arraybuffer'));
      
      console.log('✅ Fallback PDF created successfully');
      return fallbackBuffer;
    } catch (fallbackError) {
      console.error('❌ Even fallback PDF generation failed:', fallbackError);
      throw new Error('PDF generation completely failed');
    }
  }
} 