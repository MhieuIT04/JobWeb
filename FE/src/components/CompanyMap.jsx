import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

const CompanyMap = ({ address, city }) => {
  // Simple fallback mode - no API key needed
  const encodedAddress = encodeURIComponent(`${address || city}, Việt Nam`);
  
  return (
    <div className="relative h-64 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
      {/* OpenStreetMap Embed */}
      <iframe
        title="Company Location"
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight="0"
        marginWidth="0"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=105.8,21.0,105.9,21.1&layer=mapnik&marker=21.028511,105.804817`}
        style={{ border: 0 }}
        className="grayscale-[30%]"
      />
      
      {/* Overlay with Google Maps link */}
      <div className="absolute bottom-3 left-3 right-3 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 flex-1 min-w-0">
            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="truncate">{address || city}</span>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
          >
            Chỉ đường
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default CompanyMap;
