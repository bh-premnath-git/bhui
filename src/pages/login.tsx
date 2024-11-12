
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { AlertCircle, ChevronRight } from "lucide-react"

export default function Component() {
	const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full relative">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-4 -top-4 w-24 h-24 bg-gray-100 rounded-full"></div>
          <div className="absolute right-10 top-10 w-16 h-16 bg-gray-100 transform rotate-45"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gray-100 rounded-full"></div>
        </div>
        
        <div className="relative z-10 bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-20 h-20 mx-auto mb-6 text-gray-800" />
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Login Redirect Issue</h1>
          <p className="text-xl text-gray-700 mb-8">
            We encountered a problem with the Keycloak login
          </p>
          <Button className="bg-black text-white hover:bg-gray-800 transition-colors duration-300 text-lg px-6 py-3 rounded-full" onClick={() => navigate("/") }>
            Return to Home
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
        
        {/* Futuristic lines */}
        <div className="absolute left-0 right-0 bottom-0 h-1 bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200"></div>
        <div className="absolute left-0 top-1/2 bottom-0 w-1 bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200"></div>
        <div className="absolute right-0 top-0 bottom-1/2 w-1 bg-gradient-to-t from-gray-200 via-gray-400 to-gray-200"></div>
      </div>
    </div>
  )
}