import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();
    let extractedText = '';

    if (fileName.endsWith('.pdf')) {
      // Extract text from PDF
      try {
        const pdfParse = (await import('pdf-parse')).default;
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error('Failed to extract text from PDF');
      }
    } else if (fileName.endsWith('.docx')) {
      // Extract text from DOCX
      try {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch (error) {
        console.error('DOCX extraction error:', error);
        throw new Error('Failed to extract text from DOCX');
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload PDF or DOCX files.' },
        { status: 400 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'No text could be extracted from the file' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: extractedText.trim(),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

  } catch (error: any) {
    console.error('Text extraction error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to extract text from file',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 