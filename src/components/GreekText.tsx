'use client';

import React from 'react';

interface GreekTextProps {
  query: string;
}

export default function GreekText({ query }: GreekTextProps) {
  if (!query) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Enter a search query to see Greek text</p>
      </div>
    );
  }

  return (
    <div className="prose max-w-none">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Greek New Testament</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <p className="font-greek text-xl leading-relaxed">
            Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.
          </p>
          <p className="mt-4 text-gray-600">
            In the beginning was the Word, and the Word was with God, and the Word was God.
          </p>
        </div>
      </div>
    </div>
  );
}