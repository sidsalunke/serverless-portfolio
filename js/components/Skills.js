import { Code, FlaskConical, Gauge, Cloud, Eye, Bot } from 'lucide-react';
import { skills } from '../data';

const iconMap = {
  code:         Code,
  flask:        FlaskConical,
  'gauge-high': Gauge,
  cloud:        Cloud,
  eye:          Eye,
  robot:        Bot,
};

export default function Skills() {
  return (
    <section id="skills" className="section section--skills" aria-labelledby="skills-heading">
      <div className="container">
        <p className="section__label">Technology</p>
        <h2 id="skills-heading" className="section__heading">What I work with.</h2>

        <div className="skills__grid">
          {skills.map(group => (
            <div key={group.category} className="skills__group">
              <div className="skills__group-header">
                {iconMap[group.icon] && (() => {
                  const Icon = iconMap[group.icon];
                  return <Icon size={18} className="skills__icon" aria-hidden="true" />;
                })()}
                <h3 className="skills__category">{group.category}</h3>
              </div>
              <div className="skills__tags" role="list">
                {group.items.map(item => (
                  <span key={item} className="skills__tag" role="listitem">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
