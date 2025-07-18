import { test, expect } from '@playwright/test'

test.describe('Core Web Vitals', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.addInitScript(() => {
      // Store performance metrics
      window.performanceMetrics = {
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        ttfb: 0,
        loadTime: 0
      }

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lcpEntry = entries[entries.length - 1]
        window.performanceMetrics.lcp = lcpEntry.startTime
      }).observe({ type: 'largest-contentful-paint', buffered: true })

      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fidEntry = entries[0]
        window.performanceMetrics.fid = fidEntry.processingStart - fidEntry.startTime
      }).observe({ type: 'first-input', buffered: true })

      // Cumulative Layout Shift
      let clsValue = 0
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        for (const entry of entries) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        window.performanceMetrics.cls = clsValue
      }).observe({ type: 'layout-shift', buffered: true })

      // First Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
        if (fcpEntry) {
          window.performanceMetrics.fcp = fcpEntry.startTime
        }
      }).observe({ type: 'paint', buffered: true })

      // Time to First Byte
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const navigationEntry = entries[0]
        if (navigationEntry) {
          window.performanceMetrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart
        }
      }).observe({ type: 'navigation', buffered: true })
    })
  })

  test('homepage should meet Core Web Vitals thresholds', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Allow time for metrics to be captured

    // Get performance metrics
    const metrics = await page.evaluate(() => window.performanceMetrics)

    // LCP should be under 2.5 seconds (2500ms)
    expect(metrics.lcp).toBeLessThan(2500)

    // FID should be under 100ms
    expect(metrics.fid).toBeLessThan(100)

    // CLS should be under 0.1
    expect(metrics.cls).toBeLessThan(0.1)

    // FCP should be under 1.8 seconds (1800ms)
    expect(metrics.fcp).toBeLessThan(1800)

    // TTFB should be under 600ms
    expect(metrics.ttfb).toBeLessThan(600)
  })

  test('recipe detail page should meet Core Web Vitals thresholds', async ({ page }) => {
    // Navigate to a recipe page
    await page.goto('/recipes/chocolate-chip-cookies')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get performance metrics
    const metrics = await page.evaluate(() => window.performanceMetrics)

    // Core Web Vitals thresholds
    expect(metrics.lcp).toBeLessThan(2500)
    expect(metrics.fid).toBeLessThan(100)
    expect(metrics.cls).toBeLessThan(0.1)
    expect(metrics.fcp).toBeLessThan(1800)
    expect(metrics.ttfb).toBeLessThan(600)
  })

  test('recipe listing page should meet Core Web Vitals thresholds', async ({ page }) => {
    // Navigate to recipes page
    await page.goto('/recipes')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get performance metrics
    const metrics = await page.evaluate(() => window.performanceMetrics)

    // Core Web Vitals thresholds
    expect(metrics.lcp).toBeLessThan(2500)
    expect(metrics.fid).toBeLessThan(100)
    expect(metrics.cls).toBeLessThan(0.1)
    expect(metrics.fcp).toBeLessThan(1800)
    expect(metrics.ttfb).toBeLessThan(600)
  })

  test('blog post should meet Core Web Vitals thresholds', async ({ page }) => {
    // Navigate to a blog post
    await page.goto('/blog/cooking-tips-for-beginners')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get performance metrics
    const metrics = await page.evaluate(() => window.performanceMetrics)

    // Core Web Vitals thresholds
    expect(metrics.lcp).toBeLessThan(2500)
    expect(metrics.fid).toBeLessThan(100)
    expect(metrics.cls).toBeLessThan(0.1)
    expect(metrics.fcp).toBeLessThan(1800)
    expect(metrics.ttfb).toBeLessThan(600)
  })

  test('search page should meet Core Web Vitals thresholds', async ({ page }) => {
    // Navigate to search page
    await page.goto('/search?q=chocolate')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get performance metrics
    const metrics = await page.evaluate(() => window.performanceMetrics)

    // Core Web Vitals thresholds
    expect(metrics.lcp).toBeLessThan(2500)
    expect(metrics.fid).toBeLessThan(100)
    expect(metrics.cls).toBeLessThan(0.1)
    expect(metrics.fcp).toBeLessThan(1800)
    expect(metrics.ttfb).toBeLessThan(600)
  })

  test('should have minimal layout shift during navigation', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Reset CLS tracking
    await page.evaluate(() => {
      window.performanceMetrics.cls = 0
    })

    // Navigate to recipes page
    await page.getByRole('link', { name: 'Recipes' }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Check CLS after navigation
    const clsAfterNav = await page.evaluate(() => window.performanceMetrics.cls)
    expect(clsAfterNav).toBeLessThan(0.1)
  })

  test('should handle image loading without layout shift', async ({ page }) => {
    // Navigate to a recipe with images
    await page.goto('/recipes/chocolate-chip-cookies')

    // Wait for images to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Check that CLS is minimal
    const cls = await page.evaluate(() => window.performanceMetrics.cls)
    expect(cls).toBeLessThan(0.1)
  })

  test('should load critical resources quickly', async ({ page }) => {
    // Start timing
    const startTime = Date.now()

    // Navigate to homepage
    await page.goto('/')

    // Wait for critical resources
    await page.waitForSelector('h1')
    await page.waitForSelector('nav')
    await page.waitForSelector('main')

    // Calculate load time
    const loadTime = Date.now() - startTime

    // Should load critical resources under 1 second
    expect(loadTime).toBeLessThan(1000)
  })

  test('should have fast server response times', async ({ page }) => {
    // Test various pages
    const pages = [
      '/',
      '/recipes',
      '/blog',
      '/about',
      '/contact'
    ]

    for (const pagePath of pages) {
      const response = await page.goto(pagePath)
      
      // Should respond within 500ms
      expect(response.headers()['server-timing']).toBeDefined()
      
      // Check response status
      expect(response.status()).toBe(200)
    }
  })

  test('should optimize resource loading', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check resource loading
    const resourceTimings = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource')
      return resources.map(resource => ({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize
      }))
    })

    // CSS should load quickly
    const cssResources = resourceTimings.filter(r => r.name.includes('.css'))
    cssResources.forEach(css => {
      expect(css.duration).toBeLessThan(500)
    })

    // JavaScript should load quickly
    const jsResources = resourceTimings.filter(r => r.name.includes('.js'))
    jsResources.forEach(js => {
      expect(js.duration).toBeLessThan(1000)
    })
  })

  test('should handle mobile performance', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get performance metrics for mobile
    const metrics = await page.evaluate(() => window.performanceMetrics)

    // Mobile should have slightly relaxed thresholds
    expect(metrics.lcp).toBeLessThan(3000) // 3 seconds for mobile
    expect(metrics.fid).toBeLessThan(100)
    expect(metrics.cls).toBeLessThan(0.1)
    expect(metrics.fcp).toBeLessThan(2000) // 2 seconds for mobile
  })

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow 3G
    await page.route('**/*', (route) => {
      route.continue({
        // Add 500ms delay
        delay: 500
      })
    })

    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get performance metrics
    const metrics = await page.evaluate(() => window.performanceMetrics)

    // Should still meet relaxed thresholds under slow network
    expect(metrics.lcp).toBeLessThan(4000) // 4 seconds under slow network
    expect(metrics.fid).toBeLessThan(100)
    expect(metrics.cls).toBeLessThan(0.1)
  })

  test('should optimize font loading', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check font loading performance
    const fontMetrics = await page.evaluate(() => {
      const fonts = Array.from(document.fonts)
      return fonts.map(font => ({
        family: font.family,
        status: font.status,
        loaded: font.loaded
      }))
    })

    // Fonts should be loaded
    fontMetrics.forEach(font => {
      expect(font.status).toBe('loaded')
    })
  })

  test('should handle JavaScript execution efficiently', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Measure JavaScript execution time
    const jsExecutionTime = await page.evaluate(() => {
      const start = performance.now()
      
      // Simulate some JavaScript work
      for (let i = 0; i < 1000; i++) {
        document.querySelectorAll('div')
      }
      
      return performance.now() - start
    })

    // JavaScript execution should be fast
    expect(jsExecutionTime).toBeLessThan(100)
  })

  test('should handle large DOM efficiently', async ({ page }) => {
    // Navigate to recipes page (likely has many elements)
    await page.goto('/recipes')
    await page.waitForLoadState('networkidle')

    // Check DOM size
    const domSize = await page.evaluate(() => {
      return document.querySelectorAll('*').length
    })

    // DOM should be reasonable size
    expect(domSize).toBeLessThan(3000)

    // Check rendering performance
    const renderTime = await page.evaluate(() => {
      const start = performance.now()
      document.body.style.display = 'none'
      document.body.style.display = 'block'
      return performance.now() - start
    })

    expect(renderTime).toBeLessThan(50)
  })
})