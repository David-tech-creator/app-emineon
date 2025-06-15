import chromium from "@sparticuz/chromium-min";
import puppeteerCore from "puppeteer-core";

async function getBrowser() {
  const REMOTE_PATH = process.env.CHROMIUM_REMOTE_EXEC_PATH;
  const LOCAL_PATH = process.env.CHROMIUM_LOCAL_EXEC_PATH;
  
  console.log('🔧 Environment check:');
  console.log('  - CHROMIUM_REMOTE_EXEC_PATH:', REMOTE_PATH ? 'Set' : 'Not set');
  console.log('  - CHROMIUM_LOCAL_EXEC_PATH:', LOCAL_PATH ? 'Set' : 'Not set');
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - VERCEL:', process.env.VERCEL ? 'Yes' : 'No');
  
  // For development, try to use local Chrome if available
  if (process.env.NODE_ENV === 'development' && !REMOTE_PATH && !LOCAL_PATH) {
    console.log('🔧 Development mode: trying common Chrome paths');
    const commonPaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
      '/usr/bin/google-chrome', // Linux
      '/usr/bin/chromium-browser', // Linux alternative
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Windows
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', // Windows 32-bit
    ];
    
    for (const path of commonPaths) {
      try {
        console.log(`🔍 Trying Chrome at: ${path}`);
        return await puppeteerCore.launch({
          executablePath: path,
          defaultViewport: null,
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        });
      } catch (error) {
        console.log(`❌ Failed to launch Chrome at ${path}`);
        continue;
      }
    }
    
    throw new Error('No Chrome executable found. Please install Google Chrome or set CHROMIUM_LOCAL_EXEC_PATH environment variable.');
  }
  
  if (!REMOTE_PATH && !LOCAL_PATH) {
    throw new Error("Missing a path for chromium executable. Set CHROMIUM_REMOTE_EXEC_PATH or CHROMIUM_LOCAL_EXEC_PATH environment variable.");
  }

  if (!!REMOTE_PATH) {
    console.log('🔧 Using remote Chromium executable');
    return await puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(
        process.env.CHROMIUM_REMOTE_EXEC_PATH,
      ),
      defaultViewport: null,
      headless: true,
    });
  }

  console.log('🔧 Using local Chromium executable');
  return await puppeteerCore.launch({
    executablePath: LOCAL_PATH,
    defaultViewport: null,
    headless: true,
  });
}

export async function generatePDF(htmlContent: string): Promise<Buffer> {
  console.log('🚀 Starting PDF generation with new service');
  
  let browser;
  try {
    browser = await getBrowser();
    console.log('✅ Browser launched successfully');
    
    const page = await browser.newPage();
    
    // Set content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    console.log('📃 Page content set');
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    console.log('🖨️ PDF generated successfully');
    
    // Convert Uint8Array to Buffer
    return Buffer.from(pdfBuffer);
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('✅ Browser closed');
    }
  }
}

export { getBrowser }; 