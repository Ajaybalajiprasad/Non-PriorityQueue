// app/routes/upload.tsx
import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import FileUpload from "../../components/FileUpload";
import { createWorker } from "tesseract.js";

export default function Upload() {
  const [resumeData, setResumeData] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const navigate = useNavigate();

  const handleProcessCompletion = async (file: File) => {
    const worker = await createWorker();
    await worker.load();
    await worker.load('eng');
    await worker.reinitialize('eng');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();

    const cleanedText = text.replace(/\f/g, '').replace(/(\r\n|\n|\r){3,}/g, '\n\n').trim();
    const mockData = { name: file.name, extractedText: cleanedText };
    setResumeData(mockData);
  };

  const handlePublish = () => {
    if (username.trim() && resumeData) {
      navigate(`/check/${username}`, { state: { resumeData } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-400 via-blue-500 to-orange-500 p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Upload Your Resume</h1>
      <FileUpload onProcessComplete={handleProcessCompletion} />
      {resumeData && (
        <div className="bg-white shadow-lg rounded-lg p-6 mt-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Resume Preview</h2>
          <p className="mb-2"><span className="font-bold">Name:</span> {resumeData.name}</p>
          <div>
            <h3 className="font-bold mb-2">Extracted Text:</h3>
            <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{resumeData.extractedText}</pre>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() => setShowUsernamePrompt(true)}
          >
            Publish
          </button>
        </div>
      )}
      {showUsernamePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Enter Username</h2>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border p-2 rounded-lg w-full mb-4"
              placeholder="Username"
            />
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              onClick={handlePublish}
            >
              Publish Portfolio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
