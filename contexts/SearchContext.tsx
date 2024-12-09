'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SearchContextType {
  searchResults: {
    relationId: number;
    username: string;
    avatar: string;
  }[];
  setSearchResults: (results: any[]) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  return (
    <SearchContext.Provider value={{
      searchResults,
      setSearchResults,
      isSearching,
      setIsSearching
    }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearchContext() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider')
  }
  return context
} 