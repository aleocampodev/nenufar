import Image from "next/image";

export interface BlogPost {
  id: string;
  format: "standard" | "quote" | "audio" | "video" | "gallery" | "link";
  image: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  quoteText?: string;
  quoteAuthor?: string;
  linkUrl?: string;
  linkText?: string;
  featured?: boolean;
}

export function BlogPostCard({ post }: { post: BlogPost }) {
  if (post.format === "quote") {
    return (
      <div className="w-full mb-10 border-b border-gray-100 pb-10">
        <div className="bg-[#f4f2ee] px-10 py-12 text-center">
          <blockquote className="font-heading text-[24px] italic text-[#a55e3f] leading-[1.5] mb-4">
            &ldquo;{post.quoteText}&rdquo;
          </blockquote>
          <cite className="font-body text-[12px] text-[#58595b] not-italic">
            {post.quoteAuthor}
          </cite>
        </div>
      </div>
    );
  }

  if (post.format === "link") {
    return (
      <div className="w-full mb-10 border-b border-gray-100 pb-10">
        <div className="bg-[#f4f2ee] px-10 py-12 text-center">
          <a
            href={post.linkUrl}
            className="font-heading text-[22px] text-[#a55e3f] uppercase tracking-[3px] hover:opacity-80"
          >
            {post.linkText || post.title}
          </a>
        </div>
        <div className="mt-4">
          <p className="font-body text-[12px] italic text-[#58595b] mb-1">
            By {post.author} — {post.date}
          </p>
          <span className="font-body text-[11px] uppercase text-[#a55e3f] font-600 tracking-[2px]">
            {post.category}
          </span>
        </div>
      </div>
    );
  }

  if (post.format === "audio") {
    return (
      <article className="w-full mb-10 border-b border-gray-100 pb-10">
        <div className="relative w-full aspect-[16/9] mb-5 overflow-hidden">
          <Image src={post.image} alt={post.title} fill className="object-cover" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <p className="font-body text-[12px] italic text-[#58595b]">
            By {post.author} — {post.date}
          </p>
          <span className="font-body text-[11px] uppercase text-[#a55e3f] font-600 tracking-[2px]">
            {post.category}
          </span>
        </div>
        <h3 className="font-heading text-[22px] font-normal text-[#a55e3f] uppercase tracking-[3px] mb-3">
          {post.title}
        </h3>
        <p className="font-body text-[14px] text-[#58595b] leading-[1.7] mb-4">
          {post.excerpt}
        </p>
        <div className="w-full bg-[#f4f2ee] px-5 py-3 mb-4 flex items-center gap-4">
          <span className="font-body text-[11px] uppercase tracking-[2px] text-[#58595b]">
            Audio Player Placeholder
          </span>
          <div className="flex-1 h-1 bg-[#a55e3f]/20 rounded">
            <div className="w-1/3 h-full bg-[#a55e3f] rounded" />
          </div>
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-3 font-body text-[11px] font-600 tracking-[2px] text-[#58595b] uppercase"
        >
          <span className="inline-block w-10 h-px bg-[#a55e3f]" />
          READ MORE
        </a>
      </article>
    );
  }

  return (
    <article className="w-full mb-10 border-b border-gray-100 pb-10">
      <div className="relative w-full aspect-[16/9] mb-5 overflow-hidden">
        <Image src={post.image} alt={post.title} fill className="object-cover" />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <p className="font-body text-[12px] italic text-[#58595b]">
          By {post.author} — {post.date}
        </p>
        <span className="font-body text-[11px] uppercase text-[#a55e3f] font-600 tracking-[2px]">
          {post.category}
        </span>
      </div>
      <h3 className="font-heading text-[22px] font-normal text-[#a55e3f] uppercase tracking-[3px] mb-3">
        {post.title}
      </h3>
      <p className="font-body text-[14px] text-[#58595b] leading-[1.7] mb-5">
        {post.excerpt}
      </p>
      <a
        href="#"
        className="inline-flex items-center gap-3 font-body text-[11px] font-600 tracking-[2px] text-[#58595b] uppercase"
      >
        <span className="inline-block w-10 h-px bg-[#a55e3f]" />
        READ MORE
      </a>
    </article>
  );
}
