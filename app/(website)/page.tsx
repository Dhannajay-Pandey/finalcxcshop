import HeroSlider from "@/components/website/HeroSlider";
import PromiseStrip from "@/components/website/PromiseStrip";
import CategoryGrid from "@/components/website/CategoryGrid";
import HomePageCenterItem from "@/components/website/HomePageCenterItem";
import ProductGrid from "@/components/website/ProductGrid";
import HomePageDesignCrew from "@/components/website/header/HomePageDesignCrew";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <HeroSlider />
      <PromiseStrip />
      <CategoryGrid />
      <HomePageCenterItem />
      <ProductGrid />
      <HomePageDesignCrew
        imageSrc="/assets/images/gettotouch.png"
        imageAlt="Interior design consultation"
      />
    </>
  );
}