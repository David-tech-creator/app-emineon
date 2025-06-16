import chromium from "@sparticuz/chromium-min";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";

async function getBrowser() {
  console.log('🔧 Configuring Puppeteer for environment:', process.env.NODE_ENV);
  
  const REMOTE_PATH = process.env.CHROMIUM_REMOTE_EXEC_PATH;
  const LOCAL_PATH = process.env.CHROMIUM_LOCAL_EXEC_PATH;
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  
  console.log('🔧 Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    isProduction,
    hasRemotePath: !!REMOTE_PATH,
    hasLocalPath: !!LOCAL_PATH
  });

  // Production/Vercel environment
  if (isProduction) {
    console.log('🔧 Using serverless Chromium for production/Vercel environment');
    try {
      const browser = await puppeteerCore.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',
          '--no-zygote'
        ],
        executablePath: await chromium.executablePath(REMOTE_PATH),
        headless: true,
        defaultViewport: {
          width: 1280,
          height: 720
        },
        timeout: 30000
      });
      console.log('✅ Serverless Chromium launched successfully');
      return browser;
    } catch (error) {
      console.error('❌ Failed to launch serverless Chromium:', error);
      throw new Error(`Failed to launch serverless Chromium: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Development environment
  console.log('🔧 Using regular Puppeteer for development environment');
  
  // Try local Chrome executable if path is provided
  if (LOCAL_PATH) {
    try {
      console.log('🔧 Attempting to use local Chrome executable...');
      const browser = await puppeteerCore.launch({
        executablePath: LOCAL_PATH,
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ],
        defaultViewport: {
          width: 1280,
          height: 720
        },
        timeout: 30000
      });
      console.log('✅ Local Chrome launched successfully');
      return browser;
    } catch (error) {
      console.warn('⚠️ Local Chrome failed, falling back to bundled Chromium:', error instanceof Error ? error.message : String(error));
    }
  }

  // Fall back to Puppeteer's bundled Chromium for development
  try {
    console.log('🔧 Using Puppeteer bundled Chromium...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ],
      defaultViewport: {
        width: 1280,
        height: 720
      },
      timeout: 30000
    });
    console.log('✅ Bundled Chromium launched successfully');
    return browser;
  } catch (error) {
    console.error('❌ All browser launch attempts failed:', error);
    throw new Error(`Failed to launch any browser for PDF generation: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generatePDF(htmlContent: string): Promise<Buffer> {
  let browser;
  let page;
  
  try {
    console.log('🔧 Attempting to launch browser...');
    browser = await getBrowser();
    console.log('✅ Browser launched successfully');

    page = await browser.newPage();
    console.log('📃 Setting page content...');
    
    // Set a more generous timeout for content loading
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 45000 
    });
    console.log('✅ Page content set');

    console.log('🖨️ Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
      timeout: 30000
    });
    
    console.log(`✅ PDF generated, size: ${pdfBuffer.length} bytes`);
    return Buffer.from(pdfBuffer);
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error'
    });
    throw error;
  } finally {
    try {
      if (page) {
        await page.close();
        console.log('✅ Page closed');
      }
    } catch (pageCloseError) {
      console.error('⚠️ Error closing page:', pageCloseError);
    }
    
    try {
      if (browser) {
        await browser.close();
        console.log('✅ Browser closed');
      }
    } catch (browserCloseError) {
      console.error('⚠️ Error closing browser:', browserCloseError);
    }
  }
} 