export const metadata = {
  title: "About | SINNER TO SAINTS",
  description:
    "The philosophy behind SINNER TO SAINTS. Why we move, even if it's slow. Discover our story.",
};

import Image from "next/image";

export default function About() {
  return (
    <main className="about-main" style={{ paddingTop: "180px" }}>
      <section className="about-hero">
        <h1 className="about-title">The Philosophy</h1>
        <p className="about-subtitle">Why we move, even if it&apos;s slow.</p>
      </section>

      <section className="about-content-block">
        <div className="about-text">
          <p>
            Sinner to Saints is not just a clothing brand; it is a movement.
            Born from the idea that perfection is a destination we may never
            reach, but the journey towards it is what defines us. We exist in
            the grey areas, between the falter and the rise.
          </p>
          <br />
          <p>
            Our designs reflect this duality. The high contrast of black and
            white mirrors the balance of our nature. We believe in transparency,
            sustainability, and the raw, unfiltered truth of the human
            experience.
          </p>
          <br />
          <p>
            <strong>&quot;Slow Motion is Better Than No Motion.&quot;</strong>
          </p>
          <br />
          <p>
            This is our mantra. In a fast-paced world, we choose deliberate
            action over chaotic speed. Every stitch, every fabric choice, and
            every design is calculated. We are building a legacy, not just a
            label.
          </p>
        </div>

        <div
          className="about-image-wrapper brutal-card"
          style={{ position: "relative", overflow: "hidden" }}
        >
          <Image
            src="/img/Recycle black.jpg"
            alt="Sinner to Saints Brand Image"
            fill
            style={{ objectFit: "cover" }}
            className="about-img"
          />
        </div>
      </section>
    </main>
  );
}
