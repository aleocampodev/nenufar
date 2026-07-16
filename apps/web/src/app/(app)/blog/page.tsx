import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BlogSidebar } from "@/components/BlogHome/BlogSidebar";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Blog — Nénufar",
  description: "Historia de cada colección del brand Nénufar.",
};

interface Post {
  format: string;
  image?: string;
  title?: string;
  excerpt?: string;
  date?: string;
  author?: string;
  category?: string;
  quoteText?: string;
  quoteAuthor?: string;
}

const blogPosts: Post[] = [
  {
    format: "standard",
    image: "/images/blog-1-img-4.jpg",
    title: "How to make the best berries jam",
    excerpt:
      "Lorem ipsum dolor sit amet a con sectetur adipisi se cing elit se do eius mod tempor incididunt ut lab ore et dolore magna aliquat enim mini veniam quis no nostrud exercitation ullamco aboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in serense olupte velit se esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non amet proident, sunt in culpa qui officia deserunt er mollit anim id estare laborum.",
    date: "June 27, 2019",
    author: "Karen Hirsh",
    category: "Organic food",
  },
  {
    format: "quote",
    quoteText:
      "Work done by you with unconditional love and pure devotion goes in the category of divine and immortal craft.",
    quoteAuthor: "Karen Hirsh",
  },
  {
    format: "audio",
    image: "/images/blog-1-img-2.jpg",
    title: "Passion, dedication, work",
    excerpt:
      "Lorem ipsum dolor sit amet a con sectetur adipisi se cing elit se do eius mod tempor incididunt ut lab ore et dolore magna aliquat enim mini veniam quis no nostrud exercitation ullamco aboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in serense olupte velit se esse cillum dolore eu fugiat nulla pariatur.",
    date: "June 25, 2019",
    author: "Karen Hirsh",
    category: "Organic food",
  },
  {
    format: "standard",
    image: "/images/blog-1-img-5.jpg",
    title: "Providing the vision",
    excerpt:
      "Lorem ipsum dolor sit amet a con sectetur adipisi se cing elit se do eius mod tempor incididunt ut lab ore et dolore magna aliquat enim mini veniam quis no nostrud exercitation ullamco aboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in serense olupte velit se esse cillum dolore eu fugiat nulla pariatur.",
    date: "June 23, 2019",
    author: "Karen Hirsh",
    category: "Organic food",
  },
  {
    format: "standard",
    image: "/images/blog-3-img-4-1280x692.jpg",
    title: "Healthy food",
    excerpt:
      "Lorem ipsum dolor sit amet a con sectetur adipisi se cing elit se do eius mod tempor incididunt ut lab ore et dolore magna aliquat enim mini veniam quis no nostrud exercitation ullamco aboris nisi ut aliquip ex ea commodo consequat.",
    date: "June 21, 2019",
    author: "Karen Hirsh",
    category: "Organic food",
  },
];

function PostMeta({ author, date, category }: { author?: string; date?: string; category?: string }) {
  return (
    <div className="font-body text-[17px] font-300 text-[#a55e3f] leading-[27px] tracking-[0.51px] mb-[5px]">
      <span className="inline-block">By </span>
      <a href="#" className="text-[#a55e3f] no-underline">{author}</a>
      <span className="inline-block"> </span>
      <a href="#" className="text-[#a55e3f] no-underline">{date}</a>
      <span className="inline-block mx-[1px]"> - </span>
      <a href="#" className="text-[#a55e3f] no-underline">{category}</a>
    </div>
  );
}

function ReadMoreButton() {
  return (
    <a
      href="#"
      className="inline-block font-body text-[11px] font-400 text-[#a55e3f] uppercase tracking-[3.3px] leading-[22px] pt-[12px] pb-[12px] pr-[38px] no-underline"
    >
      <span className="inline-block w-0 h-[2px] bg-[#741513] align-middle mr-2" />
      <span className="inline-block">Read More</span>
    </a>
  );
}

function SocialShare() {
  return (
    <div className="text-right">
      <span className="font-body text-[12px] text-[#58595b] mx-[5px] cursor-pointer">Share</span>
      <a href="#" className="font-body text-[12px] text-[#58595b] mx-[5px] no-underline hover:text-[#a55e3f]" aria-label="Facebook">Fb</a>
      <a href="#" className="font-body text-[12px] text-[#58595b] mx-[5px] no-underline hover:text-[#a55e3f]" aria-label="Twitter">Tw</a>
      <a href="#" className="font-body text-[12px] text-[#58595b] mx-[5px] no-underline hover:text-[#a55e3f]" aria-label="Pinterest">Pi</a>
    </div>
  );
}

export default function BlogHomePage() {
  return (
    <main className="bg-white">
      <Navbar />

      <div className="max-w-[1300px] mx-auto">
        <div className="flex flex-row mx-[-25px]">
          <div className="w-3/4 px-[25px]">
            {blogPosts.map((post, i) => (
              <article key={i} className="mb-[86px]">
                {post.format === "quote" ? (
                  <div className="bg-[#f4f2ee] px-10 py-14 text-center">
                    <blockquote className="font-heading text-[24px] italic text-[#a55e3f] leading-[1.5] mb-4">
                      &ldquo;{post.quoteText}&rdquo;
                    </blockquote>
                    <cite className="font-body text-[12px] text-[#58595b] not-italic">
                      {post.quoteAuthor}
                    </cite>
                  </div>
                ) : (
                  <div>
                    {post.image && (
                      <div className="relative w-full aspect-[1300/737] mb-5 overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.title!}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <PostMeta
                        author={post.author}
                        date={post.date}
                        category={post.category}
                      />
                      <h1 className="font-heading text-[35px] font-500 text-[#a55e3f] uppercase tracking-[5.775px] leading-[43.05px] m-0">
                        <a href="#" className="text-inherit no-underline">
                          {post.title}
                        </a>
                      </h1>
                      <div className="mt-[9px]">
                        <p className="font-body text-[15px] font-300 text-[#58595b] leading-[25px] m-0">
                          {post.excerpt}
                        </p>
                      </div>
                      {post.format === "audio" && (
                        <div className="w-full bg-[#f4f2ee] px-5 py-3 my-4 flex items-center gap-4">
                          <span className="font-body text-[11px] uppercase tracking-[2px] text-[#58595b]">
                            Audio Player
                          </span>
                          <div className="flex-1 h-1 bg-[#a55e3f]/20 rounded">
                            <div className="w-1/3 h-full bg-[#a55e3f] rounded" />
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between pt-[27px]">
                        <ReadMoreButton />
                        <SocialShare />
                      </div>
                    </div>
                  </div>
                )}
              </article>
            ))}

              {/* Pagination */}
              <div className="flex items-center gap-3 mb-10">
                <span className="font-body text-[14px] text-[#a55e3f] font-600 cursor-pointer">
                  1
                </span>
                <a
                  href="#"
                  className="font-body text-[14px] text-[#58595b] hover:text-[#a55e3f]"
                >
                  2
                </a>
                <a
                  href="#"
                  className="font-body text-[14px] text-[#58595b] hover:text-[#a55e3f]"
                >
                  →
                </a>
              </div>
            </div>

            <div className="w-1/4 px-[25px]">
              <BlogSidebar />
            </div>
          </div>
        </div>

        <Footer />
    </main>
  );
}
