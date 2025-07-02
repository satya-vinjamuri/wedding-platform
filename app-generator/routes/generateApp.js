const express = require('express');
const router = express.Router();
const flutterGenerator = require('../utils/flutterGenerator');

router.post('/', async (req, res) => {
  try {
    const formData = req.body;
    console.log(formData);
    const zipPath = await flutterGenerator.generateFlutterApp(formData);
    res.download(zipPath, 'wedding_app.zip');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while generating the app.');
  }
});

module.exports = router;

