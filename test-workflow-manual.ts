import { codeModificationWorkflow } from './workflows/codeModification.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function manualTest() {
  console.log('\n🚀 Starting Manual Workflow Test\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Configure your test parameters here
  const testConfig = {
    prompt: "Add a footer to the homepage that says 'Tested manually'",
    repoUrl: "https://github.com/dieDeMiguel/blinkist-starter-kit",
    userEmail: undefined // Optional: add your email to test notifications
  };
  
  console.log('Test Configuration:');
  console.log(`  Prompt: ${testConfig.prompt}`);
  console.log(`  Repository: ${testConfig.repoUrl}`);
  console.log(`  Email: ${testConfig.userEmail || 'Not provided'}\n`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  try {
    console.log('⏳ Executing workflow...\n');
    
    const result = await codeModificationWorkflow(
      testConfig.prompt,
      testConfig.repoUrl,
      testConfig.userEmail
    );
    
    console.log('\n✅ Workflow completed successfully!\n');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Results:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n═══════════════════════════════════════════════════════\n');
    
    if (result.prUrl) {
      console.log(`\n🎉 Pull Request Created: ${result.prUrl}\n`);
    }
    
  } catch (error) {
    console.error('\n❌ Workflow failed!\n');
    console.error('Error:', error);
    console.error('\nStack trace:', (error as Error).stack);
  }
}

manualTest().catch(console.error);
