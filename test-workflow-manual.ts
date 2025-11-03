import { codeModificationWorkflow } from './workflows/codeModification';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function manualTest() {
  console.log('\n🚀 Starting Manual Workflow Test\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Configure your test parameters here
  const testConfig = {
    prompt: "Add a footer to the homepage that says 'Tested manually'",
    repoUrl: "https://github.com/dieDeMiguel/blinkist-starter-kit",
    userEmail: "", // Pass empty string instead of undefined
    githubToken: process.env.GITHUB_TOKEN || "" // Read from environment
  };
  
  if (!testConfig.githubToken) {
    console.error('❌ Error: GITHUB_TOKEN environment variable is required');
    console.error('   Set it in .env.local or pass it as an environment variable\n');
    process.exit(1);
  }
  
  console.log('Test Configuration:');
  console.log(`  Prompt: ${testConfig.prompt}`);
  console.log(`  Repository: ${testConfig.repoUrl}`);
  console.log(`  Email: ${testConfig.userEmail || 'Not provided'}`);
  console.log(`  GitHub Token: ${testConfig.githubToken.substring(0, 20)}...\n`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  try {
    console.log('⏳ Executing workflow...\n');
    
    const result = await codeModificationWorkflow(
      testConfig.prompt,
      testConfig.repoUrl,
      testConfig.userEmail,
      testConfig.githubToken
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
