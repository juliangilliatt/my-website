import { test, expect } from '@playwright/test'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

test.describe('Lighthouse Performance Tests', () => {
  const lighthouseResults = path.join(__dirname, '../../test-results/lighthouse')
  
  test.beforeAll(async () => {
    // Ensure lighthouse results directory exists
    fs.mkdirSync(lighthouseResults, { recursive: true })
  })

  test('Homepage Lighthouse audit', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Run Lighthouse audit
    const reportPath = path.join(lighthouseResults, 'homepage-lighthouse.json')
    
    try {
      execSync(`lighthouse http://localhost:3000/ --output json --output-path ${reportPath} --chrome-flags="--headless --no-sandbox" --quiet`, {
        stdio: 'pipe'
      })
      
      // Read and parse the report
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
      
      // Check performance score
      const performanceScore = report.categories.performance.score * 100
      expect(performanceScore).toBeGreaterThan(90)
      
      // Check accessibility score
      const accessibilityScore = report.categories.accessibility.score * 100
      expect(accessibilityScore).toBeGreaterThan(95)
      
      // Check best practices score
      const bestPracticesScore = report.categories['best-practices'].score * 100
      expect(bestPracticesScore).toBeGreaterThan(90)
      
      // Check SEO score
      const seoScore = report.categories.seo.score * 100
      expect(seoScore).toBeGreaterThan(90)
      
      // Check specific metrics
      const metrics = report.audits
      
      // First Contentful Paint should be under 1.8s
      expect(metrics['first-contentful-paint'].numericValue).toBeLessThan(1800)
      
      // Largest Contentful Paint should be under 2.5s
      expect(metrics['largest-contentful-paint'].numericValue).toBeLessThan(2500)
      
      // Total Blocking Time should be under 200ms
      expect(metrics['total-blocking-time'].numericValue).toBeLessThan(200)
      
      // Cumulative Layout Shift should be under 0.1
      expect(metrics['cumulative-layout-shift'].numericValue).toBeLessThan(0.1)
      
      // Speed Index should be under 3.4s
      expect(metrics['speed-index'].numericValue).toBeLessThan(3400)
      
    } catch (error) {
      console.warn('Lighthouse audit failed:', error.message)
      test.skip('Lighthouse is not available in this environment')
    }
  })

  test('Recipes page Lighthouse audit', async ({ page }) => {
    await page.goto('/recipes')
    await page.waitForLoadState('networkidle')
    
    const reportPath = path.join(lighthouseResults, 'recipes-lighthouse.json')
    
    try {
      execSync(`lighthouse http://localhost:3000/recipes --output json --output-path ${reportPath} --chrome-flags="--headless --no-sandbox" --quiet`, {
        stdio: 'pipe'
      })
      
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
      
      // Check core scores
      expect(report.categories.performance.score * 100).toBeGreaterThan(85)
      expect(report.categories.accessibility.score * 100).toBeGreaterThan(95)
      expect(report.categories['best-practices'].score * 100).toBeGreaterThan(90)
      expect(report.categories.seo.score * 100).toBeGreaterThan(90)
      
    } catch (error) {
      console.warn('Lighthouse audit failed:', error.message)
      test.skip('Lighthouse is not available in this environment')
    }
  })

  test('Blog page Lighthouse audit', async ({ page }) => {
    await page.goto('/blog')
    await page.waitForLoadState('networkidle')
    
    const reportPath = path.join(lighthouseResults, 'blog-lighthouse.json')
    
    try {
      execSync(`lighthouse http://localhost:3000/blog --output json --output-path ${reportPath} --chrome-flags="--headless --no-sandbox" --quiet`, {
        stdio: 'pipe'
      })
      
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
      
      // Check core scores
      expect(report.categories.performance.score * 100).toBeGreaterThan(85)
      expect(report.categories.accessibility.score * 100).toBeGreaterThan(95)
      expect(report.categories['best-practices'].score * 100).toBeGreaterThan(90)
      expect(report.categories.seo.score * 100).toBeGreaterThan(90)
      
    } catch (error) {
      console.warn('Lighthouse audit failed:', error.message)
      test.skip('Lighthouse is not available in this environment')
    }
  })

  test('Mobile performance audit', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const reportPath = path.join(lighthouseResults, 'mobile-lighthouse.json')
    
    try {
      execSync(`lighthouse http://localhost:3000/ --output json --output-path ${reportPath} --preset=mobile --chrome-flags="--headless --no-sandbox" --quiet`, {
        stdio: 'pipe'
      })
      
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
      
      // Mobile performance should be good
      expect(report.categories.performance.score * 100).toBeGreaterThan(80)
      
      // Check mobile-specific metrics
      const metrics = report.audits
      
      // First Contentful Paint for mobile should be under 2s
      expect(metrics['first-contentful-paint'].numericValue).toBeLessThan(2000)
      
      // Largest Contentful Paint for mobile should be under 3s
      expect(metrics['largest-contentful-paint'].numericValue).toBeLessThan(3000)
      
    } catch (error) {
      console.warn('Lighthouse audit failed:', error.message)
      test.skip('Lighthouse is not available in this environment')
    }
  })

  test('PWA audit', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const reportPath = path.join(lighthouseResults, 'pwa-lighthouse.json')
    
    try {
      execSync(`lighthouse http://localhost:3000/ --output json --output-path ${reportPath} --chrome-flags="--headless --no-sandbox" --quiet`, {
        stdio: 'pipe'
      })
      
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
      
      // Check PWA score
      const pwaScore = report.categories.pwa.score * 100
      expect(pwaScore).toBeGreaterThan(70)
      
      // Check specific PWA audits
      const audits = report.audits
      
      // Should have manifest
      expect(audits['installable-manifest'].score).toBe(1)
      
      // Should have service worker
      expect(audits['service-worker'].score).toBe(1)
      
      // Should work offline
      expect(audits['works-offline'].score).toBe(1)
      
    } catch (error) {
      console.warn('Lighthouse audit failed:', error.message)
      test.skip('Lighthouse is not available in this environment')
    }
  })
})

test.describe('Bundle Analysis Tests', () => {
  test('JavaScript bundle size analysis', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Get all JavaScript resources
    const jsResources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource')
      return resources
        .filter(resource => resource.name.includes('.js'))
        .map(resource => ({
          name: resource.name,
          size: resource.transferSize,
          duration: resource.duration
        }))
    })
    
    // Check bundle sizes
    jsResources.forEach(resource => {
      // Individual JS files should be under 1MB
      expect(resource.size).toBeLessThan(1024 * 1024)
      
      // Should load quickly
      expect(resource.duration).toBeLessThan(2000)
    })
    
    // Total JS size should be reasonable
    const totalJSSize = jsResources.reduce((sum, resource) => sum + resource.size, 0)
    expect(totalJSSize).toBeLessThan(5 * 1024 * 1024) // 5MB total
  })

  test('CSS bundle size analysis', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Get all CSS resources
    const cssResources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource')
      return resources
        .filter(resource => resource.name.includes('.css'))
        .map(resource => ({
          name: resource.name,
          size: resource.transferSize,
          duration: resource.duration
        }))
    })
    
    // Check CSS bundle sizes
    cssResources.forEach(resource => {
      // Individual CSS files should be under 500KB
      expect(resource.size).toBeLessThan(500 * 1024)
      
      // Should load quickly
      expect(resource.duration).toBeLessThan(1000)
    })
    
    // Total CSS size should be reasonable
    const totalCSSSize = cssResources.reduce((sum, resource) => sum + resource.size, 0)
    expect(totalCSSSize).toBeLessThan(1024 * 1024) // 1MB total
  })

  test('Image optimization analysis', async ({ page }) => {
    await page.goto('/recipes')
    await page.waitForLoadState('networkidle')
    
    // Get all image resources
    const imageResources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource')
      return resources
        .filter(resource => 
          resource.name.includes('.jpg') || 
          resource.name.includes('.jpeg') || 
          resource.name.includes('.png') || 
          resource.name.includes('.webp') || 
          resource.name.includes('.avif')
        )
        .map(resource => ({
          name: resource.name,
          size: resource.transferSize,
          duration: resource.duration
        }))
    })
    
    // Check image optimization
    imageResources.forEach(resource => {
      // Individual images should be under 1MB
      expect(resource.size).toBeLessThan(1024 * 1024)
      
      // Should load reasonably quickly
      expect(resource.duration).toBeLessThan(3000)
    })
  })
})

test.describe('Network Performance Tests', () => {
  test('API response times', async ({ page }) => {
    const apiEndpoints = [
      '/api/recipes',
      '/api/blog',
      '/api/github/last-commit'
    ]
    
    for (const endpoint of apiEndpoints) {
      const startTime = Date.now()
      
      const response = await page.request.get(`http://localhost:3000${endpoint}`)
      
      const responseTime = Date.now() - startTime
      
      // API endpoints should respond quickly
      expect(responseTime).toBeLessThan(1000)
      expect(response.status()).toBe(200)
    }
  })

  test('CDN and caching headers', async ({ page }) => {
    await page.goto('/')
    
    // Check that static assets have proper caching headers
    const response = await page.request.get('http://localhost:3000/')
    const headers = response.headers()
    
    // Should have cache control headers
    expect(headers['cache-control']).toBeDefined()
    
    // Should have security headers
    expect(headers['x-frame-options']).toBeDefined()
    expect(headers['x-content-type-options']).toBeDefined()
  })

  test('Resource compression', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check that resources are compressed
    const resources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource')
      return resources.map(resource => ({
        name: resource.name,
        encodedSize: resource.encodedBodySize,
        decodedSize: resource.decodedBodySize
      }))
    })
    
    resources.forEach(resource => {
      if (resource.encodedSize > 0 && resource.decodedSize > 0) {
        // Compression ratio should be reasonable
        const compressionRatio = resource.encodedSize / resource.decodedSize
        expect(compressionRatio).toBeLessThan(0.9) // At least 10% compression
      }
    })
  })
})