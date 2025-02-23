import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSQLQuery } from "@/hooks/useSQLQuery";
import { PanelLayout } from "./shared/PanelLayout";
import { Copy, PlayCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function SQLViewer() {
  const { query, setQuery, executeQuery, defaultQuery } = useSQLQuery();

  const handleCopyQuery = async () => {
    await navigator.clipboard.writeText(query);
    toast.success("Query copied to clipboard");
  };

  const handleReset = () => {
    setQuery(defaultQuery);
    toast.info("Query reset to default");
  };

  return (
    <PanelLayout>
      <Textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="font-mono flex-1 resize-none"
      />
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline"
          onClick={handleCopyQuery}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
        <Button 
          variant="outline"
          onClick={handleReset}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button 
          onClick={executeQuery}
          className="bg-black text-white border hover:bg-gray-200"
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          Run
        </Button>
      </div>
    </PanelLayout>
  );
}