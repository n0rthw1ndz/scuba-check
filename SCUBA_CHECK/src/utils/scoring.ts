import { AttachmentInfo } from '../types/email';

const getAttachmentRiskDetails = (filename: string, size: number) => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const sizeInMB = size / (1024 * 1024);
  
  // Base risk assessment
  if (/^(exe|bat|cmd|ps1|vbs|js|wsf|msi|dll|sh|bash|jar)$/.test(ext)) {
    return {
      riskLevel: 'Critical',
      penalty: 100,
      reason: 'Executable files can contain malware and pose an extreme security risk',
      recommendations: [
        'Never open executable files from unknown senders',
        'Use antivirus software to scan attachments',
        'Verify the sender through alternative channels'
      ]
    };
  }
  
  if (/^(docm|xlsm|pptm)$/.test(ext)) {
    return {
      riskLevel: 'High',
      penalty: 40,
      reason: 'Macro-enabled Office documents are commonly used to deliver malware',
      recommendations: [
        'Disable macros by default',
        'Only enable macros for trusted sources',
        'Use protected view when opening'
      ]
    };
  }
  
  if (/^(pdf)$/.test(ext)) {
    return {
      riskLevel: 'Medium',
      penalty: 30,
      reason: 'PDFs can contain malicious JavaScript or exploit vulnerabilities',
      recommendations: [
        'Use a secure PDF viewer',
        'Disable JavaScript in PDF reader',
        'Keep PDF software updated'
      ]
    };
  }
  
  if (/^(doc|xls|ppt|zip|rar|7z)$/.test(ext)) {
    return {
      riskLevel: 'Medium',
      penalty: 25,
      reason: 'Office documents and archives can contain hidden threats',
      recommendations: [
        'Use protected view for Office documents',
        'Scan archives before extracting',
        'Be cautious with password-protected archives'
      ]
    };
  }
  
  if (/^(jpg|jpeg|png|gif)$/.test(ext)) {
    return {
      riskLevel: 'Low',
      penalty: 5,
      reason: 'Image files generally pose lower risk but can still contain malicious code',
      recommendations: [
        'Keep image viewers updated',
        'Use trusted image viewing software',
        'Be cautious of unusual image sizes'
      ]
    };
  }
  
  if (/^(txt|csv|md)$/.test(ext)) {
    return {
      riskLevel: 'Low',
      penalty: 5,
      reason: 'Text files are generally safe but verify content before opening',
      recommendations: [
        'Use a simple text editor',
        'Check for unusual encodings',
        'Be cautious of very large text files'
      ]
    };
  }
  
  return {
    riskLevel: 'Unknown',
    penalty: 15,
    reason: 'Unknown file type, exercise caution',
    recommendations: [
      'Verify file type before opening',
      'Use antivirus software to scan',
      'Contact sender to verify purpose'
    ]
  };
};

export const calculateAttachmentRisk = (attachments: AttachmentInfo[] = []) => {
  if (!attachments.length) return {
    score: 100,
    details: []
  };
  
  let score = 100;
  const details = [];
  let hasPDF = false;
  let hasExecutable = false;
  let hasMacroEnabled = false;
  
  // Analyze each attachment
  for (const attachment of attachments) {
    const risk = getAttachmentRiskDetails(attachment.filename, attachment.size);
    const sizeInMB = attachment.size / (1024 * 1024);
    
    // Apply base penalty
    score -= risk.penalty;
    
    // Track special file types
    const ext = attachment.filename.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') hasPDF = true;
    if (/^(exe|bat|cmd|ps1|vbs|js|wsf|msi|dll|sh|bash|jar)$/.test(ext)) hasExecutable = true;
    if (/^(docm|xlsm|pptm)$/.test(ext)) hasMacroEnabled = true;
    
    // Size-based penalties
    let sizePenalty = 0;
    let sizeReason = '';
    
    if (sizeInMB > 10) {
      sizePenalty = 20;
      sizeReason = 'Large file size (>10MB) increases risk of hidden malicious content';
    } else if (sizeInMB > 5) {
      sizePenalty = 10;
      sizeReason = 'Moderate file size (>5MB) warrants caution';
    }
    
    score -= sizePenalty;
    
    // Compile attachment details
    details.push({
      filename: attachment.filename,
      size: sizeInMB.toFixed(2) + ' MB',
      riskLevel: risk.riskLevel,
      baseImpact: `-${risk.penalty}%`,
      sizeImpact: sizePenalty > 0 ? `-${sizePenalty}%` : 'No impact',
      totalImpact: `${-(risk.penalty + sizePenalty)}%`,
      reason: risk.reason,
      sizeReason: sizeReason || 'File size within normal range',
      recommendations: risk.recommendations
    });
  }
  
  // Additional penalties for combinations
  let combinationPenalty = 0;
  const combinationReasons = [];
  
  if (attachments.length > 1) {
    const penalty = 10 * (attachments.length - 1);
    combinationPenalty += penalty;
    combinationReasons.push(`Multiple attachments (${attachments.length}) increase overall risk: -${penalty}%`);
  }
  
  if (hasPDF && hasExecutable) {
    combinationPenalty += 25;
    combinationReasons.push('PDF combined with executable files suggests potential malware delivery: -25%');
  }
  
  if (hasPDF && hasMacroEnabled) {
    combinationPenalty += 20;
    combinationReasons.push('PDF combined with macro-enabled documents indicates possible multi-stage attack: -20%');
  }
  
  if (hasExecutable && hasMacroEnabled) {
    combinationPenalty += 30;
    combinationReasons.push('Executable files with macro-enabled documents suggest sophisticated attack: -30%');
  }
  
  score -= combinationPenalty;
  
  return {
    score: Math.max(0, Math.min(100, score)),
    details,
    combinations: combinationReasons.length > 0 ? {
      penalty: combinationPenalty,
      reasons: combinationReasons
    } : null
  };
};

export const calculateContentScore = (content: string, from: string = '', subject: string = ''): number => {
  let score = 100;
  
  // Common phishing patterns
  const suspiciousPatterns = [
    /urgent|immediate action|account suspended/i,
    /verify.*(account|identity)/i,
    /click.*link|download.*attachment/i,
    /password|credit card|ssn|social security/i,
    /lottery|winner|prize|inheritance/i,
    /bitcoin|cryptocurrency|wire transfer/i,
    /invoice|payment|statement|document/i,
    /attachment.*enclosed|please.*review/i
  ];

  // Shipping-related patterns with higher penalties
  const shippingPatterns = [
    {
      pattern: /shipping.*update|delivery.*status|package.*notification/i,
      penalty: 25,
      reason: 'Common shipping scam phrases'
    },
    {
      pattern: /track.*package|track.*shipment|delivery.*tracking/i,
      penalty: 20,
      reason: 'Package tracking lure'
    },
    {
      pattern: /package.*delayed|delivery.*failed|shipping.*problem/i,
      penalty: 30,
      reason: 'Delivery problem scam'
    },
    {
      pattern: /customs.*fee|import.*duty|shipping.*fee/i,
      penalty: 35,
      reason: 'Customs/fee scam'
    },
    {
      pattern: /ups|fedex|dhl|usps/i,
      penalty: 15,
      reason: 'Courier service impersonation'
    }
  ];

  // Subject line specific patterns with higher penalties
  const subjectPatterns = [
    {
      pattern: /urgent|immediate|asap|action.*required/i,
      penalty: 30,
      reason: 'Urgency in subject line'
    },
    {
      pattern: /account.*suspend|account.*limit|security.*alert/i,
      penalty: 35,
      reason: 'Account threat in subject'
    },
    {
      pattern: /\$|€|£|money|payment|refund|tax/i,
      penalty: 25,
      reason: 'Financial terms in subject'
    }
  ];
  
  // Apply penalties for common phishing patterns in content
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      score -= 15;
    }
  });

  // Apply higher penalties for shipping-related patterns in content
  shippingPatterns.forEach(({ pattern, penalty }) => {
    if (pattern.test(content)) {
      score -= penalty;
    }
  });

  // Apply penalties for subject line patterns
  subjectPatterns.forEach(({ pattern, penalty }) => {
    if (pattern.test(subject)) {
      score -= penalty;
    }
  });
  
  // Additional content checks
  if (/<script|<html|<img|href=/i.test(content)) {
    score -= 20;
  }
  
  const urls = content.match(/https?:\/\/[^\s]+/g) || [];
  if (urls.length > 3) {
    score -= 15;
  }
  
  if (/[\u0400-\u04FF\u0600-\u06FF\u0900-\u097F]/u.test(content)) {
    score -= 20;
  }

  if (/@gmail\.com$/i.test(from)) {
    score -= 25;
  }
  
  return Math.max(0, Math.min(100, score));
};

export const calculateSecurityScore = (authHeaders: any, content: string, attachments: AttachmentInfo[] = []) => {
  let authScore = 0;
  if (authHeaders.dkim.status === 'pass' || authHeaders.dkim.status === 'present') authScore += 33.33;
  if (authHeaders.dmarc.status === 'pass') authScore += 33.33;
  if (authHeaders.spf.status === 'pass') authScore += 33.34;

  const contentScore = calculateContentScore(content, authHeaders?.from, authHeaders?.subject);
  const attachmentRisk = calculateAttachmentRisk(attachments);

  const overallScore = Math.round(
    (authScore * 0.3) +
    (contentScore * 0.3) +
    (attachmentRisk.score * 0.4)
  );

  return {
    authentication: Math.round(authScore),
    content: Math.round(contentScore),
    attachments: Math.round(attachmentRisk.score),
    attachmentDetails: attachmentRisk,
    overall: overallScore
  };
};