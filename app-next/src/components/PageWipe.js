"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function PageWipe() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isWiping, setIsWiping] = useState(true);
  const [quote, setQuote] = useState("");

  const quotes = [
    "Slow Motion Is Better Than No Motion",
    "Keep Moving Forward",
    "Perfection is a direction, not a destination",
    "Trust the process, embrace the journey",
    "Silence speaks when words fail",
    "Quality over quantity, always",
    "Simplicity is the ultimate sophistication",
    "Stay hungry, stay foolish",
    "Design is intelligence made visible",
    "The details are not the details, they make the design",
    "Less is more",
    "Create with purpose",
    "Elegance is refusal",
    "Fashion fades, style is eternal",
    "Boldness is the only currency",
  ];

  // Set initial quote on mount only to prevent hydration mismatch
  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  // Handle route changes
  useEffect(() => {
    // Show wipe when route starts changing
    setIsWiping(true);

    // Change quote on new route
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    // Hide wipe after a delay
    const timeoutId = setTimeout(() => {
      setIsWiping(false);
    }, 600); // 600ms matches the vanilla JS transition time

    return () => clearTimeout(timeoutId);
  }, [pathname, searchParams]); // Trigger on pathname or searchParams change

  // Additional listener to hijack all Link clicks gracefully to trigger wipe BEFORE navigating
  useEffect(() => {
    const handleLinkClick = (e) => {
      const target = e.target.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");

      // Ignore external or anchor links
      if (
        !href ||
        href.startsWith("http") ||
        href.startsWith("#") ||
        target.target === "_blank"
      ) {
        return;
      }

      // If we are navigating internally
      setIsWiping(true);
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    };

    document.addEventListener("click", handleLinkClick);
    return () => document.removeEventListener("click", handleLinkClick);
  }, [pathname, searchParams]);

  return (
    <div className={`page-wipe ${!isWiping ? "hidden" : "mask-in"}`}>
      <img
        src="/img/Recycle black.jpg"
        style={{
          width: "150px",
          height: "auto",
          objectFit: "contain",
          mixBlendMode: "darken",
        }}
        alt="Logo"
        loading="eager"
        className="wiper-logo"
      />
      <p className="wipe-quote">{quote}</p>
    </div>
  );
}
