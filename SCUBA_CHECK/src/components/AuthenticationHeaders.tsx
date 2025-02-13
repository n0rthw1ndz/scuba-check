import React from 'react';
import { IPInfo } from '../types/email';

interface AuthHeadersProps {
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
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pass':
    case 'present':
      return 'text-green-400';
    case 'fail':
      return 'text-red-400';
    default:
      return 'text-yellow-400';
  }
};

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

const IPAddressInfo: React.FC<{ ip: string; ipInfo?: IPInfo }> = ({ ip, ipInfo }) => (
  <div className="space-y-2">
    <div className="flex items-center">
      <span className="text-theme-secondary">Sending IP: </span>
      <span className="text-theme-primary ml-2">{ip}</span>
      <InfoTooltip text="This is the IP address of the sending server that was evaluated against the domain's SPF record." />
    </div>
    {ipInfo && (
      <div className="bg-theme-card p-2 rounded border-theme text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p><span className="text-theme-accent">Location:</span> {ipInfo.city}, {ipInfo.regionName}, {ipInfo.country}</p>
            <p><span className="text-theme-accent">ISP:</span> {ipInfo.isp}</p>
            <p><span className="text-theme-accent">Organization:</span> {ipInfo.org}</p>
          </div>
          <div>
            <p><span className="text-theme-accent">ASN:</span> {ipInfo.as}</p>
            <p><span className="text-theme-accent">Network:</span> {ipInfo.asname}</p>
            <p><span className="text-theme-accent">Timezone:</span> {ipInfo.timezone}</p>
          </div>
        </div>
      </div>
    )}
  </div>
);

export const AuthenticationHeaders: React.FC<AuthHeadersProps> = ({ dkim, dmarc, spf }) => {
  return (
    <div className="bg-theme-card p-4 rounded-lg border-theme">
      <h3 className="font-medium mb-3 text-theme-accent">Authentication Headers</h3>
      <div className="space-y-4">
        <div className="bg-theme-card p-3 rounded-lg border-theme">
          <div className="flex items-center">
            <p className="font-medium text-theme-accent">DKIM</p>
            <InfoTooltip text="DomainKeys Identified Mail (DKIM) is a digital signature that verifies an email was sent by an authorized server and wasn't modified in transit. It helps prevent email spoofing and maintains message integrity." />
          </div>
          <div className="ml-4 text-theme-primary">
            <p className={getStatusColor(dkim?.status || '')}>
              Status: {dkim?.status}
            </p>
            {dkim?.domain && <p>Domain: {dkim.domain}</p>}
            {dkim?.selector && <p>Selector: {dkim.selector}</p>}
          </div>
        </div>

        <div className="bg-theme-card p-3 rounded-lg border-theme">
          <div className="flex items-center">
            <p className="font-medium text-theme-accent">DMARC</p>
            <InfoTooltip text="Domain-based Message Authentication, Reporting & Conformance (DMARC) is an email authentication protocol that builds on SPF and DKIM. It tells receiving servers what to do with emails that fail authentication and helps prevent domain spoofing." />
          </div>
          <div className="ml-4 text-theme-primary">
            <p className={getStatusColor(dmarc?.status || '')}>
              Status: {dmarc?.status}
            </p>
            {dmarc?.policy && <p>Policy: {dmarc.policy}</p>}
            {dmarc?.alignment && <p>Alignment: {dmarc.alignment}</p>}
          </div>
        </div>

        <div className="bg-theme-card p-3 rounded-lg border-theme">
          <div className="flex items-center">
            <p className="font-medium text-theme-accent">SPF</p>
            <InfoTooltip text="Sender Policy Framework (SPF) verifies that the sending server is authorized to send emails for the domain. It helps prevent email spoofing by checking if the email comes from an IP address listed in the domain's DNS records." />
          </div>
          <div className="ml-4 space-y-2">
            <p className={getStatusColor(spf?.status || '')}>
              Status: {spf?.status}
            </p>
            {spf?.domain && <p>Domain: {spf.domain}</p>}
            {spf?.ip && <IPAddressInfo ip={spf.ip} ipInfo={spf.ipInfo} />}
          </div>
        </div>
      </div>
    </div>
  );
};