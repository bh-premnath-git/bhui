import { Button } from "@/components/ui/button";
import { PanelLayout } from "@/components/shared/SharedPanel";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { SqlSyntaxHighlighter } from "./sql-syntax-highlighter";

interface SqlCodeBlockProps {
  sql: string;
}

export function SqlCodeBlock({ sql }: SqlCodeBlockProps) {
  const handleCopyQuery = async () => {
    await navigator.clipboard.writeText(sql);
    toast.success("Query copied to clipboard");
  };

  return (
    <PanelLayout>
      <SqlSyntaxHighlighter 
        code={sql}
        className="text-sm overflow-x-auto"
      />
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={handleCopyQuery}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
      </div>
    </PanelLayout>
  );
}
