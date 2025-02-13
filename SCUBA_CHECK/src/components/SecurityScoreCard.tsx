import React, { useState } from 'react';
import { ScoreBreakdown } from './ScoreBreakdown';
import { AnalysisResult } from '../types/email';

interface SecurityScoreProps {
  scores: {
    authentication: number;
    content: number;
    attachments: number;
    overall: number;
  };
  result: AnalysisResult;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

export const SecurityScoreCard: React.FC<SecurityScoreProps> = ({ scores, result }) => {
  const [selectedScore, setSelectedScore] = useState<'authentication' | 'content' | 'attachments' | 'overall' | null>(null);

  return (
    <div className="bg-theme-card p-4 rounded-lg border-theme">
      <h3 className="font-medium mb-3 text-theme-accent">Security Analysis</h3>
      <div className="grid grid-cols-4 gap-4">
        <div 
          className="text-center p-3 bg-theme-card rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow border-theme"
          onClick={() => setSelectedScore('authentication')}
        >
          <p className="text-sm text-theme-secondary">Authentication Score</p>
          <p className={`text-2xl font-bold ${getScoreColor(scores.authentication)}`}>
            {scores.authentication}%
          </p>
        </div>
        <div 
          className="text-center p-3 bg-theme-card rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow border-theme"
          onClick={() => setSelectedScore('content')}
        >
          <p className="text-sm text-theme-secondary">Content Score</p>
          <p className={`text-2xl font-bold ${getScoreColor(scores.content)}`}>
            {scores.content}%
          </p>
        </div>
        <div 
          className="text-center p-3 bg-theme-card rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow border-theme"
          onClick={() => setSelectedScore('attachments')}
        >
          <p className="text-sm text-theme-secondary">Attachment Score</p>
          <p className={`text-2xl font-bold ${getScoreColor(scores.attachments)}`}>
            {scores.attachments}%
          </p>
        </div>
        <div 
          className="text-center p-3 bg-theme-card rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow border-theme"
          onClick={() => setSelectedScore('overall')}
        >
          <p className="text-sm text-theme-secondary">Overall Score</p>
          <p className={`text-2xl font-bold ${getScoreColor(scores.overall)}`}>
            {scores.overall}%
          </p>
        </div>
      </div>

      {selectedScore && (
        <ScoreBreakdown
          type={selectedScore}
          result={result}
          isOpen={true}
          onClose={() => setSelectedScore(null)}
        />
      )}
    </div>
  );
};