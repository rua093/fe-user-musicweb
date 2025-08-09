'use client'

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface NextAuthWrapperProps {
  children: React.ReactNode;
}

const NextAuthWrapper = ({ children }: NextAuthWrapperProps) => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Add MilkyWay background animation
    const addBackground = () => {
      const existingBackground = document.querySelector('.milkyway-background');
      if (!existingBackground) {
        const background = document.createElement('div');
        background.className = 'milkyway-background';
        
        const stars = document.createElement('div');
        stars.className = 'milkyway-stars';
        
        // Add orbital rings
        const orbitalRings = document.createElement('div');
        orbitalRings.className = 'orbital-rings';
        orbitalRings.innerHTML = `
          <div class="orbital-ring"></div>
          <div class="orbital-ring"></div>
          <div class="orbital-ring"></div>
        `;
        
        // Add floating music notes
        const musicNotes = document.createElement('div');
        musicNotes.className = 'milkyway-music-notes';
        musicNotes.innerHTML = `
          <div class="music-note">🎵</div>
          <div class="music-note">🎶</div>
          <div class="music-note">🎸</div>
          <div class="music-note">🎹</div>
          <div class="music-note">🎺</div>
          <div class="music-note">🥁</div>
        `;
        
        background.appendChild(stars);
        background.appendChild(orbitalRings);
        background.appendChild(musicNotes);
        document.body.appendChild(background);
      }
    };

    addBackground();

    // Cleanup function
    return () => {
      const background = document.querySelector('.milkyway-background');
      if (background) {
        background.remove();
      }
    };
  }, []);

  return (
    <>
      {children}
    </>
  );
};

export default NextAuthWrapper;
