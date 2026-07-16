"use client";

import { useState } from "react";
import Image from "next/image";
import { LeafIcon } from "@/components/icons";

const testimonials = [
  {
    quote:
      "Domeus nisi ut aliquip excom modo conse. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor dunt ut te dolore magna aliqua ut enim minim veniam quis nostrud exercitation ullamco. Duis aute irure dolor in repre henderit in voluptate enim miin dortui sedio.",
    image: "/images/testimonials-1.png",
    name: "HIN LING",
    role: "Designer",
  },
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor dunt ut te dolore magna aliqua ut enim minim veniam quis nostrud exercitation ullamco. Duis aute irure dolor in repre henderit in voluptate enim miin dortui sedio.",
    image: "/images/testimonials-2.png",
    name: "ANNA MARIE",
    role: "Illustrator",
  },
  {
    quote:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    image: "/images/testimonials-3.png",
    name: "SARAH CROSS",
    role: "Artist",
  },
];

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  return (
    <section
      style={{
        background: "white",
        padding: "100px 40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative blush pink blob - left */}
      <div
        style={{
          position: "absolute",
          left: "-100px",
          top: "20%",
          width: "300px",
          height: "400px",
          background: "rgba(217,184,176,0.3)",
          borderRadius: "60% 40% 50% 70%/50% 60% 40% 70%",
          pointerEvents: "none",
        }}
      />
      {/* Decorative sage blob - right */}
      <div
        style={{
          position: "absolute",
          right: "-80px",
          bottom: "10%",
          width: "250px",
          height: "350px",
          background: "rgba(181,191,160,0.3)",
          borderRadius: "40% 60% 70% 50%/60% 50% 40% 70%",
          pointerEvents: "none",
        }}
      />

      <div style={{ color: "#2c3a6b", marginBottom: "20px", display: "flex", justifyContent: "center" }}>
        <LeafIcon />
      </div>

      <h2
        style={{
          fontFamily: "Alegreya, serif",
          fontSize: "32px",
          color: "#a55e3f",
          textTransform: "uppercase",
          letterSpacing: "5px",
          marginBottom: "40px",
          fontWeight: 400,
        }}
      >
        THEY SAID ABOUT US
      </h2>

      <p
        style={{
          fontFamily: "Alegreya, serif",
          fontSize: "16px",
          fontStyle: "italic",
          color: "#58595b",
          maxWidth: "700px",
          margin: "0 auto 40px",
          lineHeight: 1.8,
        }}
      >
        {testimonials[current].quote}
      </p>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <Image
          src={testimonials[current].image}
          width={180}
          height={180}
          alt={testimonials[current].name}
          style={{ objectFit: "contain" }}
        />
      </div>

      <p
        style={{
          fontFamily: "Lato, sans-serif",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "#58595b",
          marginTop: "20px",
          marginBottom: "4px",
        }}
      >
        {testimonials[current].name}
      </p>

      <p
        style={{
          fontFamily: "Lato, sans-serif",
          fontSize: "14px",
          color: "#58595b",
        }}
      >
        {testimonials[current].role}
      </p>

      {/* Nav lines (right side) */}
      <div
        style={{
          position: "absolute",
          right: "60px",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to testimonial ${i + 1}`}
            style={{
              width: i === current ? 40 : 25,
              height: "2px",
              background: i === current ? "#a55e3f" : "#58595b",
              border: "none",
              cursor: "pointer",
              transition: "width 0.3s",
              padding: 0,
            }}
          />
        ))}
      </div>
    </section>
  );
}
