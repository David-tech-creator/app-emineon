import chromium from "@sparticuz/chromium-min";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";

// Singleton browser instance for better performance
let browserInstance: any = null;

async function getBrowser() {
  // Return cached browser if available
  if (browserInstance && browserInstance.isConnected()) {
    console.log('🔄 Reusing existing browser instance');
    return browserInstance;
  }

  console.log('🔧 Configuring Puppeteer for PDF generation...');
  
  const REMOTE_PATH = process.env.CHROMIUM_REMOTE_EXEC_PATH;
  const LOCAL_PATH = process.env.CHROMIUM_LOCAL_EXEC_PATH;
  
  console.log('🔧 Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    hasRemotePath: !!REMOTE_PATH,
    hasLocalPath: !!LOCAL_PATH
  });

  // Optimized launch arguments for better performance
  const optimizedArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--disable-extensions',
    '--disable-plugins',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--no-first-run',
    '--no-default-browser-check',
    '--memory-pressure-off'
  ];

  // Use remote executable path (for Vercel/production)
  if (!!REMOTE_PATH && (process.env.NODE_ENV === 'production' || process.env.VERCEL)) {
    console.log('🚀 Using remote Chromium executable for production');
    try {
      browserInstance = await puppeteerCore.launch({
        args: [...chromium.args, ...optimizedArgs],
        executablePath: await chromium.executablePath(REMOTE_PATH),
        defaultViewport: null,
        headless: true,
      });
      return browserInstance;
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
              browserInstance = await puppeteerCore.launch({
          executablePath: LOCAL_PATH,
          defaultViewport: null,
          headless: true,
          args: optimizedArgs,
        });
      return browserInstance;
    } catch (error) {
      console.warn('⚠️ Local Chrome failed, falling back to bundled Chromium:', error instanceof Error ? error.message : String(error));
    }
  }

  // Fall back to Puppeteer's bundled Chromium for development
  try {
    console.log('🔧 Using Puppeteer bundled Chromium...');
          browserInstance = await puppeteer.launch({
        headless: true,
        args: optimizedArgs,
      });
    return browserInstance;
  } catch (error) {
    console.error('❌ All browser launch attempts failed:', error);
    throw new Error('Failed to launch any browser for PDF generation. Please ensure Chrome is installed or check your configuration.');
  }
}

export async function generatePDF(htmlContent: string): Promise<Buffer> {
  let page;
  
  try {
    console.log('🔧 Getting browser instance...');
    const browser = await getBrowser();
    console.log('✅ Browser ready');

    page = await browser.newPage();
    
    // Optimize page settings for faster rendering
    await page.setViewport({ width: 1200, height: 1600 });
    await page.setDefaultNavigationTimeout(10000); // Reduced from 30s to 10s
    await page.setDefaultTimeout(10000);
    
    // Disable images and other resources for faster loading
    await page.setRequestInterception(true);
    page.on('request', (request: any) => {
      const resourceType = request.resourceType();
      if (['image', 'stylesheet', 'font'].includes(resourceType)) {
        // Allow Cloudinary images (for logos) but block others
        if (resourceType === 'image' && request.url().includes('cloudinary.com')) {
          request.continue();
        } else if (resourceType === 'font' && request.url().includes('googleapis.com')) {
          request.continue();
        } else {
          request.abort();
        }
      } else {
        request.continue();
      }
    });

    console.log('📃 Setting page content...');
    
    await page.setContent(htmlContent, { 
      waitUntil: 'domcontentloaded', // Changed from networkidle0 for speed
      timeout: 8000 // Reduced timeout
    });
    console.log('✅ Page content set');

    console.log('🖨️ Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15px',
        right: '15px',
        bottom: '15px',
        left: '15px',
      },
      timeout: 10000, // 10 second timeout for PDF generation
    });
    
    console.log(`✅ PDF generated, size: ${pdfBuffer.length} bytes`);
    return Buffer.from(pdfBuffer);
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    throw error;
  } finally {
    if (page) {
      try {
        await page.close();
        console.log('✅ Page closed');
      } catch (closeError) {
        console.error('⚠️ Error closing page:', closeError);
      }
    }
    // Don't close browser instance - keep it for reuse
  }
}

// Cleanup function to close browser when needed
export async function closeBrowser() {
  if (browserInstance) {
    try {
      await browserInstance.close();
      browserInstance = null;
      console.log('✅ Browser closed');
    } catch (error) {
      console.error('⚠️ Error closing browser:', error);
    }
  }
} 