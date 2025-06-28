import { NextRequest, NextResponse } from 'next/server';
import { generatePDF } from '@/lib/pdf-service';
import { generateAntaesCompetenceFileHTML, generateCompetenceFileHTML } from '../competence-files/generate/route';
import { CVParserService } from '@/lib/services/cv-parser';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Bypass test successful',
    timestamp: new Date().toISOString(),
    availableActions: [
      'generate-pdf',
      'generate-html',
      'parse-cv',
      'performance-test'
    ]
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, template, candidateData, content } = body;

    console.log(`🧪 Test bypass: ${action}`, { template, candidateDataName: candidateData?.fullName });

    switch (action) {
      case 'generate-pdf': {
        if (!candidateData) {
          return NextResponse.json({ success: false, message: 'candidateData required' }, { status: 400 });
        }

        console.log('📄 Generating PDF via test bypass...');
        const startTime = Date.now();

        // Generate HTML based on template
        let htmlContent: string;
        if (template === 'antaes' || template === 'cf-antaes-consulting') {
          htmlContent = generateAntaesCompetenceFileHTML(candidateData);
        } else {
          htmlContent = generateCompetenceFileHTML(candidateData);
        }

        console.log(`✅ HTML generated in ${Date.now() - startTime}ms`);

        // Generate PDF
        const pdfStartTime = Date.now();
        const pdfBuffer = await generatePDF(htmlContent);
        const pdfTime = Date.now() - pdfStartTime;
        const totalTime = Date.now() - startTime;

        console.log(`✅ PDF generated in ${pdfTime}ms (total: ${totalTime}ms)`);

        const filename = `${candidateData.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_Test.pdf`;

        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': pdfBuffer.length.toString(),
            'X-Generation-Time': totalTime.toString(),
            'X-PDF-Time': pdfTime.toString(),
          },
        });
      }

      case 'generate-html': {
        if (!candidateData) {
          return NextResponse.json({ success: false, message: 'candidateData required' }, { status: 400 });
        }

        console.log('📝 Generating HTML via test bypass...');
        const startTime = Date.now();

        let htmlContent: string;
        if (template === 'antaes' || template === 'cf-antaes-consulting') {
          htmlContent = generateAntaesCompetenceFileHTML(candidateData);
        } else {
          htmlContent = generateCompetenceFileHTML(candidateData);
        }

        const totalTime = Date.now() - startTime;
        console.log(`✅ HTML generated in ${totalTime}ms`);

        return new NextResponse(htmlContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
            'X-Generation-Time': totalTime.toString(),
          },
        });
      }

      case 'parse-cv': {
        if (!content) {
          return NextResponse.json({ success: false, message: 'content required' }, { status: 400 });
        }

        console.log('📋 Parsing CV via test bypass...');
        const startTime = Date.now();

        const parser = new CVParserService();
        const parsedData = await parser.parseCV(content, 'test-cv.txt');

        const totalTime = Date.now() - startTime;
        console.log(`✅ CV parsed in ${totalTime}ms`);

        return NextResponse.json({
          success: true,
          data: parsedData,
          processingTime: totalTime,
          timestamp: new Date().toISOString()
        });
      }

      case 'performance-test': {
        console.log('⚡ Running performance test...');
        const results: {
          timestamp: string;
          tests: Array<{
            name: string;
            duration: number;
            size?: number;
            error?: string;
            status: string;
          }>;
        } = {
          timestamp: new Date().toISOString(),
          tests: []
        };

        // Test HTML generation speed
        const htmlStart = Date.now();
        const testData = {
          id: 'test',
          fullName: 'Performance Test',
          currentTitle: 'Test Engineer',
          email: 'test@example.com',
          phone: '+1-555-0000',
          location: 'Test Location',
          yearsOfExperience: 5,
          summary: 'Test summary',
          skills: ['Testing', 'Performance'],
          experience: [],
          education: [],
          certifications: [],
          languages: []
        };

        const htmlContent = generateAntaesCompetenceFileHTML(testData);
        const htmlTime = Date.now() - htmlStart;

        results.tests.push({
          name: 'HTML Generation',
          duration: htmlTime,
          size: htmlContent.length,
          status: 'success'
        });

        // Test PDF generation speed  
        const pdfStart = Date.now();
        try {
          const pdfBuffer = await generatePDF(htmlContent);
          const pdfTime = Date.now() - pdfStart;

          results.tests.push({
            name: 'PDF Generation',
            duration: pdfTime,
            size: pdfBuffer.length,
            status: 'success'
          });
        } catch (error) {
          results.tests.push({
            name: 'PDF Generation',
            duration: Date.now() - pdfStart,
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 'failed'
          });
        }

        return NextResponse.json(results);
      }

      default:
        return NextResponse.json(
          { success: false, message: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Test bypass error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 