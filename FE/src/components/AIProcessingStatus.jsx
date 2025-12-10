import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, RefreshCw, Zap } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const AIProcessingStatus = ({ applicationId, onStatusChange }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await axiosClient.get(`/api/jobs/ai/status/${applicationId}/`);
      setStatus(response.data);
      if (onStatusChange) {
        onStatusChange(response.data);
      }
    } catch (error) {
      console.error('Error fetching AI status:', error);
    } finally {
      setLoading(false);
    }
  };

  const retryProcessing = async () => {
    setRetrying(true);
    try {
      await axiosClient.post(`/api/jobs/ai/retry/${applicationId}/`);
      // Refresh status after retry
      setTimeout(fetchStatus, 2000);
    } catch (error) {
      console.error('Error retrying AI processing:', error);
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Poll for updates if processing
    const interval = setInterval(() => {
      if (status?.status === 'processing') {
        fetchStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [applicationId]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Đang tải...</span>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const getStatusDisplay = () => {
    switch (status.status) {
      case 'completed':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          text: `Điểm phù hợp: ${status.match_score_display}`,
          color: 'text-green-700 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800'
        };
      case 'processing':
        return {
          icon: <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />,
          text: status.message || 'Đang phân tích...',
          color: 'text-blue-700 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4 text-yellow-500" />,
          text: status.message || 'Chờ xử lý',
          color: 'text-yellow-700 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800'
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-500" />,
          text: 'Lỗi xử lý',
          color: 'text-red-700 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${statusDisplay.bgColor} ${statusDisplay.borderColor}`}>
      <div className="flex items-center space-x-2">
        {statusDisplay.icon}
        <span className={`text-sm font-medium ${statusDisplay.color}`}>
          {statusDisplay.text}
        </span>
      </div>

      {/* Skills extracted display */}
      {status.skills_extracted && status.skills_extracted.length > 0 && (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {status.skills_extracted.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
            >
              {skill}
            </span>
          ))}
          {status.skills_extracted.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
              +{status.skills_extracted.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Retry button for failed processing */}
      {(status.status === 'pending' || status.status === 'failed') && (
        <button
          onClick={retryProcessing}
          disabled={retrying}
          className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
        >
          <Zap className="w-3 h-3" />
          <span>{retrying ? 'Đang thử lại...' : 'Thử lại'}</span>
        </button>
      )}
    </div>
  );
};

export default AIProcessingStatus;