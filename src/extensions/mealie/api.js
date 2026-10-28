// Mealie extension. FitPad works without it; it only switches on where the proxy on the
// home server answers (~/fitpad/nginx on hera). The proxy holds the API token and adds it
// to each call, so nothing in the browser ever sees it. On Netlify there's no proxy, the
// check comes back 'unavailable', and FitPad doesn't show anything Mealie related.

const BASE = '/mealie/api';
const TIMEOUT_MS = 8000;

// kind: 'unavailable' (no proxy or no token here), 'unauthorized' (Mealie rejected the
// token), 'unreachable' (Mealie is down or slow), 'notFound', or 'error'
export class MealieError extends Error {
    constructor(kind, message) {
        super(message);
        this.kind = kind;
    }
}

const kindForStatus = (status) => {
    if (status === 401 || status === 403) {
        return 'unauthorized';
    }
    if (status === 404) {
        return 'notFound';
    }
    if (status === 502 || status === 503 || status === 504) {
        return 'unreachable';
    }
    return 'error';
}

export const mealieFetch = async (path, { method = 'GET', body } = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response;
    try {
        response = await fetch(BASE + path, {
            method,
            signal: controller.signal,
            credentials: 'omit',
            headers: body ? { 'Content-Type': 'application/json' } : undefined,
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch (error) {
        throw new MealieError('unreachable', "Couldn't reach Mealie");
    } finally {
        clearTimeout(timer);
    }

    if (!response.ok) {
        throw new MealieError(kindForStatus(response.status), `Mealie answered ${response.status}`);
    }
    // A host without the proxy answers every path with the app's own index.html
    if (!(response.headers.get('content-type') || '').includes('application/json')) {
        throw new MealieError('unavailable', 'Mealie is not set up here');
    }
    return response.json();
}

// { status: 'connected', username, version } or { status: <MealieError kind> }
export const checkMealie = async () => {
    try {
        const about = await mealieFetch('/app/about');
        const user = await mealieFetch('/users/self');
        return { status: 'connected', username: user.username || user.fullName || '', version: about.version || '' };
    } catch (error) {
        // The proxy answers 404 for everything when it has no token
        const kind = error.kind === 'notFound' ? 'unavailable' : error.kind;
        return { status: kind || 'error' };
    }
}
