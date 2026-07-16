"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const slides = [
  {
    image: "/images/main-rev-img-1.jpg",
    title: "HANDCRAFTED JUST FOR YOU",
    description:
      "Welcome to Krafti, a jaunty little theme we made specifically for your new arts & crafts or handicraft website! We made sure Krafti's got absolutely everything covered.",
  },
  {
    image: "/images/main-rev-img-2.jpg",
    title: "BUILDING NEW EXPERIENCES",
    description:
      "Krafti comes with a captivating template collection that covers all of your needs — just pick the one you like the most and start creating your own online story.",
  },
  {
    image: "/images/main-rev-img-3.jpg",
    title: "DEDICATED TO WHAT WE DO",
    description:
      "With Krafti you can get your site up and running in no time. From customizing layouts to showcasing your work, everything is designed to feel natural and intuitive.",
  },
];

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "961px",
        overflow: "hidden",
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === activeSlide ? 1 : 0,
            transition: "opacity 0.6s ease",
            pointerEvents: i === activeSlide ? "auto" : "none",
          }}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={i === 0}
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 40px",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "81px",
            fontWeight: 500,
            color: "white",
            letterSpacing: "7px",
            lineHeight: "90px",
            margin: 0,
            marginBottom: "24px",
          }}
        >
          {slides[activeSlide].title}
        </h1>

        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "20px",
            fontWeight: 300,
            fontStyle: "italic",
            color: "white",
            lineHeight: "30px",
            maxWidth: "715px",
            margin: 0,
            marginBottom: "40px",
          }}
        >
          {slides[activeSlide].description}
        </p>

        <a
          href="#"
          style={{
            display: "inline-block",
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            fontWeight: 400,
            letterSpacing: "3.3px",
            textTransform: "uppercase",
            color: "white",
            background: "#0d1e64",
            padding: "15px 49px",
            lineHeight: "22px",
            textDecoration: "none",
          }}
        >
          View more
        </a>
      </div>

      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        style={{
          position: "absolute",
          left: "40px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "white",
          fontSize: "36px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          opacity: 0.6,
          lineHeight: 1,
        }}
      >
        ‹
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        style={{
          position: "absolute",
          right: "40px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "white",
          fontSize: "36px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          opacity: 0.6,
          lineHeight: 1,
        }}
      >
        ›
      </button>

      <div
        style={{
          position: "absolute",
          bottom: "30px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
        }}
      >
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            style={{
              width: "30px",
              height: "2px",
              background:
                activeSlide === index ? "white" : "rgba(255,255,255,0.5)",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>
    </section>
  );
}
