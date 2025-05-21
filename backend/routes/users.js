var express = require('express');
var router = express.Router();
const db = require('./../lib/db');
const { checkUserAuth } = require('../middleware/checkAuth');


router.use(checkUserAuth);



router.get('/:id', async (req, res) => {
    const userId = parseInt(req.params.id);

    // Validate if the ID is a valid number
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID provided.' });
    }

    try {
        const result = await db.query('SELECT id, name, email, location FROM users_db WHERE id = $1', [userId]);

        if (result.rows.length > 0) {
            // Send the first (and should be only) row
            res.json(result.rows[0]);
        } else {
            // User not found
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (err) {
        console.error('Error fetching user data:', err);
        // Send a generic error message to the client
        res.status(500).json({ error: 'Internal server error.' });
    }
});




module.exports = router; 
