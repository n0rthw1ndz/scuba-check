import React, { useState } from 'react';
import { EmailHeaders } from '../types/email';

interface HeaderAnalysisProps {
  headers: EmailHeaders;
  rawHeaders: string;
}

interface ReceivedHeader {
  from: string;
  by: string;
  with: string;
  timestamp: Date;
  ip?: string;
}

const parseReceivedHeaders = (rawHeaders: string): ReceivedHeader[] => {
  const receivedHeaders: ReceivedHeader[] = [];
  const receivedRegex = /^Received:\s*(?:from\s+([^\s]+)[^()]*(?:\(([^)]+)\))?)?(?:\s*by\s+([^\s;]+))?(?:\s*with\s+([^;]+))?(?:;\s*(.+))?$/gm;

  let match;
  while ((match = receivedRegex.exec(rawHeaders)) !== null) {
    const [, from, ipMatch, by, with_, timestamp] = match;
    
    // Extract IP address from various formats
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
    const ip = ipMatch?.match(ipRegex)?.[0] || from?.match(ipRegex)?.[0];

    if (timestamp) {
      receivedHeaders.push({
        from: from || '',
        by: by || '',
        with: with_ || '',
        timestamp: new Date(timestamp),
        ip
      });
    }
  }

  return receivedHeaders.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const calculateTimeDiff = (headers: ReceivedHeader[]) => {
  if (headers.length < 2) return [];
  
  const diffs = [];
  for (let i = 1; i < headers.length; i++) {
    const diff = headers[i-1].timestamp.getTime() - headers[i].timestamp.getTime();
    diffs.push({
      from: headers[i].from,
      to: headers[i-1].from,
      diff: diff / 1000 // Convert to seconds
    });
  }
  return diffs;
};

export const HeaderAnalysis: React.FC<HeaderAnalysisProps> = ({ headers, rawHeaders }) => {
  const [selectedTab, setSelectedTab] = useState<'routing'|'timing'>('routing');
  const receivedHeaders = parseReceivedHeaders(rawHeaders);
  const timeDiffs = calculateTimeDiff(receivedHeaders);

  return (
    <div className="bg-theme-card p-4 rounded-lg border-theme">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-theme-accent">Header Analysis</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedTab('routing')}
            className={`px-3 py-1 rounded text-sm ${
              selectedTab === 'routing' 
                ? 'bg-theme-button text-theme-primary' 
                : 'bg-theme-card text-theme-secondary hover:text-theme-primary'
            }`}
          >
            Routing
          </button>
          <button
            onClick={() => setSelectedTab('timing')}
            className={`px-3 py-1 rounded text-sm ${
              selectedTab === 'timing' 
                ? 'bg-theme-button text-theme-primary' 
                : 'bg-theme-card text-theme-secondary hover:text-theme-primary'
            }`}
          >
            Timing
          </button>
        </div>
      </div>

      {selectedTab === 'routing' && (
        <div className="space-y-4">
          <div className="bg-theme-card p-3 rounded-lg border-theme">
            <h4 className="text-sm font-medium text-theme-accent mb-2">Email Path</h4>
            <div className="space-y-3">
              {receivedHeaders.map((header, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-theme-accent"></div>
                    {index < receivedHeaders.length - 1 && (
                      <div className="w-0.5 h-full bg-theme-button/20"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="text-theme-accent">From:</span>{' '}
                      <span className="text-theme-primary">{header.from || 'Unknown'}</span>
                      {header.ip && (
                        <span className="text-theme-secondary text-xs ml-2">({header.ip})</span>
                      )}
                    </p>
                    <p className="text-sm">
                      <span className="text-theme-accent">By:</span>{' '}
                      <span className="text-theme-primary">{header.by || 'Unknown'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-theme-accent">Protocol:</span>{' '}
                      <span className="text-theme-primary">{header.with || 'Unknown'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-theme-accent">Time:</span>{' '}
                      <span className="text-theme-primary">
                        {header.timestamp.toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'timing' && (
        <div className="space-y-4">
          <div className="bg-theme-card p-3 rounded-lg border-theme">
            <h4 className="text-sm font-medium text-theme-accent mb-2">Timing Analysis</h4>
            <div className="space-y-3">
              {timeDiffs.map((diff, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="text-theme-primary">{diff.from || 'Unknown'}</span>
                      <span className="text-theme-secondary mx-2">→</span>
                      <span className="text-theme-primary">{diff.to || 'Unknown'}</span>
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-sm ${
                    diff.diff > 300 ? 'bg-red-900/20 text-red-400' :
                    diff.diff > 60 ? 'bg-yellow-900/20 text-yellow-400' :
                    'bg-green-900/20 text-green-400'
                  }`}>
                    {diff.diff.toFixed(1)}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};