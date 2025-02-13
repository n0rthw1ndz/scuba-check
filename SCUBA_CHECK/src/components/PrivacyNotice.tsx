import React from 'react';

export const PrivacyNotice: React.FC = () => {
  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="bg-theme-card p-4 rounded-lg border-theme text-sm text-theme-secondary max-w-[300px]">
        <h4 className="text-theme-accent font-medium mb-2">Privacy Notice</h4>
        <div className="space-y-2">
          <p>
            🔒 <span className="text-theme-primary">Your Privacy is Protected</span>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>All analysis is performed locally in your browser</li>
            <li>No email content or attachments are stored or transmitted</li>
            <li>No data is collected or shared with third parties</li>
            <li>Analysis results are temporary and cleared when you close the page</li>
          </ul>
        </div>
      </div>
    </div>
  );
};