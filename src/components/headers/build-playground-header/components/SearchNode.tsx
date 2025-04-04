import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import React from 'react'

export default function SearchNode({searchTerm, handleSearch, searchResults, handleSearchResultClick}: {searchTerm: string, handleSearch: (value: string) => void, searchResults: any[], handleSearchResultClick: (id: string) => void}) {
  return (
    <div className="relative mt-1">
              <div className="relative">
                <Input
                  data-search-input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search nodes... (Ctrl+F)"
                  className="w-64 px-4 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              {searchResults?.length > 0 && searchTerm && (
                <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-100 max-h-60 overflow-y-auto z-50">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearchResultClick(result.id)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{result.title}</span>
                        <span className="text-xs text-gray-500">{result.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
  )
}
