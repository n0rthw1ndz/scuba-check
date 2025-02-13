import React from 'react';
import { LogoAnalysisResult } from '../types/email';

interface BrandAnalysisProps {
  logoAnalysis?: LogoAnalysisResult[];
}

export const BrandAnalysis: React.FC<BrandAnalysisProps> = ({ logoAnalysis }) => {
  if (!logoAnalysis || logoAnalysis.length === 0) return null;

  return (
    <div className="bg-slate-850 p-4 rounded-lg border border-purple-custom/20">
      <h3 className="font-medium mb-3 text-purple-light">Brand Impersonation Analysis</h3>
      <div className="space-y-3">
        {logoAnalysis.map((result, index) => (
          <div key={index} className="bg-slate-900 p-3 rounded-lg border border-purple-custom/10">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-red-400">{result.brandName} Brand Detected</span>
              <span className={`px-2 py-1 rounded text-sm ${
                result.confidence > 0.8 ? 'bg-red-900/20 text-red-400' : 'bg-yellow-900/20 text-yellow-400'
              }`}>
                {Math.round(result.confidence * 100)}% Confidence
              </span>
            </div>
            <div className="text-sm text-gray-400">
              <p>Found in: {result.location}</p>
              {result.confidence > 0.8 && (
                <p className="mt-2 text-red-400">
                  ⚠️ High likelihood of brand impersonation attempt
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};