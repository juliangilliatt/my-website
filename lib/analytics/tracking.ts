// Analytics and performance tracking utilities

import { SITE_CONFIG } from '@/lib/constants'

// Event tracking interfaces
export interface BaseEvent {
  action: string
  category: string
  label?: string
  value?: number
  userId?: string
  sessionId?: string
  timestamp?: number
}

export interface PageViewEvent extends BaseEvent {
  action: 'page_view'
  category: 'navigation'
  page: string
  title: string
  referrer?: string
  userAgent?: string
}

export interface RecipeEvent extends BaseEvent {
  category: 'recipe'
  recipeId: string
  recipeTitle: string
  action: 'view' | 'save' | 'share' | 'print' | 'rate' | 'comment' | 'cook_mode' | 'scale'
  value?: number // For ratings, servings, etc.
}

export interface BlogEvent extends BaseEvent {
  category: 'blog'
  postId: string
  postTitle: string
  action: 'view' | 'share' | 'comment' | 'like' | 'reading_progress'
  value?: number // For reading progress percentage
}

export interface SearchEvent extends BaseEvent {
  category: 'search'
  action: 'search' | 'filter' | 'sort' | 'result_click'
  query?: string
  filters?: Record<string, any>
  resultsCount?: number
  clickPosition?: number
}

export interface InteractionEvent extends BaseEvent {
  category: 'interaction'
  action: 'click' | 'hover' | 'scroll' | 'form_submit' | 'error'
  element: string
  location?: string
}

export interface PerformanceEvent extends BaseEvent {
  category: 'performance'
  action: 'page_load' | 'content_load' | 'image_load' | 'api_call'
  value: number // Duration in milliseconds
  resource?: string
}

export interface ConversionEvent extends BaseEvent {
  category: 'conversion'
  action: 'newsletter_signup' | 'recipe_save' | 'social_follow' | 'contact_form'
  value?: number
}

// Analytics providers
export type AnalyticsProvider = 'google' | 'plausible' | 'mixpanel' | 'segment' | 'custom'

// Analytics configuration
export interface AnalyticsConfig {
  enabled: boolean
  providers: AnalyticsProvider[]
  google?: {
    measurementId: string
    gtmId?: string
  }
  plausible?: {
    domain: string
    apiHost?: string
  }
  mixpanel?: {
    token: string
  }
  segment?: {
    writeKey: string
  }
  custom?: {
    endpoint: string
    apiKey?: string
  }
}

// Analytics manager class
export class AnalyticsManager {
  private config: AnalyticsConfig
  private sessionId: string
  private userId?: string
  private isInitialized = false

  constructor(config: AnalyticsConfig) {
    this.config = config
    this.sessionId = this.generateSessionId()
  }

  // Initialize analytics
  async initialize(userId?: string): Promise<void> {
    if (!this.config.enabled || this.isInitialized) return

    this.userId = userId
    this.isInitialized = true

    // Initialize Google Analytics
    if (this.config.providers.includes('google') && this.config.google) {
      await this.initializeGoogleAnalytics()
    }

    // Initialize Plausible
    if (this.config.providers.includes('plausible') && this.config.plausible) {
      await this.initializePlausible()
    }

    // Initialize Mixpanel
    if (this.config.providers.includes('mixpanel') && this.config.mixpanel) {
      await this.initializeMixpanel()
    }

    // Initialize Segment
    if (this.config.providers.includes('segment') && this.config.segment) {
      await this.initializeSegment()
    }

    // Track initial page view
    this.trackPageView({
      page: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    })
  }

  // Track page view
  trackPageView(data: Omit<PageViewEvent, 'action' | 'category' | 'sessionId' | 'userId' | 'timestamp'>): void {
    const event: PageViewEvent = {
      action: 'page_view',
      category: 'navigation',
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      ...data,
    }

    this.sendEvent(event)
  }

  // Track recipe interactions
  trackRecipeEvent(data: Omit<RecipeEvent, 'category' | 'sessionId' | 'userId' | 'timestamp'>): void {
    const event: RecipeEvent = {
      category: 'recipe',
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      ...data,
    }

    this.sendEvent(event)
  }

  // Track blog interactions
  trackBlogEvent(data: Omit<BlogEvent, 'category' | 'sessionId' | 'userId' | 'timestamp'>): void {
    const event: BlogEvent = {
      category: 'blog',
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      ...data,
    }

    this.sendEvent(event)
  }

  // Track search interactions
  trackSearchEvent(data: Omit<SearchEvent, 'category' | 'sessionId' | 'userId' | 'timestamp'>): void {
    const event: SearchEvent = {
      category: 'search',
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      ...data,
    }

    this.sendEvent(event)
  }

  // Track general interactions
  trackInteraction(data: Omit<InteractionEvent, 'category' | 'sessionId' | 'userId' | 'timestamp'>): void {
    const event: InteractionEvent = {
      category: 'interaction',
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      ...data,
    }

    this.sendEvent(event)
  }

  // Track performance metrics
  trackPerformance(data: Omit<PerformanceEvent, 'category' | 'sessionId' | 'userId' | 'timestamp'>): void {
    const event: PerformanceEvent = {
      category: 'performance',
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      ...data,
    }

    this.sendEvent(event)
  }

  // Track conversions
  trackConversion(data: Omit<ConversionEvent, 'category' | 'sessionId' | 'userId' | 'timestamp'>): void {
    const event: ConversionEvent = {
      category: 'conversion',
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      ...data,
    }

    this.sendEvent(event)
  }

  // Send event to all configured providers
  private async sendEvent(event: BaseEvent): Promise<void> {
    if (!this.config.enabled) return

    const promises = this.config.providers.map(provider => {
      switch (provider) {
        case 'google':
          return this.sendToGoogleAnalytics(event)
        case 'plausible':
          return this.sendToPlausible(event)
        case 'mixpanel':
          return this.sendToMixpanel(event)
        case 'segment':
          return this.sendToSegment(event)
        case 'custom':
          return this.sendToCustomEndpoint(event)
        default:
          return Promise.resolve()
      }
    })

    try {
      await Promise.all(promises)
    } catch (error) {
      console.error('Analytics error:', error)
    }
  }

  // Initialize Google Analytics
  private async initializeGoogleAnalytics(): Promise<void> {
    if (!this.config.google?.measurementId) return

    // Load gtag script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.google.measurementId}`
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }

    window.gtag('js', new Date())
    window.gtag('config', this.config.google.measurementId, {
      user_id: this.userId,
      session_id: this.sessionId,
      send_page_view: false,
    })

    // Load GTM if configured
    if (this.config.google.gtmId) {
      const gtmScript = document.createElement('script')
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${this.config.google.gtmId}');
      `
      document.head.appendChild(gtmScript)
    }
  }

  // Initialize Plausible
  private async initializePlausible(): Promise<void> {
    if (!this.config.plausible?.domain) return

    const script = document.createElement('script')
    script.async = true
    script.defer = true
    script.setAttribute('data-domain', this.config.plausible.domain)
    script.src = `${this.config.plausible.apiHost || 'https://plausible.io'}/js/script.js`
    document.head.appendChild(script)
  }

  // Initialize Mixpanel
  private async initializeMixpanel(): Promise<void> {
    if (!this.config.mixpanel?.token) return

    const script = document.createElement('script')
    script.innerHTML = `
      (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");for(h=0;h<i.length;h++)g(a,i[h]);var j="set_config,register,register_once,unregister,identify,set_config,reset,opt_in_tracking,opt_out_tracking,has_opted_in_tracking,has_opted_out_tracking,clear_opt_in_out_tracking,start_batch_senders,people.set,people.set_once,people.unset,people.increment,people.append,people.union,people.track_charge,people.clear_charges,people.delete_user,people.remove".split(",");for(h=0;h<j.length;h++)g(a,j[h]);b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
    `
    document.head.appendChild(script)

    // Initialize Mixpanel
    window.mixpanel.init(this.config.mixpanel.token, {
      debug: process.env.NODE_ENV === 'development',
      track_pageview: false,
    })

    if (this.userId) {
      window.mixpanel.identify(this.userId)
    }
  }

  // Initialize Segment
  private async initializeSegment(): Promise<void> {
    if (!this.config.segment?.writeKey) return

    const script = document.createElement('script')
    script.innerHTML = `
      !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics.SNIPPET_VERSION="4.13.1";
      analytics.load("${this.config.segment.writeKey}");
      }}();
    `
    document.head.appendChild(script)
  }

  // Send event to Google Analytics
  private async sendToGoogleAnalytics(event: BaseEvent): Promise<void> {
    if (!window.gtag) return

    const eventData: any = {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      user_id: event.userId,
      session_id: event.sessionId,
    }

    // Add event-specific data
    if (event.category === 'recipe') {
      const recipeEvent = event as RecipeEvent
      eventData.recipe_id = recipeEvent.recipeId
      eventData.recipe_title = recipeEvent.recipeTitle
    } else if (event.category === 'blog') {
      const blogEvent = event as BlogEvent
      eventData.post_id = blogEvent.postId
      eventData.post_title = blogEvent.postTitle
    }

    window.gtag('event', event.action, eventData)
  }

  // Send event to Plausible
  private async sendToPlausible(event: BaseEvent): Promise<void> {
    if (!window.plausible) return

    const eventName = `${event.category}:${event.action}`
    const props: any = {
      label: event.label,
      value: event.value,
    }

    window.plausible(eventName, { props })
  }

  // Send event to Mixpanel
  private async sendToMixpanel(event: BaseEvent): Promise<void> {
    if (!window.mixpanel) return

    const eventName = `${event.category}:${event.action}`
    const properties: any = {
      category: event.category,
      label: event.label,
      value: event.value,
      session_id: event.sessionId,
      timestamp: event.timestamp,
    }

    window.mixpanel.track(eventName, properties)
  }

  // Send event to Segment
  private async sendToSegment(event: BaseEvent): Promise<void> {
    if (!window.analytics) return

    const eventName = `${event.category}:${event.action}`
    const properties: any = {
      category: event.category,
      label: event.label,
      value: event.value,
      session_id: event.sessionId,
      timestamp: event.timestamp,
    }

    window.analytics.track(eventName, properties)
  }

  // Send event to custom endpoint
  private async sendToCustomEndpoint(event: BaseEvent): Promise<void> {
    if (!this.config.custom?.endpoint) return

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.config.custom.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.custom.apiKey}`
    }

    try {
      await fetch(this.config.custom.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.error('Custom analytics error:', error)
    }
  }

  // Generate session ID
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  }

  // Update user ID
  setUserId(userId: string): void {
    this.userId = userId

    // Update user ID in all providers
    if (window.gtag) {
      window.gtag('config', this.config.google?.measurementId, {
        user_id: userId,
      })
    }

    if (window.mixpanel) {
      window.mixpanel.identify(userId)
    }

    if (window.analytics) {
      window.analytics.identify(userId)
    }
  }

  // Clear user ID (for logout)
  clearUserId(): void {
    this.userId = undefined

    if (window.gtag) {
      window.gtag('config', this.config.google?.measurementId, {
        user_id: null,
      })
    }

    if (window.mixpanel) {
      window.mixpanel.reset()
    }

    if (window.analytics) {
      window.analytics.reset()
    }
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private analytics: AnalyticsManager

  constructor(analytics: AnalyticsManager) {
    this.analytics = analytics
  }

  // Monitor page load performance
  monitorPageLoad(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          this.analytics.trackPerformance({
            action: 'page_load',
            value: navigation.loadEventEnd - navigation.fetchStart,
            resource: window.location.pathname,
          })
        }
      }, 0)
    })
  }

  // Monitor Core Web Vitals
  monitorCoreWebVitals(): void {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lcpEntry = entries[entries.length - 1]
      
      this.analytics.trackPerformance({
        action: 'content_load',
        value: lcpEntry.startTime,
        resource: 'LCP',
      })
    }).observe({ type: 'largest-contentful-paint', buffered: true })

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fidEntry = entries[0]
      
      this.analytics.trackPerformance({
        action: 'page_load',
        value: fidEntry.processingStart - fidEntry.startTime,
        resource: 'FID',
      })
    }).observe({ type: 'first-input', buffered: true })

    // Cumulative Layout Shift
    let clsValue = 0
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      for (const entry of entries) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      
      this.analytics.trackPerformance({
        action: 'page_load',
        value: clsValue * 1000, // Convert to milliseconds for consistency
        resource: 'CLS',
      })
    }).observe({ type: 'layout-shift', buffered: true })
  }

  // Monitor resource loading
  monitorResourceLoading(): void {
    if (typeof window === 'undefined') return

    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      for (const entry of entries) {
        if (entry.name.includes('images') || entry.name.includes('.jpg') || entry.name.includes('.png')) {
          this.analytics.trackPerformance({
            action: 'image_load',
            value: entry.duration,
            resource: entry.name,
          })
        }
      }
    }).observe({ type: 'resource', buffered: true })
  }
}

// Default analytics configuration
const defaultConfig: AnalyticsConfig = {
  enabled: process.env.NODE_ENV === 'production',
  providers: ['google'],
  google: {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
    gtmId: process.env.NEXT_PUBLIC_GTM_ID,
  },
  plausible: {
    domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || '',
  },
}

// Export default instances
export const analytics = new AnalyticsManager(defaultConfig)
export const performanceMonitor = new PerformanceMonitor(analytics)

// Utility functions for common tracking scenarios
export const trackRecipeView = (recipeId: string, recipeTitle: string) => {
  analytics.trackRecipeEvent({
    action: 'view',
    recipeId,
    recipeTitle,
  })
}

export const trackRecipeInteraction = (
  action: 'save' | 'share' | 'print' | 'rate' | 'cook_mode' | 'scale',
  recipeId: string,
  recipeTitle: string,
  value?: number
) => {
  analytics.trackRecipeEvent({
    action,
    recipeId,
    recipeTitle,
    value,
  })
}

export const trackBlogView = (postId: string, postTitle: string) => {
  analytics.trackBlogEvent({
    action: 'view',
    postId,
    postTitle,
  })
}

export const trackSearch = (query: string, resultsCount: number) => {
  analytics.trackSearchEvent({
    action: 'search',
    query,
    resultsCount,
  })
}

export const trackConversion = (action: 'newsletter_signup' | 'recipe_save' | 'social_follow' | 'contact_form') => {
  analytics.trackConversion({
    action,
  })
}

// Type declarations for window objects
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
    plausible: (event: string, options?: { props?: any }) => void
    mixpanel: any
    analytics: any
  }
}