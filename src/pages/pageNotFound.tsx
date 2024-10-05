import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Cpu, Home, RotateCcw } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-gradient-to-r from-black to-gray-900 text-white p-4">
      <div className="text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Cpu className="w-64 h-64 animate-pulse" />
          </div>
          <h1 className="text-6xl font-bold tracking-tighter sm:text-7xl">
            4<span className="text-blue-500">0</span>4
          </h1>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">AI Malfunction Detected</h2>
        <p className="max-w-md mx-auto text-gray-400">
          Our AI couldn't compute the page you're looking for. It seems to have slipped into a parallel universe.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild variant="outline" className="bg-transparent text-white hover:bg-white/10">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
          <Button
            variant="outline"
            className="bg-transparent text-white hover:bg-white/10"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Recalibrate AI
          </Button>
        </div>
      </div>
      <div className="mt-16 text-sm text-gray-500">
        <p>Error Code: QUANTUM_ENTANGLEMENT_404</p>
      </div>
    </div>
  )
}