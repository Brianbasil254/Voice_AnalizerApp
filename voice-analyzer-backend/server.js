const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const { Lame } = require('node-lame'); // Correct import of node-lame

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Multer Configuration
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
};

const upload = multer({ storage, fileFilter });

// Voice Analysis and Conversion Route
app.post('/api/analyze', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            console.error("No file uploaded.");
            return res.status(400).json({ message: "No audio file uploaded." });
        }

        const inputPath = req.file.path; // Path of the uploaded audio file
        const outputPath = `uploads/${req.file.filename.split('.')[0]}.mp3`; // Output MP3 file path

        console.log(`Converting file: ${inputPath} to MP3...`);

        // Create a Lame encoder and set input/output files
        const encoder = new Lame({
            output: outputPath, // Specify the output file path
            bitrate: 128,        // Set the bitrate
        }).setFile(inputPath); // Set the input file

        // Start the encoding process
        encoder.encode()
            .then(() => {
                console.log(`File converted to MP3 successfully: ${outputPath}`);

                // Placeholder analysis logic
                const analysisResult = {
                    result: "Your voice type is Baritone!", // You can replace this with real analysis
                    convertedFile: outputPath, // Path to the converted MP3 file
                };

                res.json(analysisResult);
            })
            .catch((error) => {
                console.error('Error during conversion:', error);
                res.status(500).json({ message: 'Error during conversion' });
            });

    } catch (error) {
        console.error("Error processing audio file:", error);
        res.status(500).json({ message: error.message || "An internal server error occurred." });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
