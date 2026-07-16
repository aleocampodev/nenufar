import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShopMasonryGrid } from "@/components/ShopMasonryList/ShopMasonryGrid";

export const metadata: Metadata = {
  title: "Tienda — Nénufar",
  description: "Catálogo de joyería hecha a mano por Shirley.",
};

export default function MasonryListPage() {
  return (
    <main>
      <Navbar />

      {/* Masonry Grid */}
      <section className="w-full bg-white">
        <ShopMasonryGrid />
      </section>

      <Footer />
    </main>
  );
}
