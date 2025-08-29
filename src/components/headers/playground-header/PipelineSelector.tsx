import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Edit, 
  ChevronDown, 
  PlusCircle, 
  Search, 
  Star, 
  Clock, 
  Workflow,
  Check,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { setSelectedPipeline } from '@/store/slices/designer/pipelineSlice';
import { setSelectedEngineType } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { setIsRightAsideComponent } from '@/store/slices/chat/chatSlice';
import CreatePipelineDialog from '@/features/designers/pipeline/components/CreatePipelineDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { useDeletePipeline } from '@/hooks/useDeletePipeline';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';

interface Pipeline {
  pipeline_id: number;
  pipeline_name: string;
  pipeline_key: string;
  bh_project_id: number;
  notes: string;
  tags: Record<string, any>;
  pipeline_type: string;
  engine_type: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
  bh_project_name: string;
  pipeline_json: Record<string, any>;
  pipeline_parameters: any[];
}

interface PipelineSelectorProps {
  initialName: string;
  onSave: (newName: string) => Promise<void>;
  placeholder?: string;
  className?: string;
}

export const PipelineSelector: React.FC<PipelineSelectorProps> = ({
  initialName,
  onSave,
  placeholder = 'Select pipeline...',
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(initialName);
  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pipelineToDelete, setPipelineToDelete] = useState<Pipeline | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const deletePipelineMutation = useDeletePipeline();
  const { pipelines, setPipelines } = usePipelineContext();

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoritePipelines');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('favoritePipelines', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch pipeline list
  const fetchPipelineList = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: any = await apiService.get({
        baseUrl: CATALOG_REMOTE_API_URL,
        method: 'GET',
        url: `/pipeline/list/`,
        usePrefix: true,
        params: { limit: 1000, order_desc: true }
      });

      if (response) {
        setPipelines(response);
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setPipelines]);

  useEffect(() => {
    setTempName(initialName);
    // Always fetch pipeline list when initialName changes or on mount
    fetchPipelineList()
  }, [initialName, fetchPipelineList]);

  // Set initial pipeline name when pipelines are loaded and we have a current pipeline ID
  useEffect(() => {
    if (pipelines.length > 0 && id) {
      const currentPipeline = pipelines.find(p => p.pipeline_id.toString() === id);
      if (currentPipeline) {
        handlePipelineSelect(currentPipeline)
        // Always update the Redux store with the current pipeline to ensure consistency
        // This handles cases where the Redux state might be stale or empty
        dispatch(setSelectedPipeline(currentPipeline));
        
        // Update engine type if pipeline has engine_type
        if (currentPipeline.engine_type) {
          dispatch(setSelectedEngineType(currentPipeline.engine_type));
        }
      } else if (pipelines.length > 0) {
        // If we have pipelines but can't find the current one, it might not exist
        // Clear the invalid pipeline ID and navigate to build pipeline page
        console.warn(`Pipeline with ID ${id} not found in the pipeline list`);
        dispatch(setSelectedPipeline(null));
        localStorage.removeItem("pipeline_id");
        navigate(ROUTES.DESIGNERS.BUILD_PIPELINE, { replace: true });
      }
    }
  }, [pipelines, id, dispatch, navigate]);

  // Ensure pipeline ID is stored in localStorage when we have a valid ID from URL
  useEffect(() => {
    if (id) {
      const storedPipelineId = localStorage.getItem("pipeline_id");
      if (storedPipelineId !== id) {
        localStorage.setItem("pipeline_id", id);
      }
    }
  }, [id]);

  // Handle when pipelines become empty
  useEffect(() => {
    if (pipelines.length === 0 && id) {
      // If we have an ID but no pipelines, clear the selected state
      dispatch(setSelectedPipeline(null));
      localStorage.removeItem("pipeline_id");
    }
  }, [pipelines.length, id, dispatch]);


  // Toggle favorite status
  const toggleFavorite = (e: React.MouseEvent, pipelineId: number) => {
    e.stopPropagation();
    setFavorites(prev => {
      if (prev.includes(pipelineId)) {
        return prev.filter(id => id !== pipelineId);
      } else {
        return [...prev, pipelineId];
      }
    });
  };

  // Handle delete pipeline
  const handleDeleteClick = (e: React.MouseEvent, pipeline: Pipeline) => {
    e.stopPropagation();
    setPipelineToDelete(pipeline);
    setDeleteDialogOpen(true);
    setOpen(false); // Close the popover
  };
// Handle pipeline selection
  const handlePipelineSelect = useCallback(async (pipeline: Pipeline) => {
    const pipelineIdStr = pipeline.pipeline_id.toString();
    
    // Don't do anything if we're already on this pipeline
    if (id === pipelineIdStr) {
      setOpen(false);
      return;
    }
    
    localStorage.setItem("pipeline_id", pipelineIdStr);
    dispatch(setSelectedPipeline(pipeline));
    
    // Update engine type if pipeline has engine_type
    if (pipeline.engine_type) {
      dispatch(setSelectedEngineType(pipeline.engine_type));
    }

    // Close right aside component when navigating to a different pipeline
    dispatch(setIsRightAsideComponent(false));

    try {
      // Navigate to the new pipeline
      const targetRoute = ROUTES.DESIGNERS.BUILD_PLAYGROUND(pipelineIdStr);
      const currentRoute = location.pathname;
      
      if (currentRoute.includes('/designers/build-playground/')) {
        navigate(targetRoute, { replace: true });
      } else {
        navigate(targetRoute);
      }
      
      // Trigger pipeline list update event
      window.dispatchEvent(new Event('pipelineListUpdated'));
    } catch (error) {
      console.error('Error navigating to pipeline:', error);
    }
    
    setOpen(false);
  }, [id, dispatch, location.pathname, navigate]);

  const handleDeleteConfirm = useCallback(() => {
    if (pipelineToDelete) {
      deletePipelineMutation.mutate(pipelineToDelete.pipeline_id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPipelineToDelete(null);
          
          // Check if we're deleting the currently selected pipeline
          if (id === pipelineToDelete.pipeline_id.toString()) {
            // Find the next available pipeline to switch to
            const remainingPipelines = pipelines.filter(p => p.pipeline_id !== pipelineToDelete.pipeline_id);
            
            if (remainingPipelines.length > 0) {
              // Switch to the next available pipeline
              const nextPipeline:any = remainingPipelines[0];
              handlePipelineSelect(nextPipeline);
            } else {
              // No pipelines left, clear the selected pipeline and navigate to the build pipeline page to show empty state
              dispatch(setSelectedPipeline(null));
              localStorage.removeItem("pipeline_id");
              navigate(ROUTES.DESIGNERS.BUILD_PIPELINE, { replace: true });
            }
          }
          
          // Refresh the pipelines list
          fetchPipelineList();
        },
        onError: (error) => {
          console.error('Delete failed:', error);
          // Dialog stays open on error so user can try again
        }
      });
    }
  }, [pipelineToDelete, deletePipelineMutation, id, pipelines, dispatch, navigate, fetchPipelineList, handlePipelineSelect]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempName(e.target.value);
    setErrorMessage('');
  };

  const handleRename = async () => {
    try {
      if (tempName !== initialName && tempName.trim()) {
        await onSave(tempName);
      }
      setIsEditing(false);
    } catch (error) {
      setErrorMessage('Failed to update name');
      console.error('Error updating name:', error);
    }
  };

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (newOpen && pipelines.length === 0) {
      fetchPipelineList();
    }
    setOpen(newOpen);
  }, [pipelines.length, fetchPipelineList]);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter pipelines based on search term
  const filteredPipelines = pipelines.filter(pipeline =>
    pipeline.pipeline_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate favorites and regular pipelines
  const favoritePipelines = filteredPipelines.filter(p => favorites.includes(p.pipeline_id));
  const regularPipelines = filteredPipelines.filter(p => !favorites.includes(p.pipeline_id));

  const currentPipeline = pipelines.find(p => p.pipeline_id.toString() === id);

  return (
    <>
      <div className={cn("relative flex items-center", className)}>
        {isEditing ? (
          <>
            <Input
              type="text"
              value={tempName}
              onChange={handleNameChange}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                } else if (e.key === 'Escape') {
                  setTempName(initialName);
                  setIsEditing(false);
                }
              }}
              className="h-9 min-w-[250px]"
              autoFocus
              aria-label="Edit pipeline name"
            />
            {errorMessage && (
              <div className="text-red-500 text-sm mt-1 absolute top-full left-0 z-10">
                {errorMessage}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Popover open={open} onOpenChange={handleOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="justify-between min-w-[250px] h-9"
                  disabled={pipelines.length === 0}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Workflow size={14} />
                    <span className="truncate">
                      {pipelines.length === 0 
                        ? 'No pipelines available' 
                        : (initialName || currentPipeline?.pipeline_name || (isLoading ? 'Loading...' : placeholder))
                      }
                    </span>
                    {pipelines.length > 0 && currentPipeline?.engine_type && (
                      <Badge 
                        variant="secondary"
                        className="text-[10px] h-4 px-1 ml-1"
                      >
                        {currentPipeline.engine_type}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0" align="start">
                <Command>
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <CommandInput
                      placeholder="Search pipelines..."
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                      className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>
                      {isLoading ? 'Loading pipelines...' : 'No pipelines found'}
                    </CommandEmpty>

                    

                    {/* Favorite pipelines */}
                    {favoritePipelines.length > 0 && (
                      <CommandGroup heading="Favorites">
                        {favoritePipelines.map((pipeline:any) => (
                          <CommandItem
                            key={pipeline.pipeline_id}
                            value={pipeline.pipeline_name}
                            onSelect={() => handlePipelineSelect(pipeline)}
                            className="flex items-center justify-between p-2 cursor-pointer"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Workflow size={14} />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="truncate font-medium">{pipeline.pipeline_name}</span>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock size={10} />
                                  <span>Updated {formatDate(pipeline.updated_at)}</span>
                                  {pipeline.engine_type && (
                                    <Badge 
                                      variant="secondary"
                                      className="text-[10px] h-4 px-1"
                                    >
                                      {pipeline.engine_type}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {id === pipeline.pipeline_id.toString() && (
                                <Check size={14} className="text-primary" />
                              )}
                              <button 
                                onClick={(e) => toggleFavorite(e, pipeline.pipeline_id)}
                                className="p-1 hover:bg-muted rounded"
                              >
                                <Star 
                                  size={12} 
                                  className="text-yellow-500" 
                                  fill="currentColor" 
                                />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteClick(e, pipeline)}
                                className="p-1 hover:bg-red-50 rounded text-red-600 hover:text-red-700"
                                title="Delete pipeline"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {favoritePipelines.length > 0 && regularPipelines.length > 0 && <CommandSeparator />}

                    {/* Regular pipelines */}
                    {regularPipelines.length > 0 && (
                      <CommandGroup heading={favoritePipelines.length > 0 ? "All Pipelines" : undefined}>
                        {regularPipelines.map((pipeline:any) => (
                          <CommandItem
                            key={pipeline.pipeline_id}
                            value={pipeline.pipeline_name}
                            onSelect={() => handlePipelineSelect(pipeline)}
                            className="flex items-center justify-between p-2 cursor-pointer"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Workflow size={14} />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="truncate font-medium">{pipeline.pipeline_name}</span>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock size={10} />
                                  <span>Updated {formatDate(pipeline.updated_at)}</span>
                                  {pipeline.engine_type && (
                                    <Badge 
                                      variant="secondary"
                                      className="text-[10px] h-4 px-1"
                                    >
                                      {pipeline.engine_type}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {id === pipeline.pipeline_id.toString() && (
                                <Check size={14} className="text-primary" />
                              )}
                              <button 
                                onClick={(e) => toggleFavorite(e, pipeline.pipeline_id)}
                                className="p-1 hover:bg-muted rounded"
                              >
                                <Star 
                                  size={12} 
                                  className={favorites.includes(pipeline.pipeline_id) 
                                    ? "text-yellow-500" 
                                    : "text-muted-foreground"
                                  }
                                  fill={favorites.includes(pipeline.pipeline_id) ? "currentColor" : "none"}
                                />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteClick(e, pipeline)}
                                className="p-1 hover:bg-red-50 rounded text-red-600 hover:text-red-700"
                                title="Delete pipeline"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 rounded-full h-7 w-7 p-1.5"
              onClick={() => setIsEditing(true)}
              aria-label="Edit pipeline name"
            >
              <Edit className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>

      {/* Create Pipeline Dialog */}
      <CreatePipelineDialog
        open={createDialogOpen}
        handleClose={() => setCreateDialogOpen(false)}
      />

      {/* Delete Pipeline Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Pipeline"
        description={`Are you sure you want to delete "${pipelineToDelete?.pipeline_name}"? This action cannot be undone and will permanently remove the pipeline and all associated data.`}
        confirmText={pipelineToDelete?.pipeline_name || ''}
        onConfirm={handleDeleteConfirm}
        isLoading={deletePipelineMutation.isPending}
      />
    </>
  );
};