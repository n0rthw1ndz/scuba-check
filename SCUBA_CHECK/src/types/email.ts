// Base interfaces
export interface IPInfo {
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  asname: string;
}

export interface URLInfo {
  url: string;
  domain: string;
  path: string;
  protocol: string;
  suspicious: boolean;
  reasons: string[];
  reputation?: {
    score: number;
    categories: string[];
    source: string;
    lastChecked: string;
  };
}

export interface AttachmentInfo {
  filename: string;
  size: number;
  contentType?: string;
  content?: string; // base64 encoded content
}

export interface EmailHeaders {
  subject: string;
  from: string;
  to: string;
  date: string;
  receivedHeaders?: string;
}

export interface EmailMetadata {
  subject: string;
  from: string;
  to: string;
  date: string;
  attachments: AttachmentInfo[];
  urls?: URLInfo[];
  logoAnalysis?: LogoAnalysisResult[];
  authHeaders?: {
    dkim?: {
      status: string;
      domain?: string;
      selector?: string;
    };
    dmarc?: {
      status: string;
      policy?: string;
      alignment?: string;
    };
    spf?: {
      status: string;
      domain?: string;
      ip?: string;
      ipInfo?: IPInfo;
    };
  };
  receivedHeaders?: string;
}

export interface LogoAnalysisResult {
  brandName: string;
  confidence: number;
  location: string;
}

export interface AnalysisResult {
  headers: {
    from?: string;
    to?: string;
    subject?: string;
    date?: string;
    dkim?: {
      status: string;
      domain?: string;
      selector?: string;
    };
    dmarc?: {
      status: string;
      policy?: string;
      alignment?: string;
    };
    spf?: {
      status: string;
      domain?: string;
      ip?: string;
      ipInfo?: IPInfo;
    };
    receivedHeaders?: string;
  };
  content?: string;
  rawContent?: string;
  urls?: URLInfo[];
  attachments?: AttachmentInfo[];
  logoAnalysis?: LogoAnalysisResult[];
  securityScore: {
    authentication: number;
    content: number;
    attachments: number;
    overall: number;
  };
}