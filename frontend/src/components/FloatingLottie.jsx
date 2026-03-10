import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './FloatingLottie.css';

const FloatingLottie = ({ src, position, size = '200px', opacity = 0.3, delay = '0s' }) => {
  return (
    <div 
      className="floating-lottie" 
      style={{
        ...position,
        width: size,
        height: size,
        opacity: opacity,
        animationDelay: delay
      }}
    >
      <DotLottieReact
        src={src}
        loop
        autoplay
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default FloatingLottie;
