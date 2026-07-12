import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal, Grid, List } from "lucide-react";
import ProductFilterSidebar from "@/components/website/ProductFilterSidebar";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

async function getProducts(searchParams: SearchParams) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.set(key, value);
    }
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "/"}/api/products?${params.toString()}`,
    {
      // cache: "no-store",
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data.data;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const sp = await searchParams as SearchParams;

  const page = parseInt(typeof sp.page === "string" ? sp.page : "1");
  const sort = typeof sp.sort === "string" ? sp.sort : "newest";

  const data = await getProducts(sp);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Products not found
      </div>
    );
  }

  const { products, total, pages, hasMore } = data;

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white py-12 px-4 sm:px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">All Products</h1>
          <p className="text-white/70">
            Browse our complete collection
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilterSidebar basePath="/products" />
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <p className="text-sm text-[#1A1A1A]/60">
                Showing {products.length} of {total} products
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-[#1A1A1A] text-white rounded-lg">
                    <Grid size={18} />
                  </button>

                  <button className="p-2 bg-white rounded-lg">
                    <List size={18} />
                  </button>
                </div>

                <select
                  defaultValue={sort}
                  className="px-4 py-2 border rounded-lg bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price Low to High</option>
                  <option value="price-high">Price High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {products?.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product: any) => (
                    <Link
                      key={product._id}
                      href={`/product/${product.slug}`}
                      className="group"
                    >
                      <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition">
                        <div className="aspect-square relative">
                          {product.images?.[0]?.url ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <h3 className="font-medium line-clamp-2 mb-2">
                            {product.name}
                          </h3>

                          <div className="flex gap-2 items-center">
                            <span className="font-semibold text-[#C17A56]">
                              ₹
                              {(
                                product.salePrice || product.price
                              ).toLocaleString()}
                            </span>

                            {product.salePrice && (
                              <span className="text-sm text-gray-400 line-through">
                                ₹{product.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from(
                      { length: Math.min(5, pages) },
                      (_, i) => i + 1
                    ).map((pageNum) => (
                      <Link
                        key={pageNum}
                        href={`/products?page=${pageNum}&sort=${sort}`}
                        className={`px-4 py-2 rounded-lg ${
                          pageNum === page
                            ? "bg-[#C17A56] text-white"
                            : "bg-white border"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center">
                No Products Found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}