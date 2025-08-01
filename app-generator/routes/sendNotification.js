// // sendNotification.js
// const admin = require('firebase-admin');
// const serviceAccount = require('../firebase/serviceAccount.json');

// if (!admin.apps.length) {
//     admin.initializeApp({
//         credential: admin.credential.applicationDefault(), // or use cert(serviceAccount)
//     });
// }

// function sendBlastNotification(title, body, topic = 'all_users') {
//     console.log("topic ", topic + " " + title + " " + body);

//     const message = {
//         topic,
//         notification: {
//             title,
//             body,
//         },
//         android: {
//             priority: 'high',
//             notification: {
//                 channelId: 'default_channel', // must match your Flutter app channel
//                 sound: 'default',
//             },
//         },
//         apns: {
//             payload: {
//                 aps: {
//                     alert: {
//                         title,
//                         body,
//                     },
//                     sound: 'default',
//                 },
//             },
//         },
//         data: {
//             click_action: 'FLUTTER_NOTIFICATION_CLICK',
//             topic,
//         },
//     };

//     console.log("message ", JSON.stringify(message, null, 2));

//     return admin
//         .messaging()
//         .send(message)
//         .then((response) => {
//             console.log('✅ Successfully sent message:', response);
//             return { success: true, response };
//         })
//         .catch((error) => {
//             console.error('❌ Error sending message:', error);
//             return { success: false, error };
//         });
// }

// module.exports = { sendBlastNotification };


const axios = require('axios');

// Replace with your OneSignal App ID and REST API Key
const ONESIGNAL_APP_ID = '13a8752e-c3eb-4ece-b2d0-7118e3ebadea';
const ONESIGNAL_API_KEY = 'os_v2_app_couhklwd5nhm5mwqoemoh25n5i7bdxvt3m6e5euo6xgcxiyuzzsxyonwwbwsowxo4fe6zxen2prmcl4p34f6ivszmi3gpltcwmbw5li';

function sendBlastNotification(title, body, weddingCode = 'all_users') {
    console.log("🔔 Sending to:", weddingCode, "| Title:", title, "| Body:", body);

    const data = {
        app_id: ONESIGNAL_APP_ID,
        headings: { en: title },
        contents: { en: body },
        filters: [
            {
                field: 'tag',
                key: 'wedding_code',
                relation: '=',
                value: weddingCode
            }
        ],
        data: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
            wedding_code: weddingCode
        },
    };

    return axios.post('https://onesignal.com/api/v1/notifications', data, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${ONESIGNAL_API_KEY}`,
        },
    })
        .then(response => {
            console.log('✅ Successfully sent OneSignal message:', response.data.id);
            return { success: true, response: response.data };
        })
        .catch(error => {
            console.error('❌ Error sending OneSignal message:', error.response?.data || error.message);
            return { success: false, error };
        });
}

module.exports = { sendBlastNotification };
