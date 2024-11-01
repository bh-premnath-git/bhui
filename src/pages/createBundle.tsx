import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useState } from "react"

export default function Component() {
  const [flows, setFlows] = useState([1])

  const addFlow = () => {
    setFlows([...flows, flows.length + 1])
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <Card className="p-4 border-2 border-gray-300">
        <h1 className="text-sm font-normal text-gray-900 mb-6">Create Release Bundle</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-900 mb-2">Bundle Name</label>
            <Input 
              placeholder="Release 2024.15" 
              className="border-2 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-gray-900 mb-2">Description</label>
            <Textarea 
              placeholder="description about release" 
              className="border-2 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-gray-900 mb-2">Select flows to deployed</label>
            {flows.map((flow) => (
              <div key={flow} className="flex gap-2 mb-2">
                <Input 
                  placeholder="Flow name : Version" 
                  className="border-2 border-gray-300"
                />
                {flow === flows.length && (
                  <Button 
                    onClick={addFlow}
                    variant="outline" 
                    size="icon"
                    className="border-2 border-gray-300"
                  >
                    <Plus className="h-4 w-4 text-gray-900" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button 
            className="w-full mt-6 bg-black text-white hover:bg-gray-800"
          >
            Create Deployment Bundle
          </Button>
        </div>
      </Card>
    </div>
  )
}