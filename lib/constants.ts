// Design System Constants
export const COLORS = {
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
} as const

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// 8px grid spacing system
export const SPACING = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  18: '72px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
} as const

// Typography scale
export const TYPOGRAPHY = {
  fontFamily: {
    mono: ['IBM Plex Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
    sans: ['Inter', 'system-ui', 'sans-serif'],
    code: ['Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const

// Shadows for brutalist design
export const SHADOWS = {
  brutal: '4px 4px 0px 0px rgba(0, 0, 0, 1)',
  'brutal-sm': '2px 2px 0px 0px rgba(0, 0, 0, 1)',
  'brutal-lg': '8px 8px 0px 0px rgba(0, 0, 0, 1)',
} as const

// Animation durations
export const ANIMATION = {
  fast: '0.15s',
  normal: '0.3s',
  slow: '0.5s',
  slower: '0.75s',
  slowest: '1s',
} as const

// Component variants
export const VARIANTS = {
  button: ['default', 'primary', 'secondary', 'danger', 'outline', 'ghost', 'link'] as const,
  badge: ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'outline', 'ghost'] as const,
  card: ['default', 'elevated', 'bordered'] as const,
} as const

// Component sizes
export const SIZES = {
  button: ['default', 'sm', 'lg', 'icon'] as const,
  badge: ['default', 'sm', 'lg'] as const,
  input: ['default', 'sm', 'lg'] as const,
  spinner: ['sm', 'md', 'lg'] as const,
} as const

// Site configuration
export const SITE_CONFIG = {
  name: 'My Website',
  description: 'A brutalist portfolio website with recipes and blog',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  author: 'Your Name',
  social: {
    twitter: '@yourusername',
    github: 'yourusername',
    email: 'your.email@example.com',
  },
  navigation: [
    { name: 'Home', href: '/' },
    { name: 'Recipes', href: '/recipes' },
    { name: 'Blog', href: '/blog' },
    { name: 'Admin', href: '/admin' },
  ],
} as const

// Recipe categories and tags
export const RECIPE_CONFIG = {
  categories: [
    'appetizers',
    'main-course',
    'desserts',
    'beverages',
    'snacks',
    'salads',
    'soups',
    'sides',
  ] as const,
  cuisines: [
    'italian',
    'mexican',
    'indian',
    'chinese',
    'american',
    'french',
    'japanese',
    'mediterranean',
    'thai',
    'other',
  ] as const,
  dietaryRestrictions: [
    'vegetarian',
    'vegan',
    'gluten-free',
    'dairy-free',
    'keto',
    'paleo',
    'low-carb',
    'high-protein',
  ] as const,
  difficulties: [
    'easy',
    'medium',
    'hard',
  ] as const,
  cookingMethods: [
    'baking',
    'grilling',
    'roasting',
    'sauteing',
    'boiling',
    'steaming',
    'frying',
    'slow-cooking',
    'pressure-cooking',
    'no-cook',
  ] as const,
} as const

// Blog categories
export const BLOG_CONFIG = {
  categories: [
    'development',
    'design',
    'cooking',
    'lifestyle',
    'tutorials',
    'reviews',
    'news',
    'personal',
  ] as const,
  tags: [
    'javascript',
    'typescript',
    'react',
    'nextjs',
    'css',
    'html',
    'cooking',
    'recipes',
    'web-development',
    'ui-design',
    'ux-design',
    'productivity',
    'tools',
    'tips',
  ] as const,
} as const

// API endpoints
export const API_ENDPOINTS = {
  recipes: {
    list: '/api/recipes',
    create: '/api/recipes',
    detail: (id: string) => `/api/recipes/${id}`,
    update: (id: string) => `/api/recipes/${id}`,
    delete: (id: string) => `/api/recipes/${id}`,
    search: '/api/recipes/search',
  },
  blog: {
    list: '/api/blog',
    create: '/api/blog',
    detail: (slug: string) => `/api/blog/${slug}`,
    update: (slug: string) => `/api/blog/${slug}`,
    delete: (slug: string) => `/api/blog/${slug}`,
  },
  upload: '/api/upload',
  github: {
    lastCommit: '/api/github/last-commit',
  },
} as const

// Validation constants
export const VALIDATION = {
  recipe: {
    titleMinLength: 3,
    titleMaxLength: 100,
    descriptionMinLength: 10,
    descriptionMaxLength: 500,
    maxIngredients: 50,
    maxInstructions: 20,
    maxTags: 10,
    maxImages: 5,
    maxCookTimeMinutes: 1440, // 24 hours
    maxPrepTimeMinutes: 1440, // 24 hours
    maxServings: 50,
    minServings: 1,
  },
  blog: {
    titleMinLength: 3,
    titleMaxLength: 100,
    excerptMinLength: 10,
    excerptMaxLength: 300,
    contentMinLength: 100,
    contentMaxLength: 50000,
    maxTags: 10,
    slugMinLength: 3,
    slugMaxLength: 100,
  },
  image: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxWidth: 2048,
    maxHeight: 2048,
  },
} as const

// Default values
export const DEFAULTS = {
  recipe: {
    servings: 4,
    prepTime: 15,
    cookTime: 30,
    difficulty: 'medium' as const,
    category: 'main-course' as const,
    cuisine: 'other' as const,
  },
  blog: {
    status: 'draft' as const,
    category: 'development' as const,
  },
  pagination: {
    pageSize: 12,
    maxPageSize: 50,
  },
  search: {
    debounceMs: 300,
    minQueryLength: 2,
    maxResults: 20,
  },
} as const