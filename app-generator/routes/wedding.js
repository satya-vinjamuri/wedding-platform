const express = require('express');
const router = express.Router();
const db = require('../firebase/firebase');

// GET /api/wedding/:code
router.get('/:code', async (req, res) => {
    console.log(req.params);
    const { code } = req.params;
    console.log(code);
    try {
        const snapshot = await db
            .collection('weddingApps')
            .where('websiteSlug', '==', code)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'Wedding not found' });
        }

        const doc = snapshot.docs[0];
        return res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Error fetching wedding data:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
