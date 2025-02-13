import React from 'react';

interface EmailHeadersProps {
  headers: {
    from?: string;
    to?: string;
    subject?: string;
    date?: string;
  };
}

export const EmailHeaders: React.FC<EmailHeadersProps> = ({ headers }) => {
  return (
    <div className="bg-theme-card p-4 rounded-lg border-theme">
      <h3 className="font-medium mb-3 text-theme-accent">Email Headers</h3>
      <div className="grid grid-cols-1 gap-2 text-theme-secondary">
        <p><strong className="text-theme-accent">From:</strong> {headers.from}</p>
        <p><strong className="text-theme-accent">To:</strong> {headers.to}</p>
        <p><strong className="text-theme-accent">Subject:</strong> {headers.subject}</p>
        <p><strong className="text-theme-accent">Date:</strong> {headers.date}</p>
      </div>
    </div>
  );
};