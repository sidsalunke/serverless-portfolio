import { useState } from 'react';
import { MapPin, ChevronDown, ExternalLink } from 'lucide-react';
import { experience } from '../data';

export default function Experience() {
  const [expanded, setExpanded] = useState(null);

  const toggle = (id) => setExpanded(prev => (prev === id ? null : id));

  return (
    <section id="experience" className="section section--experience" aria-labelledby="experience-heading">
      <div className="container">
        <p className="section__label">Career</p>
        <h2 id="experience-heading" className="section__heading">Where I&rsquo;ve worked.</h2>

        <div className="exp__list">
          {experience.map(job => (
            <ExpCard
              key={job.id}
              job={job}
              isExpanded={expanded === job.id}
              onToggle={() => toggle(job.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ExpCard({ job, isExpanded, onToggle }) {
  const hasDetails = job.responsibilities.length > 0;

  return (
    <article
      className={`exp__card${isExpanded ? ' exp__card--expanded' : ''}`}
      style={{ '--company-color': job.color }}
      aria-label={`${job.role} at ${job.company}`}
    >
      <div
        className="exp__header"
        onClick={hasDetails ? onToggle : undefined}
        style={{ cursor: hasDetails ? 'pointer' : 'default' }}
        role={hasDetails ? 'button' : undefined}
        aria-expanded={hasDetails ? isExpanded : undefined}
        tabIndex={hasDetails ? 0 : undefined}
        onKeyDown={hasDetails ? (e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); } : undefined}
      >
        <div className="exp__header-left">
          <div className="exp__domain">{job.domain}</div>
          <div className="exp__role">{job.role}</div>
          <div className="exp__company-row">
            <span className="exp__company">{job.company}</span>
            <span className="exp__sep" aria-hidden="true">&middot;</span>
            <span className="exp__location">
              <MapPin size={13} aria-hidden="true" />&nbsp;{job.location}
            </span>
          </div>
        </div>

        <div className="exp__header-right">
          <span className="exp__dates">{job.dates}</span>
          {hasDetails && (
            <span className={`exp__chevron${isExpanded ? ' exp__chevron--open' : ''}`} aria-hidden="true">
              <ChevronDown size={16} />
            </span>
          )}
        </div>
      </div>

      <div className={`exp__details${isExpanded ? ' exp__details--open' : ''}`}>
        <p className="exp__description">{job.description}</p>
        {hasDetails && (
          <ul className="exp__bullets">
            {job.responsibilities.map((r, i) => (
              <li key={i} className="exp__bullet">
                <span className="exp__bullet-dot" aria-hidden="true"></span>
                {r}
              </li>
            ))}
          </ul>
        )}
        <a
          href={job.href}
          className="exp__ext-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${job.company} website`}
        >
          Visit {job.company}&nbsp;<ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
