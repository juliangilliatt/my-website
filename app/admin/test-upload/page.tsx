'use client'

import { useState } from 'react'
import { ImageUpload } from '@/components/admin/ImageUpload'

export default function TestUploadPage() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [uploadStatus, setUploadStatus] = useState<string>('')

  const handleImageChange = (url: string) => {
    console.log('Image changed:', url)
    setImageUrl(url)
    setUploadStatus('Image uploaded successfully!')
  }

  const handleError = (error: string) => {
    console.error('Upload error:', error)
    setUploadStatus(`Error: ${error}`)
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Image Upload</h1>
      
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Upload functionality is {process.env.NEXT_PUBLIC_ENABLE_FILE_UPLOADS === 'true' ? 'enabled' : 'disabled'}.
          </p>
        </div>

        <ImageUpload
          value={imageUrl}
          onChange={handleImageChange}
          onError={handleError}
          label="Test Image"
          showAltText={true}
          showCaption={true}
        />
        
        <div className="mt-4">
          <label className="block">
            <span className="text-sm font-medium">Basic File Input Test:</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  console.log('File selected:', file.name, file.type, file.size)
                  setUploadStatus(`Selected: ${file.name}`)
                }
              }}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </label>
        </div>

        {uploadStatus && (
          <div className={`p-4 rounded ${uploadStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {uploadStatus}
          </div>
        )}

        {imageUrl && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Uploaded Image URL:</h2>
            <code className="block p-2 bg-gray-100 rounded text-sm break-all">{imageUrl}</code>
          </div>
        )}
      </div>
    </div>
  )
}