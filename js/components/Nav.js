import { useState, useEffect } from 'react';
import { LinkedinIcon } from '../icons';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <a href="#hero" className="nav__logo" onClick={closeMenu}>SS</a>

      <ul className={`nav__links${menuOpen ? ' nav__links--open' : ''}`} role="list">
        <li><a href="#about" className="nav__link" onClick={closeMenu}>About</a></li>
        <li><a href="#experience" className="nav__link" onClick={closeMenu}>Experience</a></li>
        <li><a href="#skills" className="nav__link" onClick={closeMenu}>Skills</a></li>
        <li>
          <a href="https://www.linkedin.com/in/sidsalunke/" target="_blank" rel="noopener noreferrer" className="nav__cta btn btn--primary" onClick={closeMenu}>
            Connect&nbsp;<LinkedinIcon size={16} />
          </a>
        </li>
      </ul>

      <button
        className={`nav__hamburger${menuOpen ? ' nav__hamburger--open' : ''}`}
        onClick={() => setMenuOpen(prev => !prev)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {menuOpen && <div className="nav__backdrop" onClick={closeMenu} aria-hidden="true" />}
    </nav>
  );
}
