import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";
import SchemaTable from "./SchemaTable";
import OnboardTaggingStep from "./OnboardTaggingStep";
import PreviewTable from "./PreviewTable";
import { ReaderOptionsForm } from "./ReaderOptionsForm";
import { ApiService } from "@/services/apiServices";
import { CATALOG_API_PORT } from "@/services/environment";

interface OrderPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  source: any;
  nodeId: string;
  onSourceUpdate: (updatedData: any) => void;
}

export default function OrderPopUp({
  isOpen,
  onClose,
  source,
  nodeId,
  onSourceUpdate,
}: OrderPopUpProps) {
  const [selectedTab, setSelectedTab] = useState<string>("reader-options");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  // Fetch schema
  useEffect(() => {
    const fetchSchema = async () => {
      if (source?.connection_config_id) {
        try {
          const params = {
            id: source?.connection_config_id,
            offset: 0,
            limit: 10,
            order_desc: false,
          };
          const response = await ApiService(
            CATALOG_API_PORT,
            "get",
            "/connection_registry/connection_config/list/",
            null,
            params,
            { accept: "application/json" }
          );
          if (response && response.length > 0) {
            let data = response[0]?.custom_metadata;
            data.sourceId = source?.data_src_id;
            data.connectionConfigId = source?.connection_config_id;
            setInitialData(data);
          }
        } catch (error) {
          console.error("Error fetching schema:", error);
        }
      } else {
        // If there’s no connection_config_id but there is a data_src_id
        if (source?.data_src_id) {
          setInitialData({ sourceId: source?.data_src_id });
        }
      }
    };
    fetchSchema();
  }, [source]);

  return (
    <Dialog
      open={isOpen}
      // When Dialog is closed, call onClose. 
      // If you want to only close when user clicks outside or hits X,
      // you'd do something like: onOpenChange={(open) => !open && onClose()}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="flex flex-col max-w-[1000px] max-h-[800px] overflow-auto">
        {/* Header */}
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="font-bold">Orders</DialogTitle>
          <X className="cursor-pointer" onClick={onClose} />
        </DialogHeader>

        {/* Tabs Section */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-2">
          <TabsList>
            <TabsTrigger value="reader-options">Reader Options</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="tag">Tag</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Optional Popover (Help/Support, etc.) */}
          <div className="ml-auto">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="ml-2">
                  Need help?
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-80">
                <div className="flex flex-col">
                  <div className="bg-gradient-to-r from-violet-500 via-blue-500 to-pink-300 text-white p-4">
                    <p>How Can I Help You Today?</p>
                  </div>
                  <div className="m-4 relative">
                    <Input
                      autoFocus
                      type="search"
                      placeholder="Search By Keywords"
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Tab Contents */}
          <TabsContent value="reader-options" className="mt-4">
            <ReaderOptionsForm
              onSubmit={() => {}}
              onClose={onClose}
              initialData={initialData}
              nodeId={nodeId}
              onSourceUpdate={onSourceUpdate}
            />
          </TabsContent>

          <TabsContent value="schema" className="mt-4">
            <SchemaTable initialData={initialData} />
          </TabsContent>

          <TabsContent value="tag" className="mt-4">
            <OnboardTaggingStep />
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <PreviewTable />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
