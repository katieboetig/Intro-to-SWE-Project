import { useState } from "react"
import { Home, BookOpen, FileText, LogOut } from "lucide-react"
import { useAuth } from "../auth/AuthContext"
import Fridge3D from "../components/Fridge3D"
import SidePanel from "../components/SidePanel"


const mockIngredients = [
  {
    id: 1,
    name: "Tomato",
    icon: "🍅",
    nutrition: {
      calories: "18 kcal",
      protein: "0.9g",
      carbs: "3.9g",
      fat: "0.2g",
      fiber: "1.2g",
    },
    description: "Fresh, ripe tomatoes packed with vitamins and antioxidants.",
  },
  {
    id: 2,
    name: "Broccoli",
    icon: "🥦",
    nutrition: {
      calories: "34 kcal",
      protein: "2.8g",
      carbs: "7g",
      fat: "0.4g",
      fiber: "2.6g",
    },
    description: "Nutrient-rich green vegetable high in vitamins C and K.",
  },
  {
    id: 3,
    name: "Carrot",
    icon: "🥕",
    nutrition: {
      calories: "41 kcal",
      protein: "0.9g",
      carbs: "10g",
      fat: "0.2g",
      fiber: "2.8g",
    },
    description: "Crunchy root vegetable rich in beta-carotene.",
  },
  {
    id: 4,
    name: "Cheese",
    icon: "🧀",
    nutrition: {
      calories: "402 kcal",
      protein: "25g",
      carbs: "1.3g",
      fat: "33g",
      fiber: "0g",
    },
    description: "Delicious dairy product high in calcium and protein.",
  },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [ingredients, setIngredients] = useState(mockIngredients)
  const [selectedIngredient, setSelectedIngredient] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("home")

  const handleIngredientClick = (ingredient) => {
    setSelectedIngredient(ingredient)
    setIsPanelOpen(true)
  }

  const handleUpload = () => {
    // Implement your upload logic here
    console.log("Upload clicked")
    alert("Upload functionality - integrate with your file upload system")
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
              Welcome, {user?.displayName || "User"}!
            </h1>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === "home"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </button>

            <button
              onClick={() => setActiveTab("recipes")}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === "recipes"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Recipes</span>
            </button>

            <button
              onClick={() => setActiveTab("blog")}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === "blog"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Blog</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-4 border-b-2 border-transparent text-gray-600 hover:text-red-600 hover:border-red-300 transition-colors ml-auto"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === "home" && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">Your Smart Fridge</h2>
              <p className="text-gray-600">Click the fridge to view your ingredients</p>
            </div>

            {/* Fridge Container with Subtle Background */}
            <div className="relative">
              {/* Subtle radial gradient background */}
              <div className="absolute inset-0 bg-gradient-radial from-green-50/30 via-transparent to-orange-50/20 rounded-3xl transform scale-110 -z-10"></div>
              <div className="relative bg-gradient-to-br from-white/80 via-gray-50/60 to-white/90 rounded-2xl p-8 shadow-sm border border-gray-100/50">
                <Fridge3D ingredients={ingredients} onIngredientClick={handleIngredientClick} onUpload={handleUpload} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "recipes" && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recipes</h2>
            <p className="text-gray-600">Recipe content coming soon...</p>
          </div>
        )}

        {activeTab === "blog" && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog</h2>
            <p className="text-gray-600">Blog content coming soon...</p>
          </div>
        )}
      </main>

      {/* Side Panel */}
      <SidePanel ingredient={selectedIngredient} isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
    </div>
  )
}
