'use client';

export function Footer() {
  return (
    <footer className="w-full">
      {/* Main footer */}
      <div className="w-full bg-[#f4f2ee] px-[40px] py-[80px]">
        <div className="max-w-[1140px] mx-auto grid grid-cols-[2fr_1fr_1fr_1fr] gap-10">
          {/* Col 1: Brand */}
          <div>
            <span className="font-heading text-[28px] font-normal text-[#a55e3f] block mb-4">Krafti</span>
            <p className="font-body text-[14px] text-[#58595b] leading-[1.6] mb-5">
              Your new handmade and artisan site has already been created.
            </p>
            <div className="flex gap-4 text-sm">
              <a href="#" className="text-[#58595b] font-bold">f</a>
              <a href="#" className="text-[#58595b] font-bold">in</a>
              <a href="#" className="text-[#58595b] font-bold">tw</a>
            </div>
          </div>

          {/* Col 2: About Us */}
          <div>
            <h5 className="font-body text-[11px] font-600 tracking-[3px] text-[#a55e3f] uppercase mb-5">About Us</h5>
            <ul className="space-y-[13px]">
              {['About Me', 'Our Services', 'Our Team', 'Contact Us'].map((link, i) => (
                <li key={i}><a href="#" className="font-body text-[14px] text-[#58595b]">{link}</a></li>
              ))}
            </ul>
          </div>

          {/* Col 3: Help */}
          <div>
            <h5 className="font-body text-[11px] font-600 tracking-[3px] text-[#a55e3f] uppercase mb-5">Help</h5>
            <ul className="space-y-[13px]">
              {['About Us', 'Get In Touch', 'Discounts', 'Returns'].map((link, i) => (
                <li key={i}><a href="#" className="font-body text-[14px] text-[#58595b]">{link}</a></li>
              ))}
            </ul>
          </div>

          {/* Col 4: Instagram */}
          <div>
            <h5 className="font-body text-[11px] font-600 tracking-[3px] text-[#a55e3f] uppercase mb-5">Instagram</h5>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="w-full bg-[#a55e3f] px-[40px] py-[18px] text-center">
        <p className="font-body text-[13px] text-white">© 2019 Qode Interactive  All Rights Reserved</p>
      </div>
    </footer>
  );
}
