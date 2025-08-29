import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, GitBranch, ArrowDown, Clock, AlertTriangle, Circle, FileText, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { 
  closeCommitModal, 
  setCommitMessage, 
  commitChanges 
} from "@/store/slices/gitSlice";

export function CommitModal() {
  const dispatch = useAppDispatch();
  const {
    isCommitModalOpen,
    commitMessage,
    status,
    commitHistory,
    changedEntities,
    operationLoading,
  } = useAppSelector(state => state.git);

  const [showCodeChanges, setShowCodeChanges] = useState(true);

  if (!isCommitModalOpen) return null;

  const newEntities = (changedEntities ?? []).filter(e => e.status === "New");
  const modifiedEntities = (changedEntities ?? []).filter(e => e.status === "Modified");
  const changedCount = newEntities.length + modifiedEntities.length;

  const handleCommit = () => {
    if (commitMessage.trim()) {
      dispatch(commitChanges(commitMessage));
    }
  };

  const handleCloseModal = () => {
    dispatch(closeCommitModal());
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setCommitMessage(e.target.value));
  };

  const modal = (
    <div className="fixed inset-0 flex" style={{zIndex:999999}}>
      <div className="absolute inset-0 " onClick={handleCloseModal} />

      <div className="ml-auto w-[85%] bg-card border-l shadow-2xl flex flex-col backdrop-enhanced">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleCloseModal} className="focus-enhanced">
              <X className="h-4 w-4" />
            </Button>

            {/* Workflow steps */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-git-primary">1. Commit</span>
                <div className="h-0.5 w-8 bg-git-primary rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">2. Pull</span>
                <div className="h-0.5 w-8 bg-muted rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">3. Merge</span>
                <div className="h-0.5 w-8 bg-muted rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">4. Release and Deploy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Left - Commit History */}
          <div className="w-1/2 border-r flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-3">
                <Circle className="h-2 w-2 fill-git-primary text-git-primary" />
                <span className="text-sm text-muted-foreground">Current branch</span>
              </div>
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-git-primary" />
                <span className="font-semibold font-mono text-git-primary">{status?.branch ?? "—"}</span>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="p-4">
                <div className="space-y-1 mb-4">
                  <div className="grid grid-cols-[auto,1fr,auto] gap-4 text-sm font-medium text-muted-foreground">
                    <span>User</span>
                    <span>Message</span>
                    <span>Created</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {(commitHistory ?? []).map((c, index) => (
                    <div key={index} className="grid grid-cols-[auto,1fr,auto] gap-4 p-3 hover:bg-muted/30 rounded-lg text-sm transition-colors">
                      <div className="w-8 text-center font-mono font-semibold text-git-primary">{c.user}</div>
                      <div className="text-foreground font-medium truncate">{c.message}</div>
                      <div className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {c.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right - Changed Entities */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-git-secondary" />
                  <span className="font-semibold">
                    {changedCount} Entities Changed
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={showCodeChanges} onCheckedChange={setShowCodeChanges} />
                    <span className="text-sm">Code changes</span>
                  </div>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive-foreground hover:bg-destructive">
                    Reset
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-[1fr,auto] gap-4 text-sm font-medium text-muted-foreground">
                <span>Entity</span>
                <span>Status</span>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-2">
                {(changedEntities ?? []).map((entity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      {entity.type === "Pipeline" ? (
                        <Folder className="h-4 w-4 text-git-primary" />
                      ) : entity.type === "Report" ? (
                        <FileText className="h-4 w-4 text-git-secondary" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{entity.name}</span>
                          {entity.hasWarning && <AlertTriangle className="h-3 w-3 text-git-secondary" />}
                        </div>
                        <span className="text-xs text-muted-foreground">{entity.type}</span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        entity.status === "New" ? "default" :
                        entity.status === "Modified" ? "secondary" : "outline"
                      }
                      className={cn(
                        entity.status === "New" && "bg-git-primary/20 text-git-primary border-git-primary/30 hover:bg-git-primary/30",
                        entity.status === "Modified" && "bg-git-secondary/20 text-git-secondary border-git-secondary/30 hover:bg-git-secondary/30",
                      )}
                    >
                      {entity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Commit message */}
        <div className="border-t p-4 bg-muted/20">
          <div className="mb-3">
            <label className="text-sm font-semibold">Commit Message</label>
          </div>
          <Textarea
            value={commitMessage}
            onChange={handleMessageChange}
            className="mb-3 min-h-[90px] focus-enhanced font-mono text-sm"
            placeholder="Enter a detailed commit message..."
            disabled={operationLoading}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-git-secondary" />
              <span className="text-sm text-git-secondary font-semibold">
                {changedEntities?.filter(e => e.hasWarning).length || 0} warnings
              </span>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCloseModal} 
                className="focus-enhanced"
                disabled={operationLoading}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                className="btn-git-primary focus-enhanced font-semibold" 
                onClick={handleCommit}
                disabled={operationLoading || !commitMessage.trim()}
              >
                {operationLoading ? "Committing..." : "Commit Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const mount = document.getElementById("git-footer-portal") || document.body;
  return createPortal(modal, mount);
}