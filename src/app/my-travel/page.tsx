import type { Metadata } from "next";
import { MyTravelPage } from "@/components/my-travel/my-travel-page";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "My Travel",
  description: "Track your personal flight routes and travel history.",
};

export default function MyTravel() {
  return <MyTravelPage />;
}
