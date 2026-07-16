'use client';

import Image from 'next/image';

export function CTABanner() {
  return (
    <section className="relative w-full h-[480px] overflow-hidden">
      <Image src="/images/cta-banner.jpg" alt="" fill className="object-cover object-center" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="px-20 py-[30px] bg-[rgb(106,60,43)] text-white font-heading text-[23px] font-500 uppercase tracking-[3.795px] text-center"
          style={{
            clipPath: 'polygon(0% 15%, 3% 0%, 6% 15%, 9% 0%, 12% 15%, 15% 0%, 18% 15%, 21% 0%, 24% 15%, 27% 0%, 30% 15%, 33% 0%, 36% 15%, 39% 0%, 42% 15%, 45% 0%, 48% 15%, 51% 0%, 54% 15%, 57% 0%, 60% 15%, 63% 0%, 66% 15%, 69% 0%, 72% 15%, 75% 0%, 78% 15%, 81% 0%, 84% 15%, 87% 0%, 90% 15%, 93% 0%, 96% 15%, 99% 0%, 100% 15%, 100% 85%, 99% 100%, 96% 85%, 93% 100%, 90% 85%, 87% 100%, 84% 85%, 81% 100%, 78% 85%, 75% 100%, 72% 85%, 69% 100%, 66% 85%, 63% 100%, 60% 85%, 57% 100%, 54% 85%, 51% 100%, 48% 85%, 45% 100%, 42% 85%, 39% 100%, 36% 85%, 33% 100%, 30% 85%, 27% 100%, 24% 85%, 21% 100%, 18% 85%, 15% 100%, 12% 85%, 9% 100%, 6% 85%, 3% 100%, 0% 85%)',
          }}
        >
          GET 20% DISCOUNT ON ORDERS OVER 99$
        </div>
      </div>
    </section>
  );
}
