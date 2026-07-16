'use client';

import { useState, useEffect, useRef } from 'react';

const skills = [
  { name: 'Furniture', pct: 36, color: '#a55e3f' },
  { name: 'Organic Food', pct: 48, color: '#2c3a6b' },
  { name: 'Handmade', pct: 44, color: '#6b4c3b' },
  { name: 'Crafts', pct: 29, color: '#8a8a3a' },
];

export function SkillsSection() {
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
    <section ref={sectionRef} className="w-full bg-white px-[40px] py-[80px]">
      <div className="max-w-[1140px] mx-auto flex gap-[80px] items-center">
        <div className="flex-1">
          <p className="font-heading text-[15px] italic text-[#a55e3f] mb-4">The best industry practices</p>
          <h2 className="font-heading text-[36px] font-normal text-[#a55e3f] uppercase tracking-[4px] leading-[1.3] mb-8">
            A TRULY HANDCRAFTED AND DESIGNED EXPERIENCES MADE FOR EVERYBODY'S TASTE
          </h2>
          <button className="inline-block px-10 py-[14px] border border-[#58595b] font-body text-[11px] font-600 tracking-[3px] text-[#58595b] uppercase bg-transparent cursor-pointer">
            VIEW MORE
          </button>
        </div>
        <div className="flex-1">
          {skills.map((skill, i) => (
            <div key={i} className="mb-[28px]">
              <div className="flex justify-between mb-2">
                <span className="font-heading text-[16px] italic text-[#58595b]">{skill.name}</span>
                <span className="font-body text-[13px] text-[#58595b]">{skill.pct}%</span>
              </div>
              <div className="h-[2px] bg-[#e0ddd8]">
                <div
                  className="h-[2px] transition-all duration-[1200ms] ease-out"
                  style={{
                    width: visible ? `${skill.pct}%` : '0%',
                    backgroundColor: skill.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
