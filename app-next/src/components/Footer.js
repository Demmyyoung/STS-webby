export default function Footer() {
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "40px",
        fontFamily: "'Segoe UI', sans-serif",
        fontSize: "0.9rem",
        color: "#888",
      }}
    >
      &copy; {new Date().getFullYear()} Sinner to Saints. All rights reserved.
    </footer>
  );
}
