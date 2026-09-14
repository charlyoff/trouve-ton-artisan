import { useEffect, useRef, useState } from 'react';
import { request } from './api.js';

const labels = { name: 'Nom', email: 'E-mail', subject: 'Objet', message: 'Message', consent: 'Consentement' };
export default function ContactForm({ artisan }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const [fields, setFields] = useState([]);
  const form = useRef(null);
  async function loadSession() {
    try { setSession(await request('/session')); setStatus(null); }
    catch (error) { setStatus({ error: true, message: error.message }); }
  }
  useEffect(() => { loadSession(); }, [artisan.id]);
  async function submit(event) {
    event.preventDefault(); if (sending || !session) return;
    setSending(true); setFields([]); setStatus(null);
    const input = Object.fromEntries(new FormData(event.currentTarget));
    input.consent = input.consent === 'on';
    try {
      const result = await request(`/artisans/${artisan.id}/contact`, { method: 'POST',
        headers: { 'content-type': 'application/json', 'x-csrf-token': session.csrfToken }, body: JSON.stringify(input) });
      setStatus(result); form.current.reset();
    } catch (error) {
      setStatus({ error: true, message: error.message }); setFields(error.fields || []);
      if (error.fields?.[0]) form.current.elements.namedItem(error.fields[0])?.focus();
      if (error.status === 403) setSession(null);
    } finally { setSending(false); }
  }
  return <section className="contact-panel" aria-labelledby="contact-title"><h2 id="contact-title">Contacter {artisan.name}</h2>
    <p className="muted">Parlez-lui de votre projet. Une réponse sera apportée sous 48h.</p>
    <p className="required-note">Tous les champs sont obligatoires.</p>
    {session?.mailMode === 'preview' && <p className="demo-note">Mode démonstration : votre message sera enregistré localement, sans envoi d’e-mail.</p>}
    <form onSubmit={submit} ref={form}>
      <div className="row g-3">
        {['name', 'email', 'subject'].map(key => <div className={key === 'subject' ? 'col-12' : 'col-12 col-md-6'} key={key}>
          <label className="form-label" htmlFor={`contact-${key}`}>{labels[key]}</label>
          <input className="form-control" id={`contact-${key}`} name={key} type={key === 'email' ? 'email' : 'text'} autoComplete={key === 'name' ? 'name' : key === 'email' ? 'email' : 'off'} required minLength={key === 'name' ? 2 : 3} maxLength={key === 'email' ? 254 : key === 'name' ? 100 : 160} aria-invalid={fields.includes(key)} />
        </div>)}
        <div className="col-12"><label className="form-label" htmlFor="contact-message">Message</label><textarea className="form-control" id="contact-message" name="message" rows={6} required minLength={10} maxLength={5000} aria-invalid={fields.includes('message')} aria-describedby="message-hint" /><small id="message-hint" className="muted">Entre 10 et 5 000 caractères.</small></div>
      </div>
      <div className="honeypot" aria-hidden="true"><label htmlFor="website-trap">Votre site internet</label><input id="website-trap" name="website" tabIndex={-1} autoComplete="off" /></div>
      <div className="form-check consent"><input className="form-check-input" id="contact-consent" name="consent" type="checkbox" required aria-invalid={fields.includes('consent')} /><label className="form-check-label" htmlFor="contact-consent">J’accepte que mes coordonnées et mon message soient transmis à cet artisan pour répondre à ma demande.</label></div>
      {status && <div className={`alert ${status.error ? 'alert-danger' : 'alert-info'}`} role={status.error ? 'alert' : 'status'}>{status.message}{fields.length > 0 && <p className="mb-0">Champs à vérifier : {fields.map(f => labels[f] || f).join(', ')}.</p>}</div>}
      {session ? <button className="btn btn-primary contact-submit" type="submit" disabled={sending}>{sending ? 'Envoi en cours…' : 'Envoyer mon message'}</button> : <button type="button" className="btn btn-primary contact-submit" onClick={loadSession}>Activer le formulaire</button>}
    </form>
  </section>;
}
