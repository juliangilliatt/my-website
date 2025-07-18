'use client'

import { useEffect } from 'react'
import { generateJSONLD, validateStructuredData } from '@/lib/seo/structured-data'

interface StructuredDataProps {
  data: any
  id?: string
  validate?: boolean
  onValidationError?: (errors: string[]) => void
}

export function StructuredData({ 
  data, 
  id, 
  validate = false, 
  onValidationError 
}: StructuredDataProps) {
  useEffect(() => {
    if (validate) {
      const validation = validateStructuredData(data)
      if (!validation.isValid && onValidationError) {
        onValidationError(validation.errors)
      }
    }
  }, [data, validate, onValidationError])

  const jsonLd = generateJSONLD(data)

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  )
}

// Recipe structured data component
interface RecipeStructuredDataProps {
  recipe: {
    name: string
    description: string
    image?: string
    author: string
    datePublished?: string
    dateModified?: string
    prepTime?: number
    cookTime?: number
    servings?: number
    category?: string
    cuisine?: string
    keywords?: string[]
    ingredients: string[]
    instructions: string[]
    nutrition?: {
      calories?: number
      protein?: number
      carbs?: number
      fat?: number
      fiber?: number
      sugar?: number
      sodium?: number
    }
    rating?: {
      value: number
      count: number
    }
    difficulty?: string
    equipment?: string[]
    source?: string
    url?: string
  }
  validate?: boolean
  onValidationError?: (errors: string[]) => void
}

export function RecipeStructuredData({ 
  recipe, 
  validate = false, 
  onValidationError 
}: RecipeStructuredDataProps) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
  
  const structuredData = {
    '@type': 'Recipe',
    name: recipe.name,
    description: recipe.description,
    image: recipe.image ? [recipe.image] : undefined,
    author: {
      '@type': 'Person',
      name: recipe.author,
    },
    datePublished: recipe.datePublished,
    dateModified: recipe.dateModified,
    prepTime: recipe.prepTime ? `PT${recipe.prepTime}M` : undefined,
    cookTime: recipe.cookTime ? `PT${recipe.cookTime}M` : undefined,
    totalTime: totalTime > 0 ? `PT${totalTime}M` : undefined,
    recipeCategory: recipe.category,
    recipeCuisine: recipe.cuisine,
    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
    keywords: recipe.keywords?.join(', '),
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.instructions.map((instruction, index) => ({
      '@type': 'HowToStep',
      text: instruction,
      name: `Step ${index + 1}`,
    })),
    nutrition: recipe.nutrition ? {
      '@type': 'NutritionInformation',
      calories: recipe.nutrition.calories ? `${recipe.nutrition.calories} calories` : undefined,
      proteinContent: recipe.nutrition.protein ? `${recipe.nutrition.protein}g` : undefined,
      carbohydrateContent: recipe.nutrition.carbs ? `${recipe.nutrition.carbs}g` : undefined,
      fatContent: recipe.nutrition.fat ? `${recipe.nutrition.fat}g` : undefined,
      fiberContent: recipe.nutrition.fiber ? `${recipe.nutrition.fiber}g` : undefined,
      sugarContent: recipe.nutrition.sugar ? `${recipe.nutrition.sugar}g` : undefined,
      sodiumContent: recipe.nutrition.sodium ? `${recipe.nutrition.sodium}mg` : undefined,
      servingSize: recipe.servings ? `1/${recipe.servings} of recipe` : undefined,
    } : undefined,
    aggregateRating: recipe.rating ? {
      '@type': 'AggregateRating',
      ratingValue: recipe.rating.value,
      ratingCount: recipe.rating.count,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    url: recipe.url,
    recipeDifficulty: recipe.difficulty,
    recipeEquipment: recipe.equipment,
    recipeSource: recipe.source,
  }

  // Remove undefined values
  const cleanedData = JSON.parse(JSON.stringify(structuredData))

  return (
    <StructuredData
      data={cleanedData}
      id="recipe-structured-data"
      validate={validate}
      onValidationError={onValidationError}
    />
  )
}

// Blog post structured data component
interface BlogPostStructuredDataProps {
  post: {
    headline: string
    description: string
    image?: string
    author: string
    datePublished?: string
    dateModified?: string
    category?: string
    keywords?: string[]
    url?: string
    wordCount?: number
    articleBody?: string
  }
  validate?: boolean
  onValidationError?: (errors: string[]) => void
}

export function BlogPostStructuredData({ 
  post, 
  validate = false, 
  onValidationError 
}: BlogPostStructuredDataProps) {
  const structuredData = {
    '@type': 'BlogPosting',
    headline: post.headline,
    description: post.description,
    image: post.image ? [post.image] : undefined,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: process.env.NEXT_PUBLIC_SITE_NAME || 'Recipe Blog',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
      },
    },
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    articleSection: post.category,
    keywords: post.keywords?.join(', '),
    wordCount: post.wordCount,
    url: post.url,
    mainEntityOfPage: post.url,
    articleBody: post.articleBody,
  }

  // Remove undefined values
  const cleanedData = JSON.parse(JSON.stringify(structuredData))

  return (
    <StructuredData
      data={cleanedData}
      id="blog-post-structured-data"
      validate={validate}
      onValidationError={onValidationError}
    />
  )
}

// Breadcrumb structured data component
interface BreadcrumbStructuredDataProps {
  breadcrumbs: Array<{
    name: string
    url: string
  }>
  validate?: boolean
  onValidationError?: (errors: string[]) => void
}

export function BreadcrumbStructuredData({ 
  breadcrumbs, 
  validate = false, 
  onValidationError 
}: BreadcrumbStructuredDataProps) {
  const structuredData = {
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }

  return (
    <StructuredData
      data={structuredData}
      id="breadcrumb-structured-data"
      validate={validate}
      onValidationError={onValidationError}
    />
  )
}

// Organization structured data component
interface OrganizationStructuredDataProps {
  organization: {
    name: string
    url: string
    logo?: string
    description?: string
    contactPoint?: Array<{
      telephone?: string
      contactType: string
      email?: string
      availableLanguage?: string
    }>
    sameAs?: string[]
  }
  validate?: boolean
  onValidationError?: (errors: string[]) => void
}

export function OrganizationStructuredData({ 
  organization, 
  validate = false, 
  onValidationError 
}: OrganizationStructuredDataProps) {
  const structuredData = {
    '@type': 'Organization',
    name: organization.name,
    url: organization.url,
    logo: organization.logo,
    description: organization.description,
    contactPoint: organization.contactPoint?.map(contact => ({
      '@type': 'ContactPoint',
      telephone: contact.telephone,
      contactType: contact.contactType,
      email: contact.email,
      availableLanguage: contact.availableLanguage,
    })),
    sameAs: organization.sameAs,
  }

  // Remove undefined values
  const cleanedData = JSON.parse(JSON.stringify(structuredData))

  return (
    <StructuredData
      data={cleanedData}
      id="organization-structured-data"
      validate={validate}
      onValidationError={onValidationError}
    />
  )
}

// Website structured data component
interface WebsiteStructuredDataProps {
  website: {
    name: string
    url: string
    description?: string
    searchUrl?: string
  }
  validate?: boolean
  onValidationError?: (errors: string[]) => void
}

export function WebsiteStructuredData({ 
  website, 
  validate = false, 
  onValidationError 
}: WebsiteStructuredDataProps) {
  const structuredData = {
    '@type': 'WebSite',
    name: website.name,
    url: website.url,
    description: website.description,
    publisher: {
      '@type': 'Organization',
      name: website.name,
      url: website.url,
    },
    potentialAction: website.searchUrl ? {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: website.searchUrl,
      },
      'query-input': 'required name=search_term_string',
    } : undefined,
  }

  // Remove undefined values
  const cleanedData = JSON.parse(JSON.stringify(structuredData))

  return (
    <StructuredData
      data={cleanedData}
      id="website-structured-data"
      validate={validate}
      onValidationError={onValidationError}
    />
  )
}

// FAQ structured data component
interface FAQStructuredDataProps {
  faqs: Array<{
    question: string
    answer: string
  }>
  validate?: boolean
  onValidationError?: (errors: string[]) => void
}

export function FAQStructuredData({ 
  faqs, 
  validate = false, 
  onValidationError 
}: FAQStructuredDataProps) {
  const structuredData = {
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <StructuredData
      data={structuredData}
      id="faq-structured-data"
      validate={validate}
      onValidationError={onValidationError}
    />
  )
}

// Collection page structured data component
interface CollectionPageStructuredDataProps {
  collection: {
    name: string
    description: string
    url: string
    items: Array<{
      name: string
      url: string
      image?: string
      description?: string
    }>
  }
  validate?: boolean
  onValidationError?: (errors: string[]) => void
}

export function CollectionPageStructuredData({ 
  collection, 
  validate = false, 
  onValidationError 
}: CollectionPageStructuredDataProps) {
  const structuredData = {
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description,
    url: collection.url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: collection.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url,
        image: item.image,
        description: item.description,
      })),
    },
  }

  // Remove undefined values
  const cleanedData = JSON.parse(JSON.stringify(structuredData))

  return (
    <StructuredData
      data={cleanedData}
      id="collection-page-structured-data"
      validate={validate}
      onValidationError={onValidationError}
    />
  )
}

// Local business structured data component
interface LocalBusinessStructuredDataProps {
  business: {
    name: string
    description?: string
    url?: string
    telephone?: string
    address?: {
      streetAddress?: string
      addressLocality?: string
      addressRegion?: string
      postalCode?: string
      addressCountry?: string
    }
    geo?: {
      latitude: number
      longitude: number
    }
    openingHours?: string[]
    priceRange?: string
    image?: string[]
    sameAs?: string[]
  }
  validate?: boolean
  onValidationError?: (errors: string[]) => void
}

export function LocalBusinessStructuredData({ 
  business, 
  validate = false, 
  onValidationError 
}: LocalBusinessStructuredDataProps) {
  const structuredData = {
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    url: business.url,
    telephone: business.telephone,
    address: business.address ? {
      '@type': 'PostalAddress',
      streetAddress: business.address.streetAddress,
      addressLocality: business.address.addressLocality,
      addressRegion: business.address.addressRegion,
      postalCode: business.address.postalCode,
      addressCountry: business.address.addressCountry,
    } : undefined,
    geo: business.geo ? {
      '@type': 'GeoCoordinates',
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    } : undefined,
    openingHours: business.openingHours,
    priceRange: business.priceRange,
    image: business.image,
    sameAs: business.sameAs,
  }

  // Remove undefined values
  const cleanedData = JSON.parse(JSON.stringify(structuredData))

  return (
    <StructuredData
      data={cleanedData}
      id="local-business-structured-data"
      validate={validate}
      onValidationError={onValidationError}
    />
  )
}

// Multiple structured data component
interface MultipleStructuredDataProps {
  data: Array<{
    id: string
    data: any
  }>
  validate?: boolean
  onValidationError?: (id: string, errors: string[]) => void
}

export function MultipleStructuredData({ 
  data, 
  validate = false, 
  onValidationError 
}: MultipleStructuredDataProps) {
  return (
    <>
      {data.map((item) => (
        <StructuredData
          key={item.id}
          data={item.data}
          id={item.id}
          validate={validate}
          onValidationError={onValidationError ? (errors) => onValidationError(item.id, errors) : undefined}
        />
      ))}
    </>
  )
}

// Validation component (for development)
interface StructuredDataValidatorProps {
  data: any
  showErrors?: boolean
  onValidation?: (result: { isValid: boolean; errors: string[] }) => void
}

export function StructuredDataValidator({ 
  data, 
  showErrors = false, 
  onValidation 
}: StructuredDataValidatorProps) {
  const validation = validateStructuredData(data)
  
  useEffect(() => {
    if (onValidation) {
      onValidation(validation)
    }
  }, [validation, onValidation])

  if (process.env.NODE_ENV === 'development' && showErrors && !validation.isValid) {
    console.warn('Structured data validation errors:', validation.errors)
  }

  return null
}

// Hook for structured data validation
export function useStructuredDataValidation(data: any) {
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] }>({
    isValid: true,
    errors: [],
  })

  useEffect(() => {
    if (data) {
      const result = validateStructuredData(data)
      setValidation(result)
    }
  }, [data])

  return validation
}

import { useState } from 'react'

// Default export for convenience
export default StructuredData