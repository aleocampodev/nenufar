'use client';

import Image from 'next/image';

const team = [
  { name: 'JANET CONN', role: 'Painter', image: '/images/team-1.jpg' },
  { name: 'HANNAH JUDI', role: 'Blogger', image: '/images/team-2.jpg' },
  { name: 'MIKE THOMSEN', role: 'Agent', image: '/images/team-3.jpg' },
];

export function TeamSection() {
  return (
    <section className="w-full bg-white py-[80px] px-[40px] text-center">
      <h2 className="font-heading text-[32px] font-normal text-[#a55e3f] uppercase tracking-[5px] mb-2">
        THE PEOPLE BEHIND THE SCENE
      </h2>
      <p className="font-heading text-[15px] italic text-[#a55e3f] mb-[60px]">Only the best professionals</p>
      <div className="max-w-[1100px] mx-auto grid grid-cols-3 gap-[30px]">
        {team.map((member, i) => (
          <div key={i}>
            <div className="relative w-full aspect-[3/4] mb-6 overflow-hidden">
              <Image src={member.image} alt={member.name} fill className="object-cover object-top" />
            </div>
            <h4 className="font-body text-[11px] font-600 tracking-[3px] text-[#a55e3f] uppercase mb-1">
              {member.name}
            </h4>
            <p className="font-body text-[14px] text-[#58595b] mb-3">{member.role}</p>
            <div className="flex justify-center gap-4">
              <a href="#" className="text-[#2c3a6b] font-bold">f</a>
              <a href="#" className="text-[#2c3a6b] font-bold">in</a>
              <a href="#" className="text-[#2c3a6b] font-bold">tw</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
