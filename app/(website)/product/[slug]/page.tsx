import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Truck, Shield, RotateCcw } from "lucide-react";
import mongoose from "mongoose";
import ProductGallery from "@/components/website/ProductGallery";
import ProductActions from "@/components/website/ProductActions";
import ReviewForm from "@/components/website/ReviewForm";
import PincodeChecker from "@/components/website/PincodeChecker";
import { connectDB } from "@/lib/databaseConnection";
import ProductModel from "@/models/Product.model";
import ReviewModel from "@/models/Review.model";
import "@/models/Category.model";

export const dynamic = "force-dynamic";

type ProductBundle = {
  product: {
    _id: string;
    name: string;
    slug: string;
    sku?: string;
    description?: string;
    shortDescription?: string;
    price: number;
    salePrice?: number;
    images: { url: string; alt?: string }[];
    badge?: string;
    stock: number;
    category?: { _id: string; name: string; slug: string };
    ratings?: { average?: number; count?: number };
  };
  reviews: {
    _id: string;
    user?: { name?: string };
    rating: number;
    comment?: string;
    createdAt: string;
  }[];
  relatedProducts: {
    _id: string;
    slug: string;
    name: string;
    images: { url: string }[];
    salePrice?: number;
    price: number;
  }[];
};

async function fetchBundle(slug: string): Promise<ProductBundle | null> {
  try {
    await connectDB();
    const product = await ProductModel.findOne({ slug, isActive: true })
      .populate("category", "name slug description image")
      .lean();
    if (!product) return null;

    const productId = (product as unknown as { _id: mongoose.Types.ObjectId })._id;
    const categoryId = (product as unknown as { category?: { _id: mongoose.Types.ObjectId } })
      .category?._id;

    const [reviews, relatedProducts] = await Promise.all([
      ReviewModel.find({ product: productId, isApproved: true })
        .populate("user", "name avatar")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      categoryId
        ? ProductModel.find({
            category: categoryId,
            _id: { $ne: productId },
            isActive: true,
          })
            .populate("category", "name slug")
            .limit(8)
            .lean()
        : Promise.resolve([]),
    ]);

    return JSON.parse(
      JSON.stringify({ product, reviews, relatedProducts })
    ) as ProductBundle;
  } catch (error) {
    console.error("Product page DB error:", error);
    return null;
  }
}

async function getProduct(slug: string): Promise<ProductBundle | null> {
  const timeoutPromise = new Promise<ProductBundle | null>((resolve) =>
    setTimeout(() => resolve(null), 12000)
  );
  return Promise.race([fetchBundle(slug), timeoutPromise]);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) notFound();

  const { product, reviews, relatedProducts } = data;
  const price = product.salePrice ?? product.price;
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  const averageRating = product.ratings?.average || 0;
  const ratingCount = product.ratings?.count || 0;

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8">
        <nav
          data-testid="product-breadcrumb"
          className="flex items-center gap-2 text-sm text-[#1A1A1A]/60 mb-8"
        >
          <Link href="/" className="hover:text-[#C17A56]">
            Home
          </Link>
          <span>/</span>
          {product.category?.slug ? (
            <Link
              href={`/category/${product.category.slug}`}
              className="hover:text-[#C17A56]"
            >
              {product.category.name}
            </Link>
          ) : (
            <span>{product.category?.name || "Uncategorized"}</span>
          )}
          <span>/</span>
          <span className="text-[#1A1A1A]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          <ProductGallery
            images={product.images}
            name={product.name}
            badge={product.badge}
          />

          <div className="space-y-6">
            <div>
              <p className="text-sm text-[#C17A56] font-medium mb-2">
                {product.category?.name || ""}
              </p>
              <h1
                data-testid="product-name"
                className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-2"
              >
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-sm text-[#1A1A1A]/60">SKU: {product.sku}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={
                      star <= Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-[#1A1A1A]/60">
                ({ratingCount} reviews)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <p
                data-testid="product-price"
                className="text-3xl font-bold text-[#1A1A1A]"
              >
                ₹{price.toLocaleString()}
              </p>
              {product.salePrice && (
                <>
                  <p className="text-xl text-[#1A1A1A]/50 line-through">
                    ₹{product.price.toLocaleString()}
                  </p>
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-[#1A1A1A]/70">{product.shortDescription}</p>
            )}

            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span
                    data-testid="product-stock"
                    className="text-sm text-green-600 font-medium"
                  >
                    In Stock ({product.stock} available)
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span
                    data-testid="product-stock"
                    className="text-sm text-red-600 font-medium"
                  >
                    Out of Stock
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <ProductActions
                productId={product._id}
                name={product.name}
                image={product.images[0]?.url || ""}
                price={price}
                slug={product.slug}
                stock={product.stock}
              />
            </div>

            {/* PIN Code Delivery Checker */}
            <PincodeChecker />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Truck size={20} className="text-[#C17A56]" />
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    Free Shipping
                  </p>
                  <p className="text-xs text-[#1A1A1A]/60">Orders above ₹2999</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-[#C17A56]" />
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    Secure Payment
                  </p>
                  <p className="text-xs text-[#1A1A1A]/60">100% Secure</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw size={20} className="text-[#C17A56]" />
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    Easy Returns
                  </p>
                  <p className="text-xs text-[#1A1A1A]/60">30 Days Return</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
            Description
          </h2>
          <div className="prose prose-sm max-w-none text-[#1A1A1A]/70">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p>No description available.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold text-[#1A1A1A] mb-6">
            Customer Reviews
          </h2>
          {reviews.length > 0 ? (
            <div className="space-y-4 mb-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border-b border-gray-100 pb-4 last:border-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {review.user?.name?.[0] || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1A1A]">
                          {review.user?.name || "Anonymous"}
                        </p>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-[#1A1A1A]/60">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-[#1A1A1A]/70 text-sm">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#1A1A1A]/60 mb-4">
              No reviews yet. Be the first to review this product!
            </p>
          )}
          <ReviewForm productId={product._id} />
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  href={`/product/${relatedProduct.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative">
                      {relatedProduct.images[0] ? (
                        <Image
                          src={relatedProduct.images[0].url}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-[#1A1A1A] text-sm mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="font-semibold text-[#C17A56]">
                        ₹
                        {(
                          relatedProduct.salePrice || relatedProduct.price
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
