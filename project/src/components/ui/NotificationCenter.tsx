import React from 'react';
import { useGlobal } from '../../contexts/GlobalContext';
import { X } from 'lucide-react';

const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification } = useGlobal();

  if (notifications.length === 0) return null;

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-400 text-green-800';
      case 'info':
        return 'bg-blue-50 border-blue-400 text-blue-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-400 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-400 text-red-800';
      default:
        return 'bg-gray-50 border-gray-400 text-gray-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`rounded-lg border-l-4 p-4 shadow-md 
            ${getNotificationStyles(notification.type)}
            animate-fade-in-down
          `}
          style={{ 
            animationDuration: '0.5s',
          }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;