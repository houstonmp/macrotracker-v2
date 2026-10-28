import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { checkMealie } from './api';

// One connection check per page load, shared by everything that asks
let pending = null;
const runCheck = (force) => {
    if (!pending || force) {
        pending = checkMealie();
    }
    return pending;
}

// status: 'connected', 'unavailable', 'unauthorized', 'unreachable' or 'error', and null
// until the first check finishes. `available` is false until then and wherever Mealie
// isn't set up (Netlify), so nothing should show; `ready` means it's set up, switched on
// in Settings and connected. A re-check keeps the last result while `checking`.
const useMealie = () => {
    const settings = useSelector(state => state.ui.userPreferences.settings) || {};
    const enabled = settings.mealieEnabled !== false;
    const [result, setResult] = useState({ status: null });
    const [checking, setChecking] = useState(true);
    const [checks, setChecks] = useState(0);

    useEffect(() => {
        let live = true;
        runCheck(checks > 0).then(next => {
            if (live) {
                setResult(next);
                setChecking(false);
            }
        });
        return () => {
            live = false;
        }
    }, [checks]);

    const recheck = () => {
        setChecking(true);
        setChecks(count => count + 1);
    }

    return {
        ...result,
        checking,
        enabled,
        available: Boolean(result.status) && result.status !== 'unavailable',
        ready: enabled && result.status === 'connected',
        recheck,
    };
}

export default useMealie;
