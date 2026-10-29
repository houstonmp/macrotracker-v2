import { useEffect } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { foodDiaryActions } from '../store/food-diary-slice';
import { planRideSync } from './exercise';

const RIDES = '/bike/api/rides';
const CHECK_EVERY_MS = 60 * 1000;

// Collects finished rides from the bike bridge and adds them to the exercise diary. It's
// reached through the home server's proxy, which holds the bridge's key, so nothing here
// needs it. The bridge keeps a ride until FitPad has saved it: on the first check after
// loading, rides already in your saved diary are deleted there. Where there's no proxy
// or no key, the request fails and nothing happens.
const useBikeRides = (ready) => {
    const dispatch = useDispatch();
    const store = useStore();

    useEffect(() => {
        if (!ready) {
            return;
        }
        let firstCheck = true;
        let stopped = false;
        const check = async () => {
            try {
                const response = await fetch(RIDES);
                if (!response.ok || stopped) {
                    return;
                }
                const { toAdd, toDelete } = planRideSync(await response.json(), store.getState().fDiary.diaryObj);
                toAdd.forEach(ride => dispatch(foodDiaryActions.addExercise(ride)));
                // Only the diary as loaded proves a ride was saved; later checks just add
                if (firstCheck) {
                    await Promise.all(toDelete.map(id => fetch(`${RIDES}/${id}`, { method: 'DELETE' })));
                }
                firstCheck = false;
            } catch {
                // No bridge here
            }
        }
        check();
        const timer = setInterval(check, CHECK_EVERY_MS);
        return () => {
            stopped = true;
            clearInterval(timer);
        }
    }, [ready, dispatch, store]);
}

export default useBikeRides;
