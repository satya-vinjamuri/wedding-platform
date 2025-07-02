// sendNotification.js
const admin = require('firebase-admin');
const serviceAccount = require('../firebase/serviceAccount.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(), // or use cert()
    });
}

function sendBlastNotification(title, body, topic = 'all_users') {
    console.log("topic ", topic + " " + title + " " + body);
    const message = {
        topic,
        notification: {
            title,
            body,
        },
    };

    console.log("message ", message);

    return admin
        .messaging()
        .send(message)
        .then((response) => {
            console.log('✅ Successfully sent message:', response);
            return { success: true, response };
        })
        .catch((error) => {
            console.error('❌ Error sending message:', error);
            return { success: false, error };
        });
}


module.exports = { sendBlastNotification };
