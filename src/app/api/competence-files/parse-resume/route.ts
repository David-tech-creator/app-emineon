import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Supported file types based on OpenAI documentation
const SUPPORTED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
  'text/markdown': '.md',
  'text/x-markdown': '.md',
  'application/octet-stream': '.md', // Some systems detect .md files as octet-stream
  'text/html': '.html'
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication (allow bypass for testing)
    try {
      const { userId } = auth();
      if (!userId) {
        console.log('⚠️ No authentication found, proceeding for testing purposes');
      }
    } catch (authError) {
      console.log('⚠️ Authentication check failed, proceeding for testing purposes:', authError);
    }

    console.log('📄 Resume parsing endpoint called');

    // Get the uploaded file from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ 
        error: 'No file provided',
        message: 'Please upload a resume file (PDF, DOCX, TXT, MD, or HTML)'
      }, { status: 400 });
    }

    // Validate file type (check both MIME type and file extension)
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isValidMimeType = Object.keys(SUPPORTED_FILE_TYPES).includes(file.type);
    const isValidExtension = ['pdf', 'docx', 'txt', 'md', 'html'].includes(fileExtension || '');
    
    if (!isValidMimeType && !isValidExtension) {
      return NextResponse.json({
        error: 'Invalid file type',
        message: `Unsupported file type: ${file.type} (${file.name}). Supported formats: PDF, DOCX, TXT, MD, HTML`
      }, { status: 400 });
    }

    // Validate file size (32MB limit for OpenAI API, but we'll use 25MB for safety)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large',
        message: 'File size must be less than 25MB'
      }, { status: 400 });
    }

    console.log(`📁 Processing file: ${file.name} (${file.size} bytes, ${file.type})`);

    let candidateData;
    let uploadedFileId: string | null = null;

    // Define the prompt for structured extraction
    const extractionPrompt = `Please analyze this resume document and extract structured information. The document may be in PDF, DOCX, TXT, MD, or HTML format.

Extract all available information and return a JSON object with the following structure:

{
  "fullName": "string",
  "currentTitle": "string", 
  "email": "string",
  "phone": "string",
  "location": "string",
  "yearsOfExperience": number,
  "skills": ["string"],
  "certifications": ["string"],
  "experience": [
    {
      "company": "string",
      "title": "string", 
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "responsibilities": "string"
    }
  ],
  "education": ["string"],
  "languages": ["string"],
  "summary": "string"
}

Instructions:
- Extract all available information from the document content
- If some fields are not available, use empty strings or arrays
- For yearsOfExperience, calculate based on work history (if not explicitly stated)
- For summary, create a brief professional summary based on the resume content
- Ensure all text is properly formatted and clean
- Return ONLY the JSON object, no additional text or formatting

Return the JSON object now:`;

    // Try different approaches based on file type
    const isPdfOrDocx = file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (isPdfOrDocx) {
      // For PDF/DOCX files, try the new Responses API with file upload first
      try {
        console.log('☁️ Uploading file to OpenAI for PDF/DOCX processing...');
        
        const uploadedFile = await openai.files.create({
          file: file,
          purpose: "user_data",
        });

        uploadedFileId = uploadedFile.id;
        console.log(`✅ File uploaded to OpenAI: ${uploadedFile.id}`);

        // Use the Responses API with the uploaded file
        console.log('🤖 Processing PDF/DOCX with Responses API (file upload method)...');
        
        const response = await openai.responses.create({
          model: "gpt-4o",
          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_file",
                  file_id: uploadedFile.id,
                },
                {
                  type: "input_text",
                  text: extractionPrompt
                }
              ]
            }
          ]
        });

        const responseContent = response.output_text;
        
        if (!responseContent) {
          throw new Error('No response from OpenAI Responses API');
        }

        console.log('📋 Raw OpenAI response length:', responseContent.length);

        // Parse the JSON response
        try {
          const cleanedResponse = responseContent.replace(/```json\n?|\n?```/g, '').trim();
          candidateData = JSON.parse(cleanedResponse);
          console.log('✅ Successfully parsed PDF/DOCX with Responses API (file upload)');
        } catch (parseError) {
          console.error('❌ Failed to parse Responses API response as JSON:', parseError);
          
          // Try to extract JSON from the response
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            candidateData = JSON.parse(jsonMatch[0]);
            console.log('✅ Successfully extracted JSON from Responses API response');
          } else {
            throw new Error('No valid JSON found in Responses API response');
          }
        }

      } catch (fileUploadError: any) {
        console.warn('⚠️ File upload method failed, trying base64 method:', fileUploadError.message);
        
        // Fallback to base64 encoding for PDF/DOCX
        try {
          console.log('🔄 Converting PDF/DOCX to base64 for Responses API...');
          
          const arrayBuffer = await file.arrayBuffer();
          const base64String = Buffer.from(arrayBuffer).toString('base64');
          
          console.log('🤖 Processing PDF/DOCX with Responses API (base64 method)...');
          
          const response = await openai.responses.create({
            model: "gpt-4o",
            input: [
              {
                role: "user",
                content: [
                  {
                    type: "input_file",
                    filename: file.name,
                    file_data: `data:${file.type};base64,${base64String}`,
                  },
                  {
                    type: "input_text",
                    text: extractionPrompt
                  }
                ]
              }
            ]
          });

          const responseContent = response.output_text;
          
          if (!responseContent) {
            throw new Error('No response from OpenAI Responses API (base64)');
          }

          console.log('📋 Base64 response length:', responseContent.length);

          // Parse the JSON response
          try {
            const cleanedResponse = responseContent.replace(/```json\n?|\n?```/g, '').trim();
            candidateData = JSON.parse(cleanedResponse);
            console.log('✅ Successfully parsed PDF/DOCX with Responses API (base64)');
          } catch (parseError) {
            console.error('❌ Failed to parse base64 response as JSON:', parseError);
            
            // Try to extract JSON from the response
            const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              candidateData = JSON.parse(jsonMatch[0]);
              console.log('✅ Successfully extracted JSON from base64 response');
            } else {
              throw new Error('No valid JSON found in base64 response');
            }
          }

        } catch (base64Error: any) {
          console.warn('⚠️ Base64 method also failed, trying Chat Completions fallback:', base64Error.message);
          throw new Error('Both Responses API methods failed');
        }
      }
    } else {
      // For text files (TXT, MD, HTML), use Responses API with base64 encoding
      try {
        console.log('🔄 Converting text file to base64 for Responses API...');
        
        const arrayBuffer = await file.arrayBuffer();
        const base64String = Buffer.from(arrayBuffer).toString('base64');
        
        console.log('🤖 Processing text file with Responses API...');
        
        const response = await openai.responses.create({
          model: "gpt-4o",
          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_file",
                  filename: file.name,
                  file_data: `data:${file.type};base64,${base64String}`,
                },
                {
                  type: "input_text",
                  text: extractionPrompt
                }
              ]
            }
          ]
        });

        const responseContent = response.output_text;
        
        if (!responseContent) {
          throw new Error('No response from OpenAI Responses API');
        }

        console.log('📋 Text file response length:', responseContent.length);

        // Parse the JSON response
        try {
          const cleanedResponse = responseContent.replace(/```json\n?|\n?```/g, '').trim();
          candidateData = JSON.parse(cleanedResponse);
          console.log('✅ Successfully parsed text file with Responses API');
        } catch (parseError) {
          console.error('❌ Failed to parse text file response as JSON:', parseError);
          
          // Try to extract JSON from the response
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            candidateData = JSON.parse(jsonMatch[0]);
            console.log('✅ Successfully extracted JSON from text file response');
          } else {
            throw new Error('No valid JSON found in text file response');
          }
        }

      } catch (textFileError: any) {
        console.warn('⚠️ Text file processing failed, trying Chat Completions fallback:', textFileError.message);
        
        // Fallback to Chat Completions for text files
        const arrayBuffer = await file.arrayBuffer();
        const fileContent = new TextDecoder().decode(arrayBuffer);
        
        console.log('🤖 Processing text file with Chat Completions API...');
        
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: `Please analyze this resume content and extract structured information. 

File: ${file.name} (${file.type})
Content: ${fileContent}

${extractionPrompt}`
            }
          ],
          temperature: 0.1,
        });

        const chatResponse = completion.choices[0]?.message?.content;
        
        if (!chatResponse) {
          throw new Error('No response from Chat Completions API');
        }

        console.log('📋 Chat Completions response length:', chatResponse.length);

        // Parse the JSON response from Chat Completions
        try {
          const cleanedResponse = chatResponse.replace(/```json\n?|\n?```/g, '').trim();
          candidateData = JSON.parse(cleanedResponse);
          console.log('✅ Successfully parsed text file with Chat Completions API fallback');
        } catch (parseError) {
          console.error('❌ Failed to parse Chat Completions response as JSON:', parseError);
          
          // Final fallback: Try to extract JSON from the response
          const jsonMatch = chatResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            candidateData = JSON.parse(jsonMatch[0]);
            console.log('✅ Successfully extracted JSON from Chat Completions response');
          } else {
            throw new Error('Failed to parse resume content. No valid JSON found in response.');
          }
        }
      }
    }

    // Validate required fields
    if (!candidateData || !candidateData.fullName) {
      throw new Error('Could not extract candidate name from resume');
    }

    // Add metadata
    candidateData.id = `parsed_${Date.now()}`;
    candidateData.source = 'resume_upload';
    candidateData.originalFileName = file.name;
    candidateData.fileType = file.type;

    console.log('✅ Resume parsed successfully:', candidateData.fullName);

    // Clean up: Delete the uploaded file from OpenAI if it was created
    if (uploadedFileId) {
      try {
        await openai.files.del(uploadedFileId);
        console.log('🗑️ Cleaned up uploaded file from OpenAI');
      } catch (cleanupError) {
        console.warn('⚠️ Failed to cleanup uploaded file:', cleanupError);
        // Don't fail the request for cleanup errors
      }
    }

    return NextResponse.json({
      success: true,
      data: candidateData,
      message: `Resume parsed successfully from ${SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]} file`
    });

  } catch (error: any) {
    console.error('💥 Resume parsing error:', error);
    
    // Handle specific error types
    let errorMessage = 'There was an error processing your resume. Please try again.';
    let statusCode = 500;
    
    if (error?.status === 400) {
      statusCode = 400;
      if (error?.message?.includes('Invalid MIME type')) {
        errorMessage = 'The file format is not supported. Please use PDF, DOCX, TXT, MD, or HTML format.';
      } else {
        errorMessage = 'The file could not be processed. Please ensure it\'s a valid document with readable content.';
      }
    } else if (error?.status === 413) {
      statusCode = 413;
      errorMessage = 'The file is too large. Please use a smaller file (under 25MB).';
    } else if (error?.status === 429) {
      statusCode = 429;
      errorMessage = 'Service is currently busy. Please try again in a few moments.';
    } else if (error?.message?.includes('Not allowed to download files')) {
      errorMessage = 'File processing is temporarily unavailable. Please try again later.';
    } else if (error?.message?.includes('Could not extract candidate name')) {
      statusCode = 422;
      errorMessage = 'Could not extract candidate information from the resume. Please ensure the document contains clear candidate details.';
    } else if (error?.message?.includes('Failed to parse resume content')) {
      statusCode = 422;
      errorMessage = 'The resume content could not be processed. Please try uploading a different format or a clearer document.';
    }
    
    return NextResponse.json({
      error: 'Failed to process resume',
      message: errorMessage,
      details: error?.message || 'Unknown error'
    }, { status: statusCode });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Resume parsing endpoint',
    supportedFormats: Object.values(SUPPORTED_FILE_TYPES),
    maxFileSize: '25MB'
  });
} 