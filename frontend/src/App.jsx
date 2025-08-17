import React, { useState, useEffect } from 'react';
import { Upload, FileText, Send, Edit3, Save, Trash2, Copy, Mail } from 'lucide-react';

// Environment variable for API URL - works in Vite
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [transcriptText, setTranscriptText] = useState('');
  const [customPrompt, setCustomPrompt] = useState('Summarize the following meeting transcript in clear, concise bullet points:');
  const [summary, setSummary] = useState('');
  const [summaryId, setSummaryId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  const [recipients, setRecipients] = useState(['']);
  const [emailSubject, setEmailSubject] = useState('Meeting Summary');
  const [emailMessage, setEmailMessage] = useState('Please find the meeting summary below:');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [notification, setNotification] = useState('');
  const [recentSummaries, setRecentSummaries] = useState([]);

  useEffect(() => {
    loadRecentSummaries();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(''), 5000);
  };

  const loadRecentSummaries = async () => {
    try {
      const response = await fetch(`${API_URL}/api/summaries`);
      const data = await response.json();
      if (data.summaries) {
        setRecentSummaries(data.summaries.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load recent summaries:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('transcript', file);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setTranscriptText(data.text);
        showNotification('File uploaded successfully!');
      } else {
        showNotification(data.error || 'Upload failed', 'error');
      }
    } catch (error) {
      showNotification('Upload failed: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!transcriptText.trim()) {
      showNotification('Please upload a transcript or enter text', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: transcriptText,
          prompt: customPrompt,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
        setSummaryId(data.id);
        setEditedSummary(data.summary);
        showNotification('Summary generated successfully!');
        loadRecentSummaries();
      } else {
        showNotification(data.error || 'Failed to generate summary', 'error');
      }
    } catch (error) {
      showNotification('Failed to generate summary: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!summaryId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/summaries/${summaryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary: editedSummary }),
      });

      const data = await response.json();
      if (data.success) {
        setSummary(editedSummary);
        setIsEditing(false);
        showNotification('Summary saved successfully!');
        loadRecentSummaries();
      } else {
        showNotification(data.error || 'Failed to save summary', 'error');
      }
    } catch (error) {
      showNotification('Failed to save summary: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareEmail = async () => {
    if (!summaryId) {
      showNotification('No summary to share', 'error');
      return;
    }

    const validRecipients = recipients.filter(email => email.trim() && email.includes('@'));
    if (validRecipients.length === 0) {
      showNotification('Please enter at least one valid email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summaryId,
          recipients: validRecipients,
          subject: emailSubject,
          message: emailMessage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        showNotification(data.message);
        setShowEmailForm(false);
      } else {
        showNotification(data.error || 'Failed to share summary', 'error');
      }
    } catch (error) {
      showNotification('Failed to share summary: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const addRecipient = () => {
    setRecipients([...recipients, '']);
  };

  const updateRecipient = (index, value) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  const removeRecipient = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const loadSummary = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/summaries/${id}`);
      const data = await response.json();
      if (data.summary) {
        setSummary(data.summary.summary);
        setSummaryId(data.summary._id);
        setEditedSummary(data.summary.summary);
        setTranscriptText(data.summary.originalText);
        setCustomPrompt(data.summary.prompt);
        showNotification('Summary loaded successfully!');
      }
    } catch (error) {
      showNotification('Failed to load summary: ' + error.message, 'error');
    }
  };

  const deleteSummary = async (id) => {
    if (!id) return;
    
    if (!confirm('Are you sure you want to delete this summary?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/summaries/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setSummary('');
        setSummaryId('');
        setEditedSummary('');
        showNotification('Summary deleted successfully!');
        loadRecentSummaries();
      } else {
        showNotification(data.error || 'Failed to delete summary', 'error');
      }
    } catch (error) {
      showNotification('Failed to delete summary: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      showNotification('Summary copied to clipboard!');
    } catch (error) {
      showNotification('Failed to copy to clipboard', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Meeting Notes Summarizer
          </h1>
          <p className="text-gray-600">
            Upload transcripts, customize prompts, and share AI-generated summaries
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${
            notification.type === 'error' 
              ? 'bg-red-100 text-red-700 border border-red-300' 
              : 'bg-green-100 text-green-700 border border-green-300'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Recent Summaries */}
        {recentSummaries.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Recent Summaries</h2>
            <div className="space-y-2">
              {recentSummaries.map((item) => (
                <button
                  key={item._id}
                  onClick={() => loadSummary(item._id)}
                  className="block w-full text-left p-3 rounded border hover:bg-gray-50 text-sm"
                >
                  <div className="font-medium truncate">{item.prompt}</div>
                  <div className="text-gray-500 text-xs">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload Transcript
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File (.txt)
              </label>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="text-center text-gray-500">OR</div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Text Directly
              </label>
              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="Paste your meeting transcript here..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Prompt Customization */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Edit3 className="w-5 h-5 mr-2" />
            Customize Prompt
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Instructions
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Summarize in bullet points for executives, Highlight only action items, etc."
              className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleGenerateSummary}
            disabled={isLoading || !transcriptText.trim()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center"
          >
            {isLoading ? 'Generating...' : 'Generate Summary'}
            <FileText className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Summary Display */}
        {summary && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Generated Summary</h2>
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="text-gray-600 hover:text-gray-800 p-2 rounded"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded"
                  title="Edit summary"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  className="text-green-600 hover:text-green-800 p-2 rounded"
                  title="Share via email"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteSummary(summaryId)}
                  className="text-red-600 hover:text-red-800 p-2 rounded"
                  title="Delete summary"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveSummary}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedSummary(summary);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                  {summary}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Email Sharing Form */}
        {showEmailForm && summary && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Send className="w-5 h-5 mr-2" />
              Share via Email
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                {recipients.map((recipient, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="email"
                      value={recipient}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {recipients.length > 1 && (
                      <button
                        onClick={() => removeRecipient(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 rounded-r-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addRecipient}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add another recipient
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full h-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a personal message..."
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleShareEmail}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? 'Sending...' : 'Send Email'}
                </button>
                <button
                  onClick={() => setShowEmailForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>AI-powered meeting notes summarizer and sharer • Powered by Groq</p>
          <p className="mt-1">Upload • Customize • Generate • Edit • Share</p>
        </div>
      </div>
    </div>
  );
}

export default App;