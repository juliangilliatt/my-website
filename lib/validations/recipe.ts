import { z } from 'zod'
import { RECIPE_CONFIG, VALIDATION } from '@/lib/constants'

// Ingredient schema
const ingredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required').max(100, 'Ingredient name must be less than 100 characters'),
  amount: z.number().min(0, 'Amount must be positive'),
  unit: z.string().min(1, 'Unit is required').max(20, 'Unit must be less than 20 characters'),
  notes: z.string().max(200, 'Notes must be less than 200 characters').optional(),
  optional: z.boolean().default(false),
})

// Instruction schema
const instructionSchema = z.object({
  step: z.number().min(1, 'Step number must be at least 1'),
  description: z.string().min(1, 'Instruction description is required').max(500, 'Instruction description must be less than 500 characters'),
  duration: z.number().min(0, 'Duration must be positive').optional(),
  temperature: z.number().min(0, 'Temperature must be positive').optional(),
  notes: z.string().max(200, 'Notes must be less than 200 characters').optional(),
})

// Image schema
const imageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  alt: z.string().min(1, 'Image alt text is required').max(200, 'Alt text must be less than 200 characters'),
  caption: z.string().max(300, 'Caption must be less than 300 characters').optional(),
  isPrimary: z.boolean().default(false),
})

// Nutrition schema
const nutritionSchema = z.object({
  calories: z.number().min(0, 'Calories must be positive').optional(),
  protein: z.number().min(0, 'Protein must be positive').optional(),
  carbs: z.number().min(0, 'Carbs must be positive').optional(),
  fat: z.number().min(0, 'Fat must be positive').optional(),
  fiber: z.number().min(0, 'Fiber must be positive').optional(),
  sugar: z.number().min(0, 'Sugar must be positive').optional(),
  sodium: z.number().min(0, 'Sodium must be positive').optional(),
})

// Main recipe schema
export const recipeSchema = z.object({
  title: z.string()
    .min(VALIDATION.recipe.titleMinLength, `Title must be at least ${VALIDATION.recipe.titleMinLength} characters`)
    .max(VALIDATION.recipe.titleMaxLength, `Title must be less than ${VALIDATION.recipe.titleMaxLength} characters`)
    .trim(),
  
  description: z.string()
    .min(VALIDATION.recipe.descriptionMinLength, `Description must be at least ${VALIDATION.recipe.descriptionMinLength} characters`)
    .max(VALIDATION.recipe.descriptionMaxLength, `Description must be less than ${VALIDATION.recipe.descriptionMaxLength} characters`)
    .trim(),
  
  ingredients: z.array(ingredientSchema)
    .min(1, 'At least one ingredient is required')
    .max(VALIDATION.recipe.maxIngredients, `Maximum ${VALIDATION.recipe.maxIngredients} ingredients allowed`),
  
  instructions: z.array(instructionSchema)
    .min(1, 'At least one instruction is required')
    .max(VALIDATION.recipe.maxInstructions, `Maximum ${VALIDATION.recipe.maxInstructions} instructions allowed`),
  
  prepTime: z.number()
    .min(0, 'Prep time must be positive')
    .max(VALIDATION.recipe.maxPrepTimeMinutes, `Prep time cannot exceed ${VALIDATION.recipe.maxPrepTimeMinutes} minutes`),
  
  cookTime: z.number()
    .min(0, 'Cook time must be positive')
    .max(VALIDATION.recipe.maxCookTimeMinutes, `Cook time cannot exceed ${VALIDATION.recipe.maxCookTimeMinutes} minutes`),
  
  servings: z.number()
    .min(VALIDATION.recipe.minServings, `Servings must be at least ${VALIDATION.recipe.minServings}`)
    .max(VALIDATION.recipe.maxServings, `Servings cannot exceed ${VALIDATION.recipe.maxServings}`),
  
  difficulty: z.enum(RECIPE_CONFIG.difficulties, {
    required_error: 'Difficulty is required',
    invalid_type_error: 'Invalid difficulty level',
  }),
  
  category: z.enum(RECIPE_CONFIG.categories, {
    required_error: 'Category is required',
    invalid_type_error: 'Invalid category',
  }),
  
  cuisine: z.enum(RECIPE_CONFIG.cuisines, {
    required_error: 'Cuisine is required',
    invalid_type_error: 'Invalid cuisine',
  }),
  
  tags: z.array(z.string().min(1, 'Tag name is required').max(50, 'Tag name must be less than 50 characters'))
    .max(VALIDATION.recipe.maxTags, `Maximum ${VALIDATION.recipe.maxTags} tags allowed`)
    .default([]),
  
  images: z.array(imageSchema)
    .max(VALIDATION.recipe.maxImages, `Maximum ${VALIDATION.recipe.maxImages} images allowed`)
    .optional(),
  
  nutrition: nutritionSchema.optional(),
  
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
  
  source: z.string()
    .max(200, 'Source must be less than 200 characters')
    .optional(),
  
  featured: z.boolean().default(false),
  
  published: z.boolean().default(false),
})
.refine(
  (data) => {
    // Ensure at least one image is marked as primary if images exist
    if (data.images && data.images.length > 0) {
      return data.images.some(img => img.isPrimary)
    }
    return true
  },
  {
    message: 'At least one image must be marked as primary',
    path: ['images'],
  }
)
.refine(
  (data) => {
    // Ensure only one image is marked as primary
    if (data.images && data.images.length > 0) {
      const primaryImages = data.images.filter(img => img.isPrimary)
      return primaryImages.length <= 1
    }
    return true
  },
  {
    message: 'Only one image can be marked as primary',
    path: ['images'],
  }
)
.refine(
  (data) => {
    // Ensure instruction steps are sequential
    if (data.instructions.length > 1) {
      const steps = data.instructions.map(inst => inst.step).sort((a, b) => a - b)
      for (let i = 0; i < steps.length; i++) {
        if (steps[i] !== i + 1) {
          return false
        }
      }
    }
    return true
  },
  {
    message: 'Instruction steps must be sequential starting from 1',
    path: ['instructions'],
  }
)

// Recipe update schema (all fields optional except where needed)
export const recipeUpdateSchema = z.object({
  title: z.string()
    .min(VALIDATION.recipe.titleMinLength, `Title must be at least ${VALIDATION.recipe.titleMinLength} characters`)
    .max(VALIDATION.recipe.titleMaxLength, `Title must be less than ${VALIDATION.recipe.titleMaxLength} characters`)
    .trim()
    .optional(),
  
  description: z.string()
    .min(VALIDATION.recipe.descriptionMinLength, `Description must be at least ${VALIDATION.recipe.descriptionMinLength} characters`)
    .max(VALIDATION.recipe.descriptionMaxLength, `Description must be less than ${VALIDATION.recipe.descriptionMaxLength} characters`)
    .trim()
    .optional(),
  
  ingredients: z.array(ingredientSchema)
    .min(1, 'At least one ingredient is required')
    .max(VALIDATION.recipe.maxIngredients, `Maximum ${VALIDATION.recipe.maxIngredients} ingredients allowed`)
    .optional(),
  
  instructions: z.array(instructionSchema)
    .min(1, 'At least one instruction is required')
    .max(VALIDATION.recipe.maxInstructions, `Maximum ${VALIDATION.recipe.maxInstructions} instructions allowed`)
    .optional(),
  
  prepTime: z.number()
    .min(0, 'Prep time must be positive')
    .max(VALIDATION.recipe.maxPrepTimeMinutes, `Prep time cannot exceed ${VALIDATION.recipe.maxPrepTimeMinutes} minutes`)
    .optional(),
  
  cookTime: z.number()
    .min(0, 'Cook time must be positive')
    .max(VALIDATION.recipe.maxCookTimeMinutes, `Cook time cannot exceed ${VALIDATION.recipe.maxCookTimeMinutes} minutes`)
    .optional(),
  
  servings: z.number()
    .min(VALIDATION.recipe.minServings, `Servings must be at least ${VALIDATION.recipe.minServings}`)
    .max(VALIDATION.recipe.maxServings, `Servings cannot exceed ${VALIDATION.recipe.maxServings}`)
    .optional(),
  
  difficulty: z.enum(RECIPE_CONFIG.difficulties).optional(),
  
  category: z.enum(RECIPE_CONFIG.categories).optional(),
  
  cuisine: z.enum(RECIPE_CONFIG.cuisines).optional(),
  
  tags: z.array(z.string().min(1, 'Tag name is required').max(50, 'Tag name must be less than 50 characters'))
    .max(VALIDATION.recipe.maxTags, `Maximum ${VALIDATION.recipe.maxTags} tags allowed`)
    .optional(),
  
  images: z.array(imageSchema)
    .max(VALIDATION.recipe.maxImages, `Maximum ${VALIDATION.recipe.maxImages} images allowed`)
    .optional(),
  
  nutrition: nutritionSchema.optional(),
  
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
  
  source: z.string()
    .max(200, 'Source must be less than 200 characters')
    .optional(),
  
  featured: z.boolean().optional(),
  
  published: z.boolean().optional(),
})

// Recipe search schema
export const recipeSearchSchema = z.object({
  q: z.string().optional(),
  category: z.enum(RECIPE_CONFIG.categories).optional(),
  cuisine: z.enum(RECIPE_CONFIG.cuisines).optional(),
  difficulty: z.enum(RECIPE_CONFIG.difficulties).optional(),
  prepTime: z.number().min(0).max(VALIDATION.recipe.maxPrepTimeMinutes).optional(),
  cookTime: z.number().min(0).max(VALIDATION.recipe.maxCookTimeMinutes).optional(),
  servings: z.number().min(1).max(VALIDATION.recipe.maxServings).optional(),
  dietary: z.array(z.enum(RECIPE_CONFIG.dietaryRestrictions)).optional(),
  method: z.enum(RECIPE_CONFIG.cookingMethods).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
  sort: z.enum(['newest', 'oldest', 'popular', 'rating', 'title']).default('newest'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// Recipe filter schema for UI components
export const recipeFilterSchema = z.object({
  categories: z.array(z.enum(RECIPE_CONFIG.categories)).optional(),
  cuisines: z.array(z.enum(RECIPE_CONFIG.cuisines)).optional(),
  difficulties: z.array(z.enum(RECIPE_CONFIG.difficulties)).optional(),
  dietaryRestrictions: z.array(z.enum(RECIPE_CONFIG.dietaryRestrictions)).optional(),
  cookingMethods: z.array(z.enum(RECIPE_CONFIG.cookingMethods)).optional(),
  prepTimeRange: z.object({
    min: z.number().min(0).default(0),
    max: z.number().min(0).max(VALIDATION.recipe.maxPrepTimeMinutes).default(VALIDATION.recipe.maxPrepTimeMinutes),
  }).optional(),
  cookTimeRange: z.object({
    min: z.number().min(0).default(0),
    max: z.number().min(0).max(VALIDATION.recipe.maxCookTimeMinutes).default(VALIDATION.recipe.maxCookTimeMinutes),
  }).optional(),
  servingsRange: z.object({
    min: z.number().min(1).default(1),
    max: z.number().min(1).max(VALIDATION.recipe.maxServings).default(VALIDATION.recipe.maxServings),
  }).optional(),
})

// Recipe rating schema
export const recipeRatingSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
})

// Recipe import schema (for importing from external sources)
export const recipeImportSchema = z.object({
  url: z.string().url('Invalid URL'),
  source: z.string().max(200, 'Source must be less than 200 characters').optional(),
})

// Type exports
export type RecipeInput = z.infer<typeof recipeSchema>
export type RecipeUpdateInput = z.infer<typeof recipeUpdateSchema>
export type RecipeSearchInput = z.infer<typeof recipeSearchSchema>
export type RecipeFilterInput = z.infer<typeof recipeFilterSchema>
export type RecipeRatingInput = z.infer<typeof recipeRatingSchema>
export type RecipeImportInput = z.infer<typeof recipeImportSchema>
export type IngredientInput = z.infer<typeof ingredientSchema>
export type InstructionInput = z.infer<typeof instructionSchema>
export type ImageInput = z.infer<typeof imageSchema>
export type NutritionInput = z.infer<typeof nutritionSchema>