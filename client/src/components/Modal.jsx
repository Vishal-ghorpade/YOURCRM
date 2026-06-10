import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 modal-backdrop-animate">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Modal Content Card */}
      <div className="bg-surface border border-borderTheme rounded-[10px] w-full max-w-md relative z-10 flex flex-col modal-card-animate overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-borderTheme">
          <h3 className="font-semibold text-base text-primary tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-secondary hover:bg-muted hover:text-primary transition-colors duration-150"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[75vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
