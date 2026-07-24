import { LinkedinIcon, GithubIcon } from '../icons';
import { profile } from '../data';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer__inner">
        <div className="footer__socials">
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="LinkedIn">
            <LinkedinIcon size={20} />
          </a>
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="GitHub">
            <GithubIcon size={20} />
          </a>
        </div>
        <p className="footer__name">{profile.name}</p>
        <p className="footer__copy">&copy; {year} &middot; Built with React &amp; Webpack</p>
      </div>
    </footer>
  );
}
