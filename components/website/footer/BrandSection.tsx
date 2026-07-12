// components/footer/BrandSection.tsx

import SocailLink from "./SocialLink";

export function BrandSection() {
 

  return (
    <div className="col-span-2 md:col-span-1">
      <p className="text-base sm:text-lg tracking-[0.2em] uppercase font-bold mb-3">
        Cosmopolitan Xccessories
      </p>
      <p className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-[220px]">
        A curated blend of fashion and home — crafted for the way you live.
      </p>
      <div className="flex gap-4 mt-5">
      <SocailLink />
      </div>
    </div>
  );
}