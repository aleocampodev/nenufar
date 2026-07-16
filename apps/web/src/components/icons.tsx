// Extracted SVG icons from Krafti site

export function LeafIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="30" height="20">
      <path d="M8 18 C8 18 2 12 2 6 C2 2 6 0 10 2 C12 3 13 5 12 8 C11 11 8 12 8 18Z" />
      <path d="M18 16 C18 16 14 10 16 4 C17 1 21 0 24 3 C26 5 25 8 23 10 C21 12 18 13 18 16Z" />
    </svg>
  );
}

export function ZigzagSVG({ color = 'currentColor' }: { color?: string }) {
  // The actual polygon from the site — 2560px wide, 15.292px tall
  // Used as a section border, scaled to full width via CSS
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 2560 16"
      preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height: '16px' }}
      fill={color}
    >
      <polygon points="0,0 0,7 17,14 35,7 54,14 72,7 90,14 108,7 127,14 145,7 163,14 181,7 200,14 218,7 236,14 255,7 274,14 292,7 310,14 328,7 347,14 365,7 383,14 401,7 420,14 438,7 456,14 475,7 493,14 511,7 530,14 548,7 566,14 584,7 603,14 621,7 639,14 657,7 676,14 694,7 712,14 730,7 749,14 767,7 785,14 803,7 822,14 840,7 858,14 876,7 895,14 913,7 931,14 949,7 968,14 986,7 1004,14 1022,7 1041,14 1059,7 1077,14 1095,7 1114,14 1132,7 1150,14 1168,7 1187,14 1205,7 1223,14 1241,7 1260,14 1278,7 1296,14 1314,7 1333,14 1351,7 1369,14 1387,7 1406,14 1424,7 1442,14 1460,7 1479,14 1497,7 1515,14 1533,7 1552,14 1570,7 1588,14 1606,7 1625,14 1643,7 1661,14 1679,7 1698,14 1716,7 1734,14 1752,7 1771,14 1789,7 1807,14 1825,7 1844,14 1862,7 1880,14 1898,7 1917,14 1935,7 1953,14 1971,7 1990,14 2008,7 2026,14 2044,7 2063,14 2081,7 2099,14 2117,7 2136,14 2154,7 2172,14 2190,7 2209,14 2227,7 2245,14 2263,7 2282,14 2300,7 2318,14 2336,7 2355,14 2373,7 2391,14 2409,7 2428,14 2446,7 2464,14 2482,7 2501,14 2519,7 2537,14 2560,7 2560,0" />
    </svg>
  );
}

export function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 17" width="42" height="17" fill="none">
      <line x1="0" y1="1" x2="42" y2="1" stroke="#DD9E73" strokeWidth="2" />
      <line x1="0" y1="8.5" x2="42" y2="8.5" stroke="#DD9E73" strokeWidth="2" />
      <line x1="0" y1="16" x2="42" y2="16" stroke="#DD9E73" strokeWidth="2" />
    </svg>
  );
}

export function ScissorsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="12" r="5" />
      <circle cx="10" cy="28" r="5" />
      <line x1="14" y1="10" x2="35" y2="32" />
      <line x1="14" y1="30" x2="35" y2="8" />
    </svg>
  );
}

export function HeartCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" />
      <path d="M20 27 C20 27 11 21 11 15 C11 12 13 10 16 10 C18 10 20 12 20 12 C20 12 22 10 24 10 C27 10 29 12 29 15 C29 21 20 27 20 27Z" />
    </svg>
  );
}

export function YarnIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="16" />
      <path d="M6 16 Q14 12 20 20 Q26 28 34 24" />
      <path d="M8 24 Q16 20 22 26 Q28 32 36 28" />
      <path d="M10 10 Q18 8 22 14 Q26 20 32 18" />
    </svg>
  );
}

export function BrushIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="4" width="12" height="18" rx="2" />
      <path d="M16 22 L16 32 Q16 36 20 36 Q24 36 24 32 L24 22" />
      <line x1="14" y1="22" x2="26" y2="22" />
    </svg>
  );
}
