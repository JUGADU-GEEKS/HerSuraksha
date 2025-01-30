const express = require('express');
const path = require('path'); // ✅ Import path module
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');

const app = express(); // ✅ Define app only once

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

// MongoDB connection
mongoose.connect('mongodb+srv://kunnusherry:R7qjielun7MSlzTB@cluster0.nh9gt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });

// Schema for storing audio
const AudioSchema = new mongoose.Schema({
    file: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const AudioModel = mongoose.model('Audio', AudioSchema);

// Multer storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload route
app.post('/upload', upload.single('audio'), async (req, res) => {
    try {
        const newAudio = new AudioModel({
            file: req.file.buffer,
            contentType: req.file.mimetype
        });

        await newAudio.save();
        res.json({ message: "Audio saved successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error saving audio" });
    }
});


// ✅ Corrected route definition
app.get('/', (req, res) => {
    res.render('user'); // Make sure 'user.ejs' exists in the "views" folder
});

app.get('/parents', (req,res)=>{
    res.render('parents');
})

// Route to get the latest audio file
app.get('/latest-audio', async (req, res) => {
    try {
        const latestAudio = await AudioModel.findOne().sort({ timestamp: -1 }); // Find the latest audio

        if (!latestAudio) {
            return res.status(404).json({ message: "No audio found" });
        }
        
        res.json({ audioId: latestAudio._id, contentType: latestAudio.contentType }); // Send back the ID and content type
    } catch (error) {
        console.error("Error fetching latest audio:", error);
        res.status(500).json({ message: "Error fetching audio" });
    }
});

// Route to stream the audio file based on ID
app.get('/audio/:id', async (req, res) => {
    try {
        const audio = await AudioModel.findById(req.params.id);
        if (!audio) {
          return res.status(404).send('Audio not found');
        }
    
        res.set('Content-Type', audio.contentType);
        res.send(audio.file);
      } catch (error) {
        console.error("Error fetching audio:", error);
        res.status(500).send('Error fetching audio');
      }
});



app.listen(3000, () => {
    console.log("Server running on port 3000");
});
