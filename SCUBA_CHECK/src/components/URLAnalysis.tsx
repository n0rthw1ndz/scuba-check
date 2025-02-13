import React, { useState } from 'react';
import { URLInfo } from '../types/email';
import { analyzeURLs } from '../utils/urlAnalyzer';

interface URLAnalysisProps {
  urls?: URLInfo[];
}

const URLAnalysis: React.FC<URLAnalysisProps> = ({ urls }) => {
  const [analyzedUrls, setAnalyzedUrls] = useState<{ [key: string]: URLInfo }>({});
  const [analyzing, setAnalyzing] = useState<{ [key: string]: boolean }>({});

  if (!urls || urls.length === 0) return null;

  const handleAnalyzeClick = async (url: URLInfo) => {
    if (analyzedUrls[url.url]) return; // Skip if already analyzed
    
    setAnalyzing(prev => ({ ...prev, [url.url]: true }));
    try {
      const results = await analyzeURLs(url.url);
      if (results && results.length > 0) {
        setAnalyzedUrls(prev => ({
          ...prev,
          [url.url]: results[0]
        }));
      }
    } catch (error) {
      console.error('Error analyzing URL:', error);
    } finally {
      setAnalyzing(prev => ({ ...prev, [url.url]: false }));
    }
  };

  return (
    <div className="bg-theme-card p-4 rounded-lg border-theme">
      <h3 className="font-medium mb-3 text-theme-accent">URL Analysis</h3>
      <div className="space-y-3">
        {urls.map((url, index) => {
          const analyzedUrl = analyzedUrls[url.url];
          const isAnalyzing = analyzing[url.url];

          return (
            <div key={index} className="bg-theme-card p-3 rounded-lg border-theme">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-theme-primary break-all max-w-[75%]">{url.url}</span>
                {!analyzedUrl && !isAnalyzing && (
                  <button
                    onClick={() => handleAnalyzeClick(url)}
                    className="px-3 py-1 text-sm rounded bg-theme-button hover:bg-theme-button-hover text-theme-primary transition-colors"
                  >
                    Analyze
                  </button>
                )}
                {isAnalyzing && (
                  <div className="flex items-center text-theme-accent">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Analyzing...
                  </div>
                )}
                {analyzedUrl && (
                  <span className={`px-2 py-1 rounded text-sm ${
                    analyzedUrl.suspicious ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'
                  }`}>
                    {analyzedUrl.suspicious ? 'Suspicious' : 'Clean'}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p><span className="text-theme-accent">Domain:</span> <span className="text-theme-primary">{url.domain}</span></p>
                  <p><span className="text-theme-accent">Protocol:</span> <span className="text-theme-primary">{url.protocol}</span></p>
                </div>
                {analyzedUrl?.reputation && (
                  <div>
                    <p>
                      <span className="text-theme-accent">Reputation Score:</span>
                      <span className={`ml-2 ${
                        analyzedUrl.reputation.score > 80 ? 'text-red-400' :
                        analyzedUrl.reputation.score > 40 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {analyzedUrl.reputation.score.toFixed(1)}%
                      </span>
                    </p>
                    <p><span className="text-theme-accent">Source:</span> <span className="text-theme-primary">{analyzedUrl.reputation.source}</span></p>
                  </div>
                )}
              </div>

              {analyzedUrl?.suspicious && analyzedUrl.reasons.length > 0 && (
                <div className="mt-2 p-2 bg-theme-card rounded border-theme">
                  <p className="text-sm font-medium text-red-400 mb-1">Suspicious indicators:</p>
                  <ul className="list-disc list-inside text-sm text-theme-primary">
                    {analyzedUrl.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analyzedUrl?.reputation?.categories && analyzedUrl.reputation.categories.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-theme-accent">Categories:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {analyzedUrl.reputation.categories.map((category, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs rounded bg-theme-card border-theme text-theme-accent">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default URLAnalysis;