 
require('dotenv').config();
const express = require('express');
const app = express();
const notesRoutes = require('./routes/notes');

// Middleware
app.use(express.json()); // Pour analyser les données JSON
app.use('/notes', notesRoutes); // Routes pour la gestion des notes

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
