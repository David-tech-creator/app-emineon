import chromium from "@sparticuz/chromium-min";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";

async function getBrowser() {
  console.log('🔧 Configuring Puppeteer for PDF generation...');
  
  const REMOTE_PATH = process.env.CHROMIUM_REMOTE_EXEC_PATH;
  const LOCAL_PATH = process.env.CHROMIUM_LOCAL_EXEC_PATH;
  
  console.log('🔧 Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    hasRemotePath: !!REMOTE_PATH,
    hasLocalPath: !!LOCAL_PATH
  });

  // Use remote executable path (for Vercel/production)
  if (!!REMOTE_PATH && (process.env.NODE_ENV === 'production' || process.env.VERCEL)) {
    console.log('🚀 Using remote Chromium executable for production');
    try {
      return await puppeteerCore.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(REMOTE_PATH),
        defaultViewport: null,
        headless: true,
      });
    } catch (error) {
      console.error('❌ Failed to launch remote Chromium:', error);
      throw new Error('Failed to launch remote Chromium for production');
    }
  }

  // For development, try local Chrome first, then fall back to bundled Chromium
  console.log('🚀 Using local environment for development');
  
  // Try local Chrome executable if path is provided
  if (LOCAL_PATH) {
    try {
      console.log('🔧 Attempting to use local Chrome executable...');
      return await puppeteerCore.launch({
        executablePath: LOCAL_PATH,
        defaultViewport: null,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } catch (error) {
      console.warn('⚠️ Local Chrome failed, falling back to bundled Chromium:', error instanceof Error ? error.message : String(error));
    }
  }

  // Fall back to Puppeteer's bundled Chromium for development
  try {
    console.log('🔧 Using Puppeteer bundled Chromium...');
    return await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (error) {
    console.error('❌ All browser launch attempts failed:', error);
    throw new Error('Failed to launch any browser for PDF generation. Please ensure Chrome is installed or check your configuration.');
  }
}

export async function generatePDF(htmlContent: string): Promise<Buffer> {
  let browser;
  
  try {
    console.log('🔧 Attempting to launch browser...');
    browser = await getBrowser();
    console.log('✅ Browser launched successfully');

    const page = await browser.newPage();
    console.log('📃 Setting page content...');
    
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    console.log('✅ Page content set');

    console.log('🖨️ Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });
    
    console.log(`✅ PDF generated, size: ${pdfBuffer.length} bytes`);
    return Buffer.from(pdfBuffer);
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('✅ Browser closed');
      } catch (closeError) {
        console.error('⚠️ Error closing browser:', closeError);
      }
    }
  }
} 