import Image from "next/image";

interface Product {
  image: string;
  title: string;
  category: string;
  price: string;
  colSpan: string;
  rowSpan: string;
}

const products: Product[] = [
  { image: "/images/shop-5-img-1.jpg", title: "Raw collection", category: "Organic food", price: "$37.99", colSpan: "col-span-2", rowSpan: "row-span-2" },
  { image: "/images/shop-5-img-2-650x650.jpg", title: "Organic cookies", category: "Organic food", price: "$17.99", colSpan: "col-start-3", rowSpan: "row-start-1" },
  { image: "/images/shop-5-img-3-650x650.jpg", title: "Granola bars", category: "Organic food", price: "$17.99", colSpan: "col-start-4", rowSpan: "row-start-1" },
  { image: "/images/shop-5-img-4-650x650.jpg", title: "Berry cookies", category: "Organic food", price: "$17.99", colSpan: "col-start-3", rowSpan: "row-start-2" },
  { image: "/images/shop-5-img-5-650x650.jpg", title: "Black chocolate", category: "Organic food", price: "$9.99", colSpan: "col-start-4", rowSpan: "row-start-2" },
  { image: "/images/shop-5-img-6-650x650.jpg", title: "Caramel towers", category: "Organic food", price: "$8.99", colSpan: "col-start-1", rowSpan: "row-start-3" },
  { image: "/images/shop-5-img-7-650x650.jpg", title: "Mexican cinnamon", category: "Organic food", price: "$6.99", colSpan: "col-start-2", rowSpan: "row-start-3" },
  { image: "/images/shop-5-img-8-650x650.jpg", title: "Dried peach", category: "Organic food", price: "$12.99", colSpan: "col-start-3", rowSpan: "row-start-3" },
  { image: "/images/shop-5-img-9-650x650.jpg", title: "Granola pack", category: "Organic food", price: "$13.99", colSpan: "col-start-4", rowSpan: "row-start-3" },
  { image: "/images/shop-5-img-10-650x650.jpg", title: "Fresh juices", category: "Organic food", price: "$5.99", colSpan: "col-start-1", rowSpan: "row-start-4" },
  { image: "/images/shop-5-img-11.jpg", title: "Linen bag", category: "Organic food", price: "$8.99", colSpan: "col-span-2 col-start-2", rowSpan: "row-span-2 row-start-4" },
  { image: "/images/shop-5-img-12-650x650.jpg", title: "Dried fruit", category: "Organic food", price: "$6.99", colSpan: "col-start-4", rowSpan: "row-start-4" },
  { image: "/images/shop-5-img-13-650x650.jpg", title: "Brown chocolate", category: "Organic food", price: "$3.99", colSpan: "col-start-1", rowSpan: "row-start-5" },
  { image: "/images/shop-5-img-14-650x650.jpg", title: "Homemade jam", category: "Organic food", price: "$11.99", colSpan: "col-start-4", rowSpan: "row-start-5" },
  { image: "/images/shop-5-img-15-650x650.jpg", title: "Choco Cookies", category: "Organic food", price: "$5.99", colSpan: "col-start-1", rowSpan: "row-start-6" },
  { image: "/images/shop-5-img-16-650x650.jpg", title: "Mixed raisins", category: "Organic food", price: "$9.99", colSpan: "col-start-2", rowSpan: "row-start-6" },
  { image: "/images/shop-5-img-17-650x650.jpg", title: "Cutting board", category: "Organic food", price: "$29.99", colSpan: "col-start-3", rowSpan: "row-start-6" },
  { image: "/images/shop-5-img-18-650x650.jpg", title: "Chocolate cookie", category: "Organic food", price: "$11.99", colSpan: "col-start-4", rowSpan: "row-start-6" },
];

export function ShopMasonryGrid() {
  return (
    <div className="grid grid-cols-4">
      {products.map((product) => (
        <div key={product.title} className={`group relative overflow-hidden ${product.colSpan} ${product.rowSpan}`}>
          <div className="relative w-full h-0 pb-[100%] overflow-hidden bg-[#f4f2ee]">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/70 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <a
                href="#"
                className="font-body text-[11px] uppercase tracking-[3.3px] text-white bg-[#0d1e64] px-5 py-3 no-underline"
              >
                Add to cart
              </a>
            </div>
          </div>
          <div className="text-center px-3 pt-3 pb-5">
            <h4 className="font-heading text-[19px] font-500 text-[#a55e3f] uppercase tracking-[3.135px] mb-0">
              {product.title}
            </h4>
            <p className="font-body text-[15px] text-[#58595b] leading-[1.4] mt-2 mb-1">
              {product.category}
            </p>
            <p className="font-body text-[17px] text-[#a55e3f] leading-[1.4]">
              {product.price}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
