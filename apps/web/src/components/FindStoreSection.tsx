'use client';

import { useState } from 'react';

const stores = [
  { title: 'STORE 1', locations: [{ area: 'Soho, New York', addr: '123 E 7th St' }, { area: 'Murray Hills, New York', addr: '345 E 7th St' }] },
  { title: 'STORE 2', locations: [{ area: 'Chelsea, New York', addr: '123 E 7th St' }, { area: 'Astoria North, New York', addr: '345 E 7th St' }] },
  { title: 'STORE 3', locations: [{ area: 'Kips Bay, New York', addr: '123 E 7th St' }, { area: 'Koreatown, New York', addr: '345 E 7th St' }] },
  { title: 'STORE 4', locations: [{ area: 'Stuy Town, New York', addr: '123 E 7th St' }, { area: 'Hudson, New York', addr: '345 E 7th St' }] },
];

export function FindStoreSection() {
  const [email, setEmail] = useState('');

  return (
    <section className="w-full bg-white px-[40px] py-[100px] text-center relative overflow-hidden">
      {/* Blush pink blob */}
      <div
        className="absolute -left-[100px] top-[20%] w-[300px] h-[400px] pointer-events-none"
        style={{
          background: 'rgba(217,184,176,0.3)',
          borderRadius: '60% 40% 50% 70%/50% 60% 40% 70%',
        }}
      />
      {/* Sage green blob */}
      <div
        className="absolute -right-[80px] bottom-[10%] w-[250px] h-[350px] pointer-events-none"
        style={{
          background: 'rgba(181,191,160,0.3)',
          borderRadius: '40% 60% 70% 50%/60% 50% 40% 70%',
        }}
      />

      <h2 className="font-heading text-[32px] font-normal text-[#a55e3f] uppercase tracking-[5px] mb-2">
        FIND OUR STORE
      </h2>
      <p className="font-heading text-[15px] italic text-[#a55e3f] mb-[60px]">Get in touch</p>

      <div className="max-w-[1100px] mx-auto border border-[#e0ddd8]">
        {/* Header row */}
        <div className="grid grid-cols-4 border-b border-[#e0ddd8]">
          {stores.map((store, i) => (
            <div key={i} className="px-[30px] py-5 text-left border-r border-[#e0ddd8] font-body text-[11px] font-600 tracking-[3px] text-[#58595b] uppercase">
              {store.title}
            </div>
          ))}
        </div>

        {/* Content row */}
        <div className="grid grid-cols-4 border-b border-[#e0ddd8]">
          {stores.map((store, i) => (
            <div key={i} className="px-[30px] py-[30px] text-left border-r border-[#e0ddd8]">
              {store.locations.map((loc, j) => (
                <p key={j} className="font-body text-[14px] text-[#58595b] leading-[1.8] mb-4 last:mb-0">
                  {loc.area}<br />{loc.addr}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* Email row */}
        <div className="flex border-t border-[#e0ddd8]">
          <input
            type="email"
            placeholder="Your Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-[30px] py-5 border-none font-heading text-[16px] italic text-[#58595b] outline-none bg-white"
          />
          <button
            className="min-w-[200px] px-[30px] py-5 font-body text-[11px] font-600 tracking-[3px] text-white uppercase border-none cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #2c3a6b 50%, #a55e3f 50%)',
            }}
          >
            SEND
          </button>
        </div>
      </div>
    </section>
  );
}
