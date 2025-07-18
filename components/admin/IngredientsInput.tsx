'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { FormField, FormInput, FormSelect } from './FormValidation'
import { useArrayField } from '@/hooks/useFormValidation'
import { cn } from '@/lib/utils'

interface Ingredient {
  amount: string
  unit: string
  item: string
  notes?: string
}

interface IngredientsInputProps {
  value: string[]
  onChange: (ingredients: string[]) => void
  className?: string
  label?: string
  required?: boolean
  error?: string
  disabled?: boolean
  maxIngredients?: number
  placeholder?: string
  useStructuredInput?: boolean
}

export function IngredientsInput({
  value = [],
  onChange,
  className,
  label = 'Ingredients',
  required,
  error,
  disabled,
  maxIngredients = 50,
  placeholder = 'Enter ingredient...',
  useStructuredInput = false,
}: IngredientsInputProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [showStructuredInput, setShowStructuredInput] = useState(useStructuredInput)

  const {
    items: ingredients,
    errors: ingredientErrors,
    addItem,
    removeItem,
    updateItem,
    moveItem,
    setItemError,
    clearItemError,
  } = useArrayField<string>(value, {})

  // Update parent when ingredients change
  React.useEffect(() => {
    onChange(ingredients)
  }, [ingredients, onChange])

  const handleAddIngredient = useCallback(() => {
    if (ingredients.length < maxIngredients) {
      addItem('')
    }
  }, [ingredients.length, maxIngredients, addItem])

  const handleRemoveIngredient = useCallback((index: number) => {
    removeItem(index)
  }, [removeItem])

  const handleIngredientChange = useCallback((index: number, value: string) => {
    updateItem(index, value)
    
    // Clear error when user starts typing
    if (ingredientErrors[index]) {
      clearItemError(index)
    }
    
    // Validate ingredient
    if (value.trim().length === 0) {
      setItemError(index, 'Ingredient cannot be empty')
    } else if (value.length > 200) {
      setItemError(index, 'Ingredient must not exceed 200 characters')
    }
  }, [updateItem, ingredientErrors, clearItemError, setItemError])

  const handleMoveUp = useCallback((index: number) => {
    if (index > 0) {
      moveItem(index, index - 1)
    }
  }, [moveItem])

  const handleMoveDown = useCallback((index: number) => {
    if (index < ingredients.length - 1) {
      moveItem(index, index + 1)
    }
  }, [moveItem, ingredients.length])

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', '')
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropIndex(index)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDropIndex(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    
    if (dragIndex !== null && dragIndex !== index) {
      moveItem(dragIndex, index)
    }
    
    setDragIndex(null)
    setDropIndex(null)
  }, [dragIndex, moveItem])

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDropIndex(null)
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      <FormField
        label={label}
        required={required}
        error={error}
        description={`Recipe ingredients (${ingredients.length}/${maxIngredients})`}
      >
        <div className="space-y-3">
          {/* Input Type Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-neutral-600">Input mode:</span>
            <button
              type="button"
              onClick={() => setShowStructuredInput(false)}
              className={cn(
                'px-2 py-1 text-xs font-mono border rounded',
                !showStructuredInput
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-neutral-300 hover:border-black'
              )}
            >
              Simple
            </button>
            <button
              type="button"
              onClick={() => setShowStructuredInput(true)}
              className={cn(
                'px-2 py-1 text-xs font-mono border rounded',
                showStructuredInput
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-neutral-300 hover:border-black'
              )}
            >
              Structured
            </button>
          </div>

          {/* Ingredients List */}
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              className={cn(
                'relative bg-white border-2 border-black shadow-brutal transition-all duration-200',
                dragIndex === index && 'opacity-50 scale-95',
                dropIndex === index && 'border-blue-500 bg-blue-50'
              )}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="flex items-center gap-3 p-3">
                {/* Drag Handle */}
                <button
                  type="button"
                  className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-600 cursor-move"
                  disabled={disabled}
                >
                  <DragIcon className="w-4 h-4" />
                </button>

                {/* Ingredient Input */}
                <div className="flex-1">
                  {showStructuredInput ? (
                    <StructuredIngredientInput
                      value={ingredient}
                      onChange={(value) => handleIngredientChange(index, value)}
                      placeholder={placeholder}
                      disabled={disabled}
                      error={ingredientErrors[index]}
                    />
                  ) : (
                    <FormInput
                      value={ingredient}
                      onChange={(e) => handleIngredientChange(index, e.target.value)}
                      placeholder={placeholder}
                      maxLength={200}
                      disabled={disabled}
                      error={ingredientErrors[index]}
                      className="border-none shadow-none bg-transparent p-0 focus:shadow-none"
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 flex items-center gap-1">
                  {/* Move Up */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveUp(index)}
                    disabled={disabled || index === 0}
                    className="p-1 h-auto"
                  >
                    <ArrowUpIcon className="w-4 h-4" />
                  </Button>

                  {/* Move Down */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveDown(index)}
                    disabled={disabled || index === ingredients.length - 1}
                    className="p-1 h-auto"
                  >
                    <ArrowDownIcon className="w-4 h-4" />
                  </Button>

                  {/* Remove */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveIngredient(index)}
                    disabled={disabled || ingredients.length <= 1}
                    className="p-1 h-auto text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Ingredient Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddIngredient}
            disabled={disabled || ingredients.length >= maxIngredients}
            className="w-full font-mono"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Ingredient
          </Button>
        </div>
      </FormField>
    </div>
  )
}

// Structured ingredient input component
interface StructuredIngredientInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
}

function StructuredIngredientInput({
  value,
  onChange,
  placeholder,
  disabled,
  error,
}: StructuredIngredientInputProps) {
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState('')
  const [item, setItem] = useState('')
  const [notes, setNotes] = useState('')

  // Parse existing value into structured format
  React.useEffect(() => {
    if (value) {
      const parsed = parseIngredientString(value)
      setAmount(parsed.amount)
      setUnit(parsed.unit)
      setItem(parsed.item)
      setNotes(parsed.notes || '')
    }
  }, [value])

  // Update parent when structured values change
  React.useEffect(() => {
    const formatted = formatIngredientString({ amount, unit, item, notes })
    if (formatted !== value) {
      onChange(formatted)
    }
  }, [amount, unit, item, notes, onChange, value])

  const units = [
    { value: '', label: 'Select unit' },
    { value: 'cup', label: 'Cup' },
    { value: 'cups', label: 'Cups' },
    { value: 'tbsp', label: 'Tablespoon' },
    { value: 'tsp', label: 'Teaspoon' },
    { value: 'oz', label: 'Ounce' },
    { value: 'lb', label: 'Pound' },
    { value: 'g', label: 'Gram' },
    { value: 'kg', label: 'Kilogram' },
    { value: 'ml', label: 'Milliliter' },
    { value: 'l', label: 'Liter' },
    { value: 'piece', label: 'Piece' },
    { value: 'pieces', label: 'Pieces' },
    { value: 'slice', label: 'Slice' },
    { value: 'slices', label: 'Slices' },
    { value: 'clove', label: 'Clove' },
    { value: 'cloves', label: 'Cloves' },
    { value: 'pinch', label: 'Pinch' },
    { value: 'dash', label: 'Dash' },
    { value: 'to taste', label: 'To taste' },
  ]

  return (
    <div className="grid grid-cols-12 gap-2 items-start">
      <div className="col-span-2">
        <FormInput
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1"
          disabled={disabled}
          className="text-sm"
        />
      </div>
      
      <div className="col-span-3">
        <FormSelect
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          options={units}
          disabled={disabled}
          className="text-sm"
        />
      </div>
      
      <div className="col-span-5">
        <FormInput
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="ingredient name"
          disabled={disabled}
          className="text-sm"
        />
      </div>
      
      <div className="col-span-2">
        <FormInput
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="notes"
          disabled={disabled}
          className="text-sm"
        />
      </div>
    </div>
  )
}

// Bulk import ingredients component
interface BulkIngredientsImportProps {
  onImport: (ingredients: string[]) => void
  className?: string
  disabled?: boolean
}

export function BulkIngredientsImport({ 
  onImport, 
  className,
  disabled 
}: BulkIngredientsImportProps) {
  const [bulkText, setBulkText] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleImport = useCallback(() => {
    const lines = bulkText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[-•*]\s*/, '')) // Remove bullet points
      .slice(0, 50) // Limit to 50 ingredients

    if (lines.length > 0) {
      onImport(lines)
      setBulkText('')
      setIsOpen(false)
    }
  }, [bulkText, onImport])

  const handleCancel = useCallback(() => {
    setBulkText('')
    setIsOpen(false)
  }, [])

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className={cn('font-mono', className)}
      >
        <ImportIcon className="w-4 h-4 mr-2" />
        Import Ingredients
      </Button>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <FormField
        label="Bulk Import Ingredients"
        description="Paste ingredients, one per line. Bullet points will be automatically removed."
      >
        <textarea
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder="2 cups flour&#10;1 tsp salt&#10;3 eggs&#10;1/2 cup milk"
          rows={8}
          className="w-full px-3 py-2 font-mono text-sm bg-white border-2 border-black shadow-brutal focus:outline-none focus:shadow-brutal-sm"
        />
      </FormField>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={handleImport}
          disabled={!bulkText.trim()}
          className="font-mono"
        >
          Import {bulkText.split('\n').filter(line => line.trim()).length} Ingredients
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className="font-mono"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

// Helper functions
function parseIngredientString(ingredientString: string): Ingredient {
  // Simple parser - in a real app, this would be more sophisticated
  const parts = ingredientString.trim().split(' ')
  const amount = parts[0] || ''
  const unit = parts[1] || ''
  const item = parts.slice(2).join(' ')
  
  return {
    amount,
    unit,
    item,
    notes: '',
  }
}

function formatIngredientString(ingredient: Ingredient): string {
  const parts = [
    ingredient.amount,
    ingredient.unit,
    ingredient.item,
    ingredient.notes ? `(${ingredient.notes})` : ''
  ].filter(Boolean)
  
  return parts.join(' ').trim()
}

// Icon components
function DragIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
    </svg>
  )
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  )
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

function ImportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
  )
}