import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, X } from "lucide-react"

export default function ProjectCreationComponent() {
  const [tags, setTags] = useState<string[]>([])
  const [selectedProvider, setSelectedProvider] = useState("github")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tagKey, setTagKey] = useState("")
  const [tagValue, setTagValue] = useState("")

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const addTag = () => {
    if (tagKey && tagValue) {
      setTags([...tags, `${tagKey} >> ${tagValue}`])
      setTagKey("")
      setTagValue("")
      setIsModalOpen(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1 w-1/2">
          <Label htmlFor="projectName">Project Name</Label>
          <Input 
            id="projectName" 
            placeholder="Project Name" 
            className="h-9 w-1/2"
          />
        </div>
        <Button variant="outline" className="mt-1">View All Projects</Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="githubProvider">Git Provider</Label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-full">
                <SelectValue className="whitespace-nowrap overflow-hidden text-ellipsis">
                  {selectedProvider}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="github">Github</SelectItem>
                <SelectItem value="gitlab">GitLab</SelectItem>
                <SelectItem value="bitbucket">Bitbucket</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="githubUsername">Git Username</Label>
            <Input id="githubUsername" placeholder="Github Name 1" />
          </div>
          <div>
            <Label htmlFor="githubEmail">Git Email</Label>
            <Input id="githubEmail" placeholder="abc@github.com" />
          </div>
          <div>
            <Label htmlFor="defaultBranch">Default Branch</Label>
            <Input id="defaultBranch" placeholder="<Main>" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="repositoryUrl">Git Repository URL</Label>
            <Input id="repositoryUrl" placeholder="Https://Github.Com/Lorem_ipsum" />
          </div>
          <div>
            <Label htmlFor="githubToken">Git Token</Label>
            <Input id="githubToken" type="password" placeholder="********" />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            className="text-[#70e5e8] hover:underline hover:underline-offset-4 cursor-pointer bg-transparent border-none p-0 font-semibold transition-all duration-200"
            onClick={() => {
              console.log("Validating Github Credentials")
            }}
          >
            Validate Github Credentials
          </button>
        </div>

        <div>
          <Label>Add Tags</Label>
          <p className="text-sm text-gray-500 mb-2">
            Add one or more tags to easily identify compute instances created by bighammer.ai in your AWS account (Eg : Key : Product, Value : Bighammer.ai)
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="px-2 py-1">
                {tag}
                <Button variant="ghost" size="sm" className="ml-2 h-4 w-4 p-0" onClick={() => removeTag(tag)}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center text-emerald-500 hover:text-emerald-600 transition-colors duration-200">
                <PlusCircle className="mr-2 h-4 w-4" />
                ADD TAG
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Tag</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tagKey" className="text-right">
                    Key
                  </Label>
                  <Input
                    id="tagKey"
                    value={tagKey}
                    onChange={(e) => setTagKey(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tagValue" className="text-right">
                    Value
                  </Label>
                  <Input
                    id="tagValue"
                    value={tagValue}
                    onChange={(e) => setTagValue(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <Button onClick={addTag} className="w-1/3">Add Tag</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex justify-center">
        <Button className="w-1/3 bg-gray-900 text-white hover:bg-gray-800">Create Project</Button>
      </div>
    </div>
  )
}