import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from '@remix-run/react';

const Preview = () => {
  const texts = [
    "Resume in, portfolio out.",
    "JSON-rich, templates stout.",
    "Custom domain, no doubt.",
    "Smooth as silk—let’s geek it out!"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <div className="min-h-screen text-white relative">
      <img 
        src="image.png" 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover z-0" // Adjust the scale value to zoom
      />
      <div className="relative z-10 min-h-screen">
        <header className="p-4 flex justify-between items-center -ml-[2px] px-10">
          <div className="text-2xl font-bold">
            <h1>Enga Logo</h1>
          </div>
          <nav className="space-x-6">
            <Link to="#" className="hover:underline">PORTFOLIOS</Link>
            <Link to="#" className="hover:underline">TEMPLATES</Link>
            <Link to="#" className="hover:underline">RESOURCES</Link>
          </nav>
          <div className="space-x-4">
            <button className="px-4 py-2 rounded hover:bg-teal-700">LOG IN</button>
            <button className="px-4 py-2 bg-white text-black rounded hover:bg-gray-100" onClick={() => navigate('/uploads')}>Upload</button>
          </div>
        </header>
        
        <main className="container mx-auto mt-48 py-16 px-10 flex items-start justify-start h-3/4 -ml-[2px]">
          <div className="w-[65vh] text-left">
            <div className="text-md mb-4">
              <span className="mr-2">WEBSITES</span>
              <span className="text-teal-300">&gt;</span>
              <span className="ml-2">PORTFOLIOS</span>
            </div>
            <h1 className="text-7xl font-bold mb-6">Create a portfolio website</h1>
            <p className="text-lg md:text-xl mb-8">
              Showcase your work online with a portfolio website. Get started with a
              professionally designed template that can be customized to fit your brand.
            </p>
            <button 
              className="px-8 py-4 bg-white text-black text-lg font-semibold rounded hover:bg-gray-100"
              onClick={() => navigate('/uploads')}
            >
              Upload Resume
            </button>
          </div>
        </main>

        <div className="absolute top-[50%] left-[60%] transform -translate-x-1/2 -translate-y-1/2 text-teal-700 text-2xl font-bold space-y-1">
          {texts.map((text, index) => (
            <div key={index} className={index === currentIndex ? "underline opacity-65" : "opacity-45"}>
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Preview;