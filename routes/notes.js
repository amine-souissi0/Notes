const express = require('express');
const router = express.Router();
const pool = require('../db');

// Récupérer toutes les notes
router.get('/', async (req, res) => {
    const { title } = req.query; // Récupérer les paramètres de la requête
    try {
        const query = title
            ? 'SELECT * FROM notes WHERE title ILIKE $1 ORDER BY created_at DESC'
            : 'SELECT * FROM notes ORDER BY created_at DESC';
        const values = title ? [`%${title}%`] : [];
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur SQL:', err.message);
        res.status(500).send('Server Error');
    }
});


router.get('/', async (req, res) => {
    const { limit = 10, offset = 0 } = req.query;
    try {
        const result = await pool.query(
            'SELECT * FROM notes ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [parseInt(limit), parseInt(offset)]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur SQL:', err.message);
        res.status(500).send('Server Error');
    }
});


// Ajouter une nouvelle note (POST)
router.post('/', async (req, res) => {
    const { title, content, position_x, position_y, created_at } = req.body; // Ajoute created_at
    try {
        const result = await pool.query(
            'INSERT INTO notes (title, content, position_x, position_y, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, content, position_x || 0, position_y || 0, created_at || new Date().toISOString()] // Utilise new Date() si created_at est absent
        );
        res.status(201).json(result.rows[0]); // Retourne la note créée
    } catch (err) {
        console.error('Erreur SQL:', err.message);
        res.status(500).send('Server Error');
    }
});


// Mettre à jour une note (PUT)
router.put('/:id', async (req, res) => {
    const { id } = req.params; // Récupère l'ID de la note à partir des paramètres de l'URL
    const { title, content, position_x, position_y } = req.body; // Récupère les données envoyées dans le corps de la requête
    try {
        const result = await pool.query(
            'UPDATE notes SET title = $1, content = $2, position_x = $3, position_y = $4 WHERE id = $5 RETURNING *',
            [title, content, position_x || 0, position_y || 0, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Note non trouvée' });
        }
        res.json(result.rows[0]); // Retourne la note mise à jour
    } catch (err) {
        console.error('Erreur SQL:', err.message);
        res.status(500).send('Server Error');
    }
});

// Supprimer une note (DELETE)
router.delete('/:id', async (req, res) => {
    const { id } = req.params; // Récupère l'ID de la note à partir des paramètres de l'URL
    try {
        const result = await pool.query('DELETE FROM notes WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Note non trouvée' });
        }
        res.json({ message: 'Note supprimée avec succès', note: result.rows[0] }); // Retourne un message de confirmation
    } catch (err) {
        console.error('Erreur SQL:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
