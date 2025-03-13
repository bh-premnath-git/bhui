import React, { useState, useEffect, useCallback } from "react"
import { Node } from "@/types/designer/features/formTypes"
import { X } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store/"
// import { setUnsavedChanges } from "@/store/slices/designer/buildPipeLine/BuildPipeLineSlice"
import { CATALOG_API_PORT } from "@/config/platformenv"
import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"

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

// API client setup
const apiClient = axios.create({
    baseURL: `http://localhost:${CATALOG_API_PORT}`
});

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

const NodeDropList: React.FC<NodeDropListProps> = ({
  filteredNodes,
  handleNodeClick,
  addNodeToHistory,
}) => {
  const dispatch = useDispatch()

  const [dropdownVisible, setDropdownVisible] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { setUnsavedChanges } = usePipelineContext();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: dataSourceKeys.list(),
    queryFn: async ({ pageParam = 1 }) => {
      const data =await apiService.get({
        portNumber: CATALOG_API_PORT,
        url: '/data_source/list/',
        usePrefix: true,
        method: 'GET',
        metadata: {
            errorMessage: 'Failed to fetch projects'
        },
        params: {limit: 1000}
    })
      return data;
    },
    getNextPageParam: (lastPage:any, allPages) => {
      return lastPage?.length === ITEMS_PER_PAGE ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1
  });

  // Flatten and filter data sources
  const dataSources = data?.pages.flat() || [];
  const filteredSources = dataSources.filter((source:any) =>
    source.data_src_name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleButtonClick = (node: Node) => {
    setUnsavedChanges()
    if (node.ui_properties.module_name === "Reader") {
      setDropdownVisible((prev) =>
        prev === node.ui_properties.module_name ? null : node.ui_properties.module_name
      )
    } else {
      addNodeToHistory()
      handleNodeClick(node)
    }
  }

  return (
    <div className="flex justify-center gap-4 mb-4">
      {filteredNodes.slice(0, 8).map((node) => (
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
                if (!isOpen) {
                  setDropdownVisible(null)
                } else {
                  setDropdownVisible(node.ui_properties.module_name)
                }
              }}
            >
              <PopoverTrigger asChild>
                <button
                  onClick={() => handleButtonClick(node)}
                  className="node-button rounded text-white flex items-center p-0.5 transition-all duration-300 ease-in-out"
                  style={{ backgroundColor: node.ui_properties.color }}
                >
                  <div
                    className={`
                      flex items-center rounded-lg
                      transition-all duration-300 ease-in-out
                      ${hoveredNode === node.ui_properties.module_name ? "w-auto" : "w-9"}
                    `}
                  >
                    <img
                      src={node.ui_properties.icon}
                      alt={node.ui_properties.module_name}
                      className="w-9 h-9 rounded"
                    />
                    {hoveredNode === node.ui_properties.module_name && (
                      <div className="ml-2 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-sm">
                        {node.ui_properties.module_name}
                      </div>
                    )}
                  </div>
                </button>
              </PopoverTrigger>

              <PopoverContent
                className="w-80 p-2 bg-white shadow-lg rounded-lg"
                align="start"
                side="bottom"
              >
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-black font-medium">Add Source</Label>
                  <div
                    className="bg-white text-gray-700 font-medium cursor-pointer"
                    onClick={() => setDropdownVisible(null)}
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
                  className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200"
                  onScroll={handleScroll}
                >
                  {filteredSources.map((source: any, index: number) => (
                    <span key={`${source.id || index}`}>
                      <li
                        onClick={() => {
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
                          className="w-9 h-9 rounded"
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
                    onClick={() => {
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
              onClick={() => handleButtonClick(node)}
              className="node-button rounded text-white flex items-center p-0.5 transition-all duration-300 ease-in-out"
              style={{ backgroundColor: node.ui_properties.color }}
            >
              <div
                className={`
                  flex items-center rounded-lg
                  transition-all duration-300 ease-in-out
                  ${hoveredNode === node.ui_properties.module_name ? "w-auto" : "w-9"}
                `}
              >
                <img
                  src={node.ui_properties.icon}
                  alt={node.ui_properties.module_name}
                  className="w-9 h-9 rounded"
                />
                {hoveredNode === node.ui_properties.module_name && (
                  <div className="ml-2 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-sm">
                    {node.ui_properties.module_name}
                  </div>
                )}
              </div>
            </button>
          )}
        </div>
      ))}

      {filteredNodes.length > 8 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded">
              <img src="/assets/buildPipeline/add.svg" alt="more" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px]">
            {filteredNodes.slice(8).map((node: Node) => (
              <DropdownMenuItem
                key={node.ui_properties.module_name}
                onClick={() => handleNodeClick(node)}
                className="py-3"
              >
                <div className="flex items-center w-full">
                  <img
                    src={node.ui_properties.icon}
                    alt={node.ui_properties.module_name}
                    className="w-9 h-9"
                  />
                  <div className="mx-4 flex flex-col justify-between h-8 relative">
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
