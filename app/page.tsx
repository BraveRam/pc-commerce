import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import Link from "next/link";
import { FilterControls } from "./components/FilterControls";
import { Suspense } from "react";

// Define types for our data
type Category = {
  _id: string;
  name: string;
  slug: { current: string };
};

type Laptop = {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  status: "in-stock" | "sold-out";
  images: Array<{ asset: { _ref: string } }>;
  description: string;
  category: Category;
};

// GROQ queries
const categoriesQuery = `*[_type == "category"] | order(name asc) {
  _id,
  name,
  slug
}`;

const laptopsQuery = `*[_type == "laptop"] | order(_createdAt desc) {
  _id,
  title,
  slug,
  price,
  status,
  images,
  description,
  category->{
    _id,
    name,
    slug
  }
}`;

type SearchParams = Promise<{
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}>;

type Props = {
  searchParams: SearchParams;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const categoryFilter = params.category || "";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : 0;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : Infinity;

  const [categories, allLaptops] = await Promise.all([
    client.fetch<Category[]>(categoriesQuery),
    client.fetch<Laptop[]>(laptopsQuery),
  ]);

  // Apply filters
  const laptops = allLaptops.filter((laptop) => {
    // Category filter
    if (categoryFilter && laptop.category?.slug?.current !== categoryFilter) {
      return false;
    }
    // Price filter
    if (laptop.price < minPrice || laptop.price > maxPrice) {
      return false;
    }
    return true;
  });

  const hasActiveFilters = categoryFilter || params.minPrice || params.maxPrice;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Filter Controls */}
      <Suspense
        fallback={
          <div className="h-24 bg-gray-50 rounded-lg animate-pulse mb-8" />
        }
      >
        <FilterControls categories={categories} />
      </Suspense>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Active filters:</span>
          {categoryFilter && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
              Category:{" "}
              {categories.find((c) => c.slug.current === categoryFilter)
                ?.name || categoryFilter}
            </span>
          )}
          {params.minPrice && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
              Min: ${params.minPrice}
            </span>
          )}
          {params.maxPrice && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
              Max: ${params.maxPrice}
            </span>
          )}
          <span className="text-gray-500">
            ({laptops.length} result{laptops.length !== 1 ? "s" : ""})
          </span>
        </div>
      )}

      {/* Laptops Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Laptops</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {laptops.length > 0 ? (
            laptops.map((laptop) => (
              <Link
                href={`/laptop/${laptop.slug.current}`}
                key={laptop._id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow block"
              >
                {/* Image */}
                {laptop.images && laptop.images.length > 0 ? (
                  <img
                    src={urlFor(laptop.images[0]).width(400).height(300).url()}
                    alt={laptop.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Category Badge */}
                  {laptop.category && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mb-2">
                      {laptop.category.name}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="font-semibold text-lg mb-1">{laptop.title}</h3>

                  {/* Price & Status */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold text-green-600">
                      ${laptop.price.toLocaleString()}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        laptop.status === "in-stock"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {laptop.status === "in-stock" ? "In Stock" : "Sold Out"}
                    </span>
                  </div>

                  {/* Description */}
                  {laptop.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {laptop.description}
                    </p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                No laptops found matching your filters.
              </p>
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
              >
                Clear all filters
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
