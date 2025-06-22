import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/');
    const fullPath = join(process.cwd(), 'outlook-addin', filePath);
    
    console.log(`📁 Serving Outlook add-in file: ${filePath}`);
    console.log(`📂 Full path: ${fullPath}`);
    
    const fileContent = await readFile(fullPath, 'utf-8');
    
    // Determine content type
    let contentType = 'text/plain';
    if (filePath.endsWith('.html')) {
      contentType = 'text/html';
    } else if (filePath.endsWith('.js')) {
      contentType = 'application/javascript';
    } else if (filePath.endsWith('.css')) {
      contentType = 'text/css';
    } else if (filePath.endsWith('.xml')) {
      contentType = 'application/xml';
    } else if (filePath.endsWith('.png')) {
      contentType = 'image/png';
    }
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Frame-Options': 'ALLOWALL',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error(`❌ Error serving Outlook add-in file:`, error);
    return new NextResponse('File not found', { status: 404 });
  }
}
