"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { User, ShoppingBag, MapPin, Settings, LogOut, Package, Heart, CreditCard, ChevronRight, Edit2, Check } from "lucide-react";
import { logout } from "@/store/reducer/authReducer";
import { persistor } from "@/store/store";

export default function MyAccount() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.authStore.auth);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      router.push("/auth/login");
      return;
    }
    fetchData();
  }, [activeTab, auth, router]);

  const fetchData = async () => {
    if (!auth) return;
    try {
      setLoading(true);

      if (activeTab === "orders") {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.data || []);
        }
      } else if (activeTab === "addresses") {
        const res = await fetch("/api/user/addresses");
        if (res.ok) {
          const data = await res.json();
          setAddresses(data.data || []);
        }
      } else if (activeTab === "wishlist") {
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const data = await res.json();
          setWishlist(data.data?.items || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    dispatch(logout());
    await persistor.purge();
    window.location.href = "/";
  };

  const handleRemoveFromWishlist = async (productId) => {
    if (!auth) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Failed to remove from wishlist:", data.message || res.statusText);
        return;
      }

      setWishlist(data.data?.items || wishlist.filter((item) => item.product?._id !== productId));
    } catch (error) {
      console.error("Error removing wishlist item:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4 sm:px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-wide">My Account</h1>
          <p className="text-[#1A1A1A]/60 mt-2">Welcome back, {auth?.name || "User"}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
              {/* User Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#C17A56] flex items-center justify-center text-white font-bold text-lg">
                  {auth?.name?.[0] || "U"}
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">{auth?.name || "User"}</p>
                  <p className="text-xs text-[#1A1A1A]/60">{auth?.email || "user@example.com"}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? "bg-[#C17A56] text-white"
                          : "text-[#1A1A1A]/70 hover:bg-gray-50 hover:text-[#1A1A1A]"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm font-medium tracking-wide">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-xl text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium tracking-wide">Logout</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-[#1A1A1A]">Profile Information</h2>
                  <button className="flex items-center gap-2 text-[#C17A56] hover:text-[#A06245] transition-colors">
                    <Edit2 size={16} />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A]/60 mb-2">Full Name</label>
                    <p className="text-[#1A1A1A] font-medium">{auth?.name || "John Doe"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A]/60 mb-2">Email Address</label>
                    <p className="text-[#1A1A1A] font-medium">{auth?.email || "john@example.com"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A]/60 mb-2">Phone Number</label>
                    <p className="text-[#1A1A1A] font-medium">{auth?.phone || "+91 98765 43210"}</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A]/60 mb-2">Current Password</label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C17A56] focus:ring-2 focus:ring-[#C17A56]/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A]/60 mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C17A56] focus:ring-2 focus:ring-[#C17A56]/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button className="mt-4 px-6 py-3 bg-[#C17A56] text-white rounded-xl font-medium hover:bg-[#A06245] transition-colors">
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-semibold text-[#1A1A1A] mb-6">Order History</h2>

                {loading ? (
                  <div className="text-center py-8 text-[#1A1A1A]/60">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-[#1A1A1A]/60">No orders found</div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-gray-100 rounded-xl p-4 hover:border-[#C17A56]/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
                              <Package size={20} className="text-[#C17A56]" />
                            </div>
                            <div>
                              <p className="font-semibold text-[#1A1A1A]">ORD-{order._id.slice(-6)}</p>
                              <p className="text-sm text-[#1A1A1A]/60">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="font-semibold text-[#1A1A1A]">₹{order.totalAmount.toLocaleString()}</p>
                              <p className="text-sm text-[#1A1A1A]/60">{order.items.length} items</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === "Delivered" ? "bg-green-100 text-green-700" :
                                order.status === "Shipped" ? "bg-blue-100 text-blue-700" :
                                order.status === "Processing" ? "bg-yellow-100 text-yellow-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>
                                {order.status}
                              </span>
                              <ChevronRight size={16} className="text-[#1A1A1A]/40" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-[#1A1A1A]">Saved Addresses</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#C17A56] text-white rounded-xl font-medium hover:bg-[#A06245] transition-colors">
                    <MapPin size={16} />
                    <span className="text-sm">Add New</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-8 text-[#1A1A1A]/60">No addresses saved</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address, idx) => (
                      <div key={idx} className="border border-gray-100 rounded-xl p-4 hover:border-[#C17A56]/30 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-[#1A1A1A]">{address.type}</span>
                            {address.isDefault && (
                              <span className="flex items-center gap-1 text-xs text-[#C17A56]">
                                <Check size={12} />
                                Default
                              </span>
                            )}
                          </div>
                          <button className="text-[#1A1A1A]/40 hover:text-[#C17A56] transition-colors">
                            <Edit2 size={16} />
                          </button>
                        </div>
                        <p className="font-medium text-[#1A1A1A]">{address.name}</p>
                        <p className="text-sm text-[#1A1A1A]/70 mt-1">{address.address}</p>
                        <p className="text-sm text-[#1A1A1A]/70">{address.city}, {address.state} - {address.pincode}</p>
                        <p className="text-sm text-[#1A1A1A]/70 mt-1">{address.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-semibold text-[#1A1A1A] mb-6">My Wishlist</h2>

                {loading ? (
                  <div className="text-center py-8 text-[#1A1A1A]/60">Loading wishlist...</div>
                ) : wishlist.length === 0 ? (
                  <div className="text-center py-8 text-[#1A1A1A]/60">Your wishlist is empty</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((item) => (
                      <div key={item._id} className="border border-gray-100 rounded-xl overflow-hidden hover:border-[#C17A56]/30 transition-colors group">
                        <div className="relative aspect-square bg-gray-50">
                          {item.product?.images?.[0]?.url ? (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#1A1A1A]/20">
                              <Package size={48} />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveFromWishlist(item.product?._id)}
                            className="absolute top-3 right-3 rounded-full bg-white p-2 shadow-sm text-[#1A1A1A] hover:bg-[#C17A56] hover:text-white transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-[#1A1A1A] text-sm">{item.product?.name || "Product"}</h3>
                          <div className="flex items-center justify-between mt-2">
                            <p className="font-semibold text-[#C17A56]">
                              ₹{(item.product?.salePrice || item.product?.price || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-semibold text-[#1A1A1A] mb-6">Account Settings</h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                        <CreditCard size={20} className="text-[#C17A56]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1A1A]">Payment Methods</p>
                        <p className="text-sm text-[#1A1A1A]/60">Manage your saved cards</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-[#1A1A1A]/40" />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                        <MapPin size={20} className="text-[#C17A56]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1A1A]">Shipping Preferences</p>
                        <p className="text-sm text-[#1A1A1A]/60">Default shipping address</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-[#1A1A1A]/40" />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Settings size={20} className="text-[#C17A56]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1A1A]">Notification Settings</p>
                        <p className="text-sm text-[#1A1A1A]/60">Email and push notifications</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-[#1A1A1A]/40" />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                        <User size={20} className="text-[#C17A56]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1A1A]">Privacy Settings</p>
                        <p className="text-sm text-[#1A1A1A]/60">Data and privacy controls</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-[#1A1A1A]/40" />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Danger Zone</h3>
                  <button className="px-6 py-3 border border-red-200 text-red-500 rounded-xl font-medium hover:bg-red-50 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}