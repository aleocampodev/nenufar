'use client';

import Image from 'next/image';
import { ScissorsIcon, HeartCircleIcon, YarnIcon, BrushIcon } from './icons';

const features = [
  { title: 'NEW IDEAS', icon: ScissorsIcon, body: 'Lorem ipsum dolor sit amet a con sectet adipisicing elit se do eiuso tempor incidid unt ut labore et.' },
  { title: 'PASSION-DRIVEN', icon: HeartCircleIcon, body: 'Lorem ipsum dolor sit amet a con sectet adipisicing elit se do eiuso tempor incidid unt ut labore et.' },
  { title: 'ORGANIC', icon: YarnIcon, body: 'Lorem ipsum dolor sit amet a con sectet adipisicing elit se do eiuso tempor incidid unt ut labore et.' },
  { title: 'VIVID COLORS', icon: BrushIcon, body: 'Lorem ipsum dolor sit amet a con sectet adipisicing elit se do eiuso tempor incidid unt ut labore et.' },
];

export function FeaturesSplitSection() {
  return (
    <section className="flex w-full min-h-[520px]">
      <div className="relative flex-shrink-0 w-1/2 overflow-hidden">
        <Image src="/images/features-woman.jpg" alt="" fill className="object-cover object-center" />
      </div>
      <div className="flex-1 bg-[#f4f2ee] px-[60px] py-[80px] flex items-center">
        <div className="w-full grid grid-cols-2 gap-y-[50px] gap-x-[40px]">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i}>
                <Icon className="w-10 h-10 text-[#58595b] mb-4 block" />
                <h4 className="font-heading text-[16px] font-normal tracking-[3px] text-[#a55e3f] uppercase mb-3">
                  {feature.title}
                </h4>
                <p className="font-body text-[14px] text-[#58595b] leading-[1.7]">{feature.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
