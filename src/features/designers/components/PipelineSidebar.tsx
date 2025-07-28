import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Loader2, 
  PlusCircle, 
  Database, 
  Share,
  BarChart4, 
  Clock, 
  Star,
  Filter,
  Workflow
} from 'lucide-react';
import './PipelineSidebar.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CreatePipelineDialog from '../pipeline/components/CreatePipelineDialog';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { apiService } from '@/lib/api/api-service';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { setSelectedPipeline } from '@/store/slices/designer/pipelineSlice';
import { setSelectedEngineType } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';

interface PipelineSidebarProps {
  className?: string;
}

interface Pipeline {
  pipeline_id: number;
  pipeline_name: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

const PipelineSidebar: React.FC<PipelineSidebarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(id || null);

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

  // Filter pipelines based on search term and active tab
  const filteredPipelines = pipelines.filter(pipeline => {
    const matchesSearch = pipeline.pipeline_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'favorites') {
      return matchesSearch && favorites.includes(pipeline.pipeline_id);
    }
    
    if (activeTab === 'recent') {
      // For demo purposes, we'll just show all pipelines in recent
      // In a real app, you'd track recently accessed pipelines
      return matchesSearch;
    }
    
    return matchesSearch;
  });

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

  // Fetch pipeline list
  const fetchPipelineList = async () => {
    setIsLoading(true);
    try {
      const response:any = await apiService.get({
        baseUrl: CATALOG_REMOTE_API_URL,
        method: 'GET',
        url: `/pipeline/list/`,
        usePrefix: true,
        params: { limit: 1000, order_desc: true }
      });

      if (response) {
        // Add some mock data for created_at and updated_at for demo purposes
        const enhancedPipelines = response.map((pipeline: Pipeline) => ({
          ...pipeline,
          created_at: pipeline.created_at || new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          updated_at: pipeline.updated_at || new Date(Date.now() - Math.random() * 1000000000).toISOString(),
          status: pipeline.status || Math.random() > 0.7 ? 'active' : 'draft'
        }));
        setPipelines(enhancedPipelines);
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pipeline selection
  const handlePipelineSelect = async (pipelineId: number,pipeline:any) => {
    const pipelineIdStr = pipelineId.toString();
    console.log(pipeline)
    dispatch(setSelectedPipeline(pipeline))
    
    // Update engine type if pipeline has engine_type
    if (pipeline.engine_type) {
      dispatch(setSelectedEngineType(pipeline.engine_type));
    }
    
    // Don't do anything if we're already on this pipeline
    if (selectedPipelineId === pipelineIdStr) {
      return;
    }
    
    setSelectedPipelineId(pipelineIdStr);
    localStorage.setItem("pipeline_id", pipelineIdStr);

    try {
    dispatch(setSelectedPipeline(pipeline))

      // Check if we're already on the correct route
      const targetRoute = ROUTES.DESIGNERS.BUILD_PLAYGROUND(pipelineIdStr);
      const currentRoute = location.pathname;
      
      // If we're already on the correct route, just update the URL
      if (currentRoute.includes('/designers/build-playground/')) {
        navigate(targetRoute, { replace: true });
      } else {
        // Otherwise, navigate to the new route
        navigate(targetRoute);
      }
    } catch (error) {
      console.error('Error navigating to pipeline:', error);
    }
  };

  // Update selected pipeline ID when URL param changes
  useEffect(() => {
    if (id && id !== selectedPipelineId) {
      setSelectedPipelineId(id);
      localStorage.setItem("pipeline_id", id);
    }
  }, [id]);

  // Refresh pipeline list when component mounts
  useEffect(() => {
    fetchPipelineList();

    // Listen for pipeline list updates
    const handlePipelineListUpdated = () => {
      fetchPipelineList();
    };

    window.addEventListener('pipelineListUpdated', handlePipelineListUpdated);

    return () => {
      window.removeEventListener('pipelineListUpdated', handlePipelineListUpdated);
    };
  }, []);

  return (
    <>
      <div
        className={cn(
          "h-full bg-background border-r transition-all duration-300 flex flex-col pipeline-sidebar",
          isOpen ? "pipeline-sidebar-expanded" : "pipeline-sidebar-collapsed",
          className
        )}
      >
      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-3 mt-3 border-b">
        {isOpen && (
          <div className="flex items-center gap-2">
            {/* <Share size={18} className="text-primary" /> */}
            <h3 className="font-medium text-sm">Data Pipelines</h3>
          </div>
        )}
        <div className="flex items-center gap-1">
          {isOpen && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCreateDialogOpen(true)}
                    className="h-7 w-7 text-primary hover:text-primary/80 hover:bg-primary/10"
                  >
                    <PlusCircle size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create new pipeline</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                  aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                  {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
              </TooltipTrigger>
              <TooltipContent side={isOpen ? "right" : "right"}>
                <p>{isOpen ? "Collapse sidebar" : "Expand sidebar"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Only show these sections when sidebar is expanded */}
      {isOpen && (
        <>
          {/* Search input */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pipelines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          {/* Tabs for filtering */}
          <div className="px-2 pt-2">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 h-8">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="favorites" className="text-xs">Favorites</TabsTrigger>
                <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </>
      )}

      {/* Pipeline list */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : isOpen ? (
          filteredPipelines.length > 0 ? (
            <ul className="py-2">
              {filteredPipelines.map((pipeline) => (
                <li key={pipeline.pipeline_id} className="px-2">
                  <div
                    onClick={() => handlePipelineSelect(pipeline.pipeline_id,pipeline)}
                    className={cn(
                      "w-full rounded-md px-2 py-2 text-sm hover:bg-muted transition-colors cursor-pointer",
                      "flex flex-col gap-1",
                      selectedPipelineId === pipeline.pipeline_id.toString() && "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                    )}
                    title={pipeline.pipeline_name}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <Workflow size={14} className="flex-shrink-0" />
                        <span className="truncate font-medium">{pipeline.pipeline_name}</span>
                      </div>
                      <button 
                        onClick={(e) => toggleFavorite(e, pipeline.pipeline_id)}
                        className={cn(
                          "h-6 w-6 flex items-center justify-center rounded-full",
                          favorites.includes(pipeline.pipeline_id) 
                            ? "text-yellow-500 hover:text-yellow-600" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Star size={14} fill={favorites.includes(pipeline.pipeline_id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Updated {formatDate(pipeline.updated_at)}</span>
                      </div>
                      {pipeline.status && (
                        <Badge 
                          variant={pipeline.status === 'active' ? "default" : "outline"}
                          className="text-[10px] h-5"
                        >
                          {pipeline.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-sm text-muted-foreground text-center">
              <div className="flex flex-col items-center gap-2 mt-8">
                <Filter size={24} className="text-muted-foreground/50" />
                <p>No pipelines found</p>
                {activeTab === 'all' && pipelines.length === 0 ? (
                  <>
                    <p className="text-xs mb-3">Get started by creating a new pipeline</p>
                    <Button 
                      onClick={() => setCreateDialogOpen(true)}
                      size="sm"
                      className="mt-2"
                    >
                      <PlusCircle size={14} className="mr-1" />
                      Create Pipeline
                    </Button>
                  </>
                ) : (
                  <p className="text-xs">Try adjusting your search or filters</p>
                )}
              </div>
            </div>
          )
        ) : (
          // When sidebar is collapsed, show first letter for each pipeline
          <div className="flex flex-col items-center py-2">
            {filteredPipelines.slice(0, 10).map((pipeline) => (
              <TooltipProvider key={pipeline.pipeline_id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handlePipelineSelect(pipeline.pipeline_id,pipeline)}
                      className={cn(
                        "w-6 h-6 rounded-full my-1 flex items-center justify-center text-xs font-medium",
                        selectedPipelineId === pipeline.pipeline_id.toString()
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      <span className="sr-only">{pipeline.pipeline_name}</span>
                      {pipeline.pipeline_name.charAt(0).toUpperCase()}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{pipeline.pipeline_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDate(pipeline.updated_at)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            
            {filteredPipelines.length > 10 && (
              <div className="text-xs text-muted-foreground mt-2">
                +{filteredPipelines.length - 10} more
              </div>
            )}
          </div>
        )}
      </div>

      </div>
      
      {/* Create Pipeline Dialog */}
      <CreatePipelineDialog
        open={createDialogOpen}
        handleClose={() => setCreateDialogOpen(false)}
      />
    </>
  );
};

export default PipelineSidebar;