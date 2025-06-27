"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { Product } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          const searchResults = await api.searchProducts(query);
          setResults(searchResults);
          setShowResults(true);
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductClick = (product: Product) => {
    router.push(`/groups/${product.groupId}`);
    setShowResults(false);
    setQuery("");
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <Input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && results.length > 0 && setShowResults(true)}
        className="w-full"
      />
      
      {showResults && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-auto">
          <CardContent className="p-2">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Searching...</div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 hover:bg-gray-100 cursor-pointer rounded-md transition-colors"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm text-gray-600">
                      {product.manufacturer} • ${product.price.toFixed(2)} • {product.quantity} in stock
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {product.description}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No products found matching "{query}"
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 