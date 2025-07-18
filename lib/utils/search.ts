/**
 * Search utilities for MongoDB text search and query processing
 */

/**
 * Process a search query string for MongoDB text search
 * @param query - The raw search query
 * @param options - Search processing options
 * @returns Processed search query
 */
export function processSearchQuery(
  query: string,
  options: {
    minLength?: number
    maxLength?: number
    removeStopWords?: boolean
    fuzzyMatch?: boolean
    exactPhrase?: boolean
  } = {}
): string {
  const defaults = {
    minLength: 2,
    maxLength: 100,
    removeStopWords: true,
    fuzzyMatch: false,
    exactPhrase: false,
  }

  const opts = { ...defaults, ...options }

  if (!query || typeof query !== 'string') {
    return ''
  }

  let processedQuery = query.trim()

  // Check length constraints
  if (processedQuery.length < opts.minLength) {
    return ''
  }

  if (processedQuery.length > opts.maxLength) {
    processedQuery = processedQuery.substring(0, opts.maxLength).trim()
  }

  // Handle exact phrase search
  if (opts.exactPhrase) {
    return `"${processedQuery}"`
  }

  // Remove special characters that might interfere with MongoDB text search
  processedQuery = processedQuery.replace(/[^\w\s\-"]/g, ' ')

  // Remove stop words if requested
  if (opts.removeStopWords) {
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    ]
    
    const words = processedQuery.toLowerCase().split(/\s+/)
    const filteredWords = words.filter(word => 
      word.length > 1 && !stopWords.includes(word)
    )
    
    if (filteredWords.length === 0) {
      // If all words were stop words, return original query
      return query.trim()
    }
    
    processedQuery = filteredWords.join(' ')
  }

  // Clean up multiple spaces
  processedQuery = processedQuery.replace(/\s+/g, ' ').trim()

  // Add fuzzy matching if requested
  if (opts.fuzzyMatch) {
    const words = processedQuery.split(' ')
    const fuzzyWords = words.map(word => {
      if (word.length > 3) {
        return `${word}*` // Add wildcard for partial matching
      }
      return word
    })
    processedQuery = fuzzyWords.join(' ')
  }

  return processedQuery
}

/**
 * Build MongoDB aggregation pipeline for search
 * @param query - The search query
 * @param options - Search options
 * @returns MongoDB aggregation pipeline
 */
export function buildSearchPipeline(
  query: string,
  options: {
    searchFields?: string[]
    matchFields?: Record<string, any>
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    limit?: number
    skip?: number
    includeScore?: boolean
  } = {}
): any[] {
  const defaults = {
    searchFields: ['title', 'description', 'content'],
    matchFields: {},
    sortBy: 'score',
    sortOrder: 'desc' as const,
    limit: 20,
    skip: 0,
    includeScore: false,
  }

  const opts = { ...defaults, ...options }
  const pipeline: any[] = []

  // Add text search stage if query provided
  if (query) {
    pipeline.push({
      $match: {
        $text: {
          $search: query,
        },
        ...opts.matchFields,
      },
    })

    // Add score calculation if requested
    if (opts.includeScore) {
      pipeline.push({
        $addFields: {
          score: { $meta: 'textScore' },
        },
      })
    }
  } else if (Object.keys(opts.matchFields).length > 0) {
    // Add match stage for filters only
    pipeline.push({
      $match: opts.matchFields,
    })
  }

  // Add sorting
  if (opts.sortBy === 'score' && query) {
    pipeline.push({
      $sort: { score: { $meta: 'textScore' } },
    })
  } else if (opts.sortBy) {
    pipeline.push({
      $sort: { [opts.sortBy]: opts.sortOrder === 'desc' ? -1 : 1 },
    })
  }

  // Add pagination
  if (opts.skip > 0) {
    pipeline.push({ $skip: opts.skip })
  }

  if (opts.limit > 0) {
    pipeline.push({ $limit: opts.limit })
  }

  return pipeline
}

/**
 * Generate search suggestions based on query
 * @param query - The partial query
 * @param suggestions - Array of possible suggestions
 * @param options - Suggestion options
 * @returns Array of matching suggestions
 */
export function generateSearchSuggestions(
  query: string,
  suggestions: string[],
  options: {
    maxSuggestions?: number
    fuzzyMatch?: boolean
    minScore?: number
  } = {}
): Array<{ text: string; score: number }> {
  const defaults = {
    maxSuggestions: 10,
    fuzzyMatch: true,
    minScore: 0.3,
  }

  const opts = { ...defaults, ...options }

  if (!query || !suggestions.length) {
    return []
  }

  const lowerQuery = query.toLowerCase()
  const matches: Array<{ text: string; score: number }> = []

  suggestions.forEach(suggestion => {
    const lowerSuggestion = suggestion.toLowerCase()
    let score = 0

    // Exact match
    if (lowerSuggestion === lowerQuery) {
      score = 1.0
    }
    // Starts with query
    else if (lowerSuggestion.startsWith(lowerQuery)) {
      score = 0.8
    }
    // Contains query
    else if (lowerSuggestion.includes(lowerQuery)) {
      score = 0.6
    }
    // Fuzzy match
    else if (opts.fuzzyMatch) {
      score = calculateFuzzyScore(lowerQuery, lowerSuggestion)
    }

    if (score >= opts.minScore) {
      matches.push({ text: suggestion, score })
    }
  })

  // Sort by score and return top matches
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.maxSuggestions)
}

/**
 * Calculate fuzzy matching score between two strings
 * @param query - The search query
 * @param target - The target string
 * @returns Score between 0 and 1
 */
function calculateFuzzyScore(query: string, target: string): number {
  if (query.length === 0) return target.length === 0 ? 1 : 0
  if (target.length === 0) return 0

  const matrix: number[][] = []
  
  // Initialize matrix
  for (let i = 0; i <= query.length; i++) {
    matrix[i] = []
    matrix[i][0] = i
  }
  
  for (let j = 0; j <= target.length; j++) {
    matrix[0][j] = j
  }

  // Calculate edit distance
  for (let i = 1; i <= query.length; i++) {
    for (let j = 1; j <= target.length; j++) {
      if (query[i - 1] === target[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,    // deletion
          matrix[i][j - 1] + 1,    // insertion
          matrix[i - 1][j - 1] + 1 // substitution
        )
      }
    }
  }

  const editDistance = matrix[query.length][target.length]
  const maxLength = Math.max(query.length, target.length)
  
  return 1 - (editDistance / maxLength)
}

/**
 * Extract and highlight search terms in text
 * @param text - The text to highlight
 * @param query - The search query
 * @param options - Highlight options
 * @returns Text with highlighted terms
 */
export function highlightSearchTerms(
  text: string,
  query: string,
  options: {
    highlightTag?: string
    className?: string
    caseSensitive?: boolean
    wholeWords?: boolean
  } = {}
): string {
  const defaults = {
    highlightTag: 'mark',
    className: 'search-highlight',
    caseSensitive: false,
    wholeWords: false,
  }

  const opts = { ...defaults, ...options }

  if (!text || !query) {
    return text
  }

  const processedQuery = processSearchQuery(query, { removeStopWords: false })
  const terms = processedQuery.split(' ').filter(term => term.length > 0)

  if (terms.length === 0) {
    return text
  }

  let highlightedText = text
  const className = opts.className ? ` class="${opts.className}"` : ''

  terms.forEach(term => {
    const flags = opts.caseSensitive ? 'g' : 'gi'
    const pattern = opts.wholeWords ? `\\b${term}\\b` : term
    const regex = new RegExp(pattern, flags)
    
    highlightedText = highlightedText.replace(regex, (match) => {
      return `<${opts.highlightTag}${className}>${match}</${opts.highlightTag}>`
    })
  })

  return highlightedText
}

/**
 * Extract snippet from text around search terms
 * @param text - The full text
 * @param query - The search query
 * @param options - Snippet options
 * @returns Text snippet with search terms
 */
export function extractSearchSnippet(
  text: string,
  query: string,
  options: {
    maxLength?: number
    contextWords?: number
    ellipsis?: string
    highlightTerms?: boolean
  } = {}
): string {
  const defaults = {
    maxLength: 200,
    contextWords: 10,
    ellipsis: '...',
    highlightTerms: true,
  }

  const opts = { ...defaults, ...options }

  if (!text || !query) {
    return text.substring(0, opts.maxLength)
  }

  const processedQuery = processSearchQuery(query, { removeStopWords: false })
  const terms = processedQuery.split(' ').filter(term => term.length > 0)

  if (terms.length === 0) {
    return text.substring(0, opts.maxLength)
  }

  const lowerText = text.toLowerCase()
  const lowerTerms = terms.map(term => term.toLowerCase())

  // Find first occurrence of any term
  let firstIndex = -1
  let matchedTerm = ''

  for (const term of lowerTerms) {
    const index = lowerText.indexOf(term)
    if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
      firstIndex = index
      matchedTerm = term
    }
  }

  if (firstIndex === -1) {
    return text.substring(0, opts.maxLength)
  }

  // Calculate snippet boundaries
  const words = text.split(/\s+/)
  const wordIndex = text.substring(0, firstIndex).split(/\s+/).length - 1
  
  const startIndex = Math.max(0, wordIndex - opts.contextWords)
  const endIndex = Math.min(words.length, wordIndex + opts.contextWords + 1)
  
  const snippet = words.slice(startIndex, endIndex).join(' ')
  
  let result = snippet
  
  // Add ellipsis if needed
  if (startIndex > 0) {
    result = opts.ellipsis + result
  }
  if (endIndex < words.length) {
    result = result + opts.ellipsis
  }

  // Highlight terms if requested
  if (opts.highlightTerms) {
    result = highlightSearchTerms(result, query)
  }

  return result
}

/**
 * Build search filters object from query parameters
 * @param params - Search parameters
 * @param options - Filter options
 * @returns MongoDB filter object
 */
export function buildSearchFilters(
  params: Record<string, any>,
  options: {
    allowedFields?: string[]
    fieldMappings?: Record<string, string>
    transformers?: Record<string, (value: any) => any>
  } = {}
): Record<string, any> {
  const defaults = {
    allowedFields: [],
    fieldMappings: {},
    transformers: {},
  }

  const opts = { ...defaults, ...options }
  const filters: Record<string, any> = {}

  Object.entries(params).forEach(([key, value]) => {
    // Skip if field not allowed
    if (opts.allowedFields.length > 0 && !opts.allowedFields.includes(key)) {
      return
    }

    // Skip empty values
    if (value === null || value === undefined || value === '') {
      return
    }

    // Map field name if needed
    const fieldName = opts.fieldMappings[key] || key

    // Transform value if transformer exists
    const transformedValue = opts.transformers[key] ? opts.transformers[key](value) : value

    // Add to filters
    filters[fieldName] = transformedValue
  })

  return filters
}

/**
 * Generate search analytics data
 * @param query - The search query
 * @param results - Search results
 * @param options - Analytics options
 * @returns Analytics data object
 */
export function generateSearchAnalytics(
  query: string,
  results: any[],
  options: {
    userId?: string
    sessionId?: string
    timestamp?: Date
    metadata?: Record<string, any>
  } = {}
): Record<string, any> {
  const defaults = {
    timestamp: new Date(),
    metadata: {},
  }

  const opts = { ...defaults, ...options }

  return {
    query: query.trim(),
    queryLength: query.trim().length,
    wordCount: query.trim().split(/\s+/).length,
    resultCount: results.length,
    hasResults: results.length > 0,
    userId: opts.userId,
    sessionId: opts.sessionId,
    timestamp: opts.timestamp,
    metadata: opts.metadata,
  }
}

/**
 * Clean and normalize search query for storage
 * @param query - The raw search query
 * @returns Cleaned query
 */
export function cleanSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return ''
  }

  return query
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-]/g, '')
    .substring(0, 100)
}

/**
 * Check if search query is valid
 * @param query - The search query
 * @param options - Validation options
 * @returns True if valid
 */
export function isValidSearchQuery(
  query: string,
  options: {
    minLength?: number
    maxLength?: number
    allowedChars?: RegExp
    forbiddenWords?: string[]
  } = {}
): boolean {
  const defaults = {
    minLength: 2,
    maxLength: 100,
    allowedChars: /^[a-zA-Z0-9\s\-_.]+$/,
    forbiddenWords: [],
  }

  const opts = { ...defaults, ...options }

  if (!query || typeof query !== 'string') {
    return false
  }

  const trimmedQuery = query.trim()

  // Check length
  if (trimmedQuery.length < opts.minLength || trimmedQuery.length > opts.maxLength) {
    return false
  }

  // Check allowed characters
  if (!opts.allowedChars.test(trimmedQuery)) {
    return false
  }

  // Check forbidden words
  if (opts.forbiddenWords.length > 0) {
    const lowerQuery = trimmedQuery.toLowerCase()
    const containsForbiddenWord = opts.forbiddenWords.some(word => 
      lowerQuery.includes(word.toLowerCase())
    )
    if (containsForbiddenWord) {
      return false
    }
  }

  return true
}