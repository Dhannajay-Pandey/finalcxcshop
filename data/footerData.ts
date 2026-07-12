// data/footerData.ts

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  icon: string; // or React component type
  href: string;
  label: string;
}

export const footerLinks: FooterSection[] = [
  {
    title: "Shop",
    links: [
      { label: "New", href: "/category/New" },
      { label: "Decor", href: "/category/Decor" },
      { label: "Home Fragrance", href: "/category/Home Fragrance" },
      { label: "Bakhoor & Incense", href: "/category/bakhoor-incense" },
      { label: "Tabletop & Bar", href: "/category/tabletop-bar" },
      { label: "Outdoor", href: "/category/outdoor" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track Order", href: "/track-order" },
      { label: "Returns & Exchanges", href: "/returns-exchanges" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      // { label: "Sustainability", href: "/sustainability" },
      { label: "Terms of Service", href: "/terms-of-service" },
     
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
];

export const socialLinks = [
  { icon: "FaInstagram", href: "https://instagram.com", label: "Instagram" },
  { icon: "FaXTwitter", href: "https://twitter.com", label: "Twitter" },
  { icon: "FaFacebookF", href: "https://facebook.com", label: "Facebook" },
];

export const legalLinks = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
];

export const footerConfig = {
  brandName: "Cosmopolitan Xccessories",
  brandDescription: "A curated blend of fashion and home — crafted for the way you live.",
  newsletterTitle: "Stay in the Loop",
  newsletterDescription: "New arrivals, exclusive offers — straight to your inbox.",
  newsletterPlaceholder: "Your email address",
};