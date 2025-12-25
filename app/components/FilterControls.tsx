"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type Category = {
  _id: string;
  name: string;
  slug: { current: string };
};

type FilterControlsProps = {
  categories: Category[];
};

export function FilterControls({ categories }: FilterControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // Sync state when URL changes
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  const handleFilter = () => {
    const params = new URLSearchParams();

    if (selectedCategory) {
      params.set("category", selectedCategory);
    }
    if (minPrice) {
      params.set("minPrice", minPrice);
    }
    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    }

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/");
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    router.push("/");
  };

  const hasActiveFilters = selectedCategory || minPrice || maxPrice;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-8">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      <div className="flex flex-wrap gap-4 items-end">
        {/* Category Filter */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="category"
            className="text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category.slug.current}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price Filter */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="minPrice"
            className="text-sm font-medium text-gray-700"
          >
            Min Price ($)
          </label>
          <input
            id="minPrice"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            min="0"
            className="px-3 py-2 border rounded-md bg-white w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Max Price Filter */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="maxPrice"
            className="text-sm font-medium text-gray-700"
          >
            Max Price ($)
          </label>
          <input
            id="maxPrice"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="10000"
            min="0"
            className="px-3 py-2 border rounded-md bg-white w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Button */}
        <button
          onClick={handleFilter}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Filter
        </button>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-gray-600 font-medium rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
