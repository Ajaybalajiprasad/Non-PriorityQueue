import { useState, useEffect, useRef } from 'react';
import { ImageLike } from 'tesseract.js';
import { Send, Upload, RefreshCw } from 'lucide-react';

const OcrAiAnalyzer = () => {
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('extracted');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // PDF processing logic
  const processPdf = async (file: Blob) => {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onload = async () => {
        try {
          if (fileReader.result) {
            const typedArray = new Uint8Array(fileReader.result as ArrayBuffer);
            const { getDocument } = await import('pdfjs-dist');
            const pdf = await getDocument(typedArray).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
              fullText += pageText + '\n';
            }
            resolve(fullText);
          }
        } catch (err) {
          reject(err);
        }
      };
      fileReader.readAsArrayBuffer(file);
    });
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload an image or PDF file');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult('');
      setMessages([]);

      let extractedText = '';
      if (file.type === 'application/pdf') {
        extractedText = await processPdf(file) as string;
      } else {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker();
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();
        extractedText = text;
      }

      // Clean the extracted text
      const cleanedText = extractedText.replace(/\f/g, '').replace(/(\r\n|\n|\r){3,}/g, '\n\n').trim();
      setResult(cleanedText);

      // Initial AI analysis
      await analyzeWithMixtral(cleanedText, true);
    } catch (err) {
      setError('Failed to process the file');
      console.error('Processing error:', err);
    } finally {
      setLoading(false);
    }
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

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = Array.isArray(data) ? data[0].generated_text : data.generated_text;

      setMessages(prev => [...prev, 
        { role: 'user', content: isInitial ? 'Please analyze my resume' : currentMessage },
        { role: 'assistant', content: generatedText }
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
    if (!currentMessage.trim() || !result) return;
    await analyzeWithMixtral(result);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files[0];
    await handleFile(file);
  };

  const handleDragOver = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-center mb-6">AI Resume Analyzer & Assistant</h1>
        {/* File Upload Section */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-700'}`}
        >
          <input
            type="file"
            onChange={handleFileInput}
            accept="image/*,.pdf"
            className="hidden"
            id="file-upload"
            ref={fileInputRef}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="space-y-2">
                <p className="text-base">Drag and drop your resume here or click to browse</p>
                <p className="text-sm text-gray-500">Supports PDF, JPG, PNG, and GIF files</p>
              </div>
            </div>
          </label>
        </div>
        
        {/* Loading State */}
        {(loading || aiLoading) && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>{loading ? 'Processing file...' : 'AI is thinking...'}</span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
            {error}
          </div>
        )}

        {/* Content Tabs */}
        {result && (
          <div className="mt-6">
            <div className="flex border-b">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'extracted'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('extracted')}
              >
                Extracted Text
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'chat'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('chat')}
              >
                AI Analysis Chat
              </button>
            </div>

            {/* Display Tab Content */}
            <div className="mt-4">
              {activeTab === 'extracted' && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg whitespace-pre-wrap overflow-auto max-h-80">
                  {result}
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="chat-section bg-gray-50 dark:bg-gray-900 p-4 rounded-lg max-h-80 overflow-auto">
                  <div className="space-y-2">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`p-2 rounded-lg max-w-md ${
                            msg.role === 'user'
                              ? 'bg-blue-500 text-white self-end'
                              : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message Input for Chat */}
        {result && activeTab === 'chat' && (
          <form onSubmit={handleSendMessage} className="mt-4 flex items-center">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Ask the AI anything about your resume..."
              className="flex-grow border border-gray-300 dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200 dark:focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default OcrAiAnalyzer;

