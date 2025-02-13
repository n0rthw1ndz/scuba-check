import React from 'react';
import { AnalysisResult } from '../types/email';

interface ScoreBreakdownProps {
  type: 'authentication' | 'content' | 'attachments' | 'overall';
  result: AnalysisResult;
  isOpen: boolean;
  onClose: () => void;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ type, result, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getAuthenticationBreakdown = () => {
    const { dkim, dmarc, spf } = result.headers;
    return [
      {
        text: 'DKIM Authentication',
        status: dkim?.status || 'missing',
        score: dkim?.status === 'pass' ? 33.33 : 0,
        details: dkim?.domain ? `Domain: ${dkim.domain}` : undefined,
        impact: dkim?.status === 'pass' 
          ? 'Verified email integrity and sender authenticity'
          : 'Email integrity and sender authenticity cannot be verified, increasing risk of spoofing'
      },
      {
        text: 'DMARC Verification',
        status: dmarc?.status || 'missing',
        score: dmarc?.status === 'pass' ? 33.33 : 0,
        details: dmarc?.policy ? `Policy: ${dmarc.policy}` : undefined,
        impact: dmarc?.status === 'pass'
          ? 'Domain authentication policy enforced successfully'
          : 'Domain lacks proper authentication policy, potential impersonation risk'
      },
      {
        text: 'SPF Check',
        status: spf?.status || 'missing',
        score: spf?.status === 'pass' ? 33.34 : 0,
        details: spf?.domain ? `Domain: ${spf.domain}` : undefined,
        impact: spf?.status === 'pass'
          ? 'Email originated from authorized sending server'
          : 'Email may be from unauthorized sender, increased spoofing risk'
      }
    ];
  };

  const getContentBreakdown = () => {
    const content = result.rawContent || '';
    const from = result.headers.from || '';
    return [
      {
        text: 'Suspicious Keywords/Phrases',
        details: content.match(/(urgent|immediate action|verify|account|password|bitcoin|cryptocurrency|wire transfer)/gi)?.join(', '),
        impact: content.match(/(urgent|immediate action|verify|account|password|bitcoin|cryptocurrency|wire transfer)/gi)?.length 
          ? {
              score: '-15% per match',
              explanation: 'Common phishing keywords detected, suggesting potential social engineering attempt'
            }
          : {
              score: 'No impact',
              explanation: 'No suspicious keywords found, reducing likelihood of social engineering'
            }
      },
      {
        text: 'HTML/Script Content',
        details: /<script|<html|<img|href=/i.test(content) ? 'Found HTML/Script elements' : 'No HTML/Script elements',
        impact: /<script|<html|<img|href=/i.test(content)
          ? {
              score: '-20%',
              explanation: 'HTML/Script content can hide malicious code or tracking elements'
            }
          : {
              score: 'No impact',
              explanation: 'Plain text email, lower risk of hidden malicious content'
            }
      },
      {
        text: 'Multiple URLs',
        details: `${(content.match(/https?:\/\/[^\s]+/g) || []).length} URLs found`,
        impact: (content.match(/https?:\/\/[^\s]+/g) || []).length > 3
          ? {
              score: '-15%',
              explanation: 'High number of URLs increases risk of phishing or malicious links'
            }
          : {
              score: 'No impact',
              explanation: 'Normal number of URLs, typical for legitimate email'
            }
      },
      {
        text: 'Non-Latin Characters',
        details: /[\u0400-\u04FF\u0600-\u06FF\u0900-\u097F]/u.test(content) ? 'Found non-Latin scripts' : 'No non-Latin scripts',
        impact: /[\u0400-\u04FF\u0600-\u06FF\u0900-\u097F]/u.test(content)
          ? {
              score: '-20%',
              explanation: 'Non-Latin characters often used in homograph attacks to mask malicious URLs'
            }
          : {
              score: 'No impact',
              explanation: 'Standard character set, lower risk of URL manipulation'
            }
      },
      {
        text: 'Gmail Personal Account',
        details: /@gmail\.com$/i.test(from) ? 'Sent from personal Gmail' : 'Not from personal Gmail',
        impact: /@gmail\.com$/i.test(from)
          ? {
              score: '-25%',
              explanation: 'Personal email accounts are often used in impersonation attempts'
            }
          : {
              score: 'No impact',
              explanation: 'Corporate or verified sender domain'
            }
      }
    ];
  };

  const getAttachmentBreakdown = () => {
    const attachments = result.attachments || [];
    const getFileRiskLevel = (filename: string) => {
      const ext = filename.split('.').pop()?.toLowerCase() || '';
      if (/^(exe|bat|cmd|ps1|vbs|js|wsf|msi|dll|sh|bash|jar)$/.test(ext)) return 'High';
      if (/^(doc|docm|xls|xlsm|ppt|pptm|pdf|zip|rar|7z)$/.test(ext)) return 'Medium';
      if (/^(jpg|jpeg|png|gif|txt|csv|md)$/.test(ext)) return 'Low';
      return 'Unknown';
    };

    return attachments.map(attachment => {
      const ext = attachment.filename.split('.').pop()?.toLowerCase() || '';
      const riskLevel = getFileRiskLevel(attachment.filename);
      
      const getImpactExplanation = () => {
        if (/^(exe|bat|cmd|ps1|vbs|js|wsf|msi|dll|sh|bash|jar)$/.test(ext)) {
          return 'Executable files pose extreme risk of malware infection';
        }
        if (/^(doc|docm|xls|xlsm|ppt|pptm|pdf|zip|rar|7z)$/.test(ext)) {
          return 'Document/archive files may contain malicious macros or hidden threats';
        }
        if (/^(jpg|jpeg|png|gif|txt|csv|md)$/.test(ext)) {
          return 'Common file types with lower risk, but still require caution';
        }
        return 'Unknown file type, exercise caution';
      };

      return {
        text: attachment.filename,
        details: `Size: ${(attachment.size / 1024).toFixed(2)} KB`,
        riskLevel,
        impact: {
          score: (() => {
            if (/^(exe|bat|cmd|ps1|vbs|js|wsf|msi|dll|sh|bash|jar)$/.test(ext)) return '-40%';
            if (/^(doc|docm|xls|xlsm|ppt|pptm|pdf|zip|rar|7z)$/.test(ext)) return '-20%';
            if (/^(jpg|jpeg|png|gif|txt|csv|md)$/.test(ext)) return '-5%';
            return '-10%';
          })(),
          explanation: getImpactExplanation()
        }
      };
    });
  };

  const getOverallBreakdown = () => [
    {
      text: 'Authentication Score',
      score: result.securityScore.authentication,
      weight: '40%',
      weightedScore: (result.securityScore.authentication * 0.4).toFixed(1),
      impact: {
        explanation: 'Measures email authenticity and protection against spoofing'
      }
    },
    {
      text: 'Content Analysis Score',
      score: result.securityScore.content,
      weight: '30%',
      weightedScore: (result.securityScore.content * 0.3).toFixed(1),
      impact: {
        explanation: 'Evaluates message content for phishing and social engineering indicators'
      }
    },
    {
      text: 'Attachment Risk Score',
      score: result.securityScore.attachments,
      weight: '30%',
      weightedScore: (result.securityScore.attachments * 0.3).toFixed(1),
      impact: {
        explanation: 'Assesses potential threats from attached files'
      }
    }
  ];

  const getBreakdownContent = () => {
    switch (type) {
      case 'authentication':
        return {
          title: 'Authentication Analysis',
          items: getAuthenticationBreakdown()
        };
      case 'content':
        return {
          title: 'Content Analysis',
          items: getContentBreakdown()
        };
      case 'attachments':
        return {
          title: 'Attachment Analysis',
          items: getAttachmentBreakdown()
        };
      case 'overall':
        return {
          title: 'Overall Security Analysis',
          items: getOverallBreakdown()
        };
      default:
        return { title: '', items: [] };
    }
  };

  const content = getBreakdownContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-850 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-purple-custom/20">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-purple-light">{content.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            {content.items.map((item, index) => (
              <div key={index} className="bg-slate-900 p-4 rounded-lg border border-purple-custom/20">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-medium text-gray-200">{item.text}</p>
                    {item.status && (
                      <p className={`text-sm ${
                        item.status === 'pass' ? 'text-green-400' : 
                        item.status === 'fail' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        Status: {item.status}
                      </p>
                    )}
                    {item.details && (
                      <p className="text-sm text-gray-400">{item.details}</p>
                    )}
                    {item.impact && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-red-400">
                          Impact: {typeof item.impact === 'string' ? item.impact : item.impact.score}
                        </p>
                        {typeof item.impact !== 'string' && item.impact.explanation && (
                          <p className="text-sm text-gray-400 italic">
                            {item.impact.explanation}
                          </p>
                        )}
                      </div>
                    )}
                    {item.riskLevel && (
                      <p className={`text-sm ${
                        item.riskLevel === 'High' ? 'text-red-400' :
                        item.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        Risk Level: {item.riskLevel}
                      </p>
                    )}
                  </div>
                  {item.score !== undefined && (
                    <div className="text-right">
                      <span className="font-bold text-purple-light">
                        {item.score.toFixed(1)}%
                      </span>
                      {item.weight && (
                        <p className="text-sm text-gray-400">
                          Weight: {item.weight}
                        </p>
                      )}
                      {item.weightedScore && (
                        <p className="text-sm text-gray-400">
                          Weighted: {item.weightedScore}%
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-purple-custom/20">
            <p className="font-bold text-purple-light">
              Final Score: {result.securityScore[type]}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};