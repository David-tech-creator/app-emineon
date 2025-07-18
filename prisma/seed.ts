import { PrismaClient } from '@prisma/client';
import { jobTemplates } from '../src/data/job-templates';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed Job Templates
  console.log('📋 Seeding job templates...');
  for (const template of jobTemplates) {
    const existingTemplate = await prisma.jobTemplate.findFirst({
      where: { name: template.name }
    });

    if (!existingTemplate) {
      await prisma.jobTemplate.create({
        data: {
          name: template.name,
          description: template.description,
          category: template.category,
          industry: template.industry,
          features: template.sampleContent ? [
            'Sample Content Included',
            'Customizable Sections',
            'Professional Styling'
          ] : ['Customizable Sections', 'Professional Styling'],
          colorScheme: {
            primary: template.styleConfig.primaryColor,
            secondary: template.styleConfig.secondaryColor,
            accent: template.styleConfig.accentColor,
            background: template.styleConfig.backgroundColor,
          } as any,
          styleConfig: template.styleConfig as any,
          sections: template.sections as any,
          sampleContent: template.sampleContent as any,
          isActive: true,
          isDefault: template.id === 'tech-startup', // Set first template as default
        }
      });
      console.log(`✅ Created job template: ${template.name}`);
    } else {
      console.log(`⏭️  Job template already exists: ${template.name}`);
    }
  }

  // Competence file templates are now managed dynamically through the API
  console.log('👤 Competence file templates will be managed through the UI/API');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 