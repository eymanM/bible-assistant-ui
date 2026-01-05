'use client';

import React from 'react';
import { LineChart, BookOpen, Users } from 'lucide-react';

interface InsightsProps {
  query: string;
}

export default function Insights({ query }: InsightsProps) {
  if (!query) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Enter a search query to see insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <LineChart className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Biblical Analysis</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          This theme appears frequently in the Gospels, particularly in Matthew and Luke...
        </p>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Cross References</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          Related passages can be found in Psalms 23, Isaiah 40, and Romans 8...
        </p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Church Fathers' Perspective</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          Early church fathers like Augustine and Chrysostom interpreted this passage...
        </p>
      </div>
    </div>
  );
}