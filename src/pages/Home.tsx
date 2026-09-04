/*
import Hero from "../components/home/Hero";
import OurStory from "../components/home/OurStory";
import WhyTwoShades from "../components/home/WhyTwoShades";
import SeasonalSpecial from "../components/home/SeasonalSpecial";
import Reviews from "../components/home/Reviews";
import CommunityGallery from "../components/home/CommunityGallery";
import VisitUs from "../components/home/VisitUs";

export default function Home() {
  return (
    <>
      <Hero />
      <OurStory />
      <WhyTwoShades />
      <SeasonalSpecial />
      <CommunityGallery />
      <Reviews />
      <VisitUs />
    </>
  );
}
  */
import { lazy, Suspense } from "react";

import Hero from "../components/home/Hero";

import ReviewsSection from "../components/home/ReviewsSection";
import CustomerPhotoSection from "../components/home/CustomerPhotoSection";


const OurStory = lazy(() => import("../components/home/OurStory"));
const WhyTwoShades = lazy(
  () => import("../components/home/WhyTwoShades")
);
const SeasonalSpecial = lazy(
  () => import("../components/home/SeasonalSpecial")
);
const Reviews = lazy(() => import("../components/home/Reviews"));
const CommunityGallery = lazy(
  () => import("../components/home/CommunityGallery")
);
const VisitUs = lazy(() => import("../components/home/VisitUs"));

export default function Home() {
  return (
    <>
      <Hero />

      <Suspense fallback={null}>
        <OurStory />
        <WhyTwoShades />
        <SeasonalSpecial />
        <CustomerPhotoSection />
        <ReviewsSection />
        <VisitUs />
      </Suspense>
    </>
  );
}

/* old ones
 <Reviews />
 <CommunityGallery /> */