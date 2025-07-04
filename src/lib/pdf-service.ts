import chromium from "@sparticuz/chromium-min";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";

// Singleton browser instance for better performance
let browser: any = null;

async function getBrowser() {
  // Return cached browser if available
  if (browser) {
    console.log('🔄 Reusing existing browser instance');
    return browser;
  }

  console.log('🔧 Configuring Puppeteer for PDF generation...');
  
  // Multiple checks for production environment
  const isProduction = 
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.NEXT_PUBLIC_VERCEL_ENVIRONMENT === 'production' ||
    !!process.env.VERCEL;

  console.log('🔧 Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL: process.env.VERCEL,
    NEXT_PUBLIC_VERCEL_ENVIRONMENT: process.env.NEXT_PUBLIC_VERCEL_ENVIRONMENT,
    isProduction
  });

  // Use remote Chromium for production/Vercel environments
  if (isProduction) {
    console.log('🚀 Using @sparticuz/chromium-min for production environment');
    try {
      browser = await puppeteerCore.launch({
        args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: await chromium.executablePath(),
        headless: true,
      });
      console.log('✅ Remote Chromium launched successfully');
      return browser;
    } catch (error) {
      console.error('❌ Failed to launch remote Chromium:', error);
      throw new Error(`Failed to launch remote Chromium: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    // For development environment
    console.log('🚀 Using local Puppeteer for development');
    try {
      browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: true,
      });
      console.log('✅ Local Puppeteer launched successfully');
      return browser;
    } catch (error) {
      console.error('❌ Failed to launch local Puppeteer:', error);
      throw new Error(`Failed to launch local Puppeteer: ${error instanceof Error ? error.message : String(error)}`);
    }
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
  if (browser) {
    try {
      await browser.close();
      browser = null;
      console.log('✅ Browser closed');
    } catch (error) {
      console.error('⚠️ Error closing browser:', error);
    }
  }
} 