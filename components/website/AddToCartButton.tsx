"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, setCart, mapApiCartItems } from "@/store/reducer/cartReducer";
import type { RootState } from "@/store/store";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  image: string;
  price: number;
  qty?: number;
  disabled?: boolean;
}

export default function AddToCartButton({ 
  productId, 
  name, 
  image, 
  price, 
  qty = 1, 
  disabled 
}: AddToCartButtonProps) {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.authStore?.auth);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    try {
      if (auth) {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, qty }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.error("Failed to add to cart on server:", data.message);
          return;
        }

        if (data.data?.items) {
          dispatch(setCart(mapApiCartItems(data.data.items)));
        }
      } else {
        for (let i = 0; i < qty; i++) {
          dispatch(addToCart({
            id: productId,
            productId,
            name,
            category: "",
            price,
            image,
          }));
        }
      }

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || added}
      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : added
          ? "bg-green-500 text-white"
          : "bg-[#1A1A1A] text-white hover:bg-[#C17A56]"
      }`}
    >
      {added ? (
        <>
          <Check size={18} />
          <span>Added</span>
        </>
      ) : (
        <>
          <ShoppingCart size={18} />
          <span>Add to Cart</span>
        </>
      )}
    </button>
  );
}