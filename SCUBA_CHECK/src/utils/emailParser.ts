import { EmailMetadata, AttachmentInfo } from '../types/email';

export const parseAuthHeaders = (headerSection: string) => {
  const headers = {
    dkim: { status: 'missing' as string },
    dmarc: { status: 'missing' as string },
    spf: { status: 'missing' as string }
  };

  try {
    // Parse Authentication-Results header
    const authResults = headerSection.match(/Authentication-Results:([^\n]+(?:\n\s+[^\n]+)*)/gi);
    if (authResults) {
      authResults.forEach(result => {
        // Parse DKIM
        if (result.includes('dkim=')) {
          const dkimStatus = result.match(/dkim=(\w+)/i)?.[1]?.toLowerCase() || 'missing';
          headers.dkim = {
            status: dkimStatus,
            domain: result.match(/d=([^;\s]+)/i)?.[1],
            selector: result.match(/s=([^;\s]+)/i)?.[1]
          };
        }

        // Parse DMARC
        if (result.includes('dmarc=')) {
          const dmarcStatus = result.match(/dmarc=(\w+)/i)?.[1]?.toLowerCase() || 'missing';
          headers.dmarc = {
            status: dmarcStatus,
            policy: result.match(/p=([^;\s]+)/i)?.[1],
            alignment: result.match(/adkim=([^;\s]+)/i)?.[1]
          };
        }

        // Parse SPF with enhanced IP detection
        if (result.includes('spf=')) {
          const spfStatus = result.match(/spf=(\w+)/i)?.[1]?.toLowerCase() || 'missing';
          
          // Look for IP in multiple possible formats
          const clientIp = result.match(/client-ip=([^;\s]+)/i)?.[1] ||
                          result.match(/ip=([^;\s]+)/i)?.[1] ||
                          result.match(/\(([0-9.]+)\)/)?.[1];
                          
          headers.spf = {
            status: spfStatus,
            domain: result.match(/domain=([^;\s]+)/i)?.[1],
            ip: clientIp
          };
        }
      });
    }

    // Also check Received-SPF header for IP information
    const receivedSpf = headerSection.match(/Received-SPF:([^\n]+(?:\n\s+[^\n]+)*)/gi);
    if (receivedSpf && (!headers.spf.ip || headers.spf.ip === 'unknown')) {
      const ipMatch = receivedSpf[0].match(/ip=([^;\s]+)/i)?.[1] ||
                     receivedSpf[0].match(/client-ip=([^;\s]+)/i)?.[1] ||
                     receivedSpf[0].match(/\(([0-9.]+)\)/)?.[1];
      
      if (ipMatch && headers.spf) {
        headers.spf.ip = ipMatch;
      }
    }

    return headers;
  } catch (error) {
    console.error('Error parsing authentication headers:', error);
    return headers;
  }
};

const parseAttachmentSection = (section: string): AttachmentInfo => {
  const info: AttachmentInfo = {
    filename: '',
    size: 0,
    content: undefined
  };

  try {
    // Extract filename
    const filenameMatch = section.match(/filename="([^"]+)"/);
    if (filenameMatch) {
      info.filename = filenameMatch[1].trim();
    }

    // Extract Content-Type
    const contentTypeMatch = section.match(/Content-Type:\s*([^\n;]+)/i);
    if (contentTypeMatch) {
      info.contentType = contentTypeMatch[1].trim();
    }

    // Extract base64 content
    const base64Match = section.match(/\r?\n\r?\n([A-Za-z0-9+/=\s]+)$/);
    if (base64Match) {
      // Clean and store base64 content
      info.content = base64Match[1].replace(/\s/g, '');
      // Calculate size from base64 content
      info.size = Math.floor((info.content.length * 3) / 4);
    }

    return info;
  } catch (error) {
    console.error('Error parsing attachment section:', error);
    return info;
  }
};

export const parseEmailMetadata = (content: string): EmailMetadata => {
  const metadata: EmailMetadata = {
    subject: 'No Subject',
    from: 'Unknown Sender',
    to: 'Unknown Recipient',
    date: 'Unknown Date',
    attachments: []
  };

  try {
    const headerSection = content.split(/\r?\n\r?\n/)[0];
    
    // Store raw headers for analysis
    metadata.receivedHeaders = headerSection;
    
    // Extract basic headers
    const subjectMatch = headerSection.match(/(?:^|\n)Subject: ([^\n]+)/i);
    if (subjectMatch) {
      metadata.subject = subjectMatch[1].trim();
    }

    const fromMatch = headerSection.match(/(?:^|\n)From: ([^\n]+)/i);
    if (fromMatch) {
      metadata.from = fromMatch[1].trim();
    }

    const toMatch = headerSection.match(/(?:^|\n)To: ([^\n]+)/i);
    if (toMatch) {
      metadata.to = toMatch[1].trim();
    }

    const dateMatch = headerSection.match(/(?:^|\n)Date: ([^\n]+)/i);
    if (dateMatch) {
      metadata.date = dateMatch[1].trim();
    }

    // Extract Attachments with enhanced parsing
    const boundaryMatch = headerSection.match(/boundary="([^"]+)"/);
    if (boundaryMatch) {
      const boundary = boundaryMatch[1];
      const parts = content.split('--' + boundary);
      
      parts.forEach(part => {
        if (part.includes('Content-Disposition: attachment')) {
          const attachmentInfo = parseAttachmentSection(part);
          if (attachmentInfo.filename) {
            metadata.attachments.push(attachmentInfo);
          }
        }
      });
    } else {
      // Fallback to simple attachment detection
      const attachmentRegex = /Content-Type: (.+?)\r?\nContent-Disposition:.*?filename="([^"]+)"/gs;
      let attachmentMatch;
      while ((attachmentMatch = attachmentRegex.exec(content)) !== null) {
        metadata.attachments.push({
          filename: attachmentMatch[2].trim(),
          size: 0,
          contentType: attachmentMatch[1].trim()
        });
      }
    }
  } catch (err) {
    console.error('Error parsing email metadata:', err);
  }

  return metadata;
};