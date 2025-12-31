import { useCallback } from 'react';

export const useSound = () => {
  const playSound = useCallback((soundName: 'pop' | 'win' | 'spin' | 'click') => {
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed:', e));
  }, []);

  return { playSound };
};
