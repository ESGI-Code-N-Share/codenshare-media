var express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const dotenv = require('dotenv')
dotenv.config();

var app = express();
var port = process.env.PORT || 4000;

// enable CORS
app.use(cors());
app.use(cors({ origin: [process.env.CODENSHARE_WEBAPP_URL, process.env.CODENSHARE_MOBILE_URL, process.env.CODENSHARE_API_URL] }));

// parse application/json
app.use(bodyParser.json({ limit: '10mb' }));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// serving static files
app.use('/uploads', express.static('uploads'));

// handle storage using multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
var upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 Mo en octets
    },
    storage: storage
});

// request handlers
app.get('/up', (req, res) => {
    res.send('OK');
});

// handle single file upload
app.post('/uploadfile', upload.single('dataFile'), (req, res, next) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send({ message: 'Please upload a file.' });
    }
    return res.send({ message: 'File uploaded successfully.', file, imageUrl: `http://${req.hostname}:${port}/uploads/${file.filename}` });
});

// handle multiple file upload
app.post('/uploadmultifile', upload.array('dataFiles', 10), (req, res, next) => {
    const files = req.files;
    if (!files || (files && files.length === 0)) {
        return res.status(400).send({ message: 'Please upload a file.' });
    }
    return res.send({ message: 'File uploaded successfully.', files });
});

app.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, 'uploads', filename);

    // Vérifier si le fichier existe
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send({ message: 'Image not found.' });
        }

        // Renvoyer l'URL de l'image
        const imageURL = `http://${req.hostname}:${port}/uploads/${filename}`;
        res.send({ imageURL });
    });
});



app.listen(port, () => {
    console.log('Server started on: ' + port);
});