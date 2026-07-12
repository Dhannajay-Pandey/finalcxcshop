"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
  className?: string;
}

export default function SearchBar({ className = "" }: SearchBarProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!search.trim()) return;

    router.push(`/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`flex items-center border-b border-gray-300 w-full ${className}`.trim()}
    >
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 py-3 outline-none bg-transparent text-sm"
      />

      <button type="submit" className="p-2">
        <Search size={20} />
      </button>
    </form>
  );
}