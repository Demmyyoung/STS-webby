document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-btn");

  if (!menuButton) return;

  const navPanel = document.querySelector(".nav-panel");

  // small helper functions to open/close the nav and keep ARIA in sync
  function openNav() {
    menuButton.classList.add("close");
    menuButton.setAttribute("aria-expanded", "true");
    if (navPanel) {
      navPanel.classList.add("open");
      navPanel.setAttribute("aria-hidden", "false");
      // focus the first link for accessibility
      const firstLink = navPanel.querySelector(".nav-link");
      if (firstLink) firstLink.focus();
    }
    console.debug("nav: opened");
  }

  function closeNav() {
    menuButton.classList.remove("close");
    menuButton.setAttribute("aria-expanded", "false");
    if (navPanel) {
      navPanel.classList.remove("open");
      navPanel.setAttribute("aria-hidden", "true");
    }
    console.debug("nav: closed");
  }

  menuButton.addEventListener("click", (e) => {
    const isOpen = menuButton.classList.toggle("close");
    menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (navPanel) {
      navPanel.classList.toggle("open", isOpen);
      navPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");
      if (isOpen) {
        // focus the first link
        const firstLink = navPanel.querySelector(".nav-link");
        if (firstLink) firstLink.focus();
      }
    }
    console.debug("menu button clicked, open=", isOpen);
    // stop propagation so document click handler doesn't immediately close it
    e.stopPropagation();
  });

  // Close menu when a nav link is clicked
  if (navPanel) {
    navPanel.addEventListener("click", (e) => {
      const link = e.target.closest(".nav-link");
      if (link) {
        closeNav();
      }
    });
  }

  // Click outside to close
  document.addEventListener("click", (e) => {
    const clickedInsideNav = !!e.target.closest(".nav-panel");
    const clickedMenuBtn = !!e.target.closest(".menu-btn");
    const isOpen = menuButton.classList.contains("close");
    if (isOpen && !clickedInsideNav && !clickedMenuBtn) {
      closeNav();
    }
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Esc") {
      const isOpen = menuButton.classList.contains("close");
      if (isOpen) closeNav();
    }
  });
});

// Function to handle the smooth scroll for all internal hash links
function setupSmoothScroll() {
  // Select all links that start with '#' and do not equal just '#'
  document
    .querySelectorAll('a[href^="#"]:not([href="#"])')
    .forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        // Only handle proper hash targets like '#section'
        if (!targetId || !targetId.startsWith("#")) return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return; // nothing to scroll to

        e.preventDefault(); // Stop the default jump behavior
        // Use the built-in smooth scroll function
        targetElement.scrollIntoView({ behavior: "smooth" });
      });
    });
}

// Execute the function when the script loads
// Execute the function when the script loads
setupSmoothScroll();

// --- Page Transition Logic ---
// --- Page Transition Logic ---
document.addEventListener("DOMContentLoaded", () => {
  // 1. Get or Inject the wiper element
  // Ideally, it's hardcoded in HTML to prevent flicker. If not found, we create it.
  let wiper = document.querySelector(".page-wipe");
  let quoteEl;

  if (!wiper) {
    wiper = document.createElement("div");
    wiper.className = "page-wipe";

    // Static Image
    const img = document.createElement("img");
    img.src = "./img/Recycle black.jpg";
    img.style.width = "150px";
    img.style.height = "auto";
    img.style.objectFit = "contain";
    img.alt = "";

    wiper.appendChild(img);

    // Quote Element
    quoteEl = document.createElement("p");
    quoteEl.className = "wipe-quote";
    wiper.appendChild(quoteEl);

    document.body.appendChild(wiper);
  } else {
    quoteEl = wiper.querySelector(".wipe-quote");
  }

  // 2. Quote Logic
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

  let currentQuote = sessionStorage.getItem("transitionQuote");
  if (!currentQuote) {
    currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
  }

  // Update text immediately
  if (quoteEl) quoteEl.innerText = currentQuote;

  // 3. Trigger "Reveal" Animation
  // Reduced delay for faster UX (was 300, increasing to give time to see quote)
  setTimeout(() => {
    wiper.classList.add("hidden");
  }, 600);

  // 4. Intercept Link Clicks for "Exit" Animation
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");

    // Ignore invalid links
    if (
      !href ||
      href.startsWith("#") ||
      link.target === "_blank" ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return;
    }

    e.preventDefault();

    // Generate NEW random quote
    const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    sessionStorage.setItem("transitionQuote", newQuote);

    // Update text
    if (quoteEl) quoteEl.innerText = newQuote;

    // Prepare for "Cover" Animation (Left to Right Wipe)
    // 1. Instantly reset position to LEFT edge (invisible)
    wiper.classList.add("no-transition");
    wiper.classList.add("wipe-in-start"); // inset(0 100% 0 0)
    wiper.classList.remove("hidden"); // remove inset(0 0 0 100%)

    // 2. Force browser reflow so it registers the instant jump
    void wiper.offsetWidth;

    // 3. Enable transition and animate to full cover
    wiper.classList.remove("no-transition");
    wiper.classList.remove("wipe-in-start"); // transition to inset(0 0 0 0)

    // Optional: Ensure pointer events block clicks
    wiper.classList.add("mask-in");

    // Wait for animation then navigate (1000ms match css)
    setTimeout(() => {
      window.location.href = href;
    }, 1000);
  });
});
