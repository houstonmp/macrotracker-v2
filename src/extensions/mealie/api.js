// Mealie extension. FitPad works without it; it only switches on where the proxy on the
// home server's proxy answers. The proxy holds the API token and adds it
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

// ---- Recipes ----

// Why FitPad won't touch this recipe in Mealie, or null if it may. Recipes typed in by hand
// (no source website) are family recipes and the like, with no copy anywhere else.
export const protectedReason = (recipe) => {
    if (recipe.settings && recipe.settings.locked) {
        return "It's locked in Mealie, so FitPad only reads it.";
    }
    if (!recipe.orgURL) {
        return "It was typed in rather than saved from a website, so FitPad only reads it. Its ingredients in Mealie stay exactly as written.";
    }
    return null;
}


export const listRecipes = async (search = '') => {
    const params = new URLSearchParams({ perPage: '200', orderBy: 'name', orderDirection: 'asc' });
    if (search) {
        params.set('search', search);
    }
    const data = await mealieFetch(`/recipes?${params}`);
    return data.items || [];
}

export const getRecipe = (slug) => mealieFetch(`/recipes/${encodeURIComponent(slug)}`);

// Mealie's parser splits lines into amount, unit and food; it saves nothing
export const parseIngredients = (lines) => mealieFetch('/parser/ingredients', {
    method: 'POST',
    body: { parser: 'nlp', ingredients: lines },
});

// The food or unit with this name, created if Mealie doesn't have it yet. A recipe line
// can only point at foods and units that already exist. `alternatives` are other spellings
// to look for first ("parsley" for "parsleys"); the name itself is what gets created.
export const findOrCreate = async (kind, name, alternatives = []) => {
    for (const candidate of [name, ...alternatives].filter(Boolean)) {
        const wanted = candidate.trim().toLowerCase();
        const data = await mealieFetch(`/${kind}?${new URLSearchParams({ search: candidate, perPage: '50' })}`);
        const existing = (data.items || []).find(item => [item.name, item.pluralName, item.abbreviation, item.pluralAbbreviation]
            .some(value => value && value.toLowerCase() === wanted));
        if (existing) {
            return existing;
        }
    }
    return mealieFetch(`/${kind}`, { method: 'POST', body: { name: name.trim() } });
}

// Replaces only the recipe's ingredient list; steps, photos and everything else stay
export const saveIngredients = (slug, recipeIngredient) => mealieFetch(`/recipes/${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    body: { recipeIngredient },
});
