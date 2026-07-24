import { LinkedinIcon, GithubIcon } from '../icons';
import { profile } from '../data';

export default function About() {
  return (
    <section id="about" className="section section--about" aria-labelledby="about-heading">
      <div className="container">
        <div className="about__grid">
          <div className="about__photo-wrap">
            <div className="about__photo-glow" aria-hidden="true"></div>
            <img
              src="images/profile.png"
              alt="Siddharth Salunke"
              className="about__photo"
              loading="lazy"
            />
          </div>

          <div className="about__body">
            <p className="section__label">About Me</p>
            <h2 id="about-heading" className="section__heading">Engineering quality at scale.</h2>
            <p className="about__text">{profile.summary}</p>

            <div className="about__links">
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="about__link">
                <LinkedinIcon size={16} /> linkedin.com/in/sidsalunke
              </a>
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="about__link">
                <GithubIcon size={16} /> github.com/sidsalunke
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
