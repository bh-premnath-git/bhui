import { DataSource } from "@/types/data-catalog.types";
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Settings, Pencil, Link2, Users, Tags, Wrench } from "lucide-react"

interface DataCatalogSchemaProps {
  data: DataSource | null;
}
interface SchemaField {
    field: string
    description: string
    tags: string[]
  }
  
  const schemaFields: SchemaField[] = [
    { field: "id", description: "Availability of User Details", tags: ["User Details"] },
    { field: "name", description: "Availability of User Details", tags: ["User Details"] },
    { field: "age", description: "Availability of User Details", tags: ["User Details"] },
    { field: "city", description: "Availability of User Details", tags: ["User Details"] },
    { field: "address", description: "Availability of User Details", tags: ["User Details"] },
    { field: "state", description: "Availability of User Details", tags: ["User Details"] },
    { field: "zip", description: "Availability of User Details", tags: ["User Details"] },
  ]

const DataCatalogSchema = ({ data }: DataCatalogSchemaProps) => {
    return (
        <div className="border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold p-6 pb-2 border-b">Schema</h2>
          <div className="flex gap-6 p-6">
            <div className="flex-1 pr-6 border-r border-gray-200">
              <div className="mb-4">
                <Input type="search" placeholder="Search" className="max-w-sm" />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        Description
                        <Wrench className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[200px]">Tags</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schemaFields.map((field) => (
                    <TableRow key={field.field}>
                      <TableCell className="font-medium">{field.field}</TableCell>
                      <TableCell>{field.description}</TableCell>
                      <TableCell>
                        {field.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="mr-1">
                            {tag}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="w-[300px] space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-semibold">About</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Person statistics</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-semibold">Links</CardTitle>
                  <Button variant="ghost" size="icon">
                    <Link2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">No links added yet.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-semibold">Owners</CardTitle>
                  <Button variant="ghost" size="icon">
                    <Users className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">No owners have been added.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-semibold">Tags</CardTitle>
                  <Button variant="ghost" size="icon">
                    <Tags className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">No tags have been added.</p>
                </CardContent>
              </Card>
              <div className="text-sm text-muted-foreground">Last Updated On: 2/6/2025, 7:26:16 AM</div>
            </div>
          </div>
        </div>
      )
    }
    
export default DataCatalogSchema