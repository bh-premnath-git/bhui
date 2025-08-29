import React from 'react';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';

const SearchPanel: React.FC = () => {
    const { searchTerm, handleSearch, searchResults, handleSearchResultClick } = usePipelineContext();

    return (
        <div className="absolute top- -100 right-4 z-50">
            <div className="relative">
                <div className="relative">
                    <input
                        data-search-input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search nodes... (Ctrl+F)"
                        className="w-64 px-4 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                {searchResults.length > 0 && searchTerm && (
                    <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
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
        </div>
    );
};

export default SearchPanel;