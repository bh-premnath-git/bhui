import React, { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { Node } from "@/types/designer/features/formTypes"
import { X } from "lucide-react"
import { useDispatch} from "react-redux"
import { CATALOG_REMOTE_API_URL } from "@/config/platformenv"
import { useInfiniteQuery } from "@tanstack/react-query"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { apiService } from "@/lib/api/api-service"
import { usePipelineContext } from "@/context/designers/DataPipelineContext"
import { useFlow } from "@/context/designers/FlowContext"


// Query keys
const dataSourceKeys = {
    all: ['dataSources'] as const,
    list: () => [...dataSourceKeys.all, 'list'] as const,
};

interface NodeDropListProps {
  filteredNodes: Node[]
  handleNodeClick: (node: Node, source?: any) => void
  addNodeToHistory: () => void
}

const ITEMS_PER_PAGE = 10;
const MAX_VISIBLE_NODES = 5;

// Unified context hook to handle both pipeline and flow contexts
const useUnifiedContext = () => {
  let pipelineContext = null;
  let flowContext = null;
  
  try {
    pipelineContext = usePipelineContext();
  } catch (error) {
    // Pipeline context not available
  }
  
  try {
    flowContext = useFlow();
  } catch (error) {
    // Flow context not available
  }
  
  // Determine which context to use based on current URL/route
  const isFlowMode = window.location.pathname.includes('data-flow-playground');
  const context = isFlowMode ? flowContext : pipelineContext;
  
  return {
    setUnsavedChanges: context?.setUnsavedChanges || (() => {}),
    addNodeToHistory: context?.addNodeToHistory || (() => {}),
    handleNodeClick: context?.handleNodeClick || (() => {}),
    contextType: isFlowMode ? 'flow' : 'pipeline'
  };
};

const NodeDropList: React.FC<NodeDropListProps> = ({
  filteredNodes,
  handleNodeClick,
  addNodeToHistory,
}) => {
  const dispatch = useDispatch()
  const { setUnsavedChanges, addNodeToHistory: contextAddNodeToHistory } = useUnifiedContext();

  const [dropdownVisible, setDropdownVisible] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [visibleCount, setVisibleCount] = useState<number>(Math.min(MAX_VISIBLE_NODES, filteredNodes.length))

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const compute = () => {
      const rect = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      const gap = parseFloat((style as any).gap || (style as any).columnGap || '12') || 12

      // Base sizes (keep conservative to avoid wrapping). Button min width/height set in markup.
      const itemWidth = 44 // px, ~w-10 incl. padding
      const moreBtnWidth = 40 // px, width of the "+" button

      // How many slots fit based on width (each slot fits one icon or the more button)
      let widthFit = Math.floor((rect.width + gap) / (itemWidth + gap))
      widthFit = Math.max(widthFit, 0)

      const hasOverflow = filteredNodes.length > MAX_VISIBLE_NODES

      let next = 0
      if (!hasOverflow) {
        // No overflow: show as many as fit, up to total nodes
        next = Math.min(widthFit, filteredNodes.length)
      } else {
        // Overflow: prefer showing MAX_VISIBLE_NODES if we have space for +1 more button
        if (widthFit >= MAX_VISIBLE_NODES + 1) {
          next = MAX_VISIBLE_NODES
        } else {
          // Reserve one slot for the more button
          next = Math.max(widthFit - 1, 0)
        }
      }

      setVisibleCount(next)
    }

    // Initial compute and observe size changes
    compute()
    const ro = new ResizeObserver(() => compute())
    ro.observe(el)

    // Also recompute when window zoom/metrics change
    const onResize = () => compute()
    window.addEventListener('resize', onResize)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [filteredNodes.length])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: dataSourceKeys.list(),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiService.get({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: '/data_source/list/',
        usePrefix: true,
        method: 'GET',
        metadata: {
            errorMessage: 'Failed to fetch projects'
        },
        params: {limit: 1000}
    })
      return (response as any).data;
    },
    getNextPageParam: (lastPage:any, allPages) => {
      return lastPage?.length === ITEMS_PER_PAGE ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1
  });

  // Flatten and filter data sources
  const dataSources = data?.pages.flat() || [];
  const filteredSources = dataSources.filter((source: any) =>
  source && source.data_src_name && typeof source.data_src_name === 'string'
    ? source.data_src_name.toLowerCase().includes(searchTerm.toLowerCase())
    : false
  );

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLUListElement>) => {
      const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
      if (scrollHeight - scrollTop <= clientHeight * 1.5 && !isFetchingNextPage && hasNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const handleNodeHover = (nodeName: string | null) => {
    setHoveredNode(nodeName)
  }

  const handleButtonClick = useCallback((node: Node) => {
    console.log("Button clicked for node:", node.ui_properties.module_name)
    
    if (node.ui_properties.module_name === "Reader") {
      // Toggle dropdown visibility for Reader nodes
      console.log("Reader node clicked, toggling dropdown")
      setDropdownVisible((prev) => {
        const newState = prev === node.ui_properties.module_name ? null : node.ui_properties.module_name
        console.log("Setting dropdown visible state to:", newState)
        return newState
      })
    } else {
      // For non-Reader nodes, add to history and handle click
      console.log("Non-Reader node clicked, handling node click")
      setUnsavedChanges()
      contextAddNodeToHistory()
      handleNodeClick(node) // Use the prop parameter
    }
  }, [handleNodeClick, setUnsavedChanges, contextAddNodeToHistory])

  return (
    <div ref={containerRef} className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 px-2 w-full overflow-visible">
      {filteredNodes.slice(0, visibleCount).map((node) => (
        <div
          key={node.ui_properties.module_name}
          onMouseEnter={() => handleNodeHover(node.ui_properties.module_name)}
          onMouseLeave={() => handleNodeHover(null)}
          className="relative"
        >
          {node.ui_properties.module_name === "Reader" ? (
            <Popover
              open={dropdownVisible === node.ui_properties.module_name}
              onOpenChange={(isOpen) => {
                console.log("Popover onOpenChange called with isOpen:", isOpen)
                setDropdownVisible(isOpen ? node.ui_properties.module_name : null)
              }}
            >
              <PopoverTrigger asChild>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log("Reader button clicked")
                    handleButtonClick(node)
                  }}
                  className="node-button rounded text-white flex items-center p-0.5 transition-all duration-300 ease-in-out min-w-10 min-h-10"
                  style={{ backgroundColor: node.ui_properties.color }}
                >
                  <div
                    className={`
                      flex items-center rounded-lg
                      transition-all duration-300 ease-in-out
                      ${hoveredNode === node.ui_properties.module_name ? "md:w-auto" : "w-9"}
                    `}
                  >
                    <img
                      src={node.ui_properties.icon}
                      alt={node.ui_properties.module_name}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded"
                    />
                    {/* Show label only on md+ when hovered to avoid crowding on small screens */}
                    {hoveredNode === node.ui_properties.module_name && (
                      <div className="ml-2 hidden md:block whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-sm">
                        {node.ui_properties.module_name}
                      </div>
                    )}
                  </div>
                </button>
              </PopoverTrigger>

              <PopoverContent
                className="w-[85vw] sm:w-80 p-2 bg-white shadow-lg rounded-lg"
                align="start"
                side="bottom"
                style={{zIndex: 9999}}
              >
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-black font-medium">Add Source</Label>
                  <div
                    className="bg-white text-gray-700 font-medium cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log("Close button clicked")
                      setDropdownVisible(null)
                    }}
                  >
                    <X size={16} />
                  </div>
                </div>

                <Input
                  className="my-2"
                  placeholder="Search sources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <ul
                  className="space-y-3 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200"
                  onScroll={handleScroll}
                >
                  {filteredSources.map((source: any, index: number) => (
                    <span key={`${source.id || index}`}>
                      <li
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log("Source item clicked:", source.data_src_name)
                          setUnsavedChanges()
                          handleNodeClick(node, source)
                          setDropdownVisible(null)
                        }}
                        className="cursor-pointer text-sm text-gray-700 flex items-center gap-2"
                      >
                        <img
                          src={
                            source.connection_type === "postgres"
                              ? "/assets/buildPipeline/connection/postgres.png"
                              : source.connection_type === "snowflake"
                              ? "/assets/buildPipeline/connection/snowflake.png"
                              : source.connection_type === "local"
                              ? "/assets/buildPipeline/connection/bigquery.png"
                              : node.ui_properties.icon
                          }
                          alt={source.connection_type || node.ui_properties.module_name}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded"
                        />
                        {source.data_src_name}
                      </li>
                      <hr className="border-gray-200 my-2" />
                    </span>
                  ))}
                  {(isLoading || isFetchingNextPage) && (
                    <div className="text-center py-2 text-gray-500">Loading...</div>
                  )}
                </ul>

                <div className="flex justify-center mt-2">
                  <Button
                    className="bg-black hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm disabled:bg-gray-400"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log("Add Source button clicked")
                      setUnsavedChanges()
                      handleNodeClick(node)
                      setDropdownVisible(null)
                    }}
                  >
                    Add Source
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <button
              onClick={() => {
                          console.log(node)
                
                handleButtonClick(node)}}
              className="node-button rounded text-white flex items-center p-0.5 transition-all duration-300 ease-in-out min-w-10 min-h-10"
              style={{ backgroundColor: node.ui_properties.color }}
            >
              <div
                className={`
                  flex items-center rounded-lg
                  transition-all duration-300 ease-in-out
                  ${hoveredNode === node.ui_properties.module_name ? "md:w-auto" : "w-9"}
                `}
              >
                <img
                  src={node.ui_properties.icon}
                  alt={node.ui_properties.module_name}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded"
                />
                {hoveredNode === node.ui_properties.module_name && (
                  <div className="ml-2 hidden md:block whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-sm">
                    {node.ui_properties.module_name}
                  </div>
                )}
              </div>
            </button>
          )}
        </div>
      ))}

      {filteredNodes.length > visibleCount && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded min-w-10 min-h-10 flex items-center justify-center">
              <img src="/assets/buildPipeline/add.svg" alt="more" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[85vw] sm:w-[300px]"  style={{zIndex: 9999}}>
            {filteredNodes.slice(visibleCount).map((node: Node) => (
              <DropdownMenuItem
                key={node.ui_properties.module_name}
                onClick={() => handleNodeClick(node)}
                className="py-3"
                
              >
                <div className="flex items-center w-full">
                  <img
                    src={node.ui_properties.icon}
                    alt={node.ui_properties.module_name}
                    className="w-8 h-8 sm:w-9 sm:h-9"
                  />
                  <div className="mx-4 hidden sm:flex flex-col justify-between h-8 relative">
                    <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-200 -translate-x-1/2"></div>
                    <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">{node.ui_properties.module_name}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

export default NodeDropList