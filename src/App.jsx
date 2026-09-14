import { Component } from 'react';
import { Link, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import { useApi } from './api.js';
import { Header, Footer, ArtisanGrid, Loading, ErrorState, Breadcrumb, PageMeta, Rating, RouteFocus, legalPages } from './components.jsx';
import ContactForm from './ContactForm.jsx';

const steps = ['Choisir la catégorie d’artisanat dans le menu.', 'Choisir un artisan.', 'Le contacter via le formulaire de contact.', 'Une réponse sera apportée sous 48h.'];
function Home() {
  const result = useApi('/artisans?top=true');
  return <><PageMeta title="Trouvez votre artisan en Auvergne-Rhône-Alpes" description="Trouvez un artisan près de chez vous en Auvergne-Rhône-Alpes. Découvrez les artisans du mois et contactez le professionnel qui vous correspond." />
    <section className="hero"><div className="page-container"><h1>Trouvez l’artisan qu’il vous faut en Auvergne-Rhône-Alpes</h1><p>Plus de 221 000 entreprises artisanales dans la région. Contactez celle qui vous correspond en quelques clics.</p></div></section>
    <section className="steps-section"><div className="page-container"><h2>Comment trouver mon artisan ?</h2><ol className="steps-grid">{steps.map((text, i) => <li key={text}><span className="step-number">{i + 1}</span><p>{text}</p></li>)}</ol></div></section>
    <section className="featured-section"><div className="page-container"><h2>Les artisans du mois</h2>{result.loading ? <Loading /> : result.error ? <ErrorState {...result} /> : <ArtisanGrid artisans={result.data} />}</div></section>
  </>;
}
const categoryNames = { batiment: 'Bâtiment', services: 'Services', fabrication: 'Fabrication', alimentation: 'Alimentation' };
function Listing() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const endpoint = `/artisans${slug ? `?category=${encodeURIComponent(slug)}` : q ? `?q=${encodeURIComponent(q)}` : ''}`;
  const result = useApi(endpoint);
  if (slug && !categoryNames[slug]) return <NotFound />;
  const category = result.data?.[0]?.category || categoryNames[slug];
  const title = slug ? `Les artisans : ${category}` : q ? `Résultats pour « ${q} »` : 'Tous les artisans';
  return <div className="page-container content-page"><PageMeta title={title} description={`Découvrez les artisans ${category || 'de la région Auvergne-Rhône-Alpes'}, leurs spécialités, leurs notes et leurs coordonnées de contact.`} noindex={!!q} />
    <Breadcrumb><span aria-current="page">{category || 'Recherche'}</span></Breadcrumb>
    <div className="page-heading"><span className="eyebrow">UN SAVOIR-FAIRE PRÈS DE CHEZ VOUS</span><h1>{title}</h1><p>Choisissez un professionnel et découvrez comment il peut vous accompagner.</p></div>
    {result.loading ? <Loading /> : result.error ? <ErrorState {...result} /> : <><p className="result-count" role="status">{result.data.length} artisan{result.data.length > 1 ? 's' : ''} trouvé{result.data.length > 1 ? 's' : ''}</p>{result.data.length ? <ArtisanGrid artisans={result.data} /> : <div className="state-panel"><h2>Aucun artisan trouvé</h2><p>Essayez un autre nom ou explorez les catégories du menu.</p><Link to="/artisans" className="btn btn-primary">Voir tous les artisans</Link></div>}</>}
  </div>;
}
function Profile() {
  const { id } = useParams();
  const result = useApi(`/artisans/${encodeURIComponent(id)}`);
  if (result.loading) return <div className="page-container content-page"><Loading /></div>;
  if (result.error?.status === 404 || result.error?.status === 400) return <NotFound />;
  if (result.error) return <div className="page-container content-page"><ErrorState {...result} /></div>;
  const a = result.data;
  const safeWebsite = a.website && /^https?:\/\//i.test(a.website) ? a.website : null;
  return <div className="page-container content-page"><PageMeta title={`${a.name}, ${a.specialty} à ${a.city}`} description={`${a.name}, ${a.specialty} à ${a.city}. Note ${a.rating}/5. Découvrez son savoir-faire et contactez cet artisan pour votre projet.`} />
    <Breadcrumb><Link to={`/categorie/${a.categorySlug}`}>{a.category}</Link><span aria-hidden="true">/</span><span aria-current="page">{a.name}</span></Breadcrumb>
    <div className="profile-layout"><div className="profile-information">
      <div className="artisan-illustration"><img src="/favicon-32.png" width="112" height="112" alt="Illustration d’un artisan" /><span>{a.category}</span></div>
      <div className="profile-title"><span className="specialty">{a.specialty}</span><h1>{a.name}</h1><Rating value={a.rating} /><p className="location"><span aria-hidden="true">📍</span> {a.city}</p></div>
      <section className="about-section"><h2>À propos</h2><p>{a.about}</p>{safeWebsite && <a className="website-link" href={safeWebsite} target="_blank" rel="noopener noreferrer">Visiter son site web <span className="visually-hidden">(nouvel onglet)</span><span aria-hidden="true">↗</span></a>}</section>
    </div><ContactForm key={a.id} artisan={a} /></div>
  </div>;
}
function Legal({ title }) { return <div className="page-container content-page"><PageMeta title={title} description={`${title} du site Trouve ton artisan. Page en construction.`} noindex /><Breadcrumb><span aria-current="page">{title}</span></Breadcrumb><div className="state-panel legal-panel"><span className="eyebrow">INFORMATIONS LÉGALES</span><h1>{title}</h1><h2>Page en construction</h2><p>Cette page sera prochainement complétée.</p><Link to="/" className="btn btn-primary">Retour à l’accueil</Link></div></div>; }
function NotFound() { return <div className="page-container content-page"><PageMeta title="Page non trouvée" description="Cette page est introuvable. Retrouvez les artisans de la région depuis la page d’accueil." noindex /><div className="state-panel not-found"><div className="error-illustration"><span aria-hidden="true">4</span><img src="/favicon-32.png" width="80" height="80" alt="Un artisan vous accompagne vers l’accueil" /><span aria-hidden="true">4</span></div><h1>Page non trouvée</h1><p>La page que vous cherchez n’existe pas ou a été déplacée.<br />Retrouvons ensemble le bon chemin.</p><Link to="/" className="btn btn-primary">Retour à l’accueil</Link><Link to="/artisans" className="secondary-link">Parcourir les artisans</Link></div></div>; }
class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="state-panel" role="alert"><h1>Une erreur est survenue</h1><p>Rechargez la page pour réessayer.</p><a href="/" className="btn btn-primary">Revenir à l’accueil</a></div> : this.props.children; }
}
export default function App() {
  return <ErrorBoundary><a className="skip-link" href="#main-content">Aller au contenu</a><Header /><RouteFocus /><main id="main-content" tabIndex={-1}><Routes><Route path="/" element={<Home />} /><Route path="/artisans" element={<Listing />} /><Route path="/categorie/:slug" element={<Listing />} /><Route path="/artisan/:id" element={<Profile />} />{Object.entries(legalPages).map(([slug, title]) => <Route key={slug} path={`/${slug}`} element={<Legal title={title} />} />)}<Route path="*" element={<NotFound />} /></Routes></main><Footer /></ErrorBoundary>;
}
