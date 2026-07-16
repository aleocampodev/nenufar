'use client';

import Image from 'next/image';

const posts = [
  { img: '/images/blog-1.jpg', meta: 'By Karen Hirsh–June 27, 2019', title: 'THE NEW CRUNCHY DELIGHT', excerpt: 'Lorem ipsum dolor sit amet a con sectetur adipisi se cing elit se do eius mod tempor incididunt ut lab ...' },
  { img: '/images/blog-2.jpg', meta: 'By Karen Hirsh–June 27, 2019', title: 'FAVOURITE FOOD TRIPS', excerpt: 'Lorem ipsum dolor sit amet a con sectetur adipisi se cing elit se do eius mod tempor incididunt ut lab ...' },
  { img: '/images/blog-3.jpg', meta: 'By Karen Hirsh–June 27, 2019', title: 'COLORFUL TRADITION', excerpt: 'Lorem ipsum dolor sit amet a con sectetur adipisi se cing elit se do eius mod tempor incididunt ut lab ...' },
];

export function BlogSection() {
  return (
    <section className="w-full bg-white py-[80px] px-0">
      <h2 className="font-heading text-[32px] font-normal text-[#a55e3f] uppercase tracking-[5px] text-center mb-2">
        MOST POPULAR PRODUCTS
      </h2>
      <p className="font-heading text-[15px] italic text-[#a55e3f] text-center mb-[60px]">Bestselling in december</p>
      <div className="max-w-[1140px] mx-auto px-[40px] grid grid-cols-3 gap-[30px]">
        {posts.map((post, i) => (
          <div key={i}>
            <div className="relative w-full aspect-[4/3] mb-5 overflow-hidden">
              <Image src={post.img} alt={post.title} fill className="object-cover" />
            </div>
            <p className="font-body text-[12px] italic text-[#58595b] mb-2">{post.meta}</p>
            <h4 className="font-heading text-[18px] font-normal text-[#a55e3f] uppercase tracking-[3px] mb-3">
              {post.title}
            </h4>
            <p className="font-body text-[14px] text-[#58595b] leading-[1.7] mb-4">{post.excerpt}</p>
            <a href="#" className="inline-flex items-center gap-3 font-body text-[11px] font-600 tracking-[2px] text-[#58595b] uppercase">
              <span className="inline-block w-10 h-px bg-[#a55e3f]" />
              READ MORE
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
