import React, { useState, useRef } from 'react';
import { EmailMetadata, AnalysisResult } from './types/email';
import { parseAuthHeaders, parseEmailMetadata } from './utils/emailParser';
import { calculateSecurityScore } from './utils/scoring';
import { resolveIP } from './utils/ipResolver';
import { extractURLComponents } from './utils/urlAnalyzer';
import { SecurityScoreCard } from './components/SecurityScoreCard';
import { EmailHeaders } from './components/EmailHeaders';
import { AuthenticationHeaders } from './components/AuthenticationHeaders';
import { Attachments } from './components/Attachments';
import URLAnalysis from './components/URLAnalysis';
import { ScubaLogo } from './components/ScubaLogo';
import { PrivacyNotice } from './components/PrivacyNotice';
import { HeaderAnalysis } from './components/HeaderAnalysis';
import { ThemeSelector } from './components/ThemeSelector';
import { useTheme } from './context/ThemeContext';

const SUPPORTED_EXTENSIONS = [
  '.eml',  // Standard email format
  '.msg',  // Microsoft Outlook messages
  '.mbox', // Unix mailbox format
  '.mbx',  // Alternative mailbox format
  '.mbs',  // Alternative mailbox format
  '.mht',  // MIME HTML format
  '.mhtml' // MIME HTML format
];

function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRawEmail, setShowRawEmail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeEmail = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const content = await file.text();
      const metadata = parseEmailMetadata(content);
      const headerSection = content.split(/\r?\n\r?\n/)[0];
      const authHeaders = parseAuthHeaders(headerSection);
      
      if (authHeaders.spf?.ip) {
        const ipInfo = await resolveIP(authHeaders.spf.ip);
        if (ipInfo) {
          authHeaders.spf.ipInfo = ipInfo;
        }
      }

      // Extract URLs without full analysis
      const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
      const urlMatches = content.match(urlRegex) || [];
      const urls = urlMatches.map(url => ({
        ...extractURLComponents(url),
        suspicious: false,
        reasons: []
      }));
      
      const securityScore = calculateSecurityScore(authHeaders, content, metadata.attachments);
      
      setResult({
        headers: {
          from: metadata.from,
          to: metadata.to,
          subject: metadata.subject,
          date: metadata.date,
          receivedHeaders: metadata.receivedHeaders,
          ...authHeaders
        },
        rawContent: content,
        urls,
        attachments: metadata.attachments,
        securityScore
      });
    } catch (error: any) {
      console.error('Error analyzing email:', error);
      setError(error.message || 'Error analyzing email file');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verify file extension
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(fileExt)) {
        setError(`Unsupported file type. Please use one of: ${SUPPORTED_EXTENSIONS.join(', ')}`);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      analyzeEmail(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <ThemeSelector />
      <PrivacyNotice />
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <ScubaLogo />
          <h1 className="text-4xl font-bold mb-2 text-theme-accent">Scuba Check</h1>
          <p className="text-theme-secondary text-lg mb-8">Dive deep into your email security</p>
        </div>
        
        <div className="bg-theme-card rounded-lg shadow-xl p-6 border-theme">
          <div className="mb-6">
            <label className="block text-sm font-medium text-theme-accent mb-2">
              Upload Email File
            </label>
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                accept={SUPPORTED_EXTENSIONS.join(',')}
                onChange={handleFileUpload}
                className="block w-full text-sm text-theme-secondary
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-theme-button file:text-white
                  hover:file:bg-theme-button-hover
                  cursor-pointer"
              />
              <p className="text-sm text-theme-secondary">
                Maximum file size: 10MB. Supported formats: {SUPPORTED_EXTENSIONS.join(', ')}
              </p>
            </div>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-accent mx-auto"></div>
              <p className="text-theme-accent mt-2">Analyzing email...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <SecurityScoreCard scores={result.securityScore} result={result} />
              <EmailHeaders headers={result.headers} />
              {result.headers.receivedHeaders && (
                <HeaderAnalysis 
                  headers={result.headers} 
                  rawHeaders={result.headers.receivedHeaders} 
                />
              )}
              <AuthenticationHeaders {...result.headers} />
              <URLAnalysis urls={result.urls || []} />
              {result.attachments && <Attachments attachments={result.attachments} />}

              <div className="bg-theme-card p-4 rounded-lg border-theme">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-theme-accent">Raw Email Content</h3>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showRawEmail}
                      onChange={(e) => setShowRawEmail(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-button/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-button"></div>
                    <span className="ml-3 text-sm font-medium text-theme-secondary">
                      Show Raw Email
                    </span>
                  </label>
                </div>
                {showRawEmail && result.rawContent && (
                  <div className="whitespace-pre-wrap font-mono text-sm bg-theme-card p-4 rounded border-theme text-theme-secondary overflow-x-auto">
                    {result.rawContent}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Signature Section */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-theme-card px-6 py-4 rounded-lg border-theme">
            <p className="text-theme-accent font-medium">Created by n0rthw1ndz</p>
            <a 
              href="mailto:devchaps@gmail.com" 
              className="text-theme-secondary hover:text-theme-accent transition-colors"
            >
              devchaps@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;