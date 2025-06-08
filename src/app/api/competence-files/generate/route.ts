import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateCompetenceFileDocx } from '@/lib/docx-generator';
import { generateCompetenceFilePdf } from '@/lib/pdf-generator';
import { uploadCompetenceFile } from '@/lib/storage';
import { CandidateData } from '@/stores/competence-file-store';

// Request schema validation
const GenerateRequestSchema = z.object({
  candidateData: z.object({
    id: z.string(),
    fullName: z.string(),
    currentTitle: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    yearsOfExperience: z.number().optional(),
    summary: z.string().optional(),
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
  }),
  template: z.object({
    id: z.string(),
    name: z.string(),
    colorHex: z.string(),
    font: z.string(),
    client: z.string().optional(),
    footerText: z.string().optional(),
  }),
  customization: z.object({
    colorHex: z.string(),
    font: z.string(),
    logoUrl: z.string().optional(),
    footerText: z.string().optional(),
  }),
  sections: z.array(z.object({
    key: z.string(),
    label: z.string(),
    show: z.boolean(),
    order: z.number(),
  })),
  outputFormat: z.enum(['pdf', 'docx']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validatedData = GenerateRequestSchema.parse(body);
    const { candidateData, template, customization, sections, outputFormat } = validatedData;

    console.log(`Generating ${outputFormat.toUpperCase()} for candidate: ${candidateData.fullName}`);

    // Prepare generation options
    const generationOptions = {
      template,
      customization,
      sections,
    };

    // Generate file based on format
    let fileBuffer: Buffer;
    let contentType: string;
    let fileExtension: string;

    if (outputFormat === 'pdf') {
      console.log('Generating PDF using puppeteer...');
      fileBuffer = await generateCompetenceFilePdf(candidateData as CandidateData, generationOptions);
      contentType = 'application/pdf';
      fileExtension = 'pdf';
    } else {
      console.log('Generating DOCX using docx library...');
      fileBuffer = await generateCompetenceFileDocx(candidateData as CandidateData, generationOptions);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileExtension = 'docx';
    }

    // Generate filename
    const sanitizedName = candidateData.fullName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${sanitizedName}_Competence_File.${fileExtension}`;

    console.log(`File generated successfully. Size: ${fileBuffer.length} bytes`);

    // Upload to storage
          console.log('Saving to local storage...');
    const uploadResult = await uploadCompetenceFile(
      fileBuffer,
      fileName,
      outputFormat,
      candidateData,
      template
    );

    console.log(`File uploaded successfully. URL: ${uploadResult.url}`);

    // Store generation record in database (optional - would need Prisma setup)
    // await prisma.competenceFile.create({
    //   data: {
    //     candidateId: candidateData.id,
    //     templateId: template.id,
    //     fileName: uploadResult.fileName,
    //     filePath: uploadResult.path,
    //     format: outputFormat,
    //     fileSize: uploadResult.size,
    //     downloadUrl: uploadResult.url,
    //     generatedAt: new Date(),
    //   },
    // });

    return NextResponse.json({
      success: true,
      file: {
        id: `cf_${Date.now()}`,
        fileName: uploadResult.fileName,
        downloadUrl: uploadResult.url,
        format: outputFormat,
        size: uploadResult.size,
        generatedAt: new Date().toISOString(),
      },
      candidate: {
        id: candidateData.id,
        name: candidateData.fullName,
      },
      template: {
        id: template.id,
        name: template.name,
      },
    });

  } catch (error: any) {
    console.error('Competence file generation error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to generate competence file',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check service status
export async function GET() {
  return NextResponse.json({
    service: 'Competence File Generator',
    status: 'operational',
    features: {
      cvParsing: !!process.env.OPENAI_API_KEY,
      pdfGeneration: true,
      docxGeneration: true,
      fileStorage: true, // Local file storage is always available
    },
    timestamp: new Date().toISOString(),
  });
} 