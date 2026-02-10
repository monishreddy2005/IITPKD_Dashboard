import { useState, useEffect } from 'react';
import './ImageSlider.css';

/**
 * ImageSlider Component
 * 
 * USAGE:
 * Place your IIT Palakkad images in: Frontend/src/assets/images/iit-palakkad/
 * 
 * Then import them and pass as props:
 * 
 * import img1 from '../assets/images/iit-palakkad/image1.jpg';
 * import img2 from '../assets/images/iit-palakkad/image2.jpg';
 * 
 * <ImageSlider images={[img1, img2, img3]} />
 * 
 * Or use a folder structure and import dynamically (see example below)
 */

function ImageSlider({ images = [], autoSlideInterval = 4000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [images.length, autoSlideInterval]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (!images || images.length === 0) {
    return (
      <div className="image-slider-container">
        <div className="image-slider-placeholder">
          <p>No images available. Please add images to display.</p>
          <p className="image-slider-instructions">
            Place images in: <code>Frontend/src/assets/images/iit-palakkad/</code>
            <br />
            Then import and pass them to the ImageSlider component.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="image-slider-container">
      <div className="image-slider-wrapper">
        {/* Previous Button */}
        {images.length > 1 && (
          <button 
            className="slider-button slider-button-prev" 
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            ‹
          </button>
        )}

        {/* Image Container */}
        <div className="image-slider-track">
          {images.map((image, index) => (
            <div
              key={index}
              className={`slider-slide ${index === currentIndex ? 'active' : ''}`}
            >
              <img 
                src={image} 
                alt={`IIT Palakkad ${index + 1}`}
                className="slider-image"
              />
            </div>
          ))}
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button 
            className="slider-button slider-button-next" 
            onClick={goToNext}
            aria-label="Next image"
          >
            ›
          </button>
        )}
      </div>

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="slider-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageSlider;

