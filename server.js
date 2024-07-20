const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Créez le dossier de stockage s'il n'existe pas
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

app.use('/uploads', express.static('uploads'));

const upload = multer({storage: storage});

// Middleware
app.use(cors({ origin: '*' }));

// Route pour l'upload
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file was uploaded.');
    }

    const url = `${process.env.HOST_API}:${PORT}/uploads/${req.file.originalname}`;
    res.send({imageURL: url});
});

// Route pour récupérer un fichier
app.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, 'uploads', filename);

    // Vérifier si le fichier existe
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send('File not found.');
        }

        const imageURL = `${process.env.HOST_API}:${PORT}/uploads/${filename}`;
        res.send({imageURL});
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});