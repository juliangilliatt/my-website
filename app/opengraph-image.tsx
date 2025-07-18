import { ImageResponse } from 'next/og'
import { SITE_CONFIG } from '@/lib/constants'

// Image metadata
export const runtime = 'edge'
export const alt = 'Recipe Blog & Food Website'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Default Open Graph image
export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '60px',
            margin: '60px',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              background: '#667eea',
              borderRadius: '50%',
              width: '120px',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                color: 'white',
              }}
            >
              🍳
            </div>
          </div>
          
          {/* Title */}
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              marginBottom: '16px',
              lineHeight: '1.1',
            }}
          >
            {SITE_CONFIG.name}
          </h1>
          
          {/* Description */}
          <p
            style={{
              fontSize: '28px',
              color: '#666',
              margin: '0',
              lineHeight: '1.3',
              maxWidth: '800px',
            }}
          >
            Discover delicious recipes and cooking inspiration
          </p>
          
          {/* URL */}
          <p
            style={{
              fontSize: '20px',
              color: '#999',
              marginTop: '24px',
              margin: '0',
            }}
          >
            {SITE_CONFIG.url.replace('https://', '').replace('http://', '')}
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

// Generate dynamic Open Graph images for different content types
export async function generateOGImage(params: {
  title: string
  description?: string
  type?: 'recipe' | 'blog' | 'category' | 'tag' | 'page'
  image?: string
  author?: string
  category?: string
  prepTime?: string
  cookTime?: string
  servings?: string
  difficulty?: string
  tags?: string[]
  readingTime?: string
}): Promise<ImageResponse> {
  const {
    title,
    description,
    type = 'page',
    image,
    author,
    category,
    prepTime,
    cookTime,
    servings,
    difficulty,
    tags,
    readingTime,
  } = params

  // Define colors and styling based on content type
  const typeConfig = {
    recipe: {
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      icon: '🍳',
      color: '#ff6b6b',
    },
    blog: {
      gradient: 'linear-gradient(135deg, #4834d4 0%, #686de0 100%)',
      icon: '📝',
      color: '#4834d4',
    },
    category: {
      gradient: 'linear-gradient(135deg, #00d2d3 0%, #54a0ff 100%)',
      icon: '📂',
      color: '#00d2d3',
    },
    tag: {
      gradient: 'linear-gradient(135deg, #5f27cd 0%, #a55eea 100%)',
      icon: '🏷️',
      color: '#5f27cd',
    },
    page: {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: '📄',
      color: '#667eea',
    },
  }

  const config = typeConfig[type]

  return new ImageResponse(
    (
      <div
        style={{
          background: config.gradient,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            margin: '40px',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  background: config.color,
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}
              >
                {config.icon}
              </div>
              <div>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: config.color,
                    margin: '0',
                  }}
                >
                  {SITE_CONFIG.name}
                </h2>
                <p
                  style={{
                    fontSize: '16px',
                    color: '#666',
                    margin: '0',
                    textTransform: 'capitalize',
                  }}
                >
                  {type === 'recipe' ? 'Recipe' : 
                   type === 'blog' ? 'Blog Post' : 
                   type === 'category' ? 'Category' : 
                   type === 'tag' ? 'Tag' : 'Page'}
                </p>
              </div>
            </div>
            
            {/* Recipe/Blog specific badges */}
            {type === 'recipe' && difficulty && (
              <div
                style={{
                  background: '#f8f9fa',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#495057',
                  border: '2px solid #dee2e6',
                  textTransform: 'uppercase',
                }}
              >
                {difficulty}
              </div>
            )}
            
            {type === 'blog' && readingTime && (
              <div
                style={{
                  background: '#f8f9fa',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#495057',
                  border: '2px solid #dee2e6',
                }}
              >
                {readingTime} min read
              </div>
            )}
          </div>

          {/* Main Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            {/* Title */}
            <h1
              style={{
                fontSize: title.length > 50 ? '36px' : '48px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '16px',
                lineHeight: '1.1',
                maxWidth: '100%',
              }}
            >
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p
                style={{
                  fontSize: '20px',
                  color: '#666',
                  margin: '0',
                  lineHeight: '1.3',
                  maxWidth: '100%',
                }}
              >
                {description.length > 150 ? description.substring(0, 150) + '...' : description}
              </p>
            )}

            {/* Recipe Details */}
            {type === 'recipe' && (prepTime || cookTime || servings) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '32px',
                  marginTop: '24px',
                }}
              >
                {prepTime && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '16px',
                      color: '#666',
                    }}
                  >
                    <span>⏱️</span>
                    <span>Prep: {prepTime}</span>
                  </div>
                )}
                {cookTime && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '16px',
                      color: '#666',
                    }}
                  >
                    <span>🔥</span>
                    <span>Cook: {cookTime}</span>
                  </div>
                )}
                {servings && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '16px',
                      color: '#666',
                    }}
                  >
                    <span>👥</span>
                    <span>Serves: {servings}</span>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '20px',
                  flexWrap: 'wrap',
                }}
              >
                {tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      background: '#f8f9fa',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      color: '#666',
                      border: '1px solid #dee2e6',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #dee2e6',
            }}
          >
            {/* Author */}
            {author && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#666',
                }}
              >
                <span>👨‍🍳</span>
                <span>By {author}</span>
              </div>
            )}

            {/* Category */}
            {category && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#666',
                }}
              >
                <span>📂</span>
                <span>{category}</span>
              </div>
            )}

            {/* URL */}
            <p
              style={{
                fontSize: '14px',
                color: '#999',
                margin: '0',
              }}
            >
              {SITE_CONFIG.url.replace('https://', '').replace('http://', '')}
            </p>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

// Recipe-specific Open Graph image
export async function generateRecipeOGImage(recipe: {
  title: string
  description: string
  author: string
  category?: string
  prepTime?: number
  cookTime?: number
  servings?: number
  difficulty?: string
  tags?: string[]
}) {
  return generateOGImage({
    title: recipe.title,
    description: recipe.description,
    type: 'recipe',
    author: recipe.author,
    category: recipe.category,
    prepTime: recipe.prepTime ? `${recipe.prepTime}min` : undefined,
    cookTime: recipe.cookTime ? `${recipe.cookTime}min` : undefined,
    servings: recipe.servings ? `${recipe.servings}` : undefined,
    difficulty: recipe.difficulty,
    tags: recipe.tags,
  })
}

// Blog post-specific Open Graph image
export async function generateBlogPostOGImage(post: {
  title: string
  description: string
  author: string
  category?: string
  readingTime?: number
  tags?: string[]
}) {
  return generateOGImage({
    title: post.title,
    description: post.description,
    type: 'blog',
    author: post.author,
    category: post.category,
    readingTime: post.readingTime ? `${post.readingTime}` : undefined,
    tags: post.tags,
  })
}

// Category-specific Open Graph image
export async function generateCategoryOGImage(category: {
  title: string
  description: string
  type: 'recipe' | 'blog'
}) {
  return generateOGImage({
    title: category.title,
    description: category.description,
    type: 'category',
  })
}

// Tag-specific Open Graph image
export async function generateTagOGImage(tag: {
  title: string
  description: string
  type: 'recipe' | 'blog'
}) {
  return generateOGImage({
    title: tag.title,
    description: tag.description,
    type: 'tag',
  })
}