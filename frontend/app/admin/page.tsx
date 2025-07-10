'use client';

import { useState, useEffect } from 'react';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'read' | 'unread';
}

export default function AdminPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/contact/messages');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        const text = await response.text();
        console.error('Response text:', text);
        throw new Error('Server did not return JSON');
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:4000/api/contact/messages/${id}/read`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      fetchMessages(); // Refresh the list
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const deleteMessage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/contact/messages/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete message');
      fetchMessages(); // Refresh the list
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchMessages}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Contact Messages
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage contact form submissions and feedback
          </p>
        </div>

        {messages.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No messages yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 ${
                  message.status === 'unread' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {message.name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {message.email}
                      </span>
                      {message.status === 'unread' && (
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Subject: <span className="font-medium">{message.subject}</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(message.timestamp)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {message.status === 'unread' && (
                      <button
                        onClick={() => markAsRead(message.id)}
                        className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {message.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={fetchMessages}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Refresh Messages
          </button>
        </div>
      </div>
    </div>
  );
} 