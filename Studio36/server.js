const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve project data
app.get('/api/projects', (req, res) => {
    const dataPath = path.join(__dirname, 'data', 'projects.json');
    fs.readFile(dataPath, 'utf-8', (err, data) => {
        if (err) {
            res.status(500).send('Error loading project data');
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// Fallback route to load main index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
