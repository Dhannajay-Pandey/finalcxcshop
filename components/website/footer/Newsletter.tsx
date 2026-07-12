// components/footer/Newsletter.tsx
"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <div className="border-b border-white/10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg sm:text-xl font-serif mb-1">Stay in the Loop</h3>
          <p className="text-xs sm:text-sm text-white/60">
            New arrivals, exclusive offers — straight to your inbox.
          </p>
        </div>
        <form className="flex w-full md:w-auto" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="bg-white/10 text-white placeholder:text-white/40 text-xs sm:text-sm px-4 py-3 outline-none flex-1 md:w-64 lg:w-72 border border-white/20 min-w-0"
            required
          />
          <button
            type="submit"
            className="bg-[#C17A56] hover:bg-[#a8663f] px-4 py-3 transition-colors shrink-0"
            aria-label="Subscribe"
          >
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}