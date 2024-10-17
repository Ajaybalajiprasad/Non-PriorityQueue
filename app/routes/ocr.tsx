import { useState, useEffect } from 'react';
import { ImageLike } from 'tesseract.js';

const OcrAiAnalyzer = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Initialize Tesseract on component mount
  useEffect(() => {
    const loadTesseract = async () => {
      try {
        await import('tesseract.js');
      } catch (err) {
        setError('Failed to load OCR library');
        console.error('Error loading Tesseract:', err);
      }
    };
    loadTesseract();
  }, []);

  const analyzeWithMixtral = async (text: string) => {
    setAiLoading(true);
    setAiError('');
    
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `<s>[INST]Analyze this resume and provide:
                    1. Key qualifications and skills
                    2. Notable experience highlights
                    3. Areas for improvement
                    4. Overall assessment

                    Resume text:
                    ${text}[/INST]</s>`,
          parameters: {
            max_new_tokens: 1024,
            temperature: 0.4,
            top_p: 0.95,
            return_full_text: false
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API request failed: ${errorData.error || response.status}`);
      }

      const data = await response.json();
      // Handle both array and direct response formats
      const generatedText = Array.isArray(data) ? data[0].generated_text : data.generated_text;
      setAiResponse(generatedText);
    } catch (err) {
      setAiError('Failed to analyze the text with AI. Please try again.');
      console.error('AI analysis error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleFile = async (file: ImageLike) => {
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
      setAiResponse('');

      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker();
      
      // Remove deprecated calls to loadLanguage and initialize
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      // Clean up the extracted text
      const cleanedText = text
        .replace(/\f/g, '') // Remove form feed characters
        .replace(/(\r\n|\n|\r){3,}/g, '\n\n') // Replace multiple newlines with double newlines
        .trim();

      setResult(cleanedText);
      // Automatically analyze the extracted text with Mixtral
      await analyzeWithMixtral(cleanedText);
    } catch (err) {
      setError('Failed to process the file');
      console.error('OCR error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (e: { preventDefault: () => void; dataTransfer: { files: any[]; }; }) => {
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

  const handleFileInput = async (e: { target: { files: any[]; }; }) => {
    const file = e.target.files?.[0];
    await handleFile(file);
  };

  return (
    <div className="w-full max-w-[85%] mx-auto my-auto p-6 bg-gray-900 text-gray-200">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">AI Resume Analyzer</h1>
        <p className="text-gray-400">Upload your resume for OCR and AI analysis</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-800' : 'border-gray-600 hover:border-gray-500'}`}
      >
        <input
          type="file"
          onChange={handleFileInput}
          accept="image/*,.pdf"
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="space-y-4">
            <div className="text-5xl">📄</div>
            <p className="text-gray-300">
              Drag and drop your resume here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports images (JPG, PNG, GIF) and PDF files
            </p>
          </div>
        </label>
      </div>

      {(loading || aiLoading) && (
        <div className="mt-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-400">
            {loading ? 'Processing your file...' : 'Analyzing with AI...'}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-600 text-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {result && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Extracted Text:</h2>
            <div className="bg-gray-800 rounded-lg p-6 overflow-auto max-h-96">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-200">{result}</pre>
            </div>
          </div>
        )}

        {aiResponse && (
          <div>
            <h2 className="text-xl font-semibold mb-4">AI Analysis:</h2>
            <div className="bg-gray-800 rounded-lg p-6 overflow-auto max-h-96">
              <div className="prose prose-invert max-w-none">
                {aiResponse.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {aiError && (
          <div className="mt-6 p-4 bg-red-600 text-red-100 rounded-lg">
            {aiError}
          </div>
        )}
      </div>
    </div>
  );
};

export default OcrAiAnalyzer;