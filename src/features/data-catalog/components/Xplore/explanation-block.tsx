import { Button } from "@/components/ui/button";
import { PanelLayout } from "@/components/shared/SharedPanel";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface ExplanationBlockProps {
  content: string;
}

export function ExplanationBlock({ content }: ExplanationBlockProps) {
  const handleCopyExplanation = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Explanation copied to clipboard");
  };

  return (
    <PanelLayout>
      <div className="prose prose-neutral dark:prose-invert">
        <p className="whitespace-pre-wrap mb-0 text-muted-foreground">{content}</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={handleCopyExplanation}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
      </div>
    </PanelLayout>
  );
}
