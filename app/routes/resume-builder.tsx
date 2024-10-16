import React from 'react';
import { Link } from '@remix-run/react';

const LandingPage = () => {
  return (
    <div className="bg-indigo-700 min-h-screen text-white">
      <header className="p-4 flex justify-between items-center bg-white text-black">
        <div className="text-2xl font-bold">No priority</div>
        <nav className="space-x-4">
          <Link to="#" className="hover:underline">Product</Link>
          <Link to="#" className="hover:underline">Solutions</Link>
          <Link to="#" className="hover:underline">Resources</Link>
          <Link to="#" className="hover:underline">Pricing</Link>
        </nav>
        <div className="space-x-4 text-white">
          <button className="px-4 py-2 rounded-md bg-indigo-700">Log In</button>
          <button className="px-4 py-2 bg-indigo-700 rounded-md hover:bg-indigo-600">Get Started</button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6">Create a website without limits</h1>
        <p className="text-xl mb-8">Build and scale with confidence. From a powerful website builder to advanced business solutions—we've got you covered.</p>
        <button className="px-8 py-3 bg-white text-indigo-700 rounded-full text-lg font-semibold hover:bg-gray-100">
          Get Started
        </button>
        <p className="mt-4 text-sm">Start for free. No credit card required.</p>
        
        <div className="mt-16 bg-indigo-600 rounded-lg p-8 shadow-lg">
          <div className="bg-white rounded-lg p-4 text-indigo-700">
            <h2 className="text-3xl font-bold mb-4">Your Product Showcase</h2>
            <p className="mb-4">Display your product or service here</p>
            <button className="px-6 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800">
              Learn More
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;