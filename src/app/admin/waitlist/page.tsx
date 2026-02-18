'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [emails, setEmails] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const waitlist = JSON.parse(localStorage.getItem('gardengrid_waitlist') || '[]');
    setEmails(waitlist);
  }, []);

  const copyEmails = () => {
    navigator.clipboard.writeText(emails.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearWaitlist = () => {
    if (confirm('Are you sure you want to clear all waitlist emails?')) {
      localStorage.removeItem('gardengrid_waitlist');
      setEmails([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Waitlist Admin</h1>
            <p className="text-gray-600">{emails.length} signups</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyEmails}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
            >
              {copied ? 'Copied!' : 'Copy Emails'}
            </button>
            <button
              onClick={clearWaitlist}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        {emails.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-500">No waitlist signups yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">#</th>
                  <th className="text-left p-4 font-medium text-gray-600">Email</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="p-4 text-gray-500">{i + 1}</td>
                    <td className="p-4 font-medium">{email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
