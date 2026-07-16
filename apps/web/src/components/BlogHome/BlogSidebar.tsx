import Image from "next/image";

const categories = [
  { name: "Cakes", count: 3 },
  { name: "Crafting", count: 6 },
  { name: "Home decor", count: 1 },
  { name: "Organic food", count: 6 },
  { name: "Slider", count: 6 },
  { name: "Volunteering", count: 1 },
  { name: "Wooden Dishes", count: 3 },
  { name: "Workshop", count: 3 },
];

const tags = [
  "Accessories", "Artisan", "Cooking", "Crafts", "Decoration",
  "Food", "Handmade", "Natural", "Organic", "Toys", "Workshop",
];

export function BlogSidebar() {
  return (
    <aside className="w-full">
      {/* Search */}
      <div className="mb-10">
        <h5 className="font-heading text-[17px] font-500 text-[#a55e3f] uppercase tracking-[2.805px] mb-[12px]">
          Search
        </h5>
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full border-b border-gray-300 pb-2 font-body text-[14px] text-[#58595b] outline-none bg-transparent placeholder:text-[#58595b]/50"
          />
          <button className="absolute right-0 top-0 font-body text-[14px] text-[#58595b]">
            →
          </button>
        </div>
      </div>

      {/* About Author */}
      <div className="mb-10">
        <h4 className="font-heading text-[19px] font-500 text-[#a55e3f] uppercase tracking-[3.135px] leading-[25.992px] mb-5">
          About Author
        </h4>
        <div className="flex items-start gap-4">
          <div className="relative w-[70px] h-[70px] rounded-full overflow-hidden shrink-0">
            <Image
              src="/images/autor-img-1.jpg"
              alt="Author"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-body text-[14px] text-[#58595b] leading-[1.6]">
              Amque laudantium, totam rem aperiam, est eaque ipsa quae abillo
              amet inventore amet dose dust veritatis et utqua architect beatae
              vitae dicta.
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-10">
        <h5 className="font-heading text-[17px] font-500 text-[#a55e3f] uppercase tracking-[2.805px] mb-[12px]">
          Categories
        </h5>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat.name}>
              <a
                href="#"
                className="font-body text-[14px] text-[#58595b] hover:text-[#a55e3f] flex justify-between"
              >
                <span>{cat.name}</span>
                <span>({cat.count})</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="mb-10">
        <h5 className="font-heading text-[17px] font-500 text-[#a55e3f] uppercase tracking-[2.805px] mb-[12px]">
          Tags
        </h5>
        <div className="flex flex-wrap gap-x-1 gap-y-1">
          {tags.map((tag, i) => (
            <span key={tag}>
              <a
                href="#"
                className="font-body text-[14px] text-[#58595b] hover:text-[#a55e3f]"
              >
                {tag}
              </a>
              {i < tags.length - 1 && (
                <span className="text-[#58595b]/30 mx-1">/</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Instagram */}
      <div className="mb-10">
        <h5 className="font-heading text-[17px] font-500 text-[#a55e3f] uppercase tracking-[2.805px] mb-[22px]">
          Instagram
        </h5>
        <p className="font-body text-[14px] text-[#58595b]">
          It seams that you haven&apos;t connected with your Instagram account
        </p>
      </div>

      {/* Follow Us */}
      <div>
        <h5 className="font-heading text-[17px] font-500 text-[#a55e3f] uppercase tracking-[2.805px] mb-[12px] text-left">
          Follow Us
        </h5>
        <div className="flex gap-4">
          <a
            href="#"
            className="font-bold text-[#58595b] hover:text-[#a55e3f] text-sm"
            aria-label="Instagram"
          >
            Instagram
          </a>
          <a
            href="#"
            className="font-bold text-[#58595b] hover:text-[#a55e3f] text-sm"
            aria-label="Facebook"
          >
            Facebook
          </a>
          <a
            href="#"
            className="font-bold text-[#58595b] hover:text-[#a55e3f] text-sm"
            aria-label="Twitter"
          >
            Twitter
          </a>
          <a
            href="#"
            className="font-bold text-[#58595b] hover:text-[#a55e3f] text-sm"
            aria-label="Pinterest"
          >
            Pinterest
          </a>
        </div>
      </div>
    </aside>
  );
}
