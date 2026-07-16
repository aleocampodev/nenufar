'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ZigzagSVG } from './icons';

const stats = [
  { value: 2345, label: 'Items sold' },
  { value: 521, label: 'Happy customers' },
  { value: 1283, label: 'Different products' },
  { value: 331, label: 'Media reviews' },
];

function CountUp({ target, isVisible }: { target: number; isVisible: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let frame = 0;
    const total = 80;
    const timer = setInterval(() => {
      frame++;
      setCount(Math.round((frame / total) * target));
      if (frame >= total) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [isVisible, target]);
  return <>{count}</>;
}

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden">
      <Image src="/images/stats-bg.jpg" alt="" fill className="object-cover" />
      <div className="absolute top-0 left-0 w-full h-4 z-10">
        <ZigzagSVG color="white" />
      </div>
      <div className="relative z-20 px-[40px] py-[100px] pb-[80px] max-w-[1100px] mx-auto flex justify-around items-center">
        {stats.map((stat, i) => (
          <div key={i} className="text-center">
            <div className="font-body text-[72px] font-light text-white/75 tracking-[8px] leading-none mb-3">
              <CountUp target={stat.value} isVisible={visible} />
            </div>
            <p className="font-body text-[13px] font-light text-white/70 tracking-[2px]">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
