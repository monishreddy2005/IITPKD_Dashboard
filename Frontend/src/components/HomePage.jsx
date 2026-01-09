import './Page.css';

function HomePage() {
  return (
    <div className="page-container">
      <div className="page-content">
        <div className="welcome-section">
          <h1>Exploring the Vision that shapes Indian Institute of Technology Palakkad</h1>

          <p>
            Indian Institute of Technology Palakkad is committed to the creation, dissemination,
            and application of knowledge for the benefit of society. Guided by reason and compassion,
            we nurture lifelong learners with strong ethical values, a passion for innovation, and a
            deep sense of social responsibility.
          </p>

          <p>
            As a vibrant and inclusive academic community, IIT Palakkad strives to advance education,
            research, and technology while embracing diversity, sustainability, and meaningful
            engagement with society. Our vision is to be a globally recognized institution that
            remains deeply connected to its local community and responsive to global challenges.
          </p>

          <p>
            This dashboard brings together six interconnected pillars that translate our vision into
            action:
          </p>

          <ul
  style={{
    maxWidth: '900px',
    margin: '1.5rem 0',
    paddingLeft: '1.25rem',
    textAlign: 'left'
  }}
>
            <li><strong>People and Campus</strong> — Fostering a happy, inclusive, and sustainable campus community.</li>
            <li><strong>Research</strong> — Advancing knowledge through rigorous, impactful, and interdisciplinary inquiry.</li>
            <li><strong>Education</strong> — Building strong academic foundations and promoting lifelong learning.</li>
            <li><strong>Industry Connect</strong> — Strengthening collaboration with industry to translate ideas into practice.</li>
            <li><strong>Innovation and Entrepreneurship</strong> — Encouraging creativity and entrepreneurship for societal impact.</li>
            <li><strong>Outreach and Extension</strong> — Engaging with communities beyond the campus to share knowledge and contribute to sustainable development.</li>
          </ul>

          <p>
            Use the menu above to explore these sections and discover how IIT Palakkad is shaping
            knowledge, people, and partnerships for a better future.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
