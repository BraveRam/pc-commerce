import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { notFound } from "next/navigation";
import Link from "next/link";

// Types
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

// GROQ query to fetch a single laptop by slug
const laptopQuery = `*[_type == "laptop" && slug.current == $slug][0] {
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

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function LaptopPage({ params }: Props) {
  const { slug } = await params;
  const laptop = await client.fetch<Laptop | null>(laptopQuery, { slug });

  if (!laptop) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to all laptops
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images Section */}
        <div className="space-y-4">
          {/* Main Image */}
          {laptop.images && laptop.images.length > 0 ? (
            <>
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={urlFor(laptop.images[0]).width(800).height(800).url()}
                  alt={laptop.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Thumbnail Gallery */}
              {laptop.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {laptop.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-md overflow-hidden bg-gray-100 border-2 border-transparent hover:border-blue-500 cursor-pointer transition-colors"
                    >
                      <img
                        src={urlFor(image).width(150).height(150).url()}
                        alt={`${laptop.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square rounded-lg bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-lg">No image available</span>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          {/* Category */}
          {laptop.category && (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
              {laptop.category.name}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">{laptop.title}</h1>

          {/* Price */}
          <div className="text-4xl font-bold text-green-600">
            ${laptop.price.toLocaleString()}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                laptop.status === "in-stock"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  laptop.status === "in-stock" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {laptop.status === "in-stock" ? "In Stock" : "Sold Out"}
            </span>
          </div>

          {/* Description */}
          {laptop.description && (
            <div className="prose prose-gray">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {laptop.description}
              </p>
            </div>
          )}

          {/* Metadata Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y">
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-500">
                    Product ID
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {laptop._id}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-500">
                    Slug
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {laptop.slug.current}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-500">
                    Category
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {laptop.category?.name || "Uncategorized"}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-500">
                    Status
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {laptop.status === "in-stock" ? "In Stock" : "Sold Out"}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-500">
                    Images
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {laptop.images?.length || 0} image(s)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
