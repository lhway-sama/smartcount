import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  icon, 
  children, 
  className = '', 
  footer 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {(title || icon) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center">
          {icon && <span className="mr-2 text-gray-500">{icon}</span>}
          {title && <h3 className="text-lg font-medium text-gray-800">{title}</h3>}
        </div>
      )}
      
      <div className="p-6">{children}</div>
      
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;