import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import PageWipe from "@/components/PageWipe";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata = {
  title: "SINNER TO SAINTS",
  description:
    "Season 01 Collection. Redefining Streetwear. Slow Motion Is Better Than No Motion.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll>
          <PageWipe />
          <div className="container">
            <AnnouncementBar />
            <Header />
            {children}
            <Footer />
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
