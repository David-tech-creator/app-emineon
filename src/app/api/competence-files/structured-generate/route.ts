import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { structuredCompetenceService } from '@/lib/services/structured-competence-service';
import { renderStructuredContentToHTML } from '@/lib/templates/structured-pdf-renderer';
import { generatePDF } from '@/lib/pdf-service';
import { put } from '@vercel/blob';
import { getQueueMetrics } from '@/lib/ai/queue';

// Helper function to convert editor segments to structured markdown
function convertEditorSegmentsToMarkdown(
  segments: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    order: number;
  }>,
  candidateData: { fullName: string; currentTitle: string; email?: string; phone?: string; location?: string }
): string {
  // Sort segments by order
  const sortedSegments = segments.sort((a, b) => a.order - b.order);
  
  // Build structured markdown
  let markdown = `# ${candidateData.fullName}\n\n`;
  markdown += `**${candidateData.currentTitle}**\n\n`;
  
  if (candidateData.email || candidateData.phone || candidateData.location) {
    markdown += '## Contact Information\n\n';
    if (candidateData.email) markdown += `**Email:** ${candidateData.email}\n\n`;
    if (candidateData.phone) markdown += `**Phone:** ${candidateData.phone}\n\n`;
    if (candidateData.location) markdown += `**Location:** ${candidateData.location}\n\n`;
  }
  
  // Add each segment
  sortedSegments.forEach(segment => {
    if (segment.content && segment.content.trim()) {
      markdown += `## ${segment.title}\n\n`;
      
      // Clean and format the content
      let content = segment.content.trim();
      
      // Convert HTML to markdown if needed
      content = content
        .replace(/<strong>/gi, '**')
        .replace(/<\/strong>/gi, '**')
        .replace(/<em>/gi, '*')
        .replace(/<\/em>/gi, '*')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<p>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<div[^>]*>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<[^>]*>/g, ''); // Remove any remaining HTML tags
      
      // Clean up whitespace
      content = content
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Multiple newlines to double
        .replace(/^\s+|\s+$/g, '') // Trim
        .replace(/\s+/g, ' '); // Multiple spaces to single
      
      markdown += content + '\n\n';
    }
  });
  
  return markdown;
}

// Request validation schema
const StructuredRequestSchema = z.object({
  candidateData: z.object({
    id: z.string(),
    fullName: z.string(),
    currentTitle: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    yearsOfExperience: z.number().optional(),
    skills: z.array(z.string()),
    certifications: z.array(z.string()),
    experience: z.array(z.object({
      company: z.string(),
      title: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      responsibilities: z.string(),
    })),
    education: z.array(z.string()),
    languages: z.array(z.string()),
    summary: z.string().optional(),
  }),
  jobDescription: z.object({
    text: z.string(),
    requirements: z.array(z.string()),
    skills: z.array(z.string()),
    responsibilities: z.array(z.string()),
    title: z.string().optional(),
    company: z.string().optional(),
  }).optional(),
  clientName: z.string().optional(),
  finalEditorSegments: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    content: z.string(),
    order: z.number(),
  })).optional(),
  options: z.object({
    template: z.enum(['emineon', 'antaes', 'professional']).default('professional'),
    logoUrl: z.string().optional(),
    format: z.enum(['pdf', 'html', 'markdown']).default('pdf'),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI API key not configured' 
        },
        { status: 500 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const { candidateData, jobDescription, clientName, finalEditorSegments, options } = StructuredRequestSchema.parse(body);

    console.log(`🎯 Structured Competence File Generation`);
    console.log(`👤 Candidate: ${candidateData.fullName}`);
    console.log(`🎯 Job: ${jobDescription?.title || 'General Position'}`);
    console.log(`🎨 Template: ${options?.template || 'professional'}`);
    console.log(`📊 Queue Metrics:`, getQueueMetrics());

    let structuredMarkdown: string;
    let contentTime: number;
    const startTime = Date.now();

    // 🚀 CRITICAL FIX: Use final editor content if provided
    if (finalEditorSegments && finalEditorSegments.length > 0) {
      console.log(`🎯 USING FINAL EDITOR CONTENT (${finalEditorSegments.length} segments) - SKIPPING AI REGENERATION`);
      console.log(`📝 Editor segments:`, finalEditorSegments.map(s => ({
        title: s.title,
        type: s.type,
        contentLength: s.content?.length || 0,
        contentPreview: s.content?.substring(0, 100) || ''
      })));
      
      // Convert editor segments to structured markdown format
      structuredMarkdown = convertEditorSegmentsToMarkdown(finalEditorSegments, candidateData);
      contentTime = Date.now() - startTime;
      console.log(`✅ Final editor content conversion completed in ${contentTime}ms`);
    } else {
      console.log(`🤖 GENERATING NEW CONTENT using AI (no final editor content provided)`);
      // Generate structured content using AI
      structuredMarkdown = await structuredCompetenceService.generateCompleteStructuredFile(
        candidateData,
        jobDescription,
        clientName
      );
      contentTime = Date.now() - startTime;
      console.log(`✅ Structured content generation completed in ${contentTime}ms`);
    }

    // Return markdown if requested
    if (options?.format === 'markdown') {
      return NextResponse.json({
        success: true,
        data: {
          structuredContent: structuredMarkdown,
          candidateName: candidateData.fullName,
          format: 'markdown'
        },
        metrics: {
          contentGenerationTime: contentTime,
          queueMetrics: getQueueMetrics(),
        },
        processingMethod: 'structured-markdown',
      });
    }

    // Generate HTML
    const htmlStartTime = Date.now();
    const htmlContent = renderStructuredContentToHTML(
      structuredMarkdown,
      {
        template: options?.template,
        logoUrl: options?.logoUrl,
        clientName: clientName,
        candidateName: candidateData.fullName
      }
    );

    const htmlTime = Date.now() - htmlStartTime;
    console.log(`✅ HTML rendering completed in ${htmlTime}ms`);

    // Return HTML if requested
    if (options?.format === 'html') {
      return NextResponse.json({
        success: true,
        data: {
          structuredContent: structuredMarkdown,
          htmlContent: htmlContent,
          candidateName: candidateData.fullName,
          format: 'html'
        },
        metrics: {
          contentGenerationTime: contentTime,
          htmlRenderingTime: htmlTime,
          queueMetrics: getQueueMetrics(),
        },
        processingMethod: 'structured-html',
      });
    }

    // Generate PDF
    console.log('🔄 Generating PDF from structured HTML...');
    const pdfStartTime = Date.now();
    
    const pdfBuffer = await generatePDF(htmlContent);

    const pdfTime = Date.now() - pdfStartTime;
    console.log(`✅ PDF generation completed in ${pdfTime}ms`);

    // Upload to Vercel Blob
    const fileName = `${candidateData.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_${clientName?.replace(/[^a-zA-Z0-9]/g, '_') || 'General'}_Structured_Competence_File_${Date.now()}.pdf`;
    
    const uploadResult = await put(fileName, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf',
    });

    const totalTime = Date.now() - startTime;
    console.log(`✅ Complete structured generation finished in ${totalTime}ms`);
    console.log(`📊 Final Queue Metrics:`, getQueueMetrics());

    return NextResponse.json({
      success: true,
      data: {
        structuredContent: structuredMarkdown,
        htmlContent: htmlContent,
        candidateName: candidateData.fullName,
        jobTitle: jobDescription?.title || 'General Position',
        client: clientName || 'Unknown Client',
        fileName: fileName,
        fileUrl: uploadResult.url,
        format: 'pdf',
      },
      metrics: {
        contentGenerationTime: contentTime,
        htmlRenderingTime: htmlTime,
        pdfGenerationTime: pdfTime,
        totalTime,
        queueMetrics: getQueueMetrics(),
      },
      processingMethod: finalEditorSegments ? 'final-editor-content' : 'structured-pdf-complete',
    });

  } catch (error) {
    console.error('❌ Structured generation failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Generation failed',
        queueMetrics: getQueueMetrics(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Structured Competence File Generator',
    status: 'operational',
    description: 'Generate competence files with structured markdown formatting optimized for PDF output',
    features: {
      structuredMarkdown: true,
      semanticHTML: true,
      pdfOptimized: true,
      templateSupport: ['emineon', 'antaes', 'professional'],
      pQueueThrottling: true,
      multiFormat: ['pdf', 'html', 'markdown'],
      structuredPrompts: true,
      quantifiedMetrics: true,
      technologyTags: true,
    },
    outputFormats: ['pdf', 'html', 'markdown'],
    queueMetrics: getQueueMetrics(),
    timestamp: new Date().toISOString(),
  });
} 