import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { mockRecipe } from '@/lib/test/utils'

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  )
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  )
}))

describe('RecipeCard', () => {
  const defaultProps = {
    recipe: mockRecipe
  }

  it('renders recipe information correctly', () => {
    render(<RecipeCard {...defaultProps} />)
    
    expect(screen.getByText(mockRecipe.title)).toBeInTheDocument()
    expect(screen.getByText(mockRecipe.description)).toBeInTheDocument()
    expect(screen.getByText(mockRecipe.author)).toBeInTheDocument()
    expect(screen.getByAltText(mockRecipe.imageAlt)).toBeInTheDocument()
  })

  it('displays recipe timing information', () => {
    render(<RecipeCard {...defaultProps} />)
    
    expect(screen.getByText('15 min')).toBeInTheDocument() // prep time
    expect(screen.getByText('12 min')).toBeInTheDocument() // cook time
    expect(screen.getByText('24 servings')).toBeInTheDocument()
  })

  it('displays difficulty level', () => {
    render(<RecipeCard {...defaultProps} />)
    
    expect(screen.getByText('Easy')).toBeInTheDocument()
  })

  it('displays rating information', () => {
    render(<RecipeCard {...defaultProps} />)
    
    expect(screen.getByText('4.8')).toBeInTheDocument()
    expect(screen.getByText('(127 reviews)')).toBeInTheDocument()
  })

  it('displays recipe tags', () => {
    render(<RecipeCard {...defaultProps} />)
    
    mockRecipe.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument()
    })
  })

  it('shows featured badge for featured recipes', () => {
    render(<RecipeCard {...defaultProps} />)
    
    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('links to recipe detail page', () => {
    render(<RecipeCard {...defaultProps} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/recipes/${mockRecipe.slug}`)
  })

  it('handles missing optional fields gracefully', () => {
    const recipeWithoutOptionals = {
      ...mockRecipe,
      rating: undefined,
      tags: [],
      featured: false
    }

    render(<RecipeCard recipe={recipeWithoutOptionals} />)
    
    expect(screen.getByText(mockRecipe.title)).toBeInTheDocument()
    expect(screen.queryByText('Featured')).not.toBeInTheDocument()
  })

  it('calls onSave callback when save button is clicked', () => {
    const onSave = vi.fn()
    render(<RecipeCard {...defaultProps} onSave={onSave} />)
    
    const saveButton = screen.getByLabelText('Save recipe')
    fireEvent.click(saveButton)
    
    expect(onSave).toHaveBeenCalledWith(mockRecipe.id)
  })

  it('shows saved state when recipe is saved', () => {
    render(<RecipeCard {...defaultProps} saved={true} />)
    
    const saveButton = screen.getByLabelText('Recipe saved')
    expect(saveButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('handles long titles gracefully', () => {
    const recipeWithLongTitle = {
      ...mockRecipe,
      title: 'This is a very long recipe title that should be truncated or wrapped properly to maintain layout'
    }

    render(<RecipeCard recipe={recipeWithLongTitle} />)
    
    expect(screen.getByText(recipeWithLongTitle.title)).toBeInTheDocument()
  })

  it('handles missing image gracefully', () => {
    const recipeWithoutImage = {
      ...mockRecipe,
      image: '',
      imageAlt: ''
    }

    render(<RecipeCard recipe={recipeWithoutImage} />)
    
    // Should still render recipe information
    expect(screen.getByText(mockRecipe.title)).toBeInTheDocument()
  })

  it('displays category information', () => {
    render(<RecipeCard {...defaultProps} />)
    
    expect(screen.getByText(mockRecipe.category)).toBeInTheDocument()
  })

  it('displays cuisine type', () => {
    render(<RecipeCard {...defaultProps} />)
    
    expect(screen.getByText(mockRecipe.cuisine)).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<RecipeCard {...defaultProps} />)
    
    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('aria-labelledby')
    
    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toBeInTheDocument()
    
    const image = screen.getByAltText(mockRecipe.imageAlt)
    expect(image).toBeInTheDocument()
  })

  it('supports keyboard navigation', () => {
    render(<RecipeCard {...defaultProps} />)
    
    const link = screen.getByRole('link')
    link.focus()
    expect(link).toHaveFocus()
  })

  it('displays loading state when specified', () => {
    render(<RecipeCard {...defaultProps} loading={true} />)
    
    expect(screen.getByTestId('recipe-card-skeleton')).toBeInTheDocument()
  })

  it('handles click events on card', () => {
    const onClick = vi.fn()
    render(<RecipeCard {...defaultProps} onClick={onClick} />)
    
    const card = screen.getByRole('article')
    fireEvent.click(card)
    
    expect(onClick).toHaveBeenCalledWith(mockRecipe.id)
  })

  it('displays nutritional information when available', () => {
    render(<RecipeCard {...defaultProps} showNutrition={true} />)
    
    expect(screen.getByText('180 cal')).toBeInTheDocument()
  })

  it('can be rendered in compact mode', () => {
    render(<RecipeCard {...defaultProps} compact={true} />)
    
    const card = screen.getByRole('article')
    expect(card).toHaveClass('recipe-card--compact')
  })

  it('handles hover states correctly', () => {
    render(<RecipeCard {...defaultProps} />)
    
    const card = screen.getByRole('article')
    fireEvent.mouseEnter(card)
    
    expect(card).toHaveClass('recipe-card--hover')
  })

  it('shows cooking time badge', () => {
    render(<RecipeCard {...defaultProps} />)
    
    expect(screen.getByText('27 min total')).toBeInTheDocument()
  })

  it('displays recipe status for draft recipes', () => {
    const draftRecipe = {
      ...mockRecipe,
      status: 'draft' as const
    }

    render(<RecipeCard recipe={draftRecipe} />)
    
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('handles error states gracefully', () => {
    const errorRecipe = {
      ...mockRecipe,
      image: 'invalid-url'
    }

    render(<RecipeCard recipe={errorRecipe} />)
    
    // Should still render other information
    expect(screen.getByText(mockRecipe.title)).toBeInTheDocument()
  })

  it('supports custom CSS classes', () => {
    render(<RecipeCard {...defaultProps} className="custom-class" />)
    
    const card = screen.getByRole('article')
    expect(card).toHaveClass('custom-class')
  })

  it('renders recipe sharing options', () => {
    render(<RecipeCard {...defaultProps} showShareOptions={true} />)
    
    expect(screen.getByLabelText('Share recipe')).toBeInTheDocument()
  })

  it('handles recipe with no ratings', () => {
    const unratedRecipe = {
      ...mockRecipe,
      rating: {
        average: 0,
        count: 0
      }
    }

    render(<RecipeCard recipe={unratedRecipe} />)
    
    expect(screen.getByText('No ratings yet')).toBeInTheDocument()
  })
})