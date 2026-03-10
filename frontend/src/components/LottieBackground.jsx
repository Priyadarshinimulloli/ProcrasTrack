import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './LottieBackground.css';

const LottieBackground = ({ src, opacity = 0.3 }) => {
  return (
    <div className="lottie-background">
      <DotLottieReact
        src={src}
        loop
        autoplay
        style={{ 
          width: '100%', 
          height: '100%',
          opacity: opacity
        }}
      />
    </div>
  );
};

export default LottieBackground;
