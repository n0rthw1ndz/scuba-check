import React, { useState } from 'react';
import { AttachmentInfo } from '../types/email';
import CryptoJS from 'crypto-js';

interface AttachmentsProps {
  attachments: AttachmentInfo[];
}

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
  <div className="group relative inline-block ml-2">
    <svg className="w-4 h-4 text-theme-secondary hover:text-theme-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute z-10 w-72 p-2 mt-2 text-sm text-theme-secondary bg-theme-card rounded-lg border-theme -left-1/2 transform -translate-x-1/4">
      {text}
    </div>
  </div>
);

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getRiskLevel = (filename: string): { level: string; color: string } => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  if (/^(exe|bat|cmd|ps1|vbs|js|wsf|msi|dll|sh|bash|jar)$/.test(ext)) {
    return { level: 'Critical', color: 'text-red-500' };
  }
  if (/^(docm|xlsm|pptm)$/.test(ext)) {
    return { level: 'High', color: 'text-red-400' };
  }
  if (/^(doc|xls|ppt|pdf|zip|rar|7z)$/.test(ext)) {
    return { level: 'Medium', color: 'text-yellow-400' };
  }
  return { level: 'Low', color: 'text-green-400' };
};

const getRiskWarning = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  if (/^(exe|bat|cmd|ps1|vbs|js|wsf|msi|dll|sh|bash|jar)$/.test(ext)) {
    return 'WARNING: Executable files can contain malware and pose an extreme security risk. Only download if you absolutely trust the source and intend to analyze in a secure environment.';
  }
  if (/^(docm|xlsm|pptm)$/.test(ext)) {
    return 'WARNING: Macro-enabled Office documents are commonly used to deliver malware. Only download if you trust the source and have a secure environment for analysis.';
  }
  if (/^(doc|xls|ppt|pdf|zip|rar|7z)$/.test(ext)) {
    return 'CAUTION: This file type can contain hidden threats. Ensure you have security software and analyze in a controlled environment.';
  }
  return 'While this file type is generally safer, always exercise caution when downloading attachments.';
};

export const Attachments: React.FC<AttachmentsProps> = ({ attachments }) => {
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) return null;

  const handleDownload = async (attachment: AttachmentInfo) => {
    try {
      setDownloading(attachment.filename);
      
      // Calculate SHA-256 hash of the content
      const contentHash = CryptoJS.SHA256(attachment.content || '').toString();
      
      // Create blob from base64 content
      const byteCharacters = atob(attachment.content || '');
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      
      const blob = new Blob(byteArrays, { type: attachment.contentType || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`File hash: ${contentHash}`); // For verification purposes
    } catch (error) {
      console.error('Error downloading attachment:', error);
    } finally {
      setDownloading(null);
      setShowConfirm(null);
    }
  };

  const calculateHashes = (content: string) => {
    const md5 = CryptoJS.MD5(content).toString();
    const sha1 = CryptoJS.SHA1(content).toString();
    return { md5, sha1 };
  };

  return (
    <div className="bg-theme-card p-4 rounded-lg border-theme">
      <h3 className="font-medium mb-3 text-theme-accent">Attachments</h3>
      <div className="space-y-2">
        {attachments.map((attachment, index) => {
          const risk = getRiskLevel(attachment.filename);
          const isConfirming = showConfirm === attachment.filename;
          const isDownloading = downloading === attachment.filename;
          const hashes = attachment.content ? calculateHashes(attachment.content) : null;

          return (
            <div key={index} className="bg-theme-card p-3 rounded-lg border-theme">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-red-400">{attachment.filename}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${risk.color}`}>{risk.level} Risk</span>
                  <div className="text-sm text-theme-secondary">
                    <span>{formatBytes(attachment.size)}</span>
                  </div>
                </div>
              </div>
              
              {attachment.contentType && (
                <div className="mt-2 text-sm">
                  <p className="text-theme-secondary">
                    <span className="text-theme-accent">Type:</span> {attachment.contentType}
                  </p>
                </div>
              )}

              {hashes && (
                <div className="mt-2 space-y-1 font-mono text-sm">
                  <div className="flex items-center">
                    <span className="text-theme-accent mr-2">MD5:</span>
                    <span className="text-theme-secondary">{hashes.md5}</span>
                    <InfoTooltip text="MD5 hash can be used to verify file integrity or check against known malware databases." />
                  </div>
                  <div className="flex items-center">
                    <span className="text-theme-accent mr-2">SHA1:</span>
                    <span className="text-theme-secondary">{hashes.sha1}</span>
                    <InfoTooltip text="SHA1 hash provides a stronger cryptographic fingerprint of the file for security analysis." />
                  </div>
                </div>
              )}

              {attachment.content && (
                <div className="mt-3">
                  {!isConfirming && !isDownloading && (
                    <button
                      onClick={() => setShowConfirm(attachment.filename)}
                      className="px-3 py-1 text-sm rounded bg-theme-button hover:bg-theme-button-hover text-white transition-colors"
                    >
                      Download for Analysis
                    </button>
                  )}
                  
                  {isDownloading && (
                    <div className="flex items-center text-theme-accent">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Downloading...
                    </div>
                  )}
                  
                  {isConfirming && (
                    <div className="space-y-3">
                      <div className="p-2 rounded bg-red-900/10 border border-red-900/20">
                        <p className="text-sm text-red-400 mb-2">{getRiskWarning(attachment.filename)}</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownload(attachment)}
                            className="px-3 py-1 text-sm rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
                          >
                            Download Anyway
                          </button>
                          <button
                            onClick={() => setShowConfirm(null)}
                            className="px-3 py-1 text-sm rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};