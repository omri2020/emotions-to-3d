import React, { useState } from "react";

const LightButton = ({ onClick }) => {
  const defaultImage = "/light-button-display.png";
  const hoverImage = "/light-button-hover.png";
  const clickImage = "/light-button-click.png";

  const [currentImage, setCurrentImage] = useState(defaultImage);
  const [isClicked, setIsClicked] = useState(false);

  const handleMouseEnter = () => {
    if (!isClicked) {
      setCurrentImage(hoverImage);
    }
  };

  const handleMouseLeave = () => {
    if (!isClicked) {
      setCurrentImage(defaultImage);
    }
  };

  const handleMouseDown = () => {
    setCurrentImage(clickImage);
    setIsClicked(true);
    onClick();
  };

  const handleMouseUp = () => {
    setCurrentImage(hoverImage);
    setIsClicked(false);
  };

  return (
    <button
      className="underline cursor-pointer z-10 absolute top-0 left-1/2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <img
        src={currentImage}
        alt="lightning-button"
        className=" cursor-pointer w-24 h-24"
      />
    </button>
  );
};

export default LightButton;
