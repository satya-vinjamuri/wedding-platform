const express = require('express');
const cors = require('cors');
const generateAppRoute = require('./routes/generateApp');
const weddingRoute = require('./routes/wedding');
const { sendBlastNotification } = require('./routes/sendNotification'); // ✅ Import the correct function
require('dotenv').config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://wedding-platform-zeta.vercel.app',
    'https://master.d23l4mo9odzywu.amplifyapp.com/',
    'https://www.weddesigner.io/'
  ],
  methods: ['GET', 'POST'],
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

app.use('/api/generate-app', generateAppRoute);
app.use('/api/wedding', weddingRoute); // ✅ Wedding API route

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
