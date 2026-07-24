import { MapPin, ChevronDown } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '../icons';
import { profile } from '../data';

export default function Hero() {
  return (
    <section id="hero" className="hero" aria-label="Introduction">
      <div className="hero__orb hero__orb--1" aria-hidden="true"></div>
      <div className="hero__orb hero__orb--2" aria-hidden="true"></div>
      <div className="hero__orb hero__orb--3" aria-hidden="true"></div>

      <div className="hero__content">
        <div className="hero__badge">
          <MapPin size={14} aria-hidden="true" />
          {profile.location}&nbsp;&middot;&nbsp;{profile.citizenship}
        </div>

        <h1 className="hero__name">{profile.name}</h1>
        <p className="hero__role">{profile.title}</p>
        <p className="hero__tagline">{profile.tagline}</p>

        <div className="hero__ctas">
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
            <LinkedinIcon size={18} /> LinkedIn
          </a>
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
            <GithubIcon size={18} /> GitHub
          </a>
        </div>

        <div className="hero__stats" role="list">
          {profile.stats.map(s => (
            <div key={s.label} className="hero__stat" role="listitem">
              <div className="hero__stat-value">{s.value}</div>
              <div className="hero__stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <a href="#about" className="hero__scroll" aria-label="Scroll to about section">
        <span>Scroll</span>
        <ChevronDown size={18} aria-hidden="true" />
      </a>
    </section>
  );
}
