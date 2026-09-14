import { useEffect, useState } from 'react';

export async function request(url, options = {}) {
  const response = await fetch(`/api${url}`, options);
  const body = await response.json().catch(() => ({ message: 'Réponse du serveur indisponible.' }));
  if (!response.ok) {
    const error = new Error(body.message || 'Une erreur est survenue.');
    error.status = response.status;
    error.fields = body.fields || [];
    throw error;
  }
  return body;
}

export function useApi(url) {
  const [state, setState] = useState({ data: null, loading: true, error: null, url });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, error: null, loading: true, url });
    request(url, { signal: controller.signal }).then(data => {
      setState({ data, loading: false, error: null, url });
    }).catch(error => { if (error.name !== 'AbortError') setState({ data: null, loading: false, error, url }); });
    return () => controller.abort();
  }, [url, attempt]);
  return { ...(state.url === url ? state : { data: null, loading: true, error: null }), retry: () => setAttempt(x => x + 1) };
}
