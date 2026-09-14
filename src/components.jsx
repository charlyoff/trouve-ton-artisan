import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useApi } from './api.js';

export function Brand({ footer = false }) {
  return <Link className={`brand ${footer ? 'brand-footer' : ''}`} to="/" aria-label="Trouve ton artisan, accueil">
    {footer ? <><span>Trouve ton artisan !</span><small>Avec la région Auvergne-Rhône-Alpes</small></> : <img className="brand-logo" src="/images/logo-brief.png" width="1125" height="291" alt="Trouve ton artisan ! Avec la région Auvergne-Rhône-Alpes" />}
  </Link>;
}
export function Header() {
  const { data, loading, error, retry } = useApi('/categories');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => { setExpanded(false); setSearch(new URLSearchParams(location.search).get('q') || ''); }, [location]);
  function submit(event) { event.preventDefault(); navigate(`/artisans${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`); }
  return <header className="site-header">
    <div className="page-container">
      <div className="header-top"><Brand /><form role="search" className="search-form" onSubmit={submit}>
        <label className="visually-hidden" htmlFor="site-search">Rechercher un artisan par son nom</label>
        <input id="site-search" type="search" maxLength={100} placeholder="Rechercher un artisan…" value={search} onChange={e => setSearch(e.target.value)} />
        <button type="submit">Rechercher</button>
      </form></div>
      <button className="menu-toggle" aria-expanded={expanded} aria-controls="category-nav" onClick={() => setExpanded(!expanded)}>Catégories <span aria-hidden="true">{expanded ? '−' : '+'}</span></button>
      <nav id="category-nav" className={`category-nav ${expanded ? 'expanded' : ''}`} aria-label="Catégories d’artisanat">
        {loading && <span role="status">Chargement des catégories…</span>}
        {error && <button className="btn btn-outline-primary btn-sm" onClick={retry}>Recharger les catégories</button>}
        {data?.map(category => <NavLink key={category.id} to={`/categorie/${category.slug}`}>{category.name}</NavLink>)}
      </nav>
    </div>
  </header>;
}
export const legalPages = { 'mentions-legales': 'Mentions légales', 'donnees-personnelles': 'Données personnelles', accessibilite: 'Accessibilité', cookies: 'Cookies' };
export function Footer() {
  return <footer className="site-footer"><div className="page-container">
    <div className="footer-columns"><div><h2>Antenne de Lyon</h2><address>101 cours Charlemagne<br />CS 20033<br />69269 LYON CEDEX 02<br />France<br /><a href="tel:+33426734000">+33 (0)4 26 73 40 00</a></address></div>
      <nav aria-label="Informations légales"><h2>Informations légales</h2>{Object.entries(legalPages).map(([slug, title]) => <Link to={`/${slug}`} key={slug}>{title}</Link>)}</nav>
      <Brand footer />
    </div><p className="copyright">© {new Date().getFullYear()} Région Auvergne-Rhône-Alpes — Tous droits réservés</p>
  </div></footer>;
}
export function Rating({ value }) {
  const label = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1 }).format(value);
  return <div className="rating" role="img" aria-label={`Note : ${label} sur 5`}>
    <span className="stars" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <span key={i} className="star-slot"><img src="/images/star.svg" alt="" width="16" height="16" className={value >= i + 0.5 ? '' : 'unfilled'} /></span>)}</span>
    <span aria-hidden="true">{label}/5</span>
  </div>;
}
export function ArtisanCard({ artisan }) {
  return <article className="artisan-card card h-100"><Link to={`/artisan/${artisan.id}`} className="card-body">
    <h3>{artisan.name}</h3><Rating value={artisan.rating} /><span className="specialty">{artisan.specialty}</span><p className="location"><span aria-hidden="true">📍</span> {artisan.city}</p>
  </Link></article>;
}
export function ArtisanGrid({ artisans }) { return <div className="row g-4 artisan-grid">{artisans.map(a => <div key={a.id} className="col-12 col-md-6 col-lg-4"><ArtisanCard artisan={a} /></div>)}</div>; }
export function Loading() { return <div className="state-panel" role="status"><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Chargement des artisans…</div>; }
export function ErrorState({ error, retry }) { return <div className="state-panel"><p role="alert">{error.message}</p><button className="btn btn-primary" onClick={retry}>Réessayer</button></div>; }
export function Breadcrumb({ children }) { return <nav className="breadcrumbs" aria-label="Fil d’Ariane"><Link to="/">Accueil</Link><span aria-hidden="true">/</span>{children}</nav>; }
export function PageMeta({ title, description, noindex = false }) {
  useEffect(() => {
    document.title = `${title} | Trouve ton artisan`;
    document.querySelector('meta[name="description"]').content = description;
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.append(robots); }
    robots.content = noindex ? 'noindex,follow' : 'index,follow';
  }, [title, description, noindex]);
  return null;
}
export function RouteFocus() {
  const location = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    window.scrollTo(0, 0);
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [location.pathname, location.search]);
  return null;
}
