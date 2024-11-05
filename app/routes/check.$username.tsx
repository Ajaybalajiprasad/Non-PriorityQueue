// app/routes/portfolio/$username.tsx
import { useParams, useLocation } from "@remix-run/react";

export default function Portfolio() {
  const { username } = useParams();
  const location = useLocation();
  const resumeData = location.state?.resumeData;

  // Handle case when resumeData is not found
  if (!resumeData) {
    return (
      <div>
        <h1 className="text-4xl font-bold mb-8">Portfolio not found</h1>
        <p>No resume data found for username: {username}. Please upload a resume first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8">Portfolio for {username}</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">{resumeData.name}</h2>
        <h3 className="text-lg font-bold mb-2">Extracted Text:</h3>
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{resumeData.extractedText}</pre>
      </div>
    </div>
  );
}
