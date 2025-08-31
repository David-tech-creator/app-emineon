import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Text extraction endpoint called');
    
    const formData = await request.formData();
    
    // Handle both single file ('file') and multiple files ('files')
    const singleFile = formData.get('file') as File;
    const multipleFiles = formData.getAll('files') as File[];
    
    console.log('📋 FormData inspection:', {
      hasSingleFile: !!singleFile,
      singleFileName: singleFile?.name,
      multipleFilesCount: multipleFiles.length,
      multipleFileNames: multipleFiles.map(f => f?.name).filter(Boolean),
      formDataKeys: Array.from(formData.keys())
    });
    
    const filesToProcess = singleFile ? [singleFile] : multipleFiles;
    
    if (filesToProcess.length === 0) {
      console.error('❌ No files found in FormData');
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log(`📁 Processing ${filesToProcess.length} files:`, filesToProcess.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    const extractedTexts: string[] = [];
    
    for (const file of filesToProcess) {
      console.log(`🔄 Processing file: ${file.name} (${file.size} bytes, ${file.type})`);
      
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name.toLowerCase();
        let extractedText = '';

        if (fileName.endsWith('.pdf')) {
          console.log('📄 Extracting text from PDF...');
          try {
            const pdfParse = (await import('pdf-parse')).default;
            const pdfData = await pdfParse(buffer);
            extractedText = pdfData.text;
            console.log(`✅ PDF text extracted: ${extractedText.length} characters`);
          } catch (error) {
            console.error('❌ PDF extraction error:', error);
            throw new Error(`Failed to extract text from PDF: ${file.name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        } else if (fileName.endsWith('.docx')) {
          console.log('📄 Extracting text from DOCX...');
          try {
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value;
            console.log(`✅ DOCX text extracted: ${extractedText.length} characters`);
          } catch (error) {
            console.error('❌ DOCX extraction error:', error);
            throw new Error(`Failed to extract text from DOCX: ${file.name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        } else if (fileName.endsWith('.txt')) {
          console.log('📄 Extracting text from TXT...');
          try {
            extractedText = buffer.toString('utf-8');
            console.log(`✅ TXT text extracted: ${extractedText.length} characters`);
          } catch (error) {
            console.error('❌ TXT extraction error:', error);
            throw new Error(`Failed to extract text from TXT: ${file.name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        } else {
          console.error(`❌ Unsupported file format: ${file.name}`);
          return NextResponse.json(
            { error: `Unsupported file format: ${file.name}. Please upload PDF, DOCX, or TXT files.` },
            { status: 400 }
          );
        }

        if (extractedText.trim()) {
          extractedTexts.push(extractedText.trim());
          console.log(`✅ Added text from ${file.name} to results`);
        } else {
          console.warn(`⚠️ No text extracted from ${file.name}`);
        }
      } catch (fileError) {
        console.error(`❌ Error processing file ${file.name}:`, fileError);
        throw fileError; // Re-throw to be caught by outer try-catch
      }
    }

    if (extractedTexts.length === 0) {
      return NextResponse.json(
        { error: 'No text could be extracted from the uploaded files' },
        { status: 400 }
      );
    }

    // Return both single text (for backward compatibility) and texts array
    return NextResponse.json({
      success: true,
      text: extractedTexts.join('\n\n'), // Combined text for single file compatibility
      texts: extractedTexts, // Array of texts for multiple files
      fileCount: filesToProcess.length,
      fileNames: filesToProcess.map(f => f.name)
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