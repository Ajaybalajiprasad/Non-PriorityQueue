// components/TemplateSelector.tsx
import React from 'react';

interface TemplateSelectorProps {
  onSelectTemplate: (template: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate }) => {
  return (
    <div className="flex gap-4 mt-8">
      <div className="border p-4 rounded-lg cursor-pointer hover:shadow-lg" onClick={() => onSelectTemplate('template1')}>
        <h3 className="text-xl font-semibold">Template 1</h3>
        <p>Simple and clean design</p>
      </div>
      <div className="border p-4 rounded-lg cursor-pointer hover:shadow-lg" onClick={() => onSelectTemplate('template2')}>
        <h3 className="text-xl font-semibold">Template 2</h3>
        <p>Modern and colorful layout</p>
      </div>
    </div>
  );
};

export default TemplateSelector;
