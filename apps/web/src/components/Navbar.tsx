"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ZigzagSVG, HamburgerIcon } from "@/components/icons";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "BLOG", href: "/blog-home" },
  { label: "SHOP", href: "/product-list/masonry-list" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 110,
        background: "white",
        boxShadow: scrolled ? "0 2px 15px rgba(0,0,0,0.08)" : "none",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "92px",
          padding: "0 40px",
          maxWidth: "100%",
          width: "100%",
        }}
      >
        {/* Logo */}
        <a href="/" aria-label="Krafti home">
          <Image
            src="/images/main-logo.png"
            alt="Krafti"
            width={156}
            height={50}
            priority
          />
        </a>

        {/* Nav links */}
        <nav aria-label="Main navigation">
          <ul
            style={{
              display: "flex",
              alignItems: "center",
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "3.08px",
                    textTransform: "uppercase",
                    color: pathname === link.href ? "#a55e3f" : "#58595b",
                    padding: "0 20px",
                    textDecoration: "none",
                    display: "inline-block",
                    borderBottom: pathname === link.href ? "1px solid #a55e3f" : "none",
                    paddingBottom: pathname === link.href ? "2px" : "0",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "#a55e3f";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = pathname === link.href
                      ? "#a55e3f"
                      : "#58595b";
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: Cart + Hamburger */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <a
            href="/cart"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "3.08px",
              textTransform: "uppercase",
              color: "#58595b",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#a55e3f";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#58595b";
            }}
          >
            CART(0)
          </a>
          <button
            aria-label="Open menu"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <HamburgerIcon />
          </button>
        </div>
      </div>

      {/* White zigzag border at bottom of header */}
      <ZigzagSVG color="white" />
    </header>
  );
}
