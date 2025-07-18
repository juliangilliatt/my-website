import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Wait for the development server to be ready
    console.log('Waiting for development server...')
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Pre-warm the application
    await page.goto('http://localhost:3000/recipes')
    await page.waitForLoadState('networkidle')
    
    await page.goto('http://localhost:3000/blog')
    await page.waitForLoadState('networkidle')
    
    console.log('Development server is ready!')
  } catch (error) {
    console.error('Failed to connect to development server:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup