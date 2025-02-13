import { parse } from 'node-html-parser';
import { LogoAnalysisResult } from '../types/email';

// Common brand patterns to check for impersonation
const BRAND_PATTERNS = [
  {
    name: 'UPS',
    patterns: ['ups', 'united parcel service', 'ups.com'],
    logoPatterns: ['ups-logo', 'ups_logo', 'ups-shield', 'ups_shield', 'ups-brand']
  },
  {
    name: 'PayPal',
    patterns: ['paypal', 'pay-pal'],
    logoPatterns: ['paypal-logo', 'pp-logo']
  },
  {
    name: 'Microsoft',
    patterns: ['microsoft', 'ms-logo', 'microsoft365', 'office365'],
    logoPatterns: ['ms-logo', 'microsoft-logo']
  },
  {
    name: 'Google',
    patterns: ['google', 'gmail'],
    logoPatterns: ['google-logo', 'gmail-logo']
  },
  {
    name: 'Apple',
    patterns: ['apple', 'icloud'],
    logoPatterns: ['apple-logo', 'icloud-logo']
  },
  {
    name: 'Amazon',
    patterns: ['amazon', 'aws'],
    logoPatterns: ['amazon-logo', 'aws-logo']
  },
  {
    name: 'Facebook',
    patterns: ['facebook', 'fb'],
    logoPatterns: ['fb-logo', 'facebook-logo']
  },
  {
    name: 'LinkedIn',
    patterns: ['linkedin', 'linked-in'],
    logoPatterns: ['linkedin-logo', 'li-logo']
  },
  {
    name: 'Twitter',
    patterns: ['twitter', 'x.com'],
    logoPatterns: ['twitter-logo', 'x-logo']
  },
  {
    name: 'Bank of America',
    patterns: ['bankofamerica', 'bofa', 'bank of america'],
    logoPatterns: ['bofa-logo', 'bankofamerica-logo']
  },
  {
    name: 'Chase',
    patterns: ['chase', 'jpmorgan', 'jp morgan'],
    logoPatterns: ['chase-logo', 'jpmc-logo']
  }
];

export async function detectBrandImpersonation(content: string): Promise<LogoAnalysisResult[]> {
  const results: LogoAnalysisResult[] = [];
  
  try {
    // Parse HTML content
    const root = parse(content);
    
    // Find all images
    const images = root.querySelectorAll('img');
    
    for (const img of images) {
      const src = img.getAttribute('src');
      if (!src) continue;
      
      // Skip data URLs and invalid sources
      if (src.startsWith('data:') || !src.match(/^https?:\/\//)) continue;
      
      // Analyze image attributes
      const alt = img.getAttribute('alt')?.toLowerCase() || '';
      const className = img.getAttribute('class')?.toLowerCase() || '';
      const id = img.getAttribute('id')?.toLowerCase() || '';
      const title = img.getAttribute('title')?.toLowerCase() || '';
      const ariaLabel = img.getAttribute('aria-label')?.toLowerCase() || '';
      
      // Get image dimensions
      const width = parseInt(img.getAttribute('width') || '0');
      const height = parseInt(img.getAttribute('height') || '0');
      
      // Check for brand patterns
      for (const brand of BRAND_PATTERNS) {
        let confidence = 0;
        let matchReasons: string[] = [];
        
        // Check image attributes for brand patterns
        const hasNamePattern = brand.patterns.some(pattern => {
          const found = [alt, className, id, title, ariaLabel, src].some(attr => 
            attr.includes(pattern) || 
            // Add specific check for UPS shield logo in src URL
            (brand.name === 'UPS' && attr.includes('shield'))
          );
          if (found) matchReasons.push(`Brand name "${pattern}" found in image attributes`);
          return found;
        });
        
        if (hasNamePattern) confidence += 0.4;
        
        // Check for logo-specific patterns
        const hasLogoPattern = brand.logoPatterns.some(pattern => {
          const found = [alt, className, id, title, ariaLabel, src].some(attr => 
            attr.includes(pattern) || 
            // Add specific check for UPS brown color
            (brand.name === 'UPS' && attr.includes('brown'))
          );
          if (found) matchReasons.push(`Logo pattern "${pattern}" found in image attributes`);
          return found;
        });
        
        if (hasLogoPattern) confidence += 0.3;
        
        // Size analysis for logos
        if (width > 0 && height > 0) {
          const aspectRatio = width / height;
          // UPS shield logo typically has a more square aspect ratio
          const isUPSShieldRatio = brand.name === 'UPS' && aspectRatio >= 0.8 && aspectRatio <= 1.2;
          if (isUPSShieldRatio || (aspectRatio >= 0.5 && aspectRatio <= 2.0)) {
            confidence += 0.1;
            matchReasons.push('Image dimensions match typical logo proportions');
          }
        }
        
        // Additional UPS-specific checks
        if (brand.name === 'UPS') {
          // Check for brown color references
          if ([alt, className, id, title, ariaLabel].some(attr => attr.includes('brown'))) {
            confidence += 0.1;
            matchReasons.push('UPS brand color detected');
          }
          
          // Check for shield shape references
          if ([alt, className, id, title, ariaLabel].some(attr => attr.includes('shield'))) {
            confidence += 0.1;
            matchReasons.push('UPS shield shape detected');
          }
        }
        
        if (confidence > 0.5) {
          results.push({
            brandName: brand.name,
            confidence: Math.min(confidence, 1),
            location: src
          });
        }
      }
    }
  } catch (error) {
    console.error('Error detecting brand impersonation:', error);
  }
  
  return results;
}