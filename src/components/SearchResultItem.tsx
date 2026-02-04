
import React from 'react';

interface SearchResultItemProps {
  source: string;
  content: string;
  borderColor: string;
  textColor: string;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ source, content, borderColor, textColor }) => {
  return (
    <div className={`border-l-4 ${borderColor} pl-4 py-2 pr-4 rounded-r-lg hover:bg-gray-50/80 transition-colors duration-200`}>
      <p className={`text-sm font-medium ${textColor}`}>{source.replace('Source: ', '')}</p>
      <p className="mt-2 text-gray-700">{content}</p>
    </div>
  );
};

export default SearchResultItem;