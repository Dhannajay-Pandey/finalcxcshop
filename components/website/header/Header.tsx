"use client";

import Link from "next/link";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  MapPin,
  Package,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/reducer/authReducer";
import { persistor } from "@/store/store";
import type { RootState } from "@/store/store";

import TopBar from "./TopBar";
import MegaMenu from "./MegaMenu";
import { megaMenuData } from "@/data/menuData";
import CartDrawer from "../CartDrawer";
import SearchBar  from "./Search";

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dispatch = useDispatch();

  const auth = useSelector((state: RootState) => state.authStore.auth) as any;
  const cartCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, item) => sum + item.qty, 0)
  );

  // Lock scroll when drawers are open
  useEffect(() => {
    document.body.style.overflow = mobileMenu || cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenu, cartOpen]);

  // Shadow on scroll for sticky header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    dispatch(logout());
    await persistor.purge();
  };

  return (
    <>
      {/* Top Header */}
      <div className="border-b bg-white hidden">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center px-4 sm:px-5 py-2 text-[12px] sm:text-[13px]">
          <div className="flex gap-4 sm:gap-8 hidden">
            <Link href="/brands" className="hidden sm:inline">Brands</Link>
            <Link href="/gift-cards" className="hidden sm:inline">Gift Cards</Link>
            <Link href="/careers" className="hidden sm:inline">Careers</Link>
          </div>

          <div className="hidden md:flex gap-6 lg:gap-8 hidden">
            <Link
              href="/stores"
              className="flex items-center gap-2 hover:text-gray-600 hidden"
            >
              <MapPin size={14} />
              <span className="hidden lg:inline">Find A Store</span>
              <span className="lg:hidden">Store</span>
            </Link>

            <Link
              href="/track-order"
              className="flex items-center gap-2 hover:text-gray-600"
            >
              <Package size={14} />
              <span className="hidden lg:inline">Track Order</span>
              <span className="lg:hidden">Track</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Announcement Bar */}
      <TopBar />

      {/* Main Header – sticky with shadow */}
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-5 py-4 sm:py-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-5 sm:gap-7 md:gap-8">
            {/* Left: Hamburger + Search (desktop) */}
            <div className="flex items-center">
              
              <div className="fixed overflow-y-auto">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenu(true)}
              className="lg:hidden mr-3"
              aria-label="Open Menu"
            >
              <Menu size={26} />
            </button>

            {/* Desktop Search */}
            <div className="hidden lg:block">
              <SearchBar />
            </div>
          </div>

             
            </div>

            {/* Center: Logo – two lines on mobile, single line on larger screens */}
            <div className="text-center">
              <Link
                href="/"
                className="inline-block"
              >
                
                <span className="block text-base sm:text-lg md:text-xl font-bold uppercase tracking-[0.15em] text-gray-700 mt-0.5 sm:mt-1">
                Cosmopolitan Xccessories
              </span>
                          </Link>
            </div>

            {/* Right: Account, Wishlist, Cart */}
            <div className="flex justify-end items-center gap-3 sm:gap-6 md:gap-8">
              {/* Auth / Account */}
              {auth ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href={auth.role === "admin" ? "/admin/dashboard" : "/my-account"}
                    className="text-[10px] sm:text-xs hover:text-gray-600 flex flex-col items-center"
                  >
                    <User size={20} className="sm:w-[22px] sm:h-[22px]" />
                    <span className="mt-1 hidden sm:inline">
                      {auth.name?.split(" ")[0]}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Logout"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden sm:flex flex-col items-center text-[10px] sm:text-xs hover:text-gray-600"
                >
                  <User size={20} className="sm:w-[22px] sm:h-[22px]" />
                  <span className="mt-1 hidden sm:inline">Sign In</span>
                </Link>
              )}

              {/* Mobile account icon */}
              <Link
                href={auth ? (auth.role === "admin" ? "/admin/dashboard" : "/my-account") : "/auth/login"}
                className="sm:hidden flex flex-col items-center text-[10px] hover:text-gray-600"
              >
                <User size={20} />
                <span className="mt-1">{auth ? "Account" : "Login"}</span>
              </Link>

              {/* Wishlist (tablet+) */}
              <Link
                href="/wishlist"
                className="hidden sm:flex flex-col items-center text-[10px] sm:text-xs hover:text-gray-600"
              >
                <Heart size={20} className="sm:w-[22px] sm:h-[22px]" />
                <span className="mt-1 hidden sm:inline">Favourites</span>
              </Link>

              {/* Cart with live count */}
              <button
                onClick={() => setCartOpen(true)}
                className="flex flex-col items-center text-[10px] sm:text-xs hover:text-gray-600 relative"
                aria-label="Cart"
              >
                <ShoppingBag size={20} className="sm:w-[22px] sm:h-[22px]" />
                <span className="mt-1">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 sm:-right-3 bg-[#C17A56] text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation – MegaMenu on large screens */}
        <div className="border-t border-gray-200 text-[#000]">
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 xl:gap-12 my-2 mx-2 text-xs sm:text-sm md:text-[14px] xl:text-[15px">
              <MegaMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Overlay for mobile menu */}
      <div
        onClick={() => setMobileMenu(false)}
        className={`fixed inset-0 z-40 bg-black/50 transition-all duration-300 ${
          mobileMenu ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transition-transform duration-300 overflow-x-auto ${
          mobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b p-5">
          <h3 className="text-lg font-semibold">Menu</h3>
          <button onClick={() => setMobileMenu(false)}>
            <X />
          </button>
        </div>

        {/* Search inside drawer */}
        <div className="p-5 border-b">
          <div className="flex items-center border rounded-md px-3">
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-2 outline-none"
            />
            <Search size={18} />
          </div>
        </div>

        {/* Menu links */}
        <nav className="flex flex-col">
          {megaMenuData.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenu(false)}
              className="border-b px-5 py-4 text-base hover:bg-gray-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom links */}
        <div className="mt-auto border-t p-5 flex flex-col gap-4">
          <Link
            href="/stores"
            onClick={() => setMobileMenu(false)}
            className="flex items-center gap-2 hidden"
          >
            <MapPin size={18} />
            Find A Store
          </Link>

          <Link
            href="/track-order"
            onClick={() => setMobileMenu(false)}
            className="flex items-center gap-2 hidden"
          >
            <Package size={18} />
            Track Order
          </Link>

          <Link
            href={auth ? (auth.role === "admin" ? "/admin/dashboard" : "/my-account") : "/auth/login"}
            onClick={() => setMobileMenu(false)}
            className="flex items-center gap-2"
          >
            <User size={18} />
            {auth ? "My Account" : "Sign In"}
          </Link>

          <Link
            href="/wishlist"
            onClick={() => setMobileMenu(false)}
            className="flex items-center gap-2"
          >
            <Heart size={18} />
            Favourites
          </Link>

          <Link
            href="/cart"
            onClick={() => setMobileMenu(false)}
            className="flex items-center gap-2"
          >
            <ShoppingBag size={18} />
            Cart
          </Link>

          {auth && (
            <button
              onClick={() => {
                handleLogout();
                setMobileMenu(false);
              }}
              className="flex items-center gap-2 text-left text-red-600 hover:text-red-800"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}