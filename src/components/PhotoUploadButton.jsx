import { useState } from "react"
import { Camera, Image, X } from "lucide-react"
import { compressAndConvertToPNG } from "../utils/imageUtils"

export default function PhotoUploadButton({ onIngredientsUpdate }) {
  const [showModal, setShowModal] = useState(false)
  const [processing, setProcessing] = useState(false)

  const processImage = async (file) => {
    try {
      setProcessing(true)
      console.log('Original file:', file.name, `${(file.size / 1024 / 1024).toFixed(2)} MB`)
      
      // Compress and convert to PNG
      const compressedPNG = await compressAndConvertToPNG(file)
      
      console.log('Compressed PNG:', compressedPNG.name, `${(compressedPNG.size / 1024 / 1024).toFixed(2)} MB`)
      console.log('Compression ratio:', `${((1 - compressedPNG.size / file.size) * 100).toFixed(1)}% smaller`)
      
      // Convert to base64 data URL for n8n
      const reader = new FileReader()
      const base64DataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(compressedPNG)
      })
      
      // Upload to n8n webhook with expected format
      console.log('Uploading to n8n webhook...')
      const response = await fetch('https://jack-ferreri.app.n8n.cloud/webhook/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64DataUrl,
          filename: compressedPNG.name
        })
      })
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('n8n response:', result)
      
      // Extract ingredients from webhook response
      // Response format: { ingredients: [...] }
      if (result && result.ingredients && result.ingredients.length > 0) {
        const ingredients = result.ingredients
        console.log(`Found ${ingredients.length} ingredients:`, ingredients)
        
        // Update the fridge with real data
        if (onIngredientsUpdate) {
          onIngredientsUpdate(ingredients)
        }
      } else {
        console.log('Image uploaded but no ingredients found.')
      }
      
    } catch (error) {
      console.error('Error processing image:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleTakePhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' // Opens camera on mobile
    
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (file) {
        await processImage(file)
      }
    }
    
    input.click()
    setShowModal(false)
  }

  const handleChoosePhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (file) {
        await processImage(file)
      }
    }
    
    input.click()
    setShowModal(false)
  }

  return (
    <>
      {/* Rectangular Button at Bottom Center */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setShowModal(true)}
          disabled={processing}
          className={`bg-green-500 hover:bg-green-600 text-white rounded-xl px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-3 font-medium ${
            processing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Camera className="w-5 h-5" />
          {processing ? 'Processing...' : 'Add Ingredients Photo'}
        </button>
      </div>

      {/* Photo Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add Ingredients Photo</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <p className="text-gray-600 text-sm">
              Choose how you'd like to add your ingredients photo
            </p>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleTakePhoto}
                className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6 py-4 transition-all duration-200 hover:scale-105 font-medium shadow-md"
              >
                <Camera className="w-5 h-5" />
                Take Photo
              </button>

              <button
                onClick={handleChoosePhoto}
                className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-4 transition-all duration-200 hover:scale-105 font-medium shadow-md"
              >
                <Image className="w-5 h-5" />
                Choose from Photos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

