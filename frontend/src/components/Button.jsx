import React, { useState, cloneElement } from "react";

const Button = ({ children, onClick, className, animation, icons }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleMouseDown = () => {
    setIsClicked(true);
  };

  const handleMouseUp = () => {
    setIsClicked(false);
  };

  return (
    <button
      className={`btn ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={onClick}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === "span") {
          return cloneElement(child, {
            className: `${child.props.className} ${isClicked ? animation : ""}`,
          });
        }
        if (React.isValidElement(child) && child.type === "i") {
          return cloneElement(child, {
            className: `${child.props.className} ${
              isClicked ? (icons ? "icon-shrink" : "icon-hidden") : ""
            }`,
          });
        }
        return child;
      })}
    </button>
  );
};

export default Button;
