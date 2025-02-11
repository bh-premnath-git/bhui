import * as React from "react";
import { useEffect } from "react";
import { DataTable } from "@/components/bh-table/data-table"
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2 } from "lucide-react";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { ApiService } from "@/services/api.services";
import { CATALOG_API_PORT } from "@/services/environment";

interface SchemaTableProps {
  initialData: any;
}

export default function SchemaTable({ initialData }: SchemaTableProps) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [selectedDataType, setSelectedDataType] = React.useState("");
  const [tableData, setTableData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await ApiService({
          portNumber: CATALOG_API_PORT,
          method: "get",
          url: `/data_source_layout/list_full/`,
          params: { data_src_id: initialData?.sourceId }
        });
        if (response[0]?.layout_fields) {
          const transformedData = response[0].layout_fields.map((field: any) => ({
            name: field.lyt_fld_name,
            datatype: field.lyt_fld_data_type_cd,
            primarykey: field.lyt_fld_is_pk,
            optional: true,
            description: field.lyt_fld_desc,
            tags: field.lyt_fld_tags,
            actions: "",
          }));
          setTableData(transformedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle error state here if needed
      } finally {
        setIsLoading(false);
      }
    };

    if (initialData?.sourceId) {
      fetchData();
    }
  }, [initialData?.sourceId]);

  // Data type options for the select dropdown
  const dataTypeOptions = [
    { value: "", label: "Timestamp" },
    { value: "array", label: "Array" },
    { value: "binary", label: "Binary" },
    { value: "boolean", label: "Boolean" },
    { value: "byte", label: "Byte" },
    { value: "date", label: "Date" },
    { value: "int", label: "Integer" },
    { value: "double", label: "Double" },
  ];

  // Column definitions
  const columns: any[] = [
    {
      key: "name",
      header: "Field Name",
      type: "text",
    },
    {
      key: "datatype",
      header: "Data Type",
      type: "text",
      render: () => (
        <Select
          value={selectedDataType}
          onValueChange={(value) => setSelectedDataType(value)}
        >
          <SelectTrigger className="min-w-[150px] bg-white h-[28px] text-sm">
            <SelectValue placeholder="Select Data Type" />
          </SelectTrigger>
          <SelectContent>
            {dataTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "primarykey",
      header: "Primary Key",
      type: "text",
      render: () => (
        <Checkbox
          checked={true} // or maintain state if you want dynamic
          onCheckedChange={() => {}}
          className="h-4 w-4"
        />
      ),
    },
    {
      key: "optional",
      header: "Optional",
      type: "text",
      render: () => (
        <Checkbox
          checked={true} // or maintain state if you want dynamic
          onCheckedChange={() => {}}
          className="h-4 w-4"
        />
      ),
    },
    {
      key: "description",
      header: "Description",
      type: "text",
      render: (value: any) => (
        <button
          onClick={() => setOpenDialog(true)}
          className="text-blue-500 hover:text-blue-700"
        >
          {value || "Add"}
        </button>
      ),
    },
    {
      key: "tags",
      header: "Tags",
      type: "text",
      render: (value: any) =>
        value && (
          <div className="flex items-center gap-2">
            <span className="bg-gray-100 px-2 py-1 rounded-md text-sm flex items-center">
              Infer Schema from Data
              <X className="ml-1 h-4 w-4 cursor-pointer" />
            </span>
          </div>
        ),
    },
    {
      key: "actions",
      header: "",
      type: "text",
      render: () => (
        <MdOutlineDeleteSweep className="text-red-500 text-xl cursor-pointer hover:text-red-700" />
      ),
    },
  ];

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
        </div>
      ) : (
        <>
          <DataTable
            data={tableData}
            columns={columns}
            showToolbar={false}
          />

          {/* Checkboxes Section */}
          <div className="space-y-1 bg-gray-50 p-2 rounded-lg mt-2">
            {[
              "Eliminate Duplicate Records",
              "Trim All Columns",
              "Eliminate Records without Primary Key",
            ].map((text) => (
              <div key={text} className="flex items-center gap-1">
                <Checkbox
                  checked={true} // or manage state as needed
                  onCheckedChange={() => {}}
                  className="h-4 w-4"
                  disabled
                />
                <Label className="text-gray-500 font-light text-sm">{text}</Label>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mt-4">
            <Button variant="outline" className="px-6 py-1.5 text-sm">
              Close
            </Button>
            <Button className="px-6 py-1.5 text-sm">Save</Button>
          </div>
        </>
      )}

      {/* Description Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-sm w-full p-4">
          <DialogHeader className="flex justify-between">
            <DialogTitle className="text-lg font-bold">Add Description</DialogTitle>
            <X
              className="cursor-pointer hover:text-gray-700"
              onClick={() => setOpenDialog(false)}
            />
          </DialogHeader>

          {/* Multiline description field */}
          <Textarea
            rows={4}
            placeholder="Enter Description Here"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="mt-2"
          />

          <DialogFooter className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                console.log("Saved:", inputValue);
                setOpenDialog(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
