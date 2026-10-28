import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkMealie } from './api';

const json = (body, status = 200) => ({ ok: status < 400, status, headers: new Headers({ 'content-type': 'application/json' }), json: async () => body });
const html = () => ({ ok: true, status: 200, headers: new Headers({ 'content-type': 'text/html' }), json: async () => { throw new Error('not json'); } });

// Answers by path, the way the proxy would
const stubFetch = (routes) => vi.stubGlobal('fetch', vi.fn(async (url) => {
    const route = routes[url.replace('/mealie/api', '')];
    if (route instanceof Error) {
        throw route;
    }
    return route || json({ detail: 'Not found' }, 404);
}));

afterEach(() => vi.unstubAllGlobals());

describe('checkMealie', () => {
    it('reports the user and version when the token works', async () => {
        stubFetch({ '/app/about': json({ version: 'v3.21.0' }), '/users/self': json({ username: 'matt' }) });
        expect(await checkMealie()).toEqual({ status: 'connected', username: 'matt', version: 'v3.21.0' });
    });

    it('is unavailable where the proxy has no token', async () => {
        stubFetch({});
        expect((await checkMealie()).status).toBe('unavailable');
    });

    it('is unavailable where there is no proxy and the app answers with its own page', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => html()));
        expect((await checkMealie()).status).toBe('unavailable');
    });

    it('says when Mealie rejects the token', async () => {
        stubFetch({ '/app/about': json({ version: 'v3.21.0' }), '/users/self': json({ detail: 'Unauthorized' }, 401) });
        expect((await checkMealie()).status).toBe('unauthorized');
    });

    it('says when Mealie is down', async () => {
        stubFetch({ '/app/about': json({}, 502) });
        expect((await checkMealie()).status).toBe('unreachable');
        stubFetch({ '/app/about': new TypeError('Failed to fetch') });
        expect((await checkMealie()).status).toBe('unreachable');
    });
});
