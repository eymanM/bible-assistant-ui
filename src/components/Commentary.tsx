'use client';

import React from 'react';

interface CommentaryProps {
  query: string;
}

export default function Commentary({ query }: CommentaryProps) {
  if (!query) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Enter a search query to see commentary</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Augustine of Hippo</h3>
          <p className="mt-1 text-sm text-gray-500">Confessions, Book X</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <p className="text-gray-600">
            "Late have I loved you, beauty so old and so new: late have I loved you..."
          </p>
        </div>
      </div>
    </div>
  );
}