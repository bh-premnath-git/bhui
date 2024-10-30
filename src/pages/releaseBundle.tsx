import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"

export default function Component() {
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <Card className="p-4 border-2 border-gray-300">
        <div className="space-y-6">
          {/* Step 1 */}
          <div>
            <h2 className="text-sm text-gray-400 mb-4">STEP 1</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-900 mb-2">Bundle Name</label>
                <div className="relative">
                  <Input 
                    defaultValue="Release 2024.15"
                    className="border-2 border-gray-300 pr-10"
                  />
                  <AlertTriangle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500" />
                </div>
              </div>

              <div>
                <label className="block text-gray-900 mb-2">Target Environment</label>
                <div className="relative">
                  <Select defaultValue="staging">
                    <SelectTrigger className="w-full border-2 border-gray-300">
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dev">Dev</SelectItem>
                      <SelectItem value="qa">QA</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                    </SelectContent>
                  </Select>
                  <AlertTriangle className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500" />
                </div>
              </div>

              <Button 
                className="w-full bg-blue-100 text-blue-600 hover:bg-blue-200 border-2 border-blue-200"
              >
                Stage
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-200" />

          {/* Step 2 */}
          <div>
            <h2 className="text-sm text-gray-400 mb-4">STEP 2</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-900 mb-2">List of flows to be deployed</label>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Flow 1 - Version1</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span>Flow 2 - Version1</span>
                    </div>
                    <p className="text-sm text-red-500 ml-7">
                      this connection is not available in staging environment
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline"
                className="w-full border-2 border-gray-300 hover:bg-gray-50"
              >
                Release version
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}