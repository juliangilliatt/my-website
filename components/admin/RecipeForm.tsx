'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { 
  FormField, 
  FormInput, 
  FormTextarea, 
  FormSelect, 
  FormCheckbox, 
  FormSection,
  FormErrorSummary,
  FormSuccessMessage,
  FormLoading,
  CharacterCounter
} from './FormValidation'
import { ImageUpload } from './ImageUpload'
import { TagSelector } from './TagSelector'
import { IngredientsInput } from './IngredientsInput'
import { InstructionsInput } from './InstructionsInput'
import { RecipePreview } from './RecipePreview'
import { useFormValidation } from '@/hooks/useFormValidation'
import { 
  recipeFormSchema, 
  type RecipeFormData,
  validateForm 
} from '@/lib/validations/admin-forms'
import { cn } from '@/lib/utils'

interface RecipeFormProps {
  initialData?: Partial<RecipeFormData>
  mode?: 'create' | 'edit'
  onSubmit?: (data: RecipeFormData) => Promise<void>
  onCancel?: () => void
  className?: string
}

export function RecipeForm({
  initialData = {},
  mode = 'create',
  onSubmit,
  onCancel,
  className
}: RecipeFormProps) {
  const router = useRouter()
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Form validation
  const {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setValues,
    validateForm: validateFormFields,
    handleSubmit,
    getFieldProps,
    reset
  } = useFormValidation<RecipeFormData>({
    // Default values
    title: '',
    description: '',
    slug: '',
    category: '',
    difficulty: 'easy',
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    ingredients: [''],
    instructions: [''],
    tags: [],
    image: '',
    imageAlt: '',
    notes: '',
    tips: '',
    nutrition: undefined,
    published: false,
    featured: false,
    author: '',
    cuisine: '',
    equipment: [],
    source: '',
    sourceUrl: '',
    ...initialData
  }, {
    schema: recipeFormSchema,
    validateOnChange: true,
    validateOnBlur: true,
  })

  // Auto-generate slug from title
  useEffect(() => {
    if (values.title && !touched.slug) {
      const slug = values.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setValue('slug', slug)
    }
  }, [values.title, touched.slug, setValue])

  // Auto-set image alt text from title
  useEffect(() => {
    if (values.title && !values.imageAlt) {
      setValue('imageAlt', values.title)
    }
  }, [values.title, values.imageAlt, setValue])

  // Handle form submission
  const handleFormSubmit = useCallback(async (data: RecipeFormData) => {
    try {
      if (onSubmit) {
        await onSubmit(data)
        setSubmitSuccess(true)
        
        // Redirect after success
        setTimeout(() => {
          router.push('/admin/recipes')
        }, 2000)
      }
    } catch (error) {
      console.error('Form submission error:', error)
      throw error
    }
  }, [onSubmit, router])

  // Handle save draft - bypass validation for drafts
  const handleSaveDraft = useCallback(async () => {
    const draftData = { ...values, published: false }
    try {
      if (onSubmit) {
        const result = await onSubmit(draftData)

        // Check if the result indicates success
        if (result && typeof result === 'object' && 'success' in result) {
          if (result.success && result.recipeId) {
            // Redirect to edit page
            router.push(`/admin/recipes/${result.recipeId}/edit?success=created`)
          } else {
            // Show error
            alert('Error saving draft: ' + (result.error || 'Unknown error'))
          }
        } else {
          // Old behavior - show success and redirect to list
          setSubmitSuccess(true)
          setTimeout(() => {
            router.push('/admin/recipes')
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Save draft error:', error)
      alert('Error saving draft: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }, [values, onSubmit, router])

  // Handle publish
  const handlePublish = useCallback(async () => {
    const publishData = { ...values, published: true }
    try {
      await handleFormSubmit(publishData)
    } catch (error) {
      console.error('Publish error:', error)
    }
  }, [values, handleFormSubmit])

  // Categories and difficulty options
  const categoryOptions = [
    { value: '', label: 'Select Category' },
    { value: 'appetizers', label: 'Appetizers' },
    { value: 'main-courses', label: 'Main Courses' },
    { value: 'desserts', label: 'Desserts' },
    { value: 'salads', label: 'Salads' },
    { value: 'soups', label: 'Soups' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'pasta', label: 'Pasta' },
    { value: 'seafood', label: 'Seafood' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
  ]

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ]

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'instructions', label: 'Instructions' },
    { id: 'details', label: 'Details' },
    { id: 'seo', label: 'SEO & Meta' },
  ]

  if (submitSuccess) {
    return (
      <div className={cn('max-w-2xl mx-auto', className)}>
        <FormSuccessMessage 
          message={`Recipe ${mode === 'create' ? 'created' : 'updated'} successfully! Redirecting...`}
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-black">
            {mode === 'create' ? 'Create Recipe' : 'Edit Recipe'}
          </h1>
          <p className="text-neutral-600 font-mono text-sm mt-1">
            {mode === 'create' 
              ? 'Create a new recipe with ingredients and instructions'
              : 'Update recipe details and content'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="font-mono"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="font-mono"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Form Errors */}
      <FormErrorSummary errors={errors} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-3 py-2 text-sm font-mono border-2 border-black transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-black text-white shadow-brutal'
                    : 'bg-white text-black hover:bg-neutral-50 shadow-brutal-sm'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <Card className="p-6">
                <FormSection title="Basic Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Recipe Title"
                      required
                      error={errors.title}
                    >
                      <FormInput
                        {...getFieldProps('title')}
                        placeholder="Enter recipe title"
                        error={errors.title}
                        disabled={isSubmitting}
                      />
                      <CharacterCounter current={values.title?.length || 0} max={100} />
                    </FormField>

                    <FormField
                      label="URL Slug"
                      required
                      error={errors.slug}
                      description="URL-friendly version of the title"
                    >
                      <FormInput
                        {...getFieldProps('slug')}
                        placeholder="recipe-slug"
                        error={errors.slug}
                        disabled={isSubmitting}
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="Description"
                    required
                    error={errors.description}
                  >
                    <FormTextarea
                      {...getFieldProps('description')}
                      placeholder="Brief description of the recipe"
                      rows={3}
                      error={errors.description}
                      disabled={isSubmitting}
                    />
                    <CharacterCounter current={values.description?.length || 0} max={500} />
                  </FormField>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      label="Category"
                      required
                      error={errors.category}
                    >
                      <FormSelect
                        {...getFieldProps('category')}
                        options={categoryOptions}
                        error={errors.category}
                        disabled={isSubmitting}
                      />
                    </FormField>

                    <FormField
                      label="Difficulty"
                      required
                      error={errors.difficulty}
                    >
                      <FormSelect
                        {...getFieldProps('difficulty')}
                        options={difficultyOptions}
                        error={errors.difficulty}
                        disabled={isSubmitting}
                      />
                    </FormField>

                    <FormField
                      label="Cuisine"
                      error={errors.cuisine}
                    >
                      <FormInput
                        {...getFieldProps('cuisine')}
                        placeholder="e.g., Italian, Mexican"
                        error={errors.cuisine}
                        disabled={isSubmitting}
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      label="Prep Time (minutes)"
                      required
                      error={errors.prepTime}
                    >
                      <FormInput
                        {...getFieldProps('prepTime')}
                        type="number"
                        min="0"
                        max="1440"
                        error={errors.prepTime}
                        disabled={isSubmitting}
                      />
                    </FormField>

                    <FormField
                      label="Cook Time (minutes)"
                      required
                      error={errors.cookTime}
                    >
                      <FormInput
                        {...getFieldProps('cookTime')}
                        type="number"
                        min="0"
                        max="1440"
                        error={errors.cookTime}
                        disabled={isSubmitting}
                      />
                    </FormField>

                    <FormField
                      label="Servings"
                      required
                      error={errors.servings}
                    >
                      <FormInput
                        {...getFieldProps('servings')}
                        type="number"
                        min="1"
                        max="100"
                        error={errors.servings}
                        disabled={isSubmitting}
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="Author"
                    required
                    error={errors.author}
                  >
                    <FormInput
                      {...getFieldProps('author')}
                      placeholder="Recipe author name"
                      error={errors.author}
                      disabled={isSubmitting}
                    />
                  </FormField>
                </FormSection>
              </Card>
            )}

            {/* Ingredients Tab */}
            {activeTab === 'ingredients' && (
              <Card className="p-6">
                <IngredientsInput
                  value={values.ingredients || []}
                  onChange={(ingredients) => setValue('ingredients', ingredients)}
                  error={errors.ingredients}
                  disabled={isSubmitting}
                />
              </Card>
            )}

            {/* Instructions Tab */}
            {activeTab === 'instructions' && (
              <Card className="p-6">
                <InstructionsInput
                  value={values.instructions || []}
                  onChange={(instructions) => setValue('instructions', instructions)}
                  error={errors.instructions}
                  disabled={isSubmitting}
                />
              </Card>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <Card className="p-6">
                <FormSection title="Recipe Details">
                  <ImageUpload
                    value={values.image}
                    onChange={(url) => setValue('image', url)}
                    altText={values.imageAlt}
                    onAltTextChange={(alt) => setValue('imageAlt', alt)}
                    disabled={isSubmitting}
                  />

                  <TagSelector
                    value={values.tags || []}
                    onChange={(tags) => setValue('tags', tags)}
                    error={errors.tags}
                    disabled={isSubmitting}
                  />

                  <FormField
                    label="Notes"
                    error={errors.notes}
                  >
                    <FormTextarea
                      {...getFieldProps('notes')}
                      placeholder="Additional notes about the recipe"
                      rows={3}
                      error={errors.notes}
                      disabled={isSubmitting}
                    />
                    <CharacterCounter current={values.notes?.length || 0} max={1000} />
                  </FormField>

                  <FormField
                    label="Tips"
                    error={errors.tips}
                  >
                    <FormTextarea
                      {...getFieldProps('tips')}
                      placeholder="Helpful tips for making this recipe"
                      rows={3}
                      error={errors.tips}
                      disabled={isSubmitting}
                    />
                    <CharacterCounter current={values.tips?.length || 0} max={1000} />
                  </FormField>

                  <FormField
                    label="Source"
                    error={errors.source}
                  >
                    <FormInput
                      {...getFieldProps('source')}
                      placeholder="Recipe source (optional)"
                      error={errors.source}
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField
                    label="Source URL"
                    error={errors.sourceUrl}
                  >
                    <FormInput
                      {...getFieldProps('sourceUrl')}
                      type="url"
                      placeholder="https://example.com/recipe"
                      error={errors.sourceUrl}
                      disabled={isSubmitting}
                    />
                  </FormField>
                </FormSection>
              </Card>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <Card className="p-6">
                <FormSection title="Publishing Options">
                  <div className="space-y-4">
                    <FormCheckbox
                      {...getFieldProps('published')}
                      label="Published"
                      disabled={isSubmitting}
                    />
                    
                    <FormCheckbox
                      {...getFieldProps('featured')}
                      label="Featured Recipe"
                      disabled={isSubmitting}
                    />
                  </div>
                </FormSection>
              </Card>
            )}

            {/* Form Actions */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting || !isDirty}
                    className="font-mono"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Draft'}
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValid || !isDirty}
                    className="font-mono"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Recipe'}
                  </Button>
                </div>

                <div className="text-sm font-mono text-neutral-600">
                  {isDirty ? 'Unsaved changes' : 'No changes'}
                </div>
              </div>
            </Card>
          </form>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-6 lg:h-screen lg:overflow-y-auto">
            <RecipePreview
              formData={values}
              mode="card"
              showMetadata={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}