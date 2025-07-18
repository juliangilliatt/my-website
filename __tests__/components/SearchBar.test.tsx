import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SearchBar } from '@/components/ui/SearchBar'
import { mockRecipe, mockBlogPost } from '@/lib/test/utils'

// Mock debounce
vi.mock('lodash.debounce', () => ({
  default: (fn: Function) => fn
}))

describe('SearchBar', () => {
  const defaultProps = {
    placeholder: 'Search recipes...',
    onSearch: vi.fn(),
    onClear: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input with placeholder', () => {
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search recipes...')
    expect(input).toBeInTheDocument()
  })

  it('calls onSearch when typing', async () => {
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search recipes...')
    fireEvent.change(input, { target: { value: 'chocolate' } })
    
    await waitFor(() => {
      expect(defaultProps.onSearch).toHaveBeenCalledWith('chocolate')
    })
  })

  it('shows clear button when input has value', () => {
    render(<SearchBar {...defaultProps} value="chocolate" />)
    
    const clearButton = screen.getByLabelText('Clear search')
    expect(clearButton).toBeInTheDocument()
  })

  it('calls onClear when clear button is clicked', () => {
    render(<SearchBar {...defaultProps} value="chocolate" />)
    
    const clearButton = screen.getByLabelText('Clear search')
    fireEvent.click(clearButton)
    
    expect(defaultProps.onClear).toHaveBeenCalled()
  })

  it('shows loading state when searching', () => {
    render(<SearchBar {...defaultProps} loading={true} />)
    
    const loadingSpinner = screen.getByTestId('search-loading')
    expect(loadingSpinner).toBeInTheDocument()
  })

  it('displays search suggestions when available', () => {
    const suggestions = [
      { id: '1', title: 'Chocolate Cake', type: 'recipe' },
      { id: '2', title: 'Chocolate Cookies', type: 'recipe' }
    ]

    render(<SearchBar {...defaultProps} suggestions={suggestions} />)
    
    suggestions.forEach(suggestion => {
      expect(screen.getByText(suggestion.title)).toBeInTheDocument()
    })
  })

  it('handles keyboard navigation in suggestions', () => {
    const suggestions = [
      { id: '1', title: 'Chocolate Cake', type: 'recipe' },
      { id: '2', title: 'Chocolate Cookies', type: 'recipe' }
    ]

    render(<SearchBar {...defaultProps} suggestions={suggestions} />)
    
    const input = screen.getByPlaceholderText('Search recipes...')
    
    // Arrow down should highlight first suggestion
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    const firstSuggestion = screen.getByText('Chocolate Cake')
    expect(firstSuggestion).toHaveClass('suggestion--active')
  })

  it('selects suggestion on Enter key', () => {
    const suggestions = [
      { id: '1', title: 'Chocolate Cake', type: 'recipe' },
      { id: '2', title: 'Chocolate Cookies', type: 'recipe' }
    ]

    const onSelect = vi.fn()
    render(<SearchBar {...defaultProps} suggestions={suggestions} onSelect={onSelect} />)
    
    const input = screen.getByPlaceholderText('Search recipes...')
    
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(onSelect).toHaveBeenCalledWith(suggestions[0])
  })

  it('closes suggestions on Escape key', () => {
    const suggestions = [
      { id: '1', title: 'Chocolate Cake', type: 'recipe' }
    ]

    render(<SearchBar {...defaultProps} suggestions={suggestions} />)
    
    const input = screen.getByPlaceholderText('Search recipes...')
    fireEvent.keyDown(input, { key: 'Escape' })
    
    expect(screen.queryByText('Chocolate Cake')).not.toBeInTheDocument()
  })

  it('handles click selection of suggestions', () => {
    const suggestions = [
      { id: '1', title: 'Chocolate Cake', type: 'recipe' }
    ]

    const onSelect = vi.fn()
    render(<SearchBar {...defaultProps} suggestions={suggestions} onSelect={onSelect} />)
    
    const suggestion = screen.getByText('Chocolate Cake')
    fireEvent.click(suggestion)
    
    expect(onSelect).toHaveBeenCalledWith(suggestions[0])
  })

  it('shows no results message when no suggestions', () => {
    render(<SearchBar {...defaultProps} suggestions={[]} showNoResults={true} />)
    
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('supports filtering by type', () => {
    const filters = [
      { id: 'recipes', label: 'Recipes', active: true },
      { id: 'blog', label: 'Blog Posts', active: false }
    ]

    render(<SearchBar {...defaultProps} filters={filters} />)
    
    filters.forEach(filter => {
      expect(screen.getByText(filter.label)).toBeInTheDocument()
    })
  })

  it('handles filter selection', () => {
    const filters = [
      { id: 'recipes', label: 'Recipes', active: true },
      { id: 'blog', label: 'Blog Posts', active: false }
    ]

    const onFilterChange = vi.fn()
    render(<SearchBar {...defaultProps} filters={filters} onFilterChange={onFilterChange} />)
    
    const blogFilter = screen.getByText('Blog Posts')
    fireEvent.click(blogFilter)
    
    expect(onFilterChange).toHaveBeenCalledWith('blog')
  })

  it('shows recent searches when input is focused', () => {
    const recentSearches = ['chocolate cake', 'pasta recipes']
    
    render(<SearchBar {...defaultProps} recentSearches={recentSearches} />)
    
    const input = screen.getByPlaceholderText('Search recipes...')
    fireEvent.focus(input)
    
    recentSearches.forEach(search => {
      expect(screen.getByText(search)).toBeInTheDocument()
    })
  })

  it('handles advanced search options', () => {
    render(<SearchBar {...defaultProps} showAdvancedOptions={true} />)
    
    const advancedButton = screen.getByText('Advanced Search')
    fireEvent.click(advancedButton)
    
    expect(screen.getByText('Cooking Time')).toBeInTheDocument()
    expect(screen.getByText('Difficulty')).toBeInTheDocument()
    expect(screen.getByText('Cuisine')).toBeInTheDocument()
  })

  it('applies advanced search filters', () => {
    const onAdvancedSearch = vi.fn()
    render(<SearchBar {...defaultProps} showAdvancedOptions={true} onAdvancedSearch={onAdvancedSearch} />)
    
    const advancedButton = screen.getByText('Advanced Search')
    fireEvent.click(advancedButton)
    
    const cuisineSelect = screen.getByLabelText('Cuisine')
    fireEvent.change(cuisineSelect, { target: { value: 'italian' } })
    
    const applyButton = screen.getByText('Apply Filters')
    fireEvent.click(applyButton)
    
    expect(onAdvancedSearch).toHaveBeenCalledWith({
      cuisine: 'italian'
    })
  })

  it('shows search history', () => {
    const history = [
      { query: 'chocolate cake', timestamp: Date.now() - 3600000 },
      { query: 'pasta recipes', timestamp: Date.now() - 7200000 }
    ]

    render(<SearchBar {...defaultProps} searchHistory={history} />)
    
    const input = screen.getByPlaceholderText('Search recipes...')
    fireEvent.focus(input)
    
    expect(screen.getByText('Recent Searches')).toBeInTheDocument()
    history.forEach(item => {
      expect(screen.getByText(item.query)).toBeInTheDocument()
    })
  })

  it('handles voice search', () => {
    const onVoiceSearch = vi.fn()
    render(<SearchBar {...defaultProps} voiceSearch={true} onVoiceSearch={onVoiceSearch} />)
    
    const voiceButton = screen.getByLabelText('Voice search')
    fireEvent.click(voiceButton)
    
    expect(onVoiceSearch).toHaveBeenCalled()
  })

  it('shows voice search status', () => {
    render(<SearchBar {...defaultProps} voiceSearch={true} voiceSearchActive={true} />)
    
    expect(screen.getByText('Listening...')).toBeInTheDocument()
  })

  it('handles search shortcuts', () => {
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search recipes...')
    
    // Ctrl+K should focus the search
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(input).toHaveFocus()
  })

  it('handles empty search gracefully', () => {
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search recipes...')
    fireEvent.change(input, { target: { value: '' } })
    
    expect(defaultProps.onSearch).toHaveBeenCalledWith('')
  })

  it('shows search count when available', () => {
    render(<SearchBar {...defaultProps} resultCount={42} />)
    
    expect(screen.getByText('42 results')).toBeInTheDocument()
  })

  it('handles search error states', () => {
    render(<SearchBar {...defaultProps} error="Search failed" />)
    
    expect(screen.getByText('Search failed')).toBeInTheDocument()
  })

  it('supports custom styling', () => {
    render(<SearchBar {...defaultProps} className="custom-search" />)
    
    const container = screen.getByRole('search')
    expect(container).toHaveClass('custom-search')
  })

  it('handles form submission', () => {
    const onSubmit = vi.fn()
    render(<SearchBar {...defaultProps} onSubmit={onSubmit} />)
    
    const form = screen.getByRole('search')
    fireEvent.submit(form)
    
    expect(onSubmit).toHaveBeenCalled()
  })

  it('shows autocomplete suggestions', () => {
    const autocomplete = [
      'chocolate chip cookies',
      'chocolate cake',
      'chocolate brownies'
    ]

    render(<SearchBar {...defaultProps} autocomplete={autocomplete} />)
    
    const input = screen.getByPlaceholderText('Search recipes...')
    fireEvent.change(input, { target: { value: 'choc' } })
    
    autocomplete.forEach(suggestion => {
      expect(screen.getByText(suggestion)).toBeInTheDocument()
    })
  })

  it('handles mobile responsive behavior', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    })

    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search recipes...')
    expect(input).toHaveClass('search-input--mobile')
  })

  it('preserves search state across rerenders', () => {
    const { rerender } = render(<SearchBar {...defaultProps} value="initial" />)
    
    const input = screen.getByPlaceholderText('Search recipes...')
    expect(input).toHaveValue('initial')
    
    rerender(<SearchBar {...defaultProps} value="updated" />)
    expect(input).toHaveValue('updated')
  })

  it('handles special characters in search', () => {
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search recipes...')
    fireEvent.change(input, { target: { value: 'café & résumé' } })
    
    expect(defaultProps.onSearch).toHaveBeenCalledWith('café & résumé')
  })
})