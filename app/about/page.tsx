
import Link from "next/link";

const values = [
  {
    number: "01",
    icon: "❤️",
    title: "Love",
    description:
      "We believe in showing genuine love, kindness, and compassion to everyone.",
  },
  {
    number: "02",
    icon: "🙏",
    title: "Faith",
    description:
      "We seek to grow spiritually through worship, prayer, learning, and trust in God.",
  },
  {
    number: "03",
    icon: "🤝",
    title: "Fellowship",
    description:
      "We build meaningful relationships and encourage one another along the journey.",
  },
  {
    number: "04",
    icon: "🌍",
    title: "Service",
    description:
      "We use our gifts and resources to serve others and make a positive difference.",
  },
];

export default function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="home-eyebrow">GET TO KNOW US</span>
          <h1>
            Rooted in faith.
            <br />
            <span>United in purpose.</span>
          </h1>
          <p>
            Discover the heart behind our church: a community committed
            to worship, fellowship, service, and growing together in faith.
          </p>
        </div>
      </section>

      <section className="about-story section-container">
        <div className="about-story-label">
          <span className="home-section-eyebrow">OUR STORY</span>
          <span className="about-story-decoration">01 / 03</span>
        </div>

        <div className="about-story-content">
          <h2>
            We are more than a congregation.
            <span> We are a family.</span>
          </h2>

          <p>
            Welcome to ChurchConnect. We are a church community built
            around a shared commitment to worship, fellowship, service,
            and spiritual growth.
          </p>

          <p>
            We believe that faith is strengthened when people come
            together. Our desire is to create a welcoming environment
            where people can discover their purpose, develop their gifts,
            support one another, and grow in their relationship with God.
          </p>

          <p>
            Wherever you are on your faith journey, we invite you to
            connect, participate, and become part of our community.
          </p>
        </div>
      </section>

      <section className="about-purpose-section">
        <div className="section-container">
          <div className="about-purpose-heading">
            <span className="home-section-eyebrow">WHAT GUIDES US</span>
            <h2>Our purpose and direction.</h2>
            <p>
              Everything we do is shaped by our desire to grow in faith
              and make a meaningful difference in the lives of others.
            </p>
          </div>

          <div className="about-purpose-grid">
            <article className="about-purpose-card about-mission-card">
              <div className="about-purpose-icon">✦</div>
              <span>OUR MISSION</span>
              <h3>Living out our faith through love and service.</h3>
              <p>
                To encourage spiritual growth, build a caring community,
                and serve others through faith, compassion, and action.
              </p>
            </article>

            <article className="about-purpose-card about-vision-card">
              <div className="about-purpose-icon">◎</div>
              <span>OUR VISION</span>
              <h3>A connected community growing together in Christ.</h3>
              <p>
                To nurture a welcoming and Christ-centred community
                where people are inspired to live with purpose and
                positively impact the world around them.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-values-section section-container">
        <div className="about-values-heading">
          <span className="home-section-eyebrow">WHAT WE STAND FOR</span>
          <h2>Our core values.</h2>
          <p>
            These values shape how we worship, relate to one another,
            and serve our wider community.
          </p>
        </div>

        <div className="about-values-grid">
          {values.map((value) => (
            <article className="about-value-card" key={value.number}>
              <div className="about-value-top">
                <span>{value.number}</span>
                <span className="about-value-icon">{value.icon}</span>
              </div>

              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-cta">
        <div className="about-cta-content">
          <span className="home-section-eyebrow">COME AND CONNECT</span>
          <h2>We would love to welcome you.</h2>
          <p>
            Take a step towards community, fellowship, and spiritual growth.
            Your journey can begin here.
          </p>

          <div className="home-hero-actions">
            <Link href="/signup" className="home-button home-button-light">
              Join our community <span>→</span>
            </Link>

            <Link href="/events" className="home-button home-button-outline">
              Explore our events
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
