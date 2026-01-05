import React, { useEffect, useState } from 'react';

interface BibleReaderProps {
  book: string;
  chapter: number;
  setBook: React.Dispatch<React.SetStateAction<string>>;
  setChapter: React.Dispatch<React.SetStateAction<number>>;
  searchQuery: string;
}

interface Verse {
  number: number;
  text: string;
}

export default function BibleReader({ book, chapter, setBook, setChapter, searchQuery }: BibleReaderProps) {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    fetch(`http://localhost:5000/bible/${book}/${chapter}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch verses');
        }
        return res.json();
      })
      .then(data => {
        setVerses(data.verses || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching Bible content:', err);
        setError(err.message);
        setVerses([]);
        setIsLoading(false);
      });
  }, [book, chapter]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Bible Reader</h2>
        <div className="flex gap-2">
          <select
            value={book}
            onChange={(e) => setBook(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
          >
            {/* Add proper Bible books enum/list here */}
            <option>Genesis</option>
            <option>Exodus</option>
          </select>
          <select
            value={chapter}
            onChange={(e) => setChapter(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
          >
            {[...Array(50)].map((_, i) => (
              <option key={i + 1} value={i + 1}>Chapter {i + 1}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="prose prose-gray max-w-none">
        {searchQuery && (
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <p className="font-medium text-yellow-800">
              Showing results for "{searchQuery}" in {book} {chapter}
            </p>
          </div>
        )}
        <div className="space-y-4 text-gray-700 leading-relaxed">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading verses...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : verses.length > 0 ? (
            verses.map((verse) => (
              <div key={verse.number} className="flex gap-4 py-2 hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-400 w-8 shrink-0 text-right">
                  {verse.number}
                </span>
                <p className="text-gray-700">{verse.text}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No verses found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}