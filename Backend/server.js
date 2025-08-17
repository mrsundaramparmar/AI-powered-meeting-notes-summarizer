const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meeting-notes', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Summary schema
const summarySchema = new mongoose.Schema({
  originalText: { type: String, required: true },
  prompt: { type: String, required: true },
  summary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Summary = mongoose.model('Summary', summarySchema);

// Groq configuration
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Email configuration
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are allowed'), false);
    }
  }
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Upload and process transcript
app.post('/api/upload', upload.single('transcript'), async (req, res) => {
  try {
    if (!req.file && !req.body.text) {
      return res.status(400).json({ error: 'No file or text provided' });
    }

    let transcriptText;
    if (req.file) {
      transcriptText = req.file.buffer.toString('utf-8');
    } else {
      transcriptText = req.body.text;
    }

    if (!transcriptText || transcriptText.trim().length === 0) {
      return res.status(400).json({ error: 'Transcript text is empty' });
    }

    res.json({ 
      success: true, 
      text: transcriptText,
      length: transcriptText.length 
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process transcript' });
  }
});

// Generate summary using Groq AI
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, prompt } = req.body;

    if (!text || !prompt) {
      return res.status(400).json({ error: 'Text and prompt are required' });
    }

    // Default prompt if empty
    const aiPrompt = prompt || "Summarize the following meeting transcript in clear, concise bullet points:";

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a meeting summarizer" },
        { role: "user", content: `${aiPrompt}\n\n${text}` }
      ]
    });

    const summary = completion.choices[0].message.content.trim();

    // Save to DB
    const savedSummary = new Summary({
      originalText: text,
      prompt: aiPrompt,
      summary: summary
    });

    await savedSummary.save();

    res.json({
      success: true,
      id: savedSummary._id,
      summary: summary,
      prompt: aiPrompt
    });

  } catch (error) {
    console.error('Groq Summarization error:', error);
    
    if (error.message.includes('rate_limit')) {
      res.status(429).json({ error: 'Rate limit exceeded. Please try again in a moment.' });
    } else if (error.message.includes('quota')) {
      res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
    } else if (error.message.includes('Invalid API Key')) {
      res.status(401).json({ error: 'Invalid Groq API key. Please check your configuration.' });
    } else {
      res.status(500).json({ error: 'Failed to generate summary: ' + error.message });
    }
  }
});

// Get all summaries
app.get('/api/summaries', async (req, res) => {
  try {
    const summaries = await Summary.find()
      .sort({ createdAt: -1 })
      .select('_id prompt summary createdAt updatedAt')
      .limit(50);

    res.json({ summaries });
  } catch (error) {
    console.error('Get summaries error:', error);
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
});

// Get specific summary
app.get('/api/summaries/:id', async (req, res) => {
  try {
    const summary = await Summary.findById(req.params.id);
    
    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    res.json({ summary });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// Update summary
app.put('/api/summaries/:id', async (req, res) => {
  try {
    const { summary } = req.body;

    if (!summary) {
      return res.status(400).json({ error: 'Summary content is required' });
    }

    const updatedSummary = await Summary.findByIdAndUpdate(
      req.params.id,
      { summary, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedSummary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    res.json({ success: true, summary: updatedSummary });
  } catch (error) {
    console.error('Update summary error:', error);
    res.status(500).json({ error: 'Failed to update summary' });
  }
});

// Share summary via email
app.post('/api/share', async (req, res) => {
  try {
    const { summaryId, recipients, subject, message } = req.body;

    if (!summaryId || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Summary ID and recipients are required' });
    }

    const summary = await Summary.findById(summaryId);
    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    const emailSubject = subject || 'Meeting Summary';
    const emailBody = `
${message || 'Please find the meeting summary below:'}

---

${summary.summary}

---

Generated on: ${summary.createdAt.toLocaleString()}
${summary.updatedAt > summary.createdAt ? `Last updated: ${summary.updatedAt.toLocaleString()}` : ''}
    `;

    // Send email to all recipients
    for (const recipient of recipients) {
      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipient,
        subject: emailSubject,
        text: emailBody
      });
    }

    res.json({ 
      success: true, 
      message: `Summary shared with ${recipients.length} recipient(s)` 
    });

  } catch (error) {
    console.error('Share email error:', error);
    res.status(500).json({ error: 'Failed to share summary via email' });
  }
});

// Delete summary
app.delete('/api/summaries/:id', async (req, res) => {
  try {
    const deletedSummary = await Summary.findByIdAndDelete(req.params.id);
    
    if (!deletedSummary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    res.json({ success: true, message: 'Summary deleted successfully' });
  } catch (error) {
    console.error('Delete summary error:', error);
    res.status(500).json({ error: 'Failed to delete summary' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum 10MB allowed.' });
    }
  }
  res.status(500).json({ error: error.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});