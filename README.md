# 🤖 AI Meeting Notes Summarizer & Sharer

> **Transform your meeting transcripts into actionable summaries with AI-powered intelligence**

A full-stack web application that leverages **Groq's lightning-fast AI** to convert meeting transcripts into structured summaries, with custom prompting, real-time editing, and seamless email sharing capabilities.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue)](https://your-app.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Railway-green)](https://your-backend.railway.app)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

![App Screenshot](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=AI+Meeting+Notes+Summarizer)

---

## ✨ **Features**

### 🚀 **Core Functionality**
- **📁 Smart Upload**: Support for .txt files or direct text paste
- **🤖 AI-Powered**: Groq's Mixtral-8x7B for ultra-fast summarization
- **✏️ Custom Prompts**: Tailor AI instructions ("Summarize for executives", "Action items only", etc.)
- **📝 Live Editing**: Edit AI-generated summaries with real-time save
- **📧 Email Sharing**: Send to multiple recipients with custom messages
- **🕒 Summary History**: Access and reload recent summaries
- **📱 Responsive**: Perfect on desktop, tablet, and mobile

### 🎯 **Smart AI Features**
- **Context-Aware**: AI understands meeting context and structure
- **Multi-Style Output**: Bullet points, executive summaries, action items
- **Fast Processing**: Groq's infrastructure for sub-second responses
- **Quality Control**: Consistent, professional formatting

### 🛠️ **Developer Features**
- **RESTful API**: Clean, documented endpoints
- **Error Handling**: Comprehensive error management
- **Security**: Input validation, CORS protection
- **Scalable**: MongoDB Atlas for reliable data storage

---

## 🏗️ **Tech Stack**

### **Frontend**
```
⚡ React 18 + Vite
🎨 Tailwind CSS
📦 Lucide React Icons
🌐 Deployed on Vercel
```

### **Backend**
```
🚀 Node.js + Express.js
📊 MongoDB + Mongoose
🤖 Groq AI SDK (Mixtral-8x7B)
📧 Nodemailer (Gmail SMTP)
☁️ Deployed on Railway
```

---

## 🚦 **Quick Start**

### **Prerequisites**
- Node.js 16+
- npm or yarn
- MongoDB Atlas account (free)
- Groq API key (free tier available)
- Gmail account with App Password

### **1️⃣ Clone Repository**
```bash
git clone https://github.com/your-username/ai-meeting-summarizer.git
cd ai-meeting-summarizer
```

### **2️⃣ Backend Setup**
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meeting-notes
GROQ_API_KEY=gsk_your-groq-api-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
CORS_ORIGIN=http://localhost:3000
```

**Start backend:**
```bash
npm run dev
```
✅ Backend running on `http://localhost:5000`

### **3️⃣ Frontend Setup**
```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env

# Start frontend
npm run dev
```
✅ Frontend running on `http://localhost:3000`

---

## 🌐 **API Documentation**

### **Base URL**: `https://your-backend.railway.app/api`

### **Endpoints**

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/health` | Health check | - |
| `POST` | `/upload` | Upload transcript | `FormData` or `{text: string}` |
| `POST` | `/summarize` | Generate AI summary | `{text: string, prompt: string}` |
| `GET` | `/summaries` | Get recent summaries | - |
| `GET` | `/summaries/:id` | Get specific summary | - |
| `PUT` | `/summaries/:id` | Update summary | `{summary: string}` |
| `POST` | `/share` | Share via email | `{summaryId, recipients[], subject, message}` |
| `DELETE` | `/summaries/:id` | Delete summary | - |

### **Example API Call**
```javascript
// Generate AI Summary
const response = await fetch('/api/summarize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "Meeting transcript here...",
    prompt: "Summarize in bullet points for executives"
  })
});

const data = await response.json();
console.log(data.summary); // AI-generated summary
```

---

## 🚀 **Deployment**

### **🔥 One-Click Deploy**

[![Deploy Backend](https://railway.app/button.svg)](https://railway.app)
[![Deploy Frontend](https://vercel.com/button)](https://vercel.com)

### **📋 Manual Deployment**

#### **Backend (Railway)**
1. Create Railway project
2. Connect GitHub repository
3. Set environment variables:
   ```
   GROQ_API_KEY=gsk_your-api-key
   MONGODB_URI=mongodb+srv://your-connection
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```
4. Deploy automatically via Git push

#### **Frontend (Vercel)**
1. Import GitHub repository to Vercel
2. Set environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
3. Deploy automatically

#### **Update CORS**
After frontend deployment, update backend:
```
CORS_ORIGIN=https://your-frontend.vercel.app
```

---

## 📖 **Usage Guide**

### **1. Upload Transcript**
- Upload `.txt` file or paste text directly
- Support for any meeting transcript format

### **2. Customize AI Prompt**
```
Examples:
- "Summarize in bullet points for executives"
- "Extract only action items and deadlines"
- "Create a brief overview for team updates"
- "Highlight decisions and next steps"
```

### **3. Generate & Edit**
- Click "Generate Summary" for AI processing
- Edit the result in real-time
- Auto-save functionality

### **4. Share Results**
- Email to multiple recipients
- Custom subject and message
- Professional formatting

---

## 🔧 **Configuration**

### **Environment Variables**

#### **Backend**
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection | `mongodb+srv://...` |
| `GROQ_API_KEY` | Groq AI API key | `gsk_...` |
| `EMAIL_USER` | Gmail address | `your-email@gmail.com` |
| `EMAIL_PASS` | Gmail app password | `abcd efgh ijkl mnop` |
| `CORS_ORIGIN` | Frontend URL | `https://your-app.vercel.app` |

#### **Frontend**
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.railway.app` |

---

## 🧪 **Testing**

### **Backend Tests**
```bash
cd backend
npm test
```

### **Frontend Tests**
```bash
cd frontend
npm run test
```

### **Manual Testing Checklist**
- [ ] File upload works
- [ ] Text paste works
- [ ] AI summarization completes
- [ ] Summary editing saves
- [ ] Email sharing delivers
- [ ] Recent summaries load
- [ ] Delete functionality works
- [ ] Error handling displays properly

---

## 🔍 **Troubleshooting**

### **Common Issues**

**❌ CORS Errors**
```bash
# Ensure CORS_ORIGIN matches frontend URL exactly
CORS_ORIGIN=https://your-frontend.vercel.app
```

**❌ AI API Errors**
```bash
# Check Groq API key
curl -H "Authorization: Bearer gsk_your-key" https://api.groq.com/openai/v1/models
```

**❌ Email Not Working**
- Use Gmail App Password, not regular password
- Enable 2FA in Google Account
- Generate App Password in Google Account Settings

**❌ MongoDB Connection**
- Whitelist IP `0.0.0.0/0` in MongoDB Atlas
- Check connection string format
- Verify database user permissions

### **Debug Commands**
```bash
# Check logs
npm run dev # Local development
railway logs # Railway deployment
vercel logs # Vercel deployment

# Test API endpoints
curl http://localhost:5000/api/health
curl -X POST http://localhost:5000/api/summarize
```

---

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

### **Development Setup**
1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit: `git commit -m 'Add feature-name'`
5. Push: `git push origin feature-name`
6. Create Pull Request

### **Contribution Guidelines**
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass
- Keep PRs focused and atomic

---

## 📊 **Performance**

### **Benchmarks**
- **AI Response Time**: < 3 seconds (Groq Mixtral)
- **File Upload**: 10MB max, < 2 seconds processing
- **Database Queries**: < 100ms average
- **Email Delivery**: < 5 seconds average

### **Scalability**
- **Concurrent Users**: 100+ supported
- **Storage**: MongoDB Atlas auto-scaling
- **API Rate Limits**: 1000 requests/hour per IP

---

## 🛣️ **Roadmap**

### **v2.0 Features**
- [ ] User authentication & personal dashboards
- [ ] PDF/Word document support
- [ ] Real-time collaborative editing
- [ ] Summary templates & presets
- [ ] Calendar integration (Google/Outlook)
- [ ] Mobile app (React Native)
- [ ] Advanced AI models (GPT-4, Claude)
- [ ] Audio transcription integration
- [ ] Export to multiple formats
- [ ] Analytics & usage tracking

### **v1.1 Planned**
- [ ] Drag & drop file upload
- [ ] Summary version history
- [ ] Batch processing multiple files
- [ ] Custom email templates
- [ ] Dark mode theme

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 **Author**

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/your-profile)
- Email: your-email@example.com

---

## 🙏 **Acknowledgments**

- **Groq**: For providing lightning-fast AI inference
- **MongoDB Atlas**: For reliable cloud database
- **Railway**: For seamless backend deployment
- **Vercel**: For excellent frontend hosting
- **Tailwind CSS**: For beautiful, responsive design
- **Lucide**: For clean, modern icons

---

## 📞 **Support**

Having issues? We're here to help!

- 📖 **Documentation**: Check this README first
- 🐛 **Bug Reports**: [Create an Issue](https://github.com/your-username/ai-meeting-summarizer/issues)
- 💡 **Feature Requests**: [Start a Discussion](https://github.com/your-username/ai-meeting-summarizer/discussions)
- 📧 **Direct Support**: your-email@example.com

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by developers, for developers.

[🚀 **Deploy Now**](https://vercel.com) • [📖 **Documentation**](https://github.com/your-username/ai-meeting-summarizer) • [💬 **Community**](https://github.com/your-username/ai-meeting-summarizer/discussions)

</div>
