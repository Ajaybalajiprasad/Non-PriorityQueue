// app/components/PortfolioPreview.tsx
export default function PortfolioPreview({ resumeData }: { resumeData: any }) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Portfolio Preview</h2>
        <p className="mb-2">Name: {resumeData.name || "N/A"}</p>
        <div>
          <h3 className="font-bold">Extracted Text:</h3>
          <pre className="bg-gray-100 p-4 rounded">{resumeData.extractedText}</pre>
        </div>
      </div>
    );
  }
  