const express = require('express');
const cors = require('cors');
const weddingRoute = require('./routes/wedding');
const { sendBlastNotification } = require('./routes/sendNotification'); // ✅ Import the correct function
require('dotenv').config();

const app = express();

// ✅ Allow preflight and dynamic origin handling
// const allowedOrigins = [
//   'http://localhost:3000',
//   'https://wedding-platform-zeta.vercel.app',
//   'https://master.d23l4mo9odzywu.amplifyapp.com',
//   'https://www.weddesigner.io'
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
// }));

// // ✅ Explicitly handle preflight OPTIONS requests
// app.options('*', cors());


app.use(cors({
  origin: ['http://localhost:3000', 'https://wedding-platform-zeta.vercel.app', 'https://master.d23l4mo9odzywu.amplifyapp.com/', 'https://www.weddesigner.io/'],
  methods: ['POST'],
}));


app.use(express.json());

// ✅ Fixed send-blast route
app.post('/send-blast', async (req, res) => {
  console.log(req.body);
  const { title, body, weddingCode } = req.body;

  const topic = weddingCode || 'all_users';

  try {
    const result = await sendBlastNotification(title, body, topic);
    if (result.success) {
      res.status(200).send(result);
    } else {
      res.status(500).send(result);
    }
  } catch (error) {
    console.error('❌ Error in sendBlastNotification handler:', error);
    res.status(500).send({ success: false, error });
  }
});

// NOTE: /api/generate-app (per-couple ZIP export) was removed — the Flutter
// app now reads WeddingConfig from Firestore at runtime instead of being
// compiled per couple. See REFACTOR_ROADMAP.md Phase 7.
app.use('/api/wedding', weddingRoute); // ✅ Wedding API route — still used by the public web site

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
