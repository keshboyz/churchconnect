
import Link from "next/link";

const features = [
  {
    icon: "🤝",
    title: "A welcoming community",
    description:
      "Connect with fellow members, build meaningful relationships, and grow together in faith.",
    href: "/community",
    linkText: "Meet the community",
  },
  {
    icon: "📅",
    title: "Events and fellowship",
    description:
      "Stay connected with church gatherings, special services, and upcoming activities.",
    href: "/events",
    linkText: "Explore events",
  },
  {
    icon: "🎵",
    title: "Worship and inspiration",
    description:
      "Explore worship songs and uplifting videos to encourage your spiritual journey.",
    href: "/songs",
    linkText: "Explore worship",
  },
];

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-overlay" />

        <div className="home-hero-content">
          <span className="home-eyebrow">
            WELCOME TO CHURCHCONNECT
          </span>

          <h1>
            Faith grows
            <br />
            <span>better together.</span>
          </h1>

          <p>
            A place to belong, worship, serve, and grow. Discover a
            community where faith is strengthened and lives are
            transformed.
          </p>

          <div className="home-hero-actions">
            <Link href="/signup" className="home-button home-button-light">
              Join our community <span>→</span>
            </Link>

            <Link href="/about" className="home-button home-button-outline">
              Discover our story
            </Link>
          </div>

          <div className="home-hero-note">
            <span className="home-note-dot" />
            One community. One faith. Growing together.
          </div>
        </div>

        <div className="home-hero-bottom">
          <span>FAITH</span>
          <span className="home-hero-bottom-line" />
          <span>FELLOWSHIP</span>
          <span className="home-hero-bottom-line" />
          <span>SERVICE</span>
        </div>
      </section>

      <section className="home-intro section-container">
        <div className="home-intro-heading">
          <span className="home-section-eyebrow">MORE THAN A PLACE</span>
          <h2>
            A family where
            <br />
            <span>everyone belongs.</span>
          </h2>
        </div>

        <div className="home-intro-copy">
          <p>
            ChurchConnect is a place to build relationships, deepen
            your faith, and discover opportunities to make a difference.
            Whether you are visiting for the first time or have been part
            of the community for years, there is a place for you here.
          </p>

          <Link href="/about" className="home-text-link">
            Learn more about us <span>→</span>
          </Link>
        </div>
      </section>

      <section className="home-features-section">
        <div className="section-container">
          <div className="home-section-heading">
            <div>
              <span className="home-section-eyebrow">EXPLORE CHURCHCONNECT</span>
              <h2>Grow in every season.</h2>
            </div>

            <p>
              Find ways to connect, participate, and stay encouraged
              throughout your faith journey.
            </p>
          </div>

          <div className="home-feature-grid">
            {features.map((feature) => (
              <article className="home-feature-card" key={feature.title}>
                <div className="home-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <Link href={feature.href}>
                  {feature.linkText} <span>→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-community-cta">
        <div className="home-community-cta-inner">
          <span className="home-section-eyebrow">
            YOUR PLACE IN THE FAMILY
          </span>

          <h2>
            There is a place
            <br />
            <span>for you here.</span>
          </h2>

          <p>
            Take the next step. Become part of a community that
            encourages, supports, and grows together.
          </p>

          <Link href="/signup" className="home-button home-button-blue">
            Become a member <span>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
