import axios from 'axios';

export async function testPushNotification() {
    try {
        console.log('Sending test notification...');
        const response = await axios.post('/api/push/test');
        console.log('Test notification response:', response.data);
        return true;
    } catch (error) {
        console.error('Error sending test notification:', error);
        return false;
    }
}

// Puoi chiamare questa funzione dalla console del browser:
// import { testPushNotification } from './lib/testPush';
// testPushNotification();
