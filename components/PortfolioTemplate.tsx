import { FaLaptopCode, FaBriefcase, FaGraduationCap, FaGithub, FaLinkedin } from 'react-icons/fa'; // Social icons

interface PortfolioProps {
  name: string;
  contact: string;
  skills: string[];
  experience: string[];
  qualifications: string[];
  extractedText: string;
  selectedTemplate: string;
}

const PortfolioTemplate: React.FC<PortfolioProps> = ({
  name,
  contact,
  skills = [],
  experience = [],
  qualifications = [],
}) => {
  return (
    <div className="portfolio-container bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 rounded-lg shadow-lg text-white max-w-4xl mx-auto mt-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8 animate-slideUp">
        <h1 className="text-5xl font-extrabold mb-2">{name}</h1>
        <p className="mt-2 text-xl">Contact: {contact}</p>
      </div>

      {/* About Me Section */}
      <div className="about-me mt-8 mb-8 animate-slideUp">
        <h2 className="text-3xl font-semibold">About Me</h2>
        <p className="mt-2 text-lg text-gray-300">
          I'm a passionate developer with a love for learning and solving complex problems. 
          I thrive in fast-paced environments and enjoy working on innovative projects. 
          Whether it's coding, problem-solving, or collaborating, I'm always looking for new opportunities to grow.
        </p>
      </div>

      {/* Skills Section */}
      <div className="mt-8 animate-fadeInUp">
        <h2 className="text-3xl font-semibold flex items-center gap-2">
          <FaLaptopCode /> Skills
        </h2>
        <ul className="list-disc list-inside mt-2 space-y-2">
          {Array.isArray(skills) && skills.length > 0 ? (
            skills.map((skill, index) => (
              <li
                key={index}
                className="bg-white text-black p-3 rounded-lg shadow-md hover:bg-gray-200 transition-transform transform hover:scale-105"
              >
                {skill}
              </li>
            ))
          ) : (
            <li>No skills listed</li>
          )}
        </ul>
      </div>

      {/* Experience Section */}
      <div className="mt-8 animate-fadeInUp">
        <h2 className="text-3xl font-semibold flex items-center gap-2">
          <FaBriefcase /> Experience
        </h2>
        <ul className="list-disc list-inside mt-2 space-y-2">
          {Array.isArray(experience) && experience.length > 0 ? (
            experience.map((exp, index) => (
              <li
                key={index}
                className="bg-white text-black p-3 rounded-lg shadow-md hover:bg-gray-200 transition-transform transform hover:scale-105"
              >
                {exp}
              </li>
            ))
          ) : (
            <li>No experience listed</li>
          )}
        </ul>
      </div>

      {/* Qualifications Section */}
      <div className="mt-8 animate-fadeInUp">
        <h2 className="text-3xl font-semibold flex items-center gap-2">
          <FaGraduationCap /> Qualifications
        </h2>
        <ul className="list-disc list-inside mt-2 space-y-2">
          {Array.isArray(qualifications) && qualifications.length > 0 ? (
            qualifications.map((qual, index) => (
              <li
                key={index}
                className="bg-white text-black p-3 rounded-lg shadow-md hover:bg-gray-200 transition-transform transform hover:scale-105"
              >
                {qual}
              </li>
            ))
          ) : (
            <li>No qualifications listed</li>
          )}
        </ul>
      </div>

      {/* Footer with Social Links */}
      <div className="footer mt-8 text-center animate-slideUp">
        <h2 className="text-3xl font-semibold mb-4">Find Me On</h2>
        <div className="flex justify-center gap-6 text-2xl">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-200 hover:text-white transition-colors"
          >
            <FaGithub />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-200 hover:text-white transition-colors"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PortfolioTemplate;
