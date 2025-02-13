import CryptoJS from 'crypto-js';

interface URLComponents {
  url: string;
  domain: string;
  path: string;
  protocol: string;
}

export const extractURLComponents = (url: string): URLComponents => {
  try {
    const urlObj = new URL(url);
    return {
      url: url,
      domain: urlObj.hostname,
      path: urlObj.pathname + urlObj.search + urlObj.hash,
      protocol: urlObj.protocol.replace(':', '')
    };
  } catch {
    // If URL parsing fails, do basic extraction
    const protocol = url.split('://')[0] || 'http';
    const withoutProtocol = url.replace(/^.*?:\/\//, '');
    const domain = withoutProtocol.split('/')[0];
    const path = withoutProtocol.includes('/') ? '/' + withoutProtocol.split('/').slice(1).join('/') : '/';
    
    return { url, domain, path, protocol };
  }
};

const suspiciousPatterns = {
  domains: [
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP addresses
    /bit\.ly|tinyurl\.com|goo\.gl|t\.co|is\.gd|cli\.gs|ow\.ly|buff\.ly|adf\.ly|bit\.do|mcaf\.ee/, // URL shorteners
    /[^a-z0-9.-]/i, // Non-standard characters in domain
    /\.(xyz|top|work|loan|click|party|gq|ml|ga|cf|pw)$/, // Suspicious TLDs
  ],
  paths: [
    /login|verify|account|secure|banking|security|update|password/, // Sensitive keywords
    /\.(exe|zip|rar|7z|msi|bat|ps1|vbs)$/, // Executable or archive files
    /[^\x20-\x7E]/, // Non-ASCII characters
  ],
  phishingKeywords: [
    /paypal|apple|microsoft|google|facebook|instagram|twitter|amazon|netflix|bank|secure|login|verify|account/i,
  ],
  suspiciousSequences: [
    /\d{8,}/, // Long number sequences
    /[a-zA-Z0-9]{25,}/, // Very long alphanumeric sequences
    /-{2,}|\_{2,}/, // Multiple consecutive hyphens or underscores
  ]
};

// Check URLScan.io passive DNS data
const checkURLScan = async (domain: string) => {
  try {
    // Use the public search API with minimal query
    const response = await fetch(`https://urlscan.io/api/v1/search/?q=domain:"${domain}"&size=10`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 429) {
        console.log('URLScan rate limit reached, skipping check');
        return null;
      }
      throw new Error(`URLScan API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we have any results
    if (!data.results || data.results.length === 0) {
      return {
        malicious: false,
        categories: [],
        lastSeen: null
      };
    }

    // Process the results
    const maliciousResults = data.results.filter((result: any) => {
      const verdict = result.verdicts?.overall;
      return verdict && verdict.malicious;
    });

    // Collect unique tags/categories
    const categories = [...new Set(data.results.flatMap((result: any) => {
      const tags = result.tags || [];
      const threats = result.verdicts?.overall?.threats || [];
      return [...tags, ...threats.map((t: any) => t.tag)];
    }))];

    return {
      malicious: maliciousResults.length > 0,
      categories: categories,
      lastSeen: data.results[0]?.task?.time || null
    };
  } catch (error) {
    console.error('Error checking URLScan:', error);
    return null;
  }
};

// Check domain age using WHOIS API
const checkDomainAge = async (domain: string) => {
  try {
    // Use WHOIS API (free, no authentication required)
    const response = await fetch(`https://whois.freeaiapi.xyz/?domain=${domain}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('Domain not found');
        return null;
      }
      throw new Error(`WHOIS API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for creation date in various formats
    const creationDate = data.creation_date || data.created || data.createdDate;
    
    if (creationDate) {
      const registrationDate = new Date(creationDate);
      if (!isNaN(registrationDate.getTime())) {
        const ageInDays = (Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24);
        return Math.floor(ageInDays);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking domain age:', error);
    return null;
  }
};

// Check Google Safe Browsing (using hash prefix matching)
const checkGoogleSafeBrowsing = async (url: string) => {
  try {
    // Create SHA256 hash of the URL
    const urlHash = CryptoJS.SHA256(url).toString();
    const hashPrefix = urlHash.substring(0, 8);

    // Query the Safe Browsing API v4 lookup
    const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client: {
          clientId: 'scuba-check',
          clientVersion: '1.0.0'
        },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Safe Browsing API returned ${response.status}`);
    }
    
    const data = await response.json();
    return data.matches?.length > 0;
  } catch (error) {
    console.error('Error checking Safe Browsing:', error);
    return null;
  }
};

export const analyzeURLs = async (url: string) => {
  const components = extractURLComponents(url);
  const reasons: string[] = [];
  let suspicious = false;
  let reputationScore = 0;
  const categories: string[] = [];

  // Check domain patterns
  suspiciousPatterns.domains.forEach((pattern, index) => {
    if (pattern.test(components.domain)) {
      suspicious = true;
      reputationScore += 25;
      reasons.push([
        'IP address used as domain',
        'URL shortener service detected',
        'Non-standard characters in domain',
        'Suspicious top-level domain'
      ][index]);
    }
  });

  // Check path patterns
  suspiciousPatterns.paths.forEach((pattern, index) => {
    if (pattern.test(components.path)) {
      suspicious = true;
      reputationScore += 20;
      reasons.push([
        'Sensitive keywords in URL path',
        'Suspicious file type in URL',
        'Non-ASCII characters in URL path'
      ][index]);
    }
  });

  // Check for phishing keywords in domain
  suspiciousPatterns.phishingKeywords.forEach(pattern => {
    if (pattern.test(components.domain)) {
      suspicious = true;
      reputationScore += 15;
      categories.push('Potential Phishing');
      reasons.push('Common phishing keywords in domain');
    }
  });

  // Check for suspicious character sequences
  suspiciousPatterns.suspiciousSequences.forEach(pattern => {
    if (pattern.test(components.domain)) {
      suspicious = true;
      reputationScore += 10;
      reasons.push('Suspicious character sequence in domain');
    }
  });

  // Check for mixed case domains (potential typosquatting)
  if (/[A-Z]/.test(components.domain)) {
    suspicious = true;
    reputationScore += 15;
    categories.push('Potential Typosquatting');
    reasons.push('Mixed case characters in domain (possible typosquatting)');
  }

  // Check for long domains
  if (components.domain.length > 30) {
    suspicious = true;
    reputationScore += 10;
    reasons.push('Unusually long domain name');
  }

  // Initialize sources array with local analysis
  const sources = ['Local Analysis'];

  // Check domain age
  const domainAge = await checkDomainAge(components.domain);
  if (domainAge !== null) {
    sources.push('WHOIS');
    if (domainAge < 30) {
      suspicious = true;
      reputationScore += 25;
      categories.push('Recently Registered Domain');
      reasons.push(`Domain registered less than 30 days ago`);
    }
  }

  // Check URLScan.io
  const urlscanResult = await checkURLScan(components.domain);
  if (urlscanResult) {
    sources.push('URLScan.io');
    if (urlscanResult.malicious) {
      suspicious = true;
      reputationScore += 40;
      reasons.push('Reported as malicious by URLScan.io');
    }
    if (urlscanResult.categories.length > 0) {
      categories.push(...urlscanResult.categories);
    }
  }

  // Check Google Safe Browsing
  const isMalicious = await checkGoogleSafeBrowsing(url);
  if (isMalicious !== null) {
    sources.push('Google Safe Browsing');
    if (isMalicious) {
      suspicious = true;
      reputationScore += 50;
      categories.push('Flagged by Google Safe Browsing');
      reasons.push('URL is flagged as malicious by Google Safe Browsing');
    }
  }

  return [{
    ...components,
    suspicious,
    reasons,
    reputation: {
      score: Math.min(reputationScore, 100),
      categories: [...new Set(categories)],
      source: sources.join(', '),
      lastChecked: new Date().toISOString()
    }
  }];
};