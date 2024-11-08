import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@remix-run/react";
import { createWorker } from "tesseract.js";
import { Send, RefreshCw } from 'lucide-react';
import FileUpload from "../../components/FileUpload"; // Component for uploading files
import TemplateSelector from "../../components/TemplateSelector"; // Component for selecting templates
import PortfolioTemplate from "../../components/PortfolioTemplate"; // Component for displaying portfolio preview

export default function Upload() {
  const [resumeData, setResumeData] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const navigate = useNavigate();
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Assistant State Variables
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [activeTab, setActiveTab] = useState('preview');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to handle the completion of file processing
  const handleProcessCompletion = async (file: File) => {
    const worker = await createWorker();
    await worker.load();
    await worker.load('eng');
    await worker.reinitialize('eng');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();

    // Clean and format the extracted text
    const cleanedText = text.replace(/\f/g, '').replace(/(\r\n|\n|\r){3,}/g, '\n\n').trim();

    // Send the extracted text to the AI model for processing
    setAiLoading(true);
    try {
      const aiResponse = await processWithAI(cleanedText);
      setResumeData(aiResponse);
      // Initial AI analysis
      await analyzeWithMixtral(cleanedText, true);
    } catch (err) {
      setError("An error occurred while processing the resume with AI.");
    }
    setAiLoading(false);
  };

  // Function to send extracted text to the AI model (Mixtral)
  const processWithAI = async (text: string) => {
    // Implement any additional AI processing if needed
    return { extractedText: text, name: "Sample Name" }; // Example response
  };

  const analyzeWithMixtral = async (text: string, isInitial = false) => {
    setAiLoading(true);
    
    try {
      const prompt = isInitial 
        ? `Analyze if this is a resume and provide the following details, else say 'it is not a resume':
           1. Key qualifications and skills
           2. Notable experience highlights
           3. Areas for improvement
           4. Overall assessment`
        : currentMessage;

      const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `<s>[INST]${prompt}\n\nContext from resume:\n${text}[/INST]</s>`,
          parameters: {
            max_new_tokens: 1024,
            temperature: 0.4,
            top_p: 0.95,
            return_full_text: false
          }
        }),
      });

      const { generated_text } = await response.json();

      setMessages(prev => [...prev, 
        { role: 'user', content: isInitial ? 'Please analyze my resume' : currentMessage },
        { role: 'assistant', content: generated_text }
      ]);
      
      if (!isInitial) {
        setCurrentMessage('');
      }
    } catch (err) {
      setError('Failed to analyze with AI. Please try again.');
      console.error('AI analysis error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendMessage = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!currentMessage.trim() || !resumeData) return;
    await analyzeWithMixtral(resumeData.extractedText);
  };

  // Function to handle the selection of a template
  const handleTemplateSelection = (template: string) => {
    setSelectedTemplate(template);
    setShowUsernamePrompt(true);
  };

  // Function to handle the publishing of the portfolio
  const handlePublish = () => {
    if (username.trim() && resumeData && selectedTemplate) {
      navigate(`/check/${username}`, { state: { resumeData, template: selectedTemplate } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-500 via-indigo-600 to-pink-600 p-8 transition-all duration-500">
      <h1 className="text-5xl font-extrabold text-white mb-8 text-center">Upload Your Resume</h1>

      {/* File upload section */}
      <FileUpload onProcessComplete={handleProcessCompletion} />

      {/* Show loading indicator if AI is processing */}
      {aiLoading && (
        <div className="text-white mb-4 flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-white" />
          <span>Processing with AI...</span>
        </div>
      )}

      {/* Display the extracted resume data if available */}
      {resumeData && (
        <div className="bg-white shadow-xl rounded-lg p-6 mt-8 w-full max-w-2xl transition-all duration-500">
          <h2 className="text-4xl font-semibold mb-6 text-center text-gray-800">Portfolio Preview</h2>

          {/* Template selection */}
          <TemplateSelector onSelectTemplate={handleTemplateSelection} />

          {/* Displaying the selected template with extracted resume data */}
          {selectedTemplate && (
            <>
              <PortfolioTemplate
                name={resumeData.name}
                contact={resumeData.contact}
                skills={resumeData.skills}
                experience={resumeData.experience}
                qualifications={resumeData.qualifications}
                extractedText={resumeData.extractedText} // Adding the extracted text to the template
                selectedTemplate={selectedTemplate} // Pass selected template for rendering
              />

              {/* Content Tabs for Preview and AI Assistant */}
              <div className="mt-6">
                <div className="flex border-b border-gray-300">
                  <button
                    className={`px-4 py-2 font-semibold text-lg transition duration-300 ease-in-out ${
                      activeTab === 'preview' ? 'border-b-4 border-blue-500 text-blue-600' : 'text-gray-500'
                    } hover:text-blue-600`}
                    onClick={() => setActiveTab('preview')}
                  >
                    Preview
                  </button>
                  <button
                    className={`px-4 py-2 font-semibold text-lg transition duration-300 ease-in-out ${
                      activeTab === 'chat' ? 'border-b-4 border-blue-500 text-blue-600' : 'text-gray-500'
                    } hover:text-blue-600`}
                    onClick={() => setActiveTab('chat')}
                  >
                    AI Assistant
                  </button>
                </div>

                <div className="mt-4">
                  {activeTab === 'preview' ? (
                    <div className="h-[400px] overflow-auto border rounded-lg p-4 bg-gray-50 shadow-inner">
                      <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">{resumeData.extractedText}</pre>
                    </div>
                  ) : (
                    <div className="h-[400px] flex flex-col overflow-hidden bg-gray-50 p-4 rounded-lg">
                      <div className="flex-1 overflow-auto">
                        <div className="space-y-4">
                          {messages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  message.role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200'
                                } shadow-lg`}
                              >
                                {message.content}
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </div>
                      <form onSubmit={handleSendMessage} className="flex items-center space-x-2 mt-4">
                        <input
                          type="text"
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          placeholder="Ask AI about your resume..."
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="text-blue-600">
                          <Send size={24} />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Username prompt */}
      {showUsernamePrompt && (
        <div className="mt-6">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username to publish"
            className="w-full max-w-xs px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handlePublish}
            className="mt-4 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
          >
            Publish Portfolio
          </button>
        </div>
      )}
    </div>
  );
}
