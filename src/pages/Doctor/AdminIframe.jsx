import React from 'react';

export default function AdminIframe({ tab }) {
  // Pass ?embed=true and the specific tab to render
  const iframeSrc = `/?embed=true&admTab=${tab}`;

  return (
    <div className="w-full h-full glass rounded-3xl overflow-hidden flex flex-col shadow-sm">
      <iframe 
        src={iframeSrc} 
        className="w-full h-full border-none"
        title={`Admin ${tab}`}
      />
    </div>
  );
}
