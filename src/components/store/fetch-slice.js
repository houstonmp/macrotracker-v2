
import { uiActions } from "./ui-slice"
import { auth } from "../../Firebase";


export const fetchData = (fetchObj) => {

    return async (dispatch) => {
        dispatch(uiActions.showNotification({
            status: 'pending',
            title: 'Fetching Cart',
            message: 'Requesting Data from the server'
        }));
        try {
            const sendRequest = async () => {
                const token = await auth.currentUser.getIdToken()

                const response = await fetch('https://health-app-c5571-default-rtdb.firebaseio.com/' + fetchObj.url + token)
                if (!response.ok) {
                    throw new Error('Error: Couldn\'t send request');
                }
                const data = await response.json();

                return data;
            }

            const data = await sendRequest();

            fetchObj.saveData(data)

            dispatch(uiActions.showNotification({
                status: 'success',
                title: 'Data Received',
                message: 'Cart successfully downloaded from server'
            }));

        } catch (error) {
            dispatch(uiActions.showNotification({
                status: 'error',
                title: 'Upload Failed',
                message: error.message
            }));
        }
    }
}

export const fetchSlice = (objectData) => {
    return async (dispatch) => {
        dispatch(uiActions.showNotification({
            status: 'pending',
            title: 'sending',
            message: 'sending cart data'
        }));

        const sendRequest = async () => {
            const token = await auth.currentUser.getIdToken();

            const response = await fetch(`https://health-app-c5571-default-rtdb.firebaseio.com/` + objectData.url + token, objectData.header);
            if (!response.ok) {
                throw new Error('Error: Data could not be uploaded to server')
            }
        }
        try {
            await sendRequest();

            await response.json();

            dispatch(uiActions.showNotification({
                status: 'success',
                title: 'Message sent',
                message: 'Data upload was successful'
            }));
        } catch (error) {
            dispatch(uiActions.showNotification({
                status: 'error',
                title: 'Upload Failed',
                message: error.message
            }));
        }
    }
}