import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  // Clean up any test data or resources
  console.log('Cleaning up test environment...')
  
  // Add any cleanup logic here
  // For example, clearing test database records, removing uploaded files, etc.
  
  console.log('Test environment cleanup completed')
}

export default globalTeardown