import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    console.log(e.target, e.currentTarget);
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleOverlayClick}
      ></div>
      <div className="bg-stone-200 w-1/3 h-1/3 z-10 relative rounded-md flex justify-center items-center">
        {children}
      </div>
    </div>
  );
};

export default Modal;
