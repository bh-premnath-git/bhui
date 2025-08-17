import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GitBranch, GitCommit, Download, GitMerge, Trash2, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { 
  openCommitModal, 
  pullChanges, 
  fetchGitStatus,
  fetchCommitHistory,
  fetchChangedEntities, 
} from "@/store/slices/gitSlice";
import { useEffect } from "react";

export function GitControlsFooterPortal() {
  const mount = document.getElementById("git-footer-portal");
  if (!mount) return null;
  return createPortal(<GitControlsFooter />, mount);
}

function GitControlsFooter() {
  const dispatch = useAppDispatch();
  const {
    enabled,
    status,
    changedEntities,
    statusLoading,
    operationLoading,
  } = useAppSelector(state => state.git);

  // Fetch initial data when git is enabled
  useEffect(() => {
    if (enabled) {
      dispatch(fetchGitStatus());
      dispatch(fetchCommitHistory());
      dispatch(fetchChangedEntities());
    }
  }, [enabled, dispatch]);

  if (!enabled) return null;

  const newEntities = (changedEntities ?? []).filter(e => e.status === "New");
  const modifiedEntities = (changedEntities ?? []).filter(e => e.status === "Modified");
  const changedCount = newEntities.length + modifiedEntities.length;
  const uncommittedFiles = status?.uncommittedFiles ?? changedCount;
  const branch = status?.branch ?? "—";

  const handleCommit = () => {
    dispatch(openCommitModal());
  };

  const handlePull = () => {
    dispatch(pullChanges());
  };

  const handleCheckoutBranch = () => {
    // TODO: Implement branch checkout functionality
    console.log("Checkout branch clicked");
  };

  const handleSquashRebase = () => {
    // TODO: Implement squash and rebase functionality
    console.log("Squash and rebase clicked");
  };

  const handleDeleteBranch = () => {
    // TODO: Implement delete branch functionality
    console.log("Delete branch clicked");
  };

  return (
    <div className="border-t backdrop-enhanced">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Branch & actions */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 focus-enhanced font-mono">
                <GitBranch className="h-4 w-4 text-git-primary" />
                <span className="text-git-primary font-semibold">
                  {statusLoading ? "Loading..." : branch}
                </span>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 backdrop-enhanced">
              <DropdownMenuItem 
                className="gap-2 focus-enhanced" 
                onClick={handleCommit}
                disabled={changedCount === 0 || operationLoading}
              >
                <GitCommit className="h-4 w-4 text-git-primary" />
                Commit Changes
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 focus-enhanced"
                onClick={handleCheckoutBranch}
                disabled={operationLoading}
              >
                <GitBranch className="h-4 w-4" />
                Checkout Branch
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 focus-enhanced" 
                onClick={handlePull}
                disabled={operationLoading}
              >
                <Download className="h-4 w-4" />
                {operationLoading ? "Pulling..." : "Pull from Origin"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 focus-enhanced"
                onClick={handleSquashRebase}
                disabled={operationLoading}
              >
                <GitMerge className="h-4 w-4" />
                Squash and Rebase
                <ChevronRight className="h-3 w-3 ml-auto" />
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 text-destructive focus-enhanced"
                onClick={handleDeleteBranch}
                disabled={operationLoading}
              >
                <Trash2 className="h-4 w-4" />
                Delete Branch
                <ChevronRight className="h-3 w-3 ml-auto" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="text-sm text-muted-foreground font-mono">
            {operationLoading ? "Syncing..." : "Ready to commit • Last sync 2m ago"}
          </div>
        </div>

        {/* Right: Commit changes */}
        <Button 
          onClick={handleCommit} 
          className="btn-git-primary gap-2 font-semibold"
          disabled={changedCount === 0 || operationLoading}
        >
          <GitCommit className="h-4 w-4" />
          {operationLoading ? "Processing..." : `Commit Changes (${uncommittedFiles} files)`}
        </Button>
      </div>
    </div>
  );
}