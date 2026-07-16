"use client";

import { useState } from "react";
import Image from "next/image";
import { LeafIcon } from "@/components/icons";

const allProducts = [
  { img: "/images/product-5.jpg", name: "WOOL SCARF", category: "Clothing accessories", price: "$37.99" },
  { img: "/images/product-6.jpg", name: "CINNAMON ALBA", category: "Organic food", price: "$37.99" },
  { img: "/images/product-7.jpg", name: "DARK CHOCOLATE", category: "Organic food", price: "$17.99" },
  { img: "/images/product-8.jpg", name: "WIND CHIMES", category: "Home Decor", price: "$44.99" },
  { img: "/images/product-1.jpg", name: "CRAFT KIT", category: "Accessories", price: "$24.99" },
  { img: "/images/product-2.jpg", name: "ART BOOK", category: "Books", price: "$29.99" },
  { img: "/images/product-3.jpg", name: "CLAY SET", category: "Pottery", price: "$34.99" },
  { img: "/images/product-4.jpg", name: "WOOD PIECE", category: "Home Decor", price: "$19.99" },
];

const ITEMS_PER_SLIDE = 4;
const TOTAL_SLIDES = Math.ceil(allProducts.length / ITEMS_PER_SLIDE);

export function ProductsCarousel() {
  const [slide, setSlide] = useState(0);

  const visibleProducts = allProducts.slice(
    slide * ITEMS_PER_SLIDE,
    slide * ITEMS_PER_SLIDE + ITEMS_PER_SLIDE
  );

  const prev = () => setSlide((s) => Math.max(0, s - 1));
  const next = () => setSlide((s) => Math.min(TOTAL_SLIDES - 1, s + 1));

  return (
    <section style={{ background: "white", padding: "80px 0 100px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "16px", color: "#2c3a6b", display: "flex", justifyContent: "center" }}>
        <LeafIcon />
      </div>

      <h2
        style={{
          fontFamily: "Alegreya, serif",
          fontSize: "32px",
          textTransform: "uppercase",
          letterSpacing: "5px",
          color: "#a55e3f",
          textAlign: "center",
          fontWeight: 400,
          marginBottom: "8px",
        }}
      >
        MOST POPULAR PRODUCTS
      </h2>

      <p
        style={{
          fontFamily: "Alegreya, serif",
          fontSize: "15px",
          fontStyle: "italic",
          color: "#a55e3f",
          textAlign: "center",
          marginBottom: "60px",
        }}
      >
        Bestselling in december
      </p>

      {/* Carousel wrapper */}
      <div style={{ position: "relative", padding: "0 60px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Prev arrow */}
        <button
          onClick={prev}
          disabled={slide === 0}
          aria-label="Previous products"
          style={{
            position: "absolute",
            left: 0,
            top: "40%",
            transform: "translateY(-50%)",
            fontFamily: "Lato, sans-serif",
            fontSize: "30px",
            color: "#58595b",
            background: "none",
            border: "none",
            cursor: slide === 0 ? "default" : "pointer",
            opacity: slide === 0 ? 0.3 : 1,
            lineHeight: 1,
          }}
        >
          ‹
        </button>

        {/* Products grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "30px",
          }}
        >
          {visibleProducts.map((product, idx) => (
            <div key={`${slide}-${idx}`} style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "280px",
                  marginBottom: "20px",
                }}
              >
                <Image
                  src={product.img}
                  alt={product.name}
                  width={260}
                  height={260}
                  style={{
                    maxHeight: "260px",
                    objectFit: "contain",
                    width: "auto",
                  }}
                />
              </div>

              <p
                style={{
                  fontFamily: "Alegreya, serif",
                  fontSize: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "3px",
                  color: "#a55e3f",
                  marginBottom: "4px",
                  fontWeight: 400,
                }}
              >
                {product.name}
              </p>

              <p
                style={{
                  fontFamily: "Lato, sans-serif",
                  fontSize: "13px",
                  color: "#58595b",
                  marginBottom: "4px",
                }}
              >
                {product.category}
              </p>

              <p
                style={{
                  fontFamily: "Lato, sans-serif",
                  fontSize: "14px",
                  color: "#58595b",
                }}
              >
                {product.price}
              </p>
            </div>
          ))}
        </div>

        {/* Next arrow */}
        <button
          onClick={next}
          disabled={slide === TOTAL_SLIDES - 1}
          aria-label="Next products"
          style={{
            position: "absolute",
            right: 0,
            top: "40%",
            transform: "translateY(-50%)",
            fontFamily: "Lato, sans-serif",
            fontSize: "30px",
            color: "#58595b",
            background: "none",
            border: "none",
            cursor: slide === TOTAL_SLIDES - 1 ? "default" : "pointer",
            opacity: slide === TOTAL_SLIDES - 1 ? 0.3 : 1,
            lineHeight: 1,
          }}
        >
          ›
        </button>
      </div>
    </section>
  );
}
