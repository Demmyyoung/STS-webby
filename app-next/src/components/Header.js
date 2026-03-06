"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Sync cart count with localStorage
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("sts_cart") || "[]");
    const totalQty = cart.reduce(
      (sum, item) => sum + (item.cartQuantity || item.quantity || 1),
      0,
    );
    setCartCount(totalQty);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    // Also listen for cross-tab updates if needed
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  return (
    <>
      <header className="header">
        <div className="logo-placeholder">
          <Link href="/" className="logo-link">
            {/* Using standard img tags to safely use CSS overrides on Next Image loops */}
            <img
              src="/img/Recycle-white.jpg"
              alt="Sinner to Saints Logo"
              className="logo-image"
              id="logo-img"
              style={{ objectFit: "contain", mixBlendMode: "darken" }}
            />
          </Link>
        </div>

        <div className="header-right">
          <button
            className="theme-toggle"
            aria-label="Toggle Dark Mode"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {/* Outline Sun/Moon logic based on state */}
            {isDarkMode ? (
              <svg
                className="theme-icon-sun"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                />
              </svg>
            ) : (
              <svg
                className="theme-icon-moon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                />
              </svg>
            )}
          </button>

          <Link href="/cart" className="cart-icon-btn" aria-label="View Cart">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <span className="cart-count">{cartCount}</span>
          </Link>

          <button
            className={`menu-btn ${menuOpen ? "open" : ""}`}
            aria-label="Open Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="btn-line"></span>
            <span className="btn-line"></span>
            <span className="btn-line"></span>
          </button>
        </div>
      </header>

      <nav
        className={`nav-panel ${menuOpen ? "open" : ""}`}
        aria-hidden={!menuOpen}
        role="navigation"
      >
        <ul className="nav-list">
          <li>
            <Link
              href="/"
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/store"
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              Store
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
