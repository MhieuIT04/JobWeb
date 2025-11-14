import React from 'react';

export default function FeaturedCategories({ categories = [], onSelect }) {
  const items = categories.slice(0, 8);
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Ngành nghề trọng điểm</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {items.map(c => (
          <button key={c.id} onClick={()=>onSelect && onSelect(c)} className="p-3 bg-white dark:bg-gray-900 rounded-lg border hover:shadow">
            <div className="text-sm font-medium truncate">{c.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}


