'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ImageWrapperProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
}

function ImageWrapper({ src, alt, style }: ImageWrapperProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        style={{
          objectFit: 'cover',
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
          transition: 'transform 0.4s ease',
        }}
      />
    </div>
  );
}

export function PortfolioGrid() {
  return (
    <section style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px',
        }}
      >
        {/* Large left image spanning 2 rows */}
        <ImageWrapper
          src="/images/portfolio-1.jpg"
          alt="Chocolates food art"
          style={{
            gridRow: 'span 2',
            aspectRatio: '1 / 1.2',
          }}
        />

        {/* Right 2×2 subgrid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '4px',
          }}
        >
          <ImageWrapper
            src="/images/portfolio-2.jpg"
            alt="Green leaves"
            style={{ aspectRatio: '1 / 1' }}
          />
          <ImageWrapper
            src="/images/portfolio-3.jpg"
            alt="Abstract book"
            style={{ aspectRatio: '1 / 1' }}
          />
          <ImageWrapper
            src="/images/portfolio-4.jpg"
            alt="Orange box"
            style={{ aspectRatio: '1 / 1' }}
          />
          <ImageWrapper
            src="/images/portfolio-5.jpg"
            alt="Coral text"
            style={{ aspectRatio: '1 / 1' }}
          />
        </div>
      </div>
    </section>
  );
}
