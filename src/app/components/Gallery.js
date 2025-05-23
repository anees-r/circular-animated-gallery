'use client';
import { useEffect } from 'react';
import collection from '../lib/collection';
import '../globals.css';

export default function Gallery() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.gsap || !window.SplitText) return;

    const gsap = window.gsap;
    const SplitText = window.SplitText;

    const gallery = document.querySelector('.gallery');
    const galleryContainer = document.querySelector('.gallery-container');
    const titleContainer = document.querySelector('.title-container');
    const descText = document.querySelector('.desc-text');

    const cards = [];
    const transformState = [];

    let currentTitle = null;
    let isPreviewActive = false;
    let isTransitioning = false;

    const config = {
      imageCount: 20,
      radius: 275,
      senstivity: 500,
      effectFalloff: 250,
      cardMoveAmount: 50,
      lerpFactor: 0.15,
      isMobile: window.innerWidth < 1000,
    };

    const parallaxState = {
      targetX: 0,
      targetY: 0,
      targetZ: 0,
      currentX: 0,
      currentY: 0,
      currentZ: 0,
    };

    for (let i = 0; i < config.imageCount; i++) {
      const angle = (i / config.imageCount) * Math.PI * 2;
      const x = Math.cos(angle) * config.radius;
      const y = Math.sin(angle) * config.radius;
      const cardIndex = i % collection.length;

      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.index = i;
      card.dataset.title = collection[cardIndex].title;

      const img = document.createElement('img');
      img.src = collection[cardIndex].img;
      card.appendChild(img);

      gsap.set(card, {
        x,
        y,
        rotationY: (angle * 180) / Math.PI + 90,
        transformPerspective: 800,
        transformOrigin: 'center center',
      });

      gallery.appendChild(card);
      cards.push(card);

      transformState.push({
        currentRotation: 0,
        targetRotation: 0,
        currentX: 0,
        targetX: 0,
        currentY: 0,
        targetY: 0,
        currentScale: 1,
        targetScale: 1,
        angle,
      });

      card.addEventListener('click', (e) => {
        if (!isPreviewActive && !isTransitioning) {
          togglePreview(parseInt(card.dataset.index));
          e.stopPropagation();
        }
      });
    }

    function togglePreview(index) {
      isPreviewActive = true;
      isTransitioning = true;

      const angle = transformState[index].angle;
      const targetPosition = (Math.PI * 3) / 2;
      let rotationRadians = targetPosition - angle;

      if (rotationRadians > Math.PI) rotationRadians -= Math.PI * 2;
      else if (rotationRadians < -Math.PI) rotationRadians += Math.PI * 2;

      transformState.forEach((state) => {
        Object.assign(state, {
          currentRotation: 0,
          targetRotation: 0,
          currentX: 0,
          targetX: 0,
          currentY: 0,
          targetY: 0,
          currentScale: 1,
          targetScale: 1,
        });
      });

      gsap.to(gallery, {
        onStart: () => {
          cards.forEach((card, i) => {
            gsap.to(card, {
              x: config.radius * Math.cos(transformState[i].angle),
              y: config.radius * Math.sin(transformState[i].angle),
              rotationY: 0,
              scale: 1,
              duration: 1.25,
              ease: 'power2.out',
            });
          });
        },
        scale: 5,
        y: 1300,
        rotation: (rotationRadians * 180) / Math.PI + 360,
        duration: 2,
        ease: 'power4.inOut',
        onComplete: () => {
          isTransitioning = false;
        },
      });

      gsap.to(parallaxState, {
        currentX: 0,
        currentY: 0,
        currentZ: 0,
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: () => {
          gsap.set(galleryContainer, {
            rotateX: parallaxState.currentX,
            rotateY: parallaxState.currentY,
            rotateZ: parallaxState.currentZ,
            transformOrigin: 'center center',
          });
        },
      });

      const p = document.createElement('p');
      p.textContent = cards[index].dataset.title;
      titleContainer.appendChild(p);
      currentTitle = p;

      const splitText = new SplitText(p, {
        type: 'words',
        wordsClass: 'word',
      });

      const words = splitText.words;

      gsap.set(words, { y: '125%' });
      gsap.to(words, {
        y: '0%',
        duration: 0.75,
        delay: 1.25,
        stagger: 0.1,
        ease: 'power4.out',
      });

      gsap.to(descText, {
        opacity: 0,
        duration: 0.5,
        delay: 0.25,
        stagger: 0.1,
        ease: 'power4.out',
      });
    }

    function resetGallery() {
      if (isTransitioning) return;
      isTransitioning = true;

      if (currentTitle) {
        const words = currentTitle.querySelectorAll('.word');
        gsap.to(words, {
          y: '-125%',
          duration: 0.5,
          delay: 0.5,
          stagger: 0.1,
          ease: 'power4.out',
          onComplete: () => {
            currentTitle.remove();
            currentTitle = null;
          },
        });
      }

      gsap.to(descText, {
        opacity: 1,
        duration: 0.75,
        delay: 1,
        stagger: 0.1,
        ease: 'power4.out',
      });

      gsap.to(gallery, {
        scale: 1,
        x: 0,
        y: 0,
        rotation: 0,
        duration: 1.5,
        ease: 'power4.inOut',
        onComplete: () => {
          isTransitioning = false;
          isPreviewActive = false;
        },
      });
    }

    document.addEventListener('click', () => {
      if (isPreviewActive && !isTransitioning) {
        resetGallery();
      }
    });

    galleryContainer.addEventListener('mousemove', (e) => {
      if (isPreviewActive || isTransitioning || config.isMobile) return;

      const centerX = galleryContainer.offsetWidth / 2;
      const centerY = galleryContainer.offsetHeight / 2;
      const percentX = (e.clientX - centerX) / centerX;
      const percentY = (e.clientY - centerY) / centerY;

      parallaxState.targetY = percentX * 15;
      parallaxState.targetX = -percentY * 15;
      parallaxState.targetZ = percentX * 5;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.senstivity && !config.isMobile) {
          const flipFactor = Math.max(0, 1 - distance / config.effectFalloff);
          const angle = transformState[index].angle;
          const moveAmount = config.cardMoveAmount * flipFactor;

          transformState[index].targetX = moveAmount * Math.cos(angle);
          transformState[index].targetY = moveAmount * Math.sin(angle);
          transformState[index].targetRotation = 180 * flipFactor;
          transformState[index].targetScale = 1 + 0.3 * flipFactor;
        } else {
          transformState[index].targetX = 0;
          transformState[index].targetY = 0;
          transformState[index].targetRotation = 0;
          transformState[index].targetScale = 1;
        }
      });
    });

    function animate() {
      if (!isPreviewActive && !isTransitioning) {
        parallaxState.currentX +=
          (parallaxState.targetX - parallaxState.currentX) * config.lerpFactor;
        parallaxState.currentY +=
          (parallaxState.targetY - parallaxState.currentY) * config.lerpFactor;
        parallaxState.currentZ +=
          (parallaxState.targetZ - parallaxState.currentZ) * config.lerpFactor;

        gsap.set(galleryContainer, {
          rotateX: parallaxState.currentX,
          rotateY: parallaxState.currentY,
          rotateZ: parallaxState.currentZ,
          transformOrigin: 'center center',
        });

        cards.forEach((card, index) => {
          const state = transformState[index];
          state.currentX += (state.targetX - state.currentX) * config.lerpFactor;
          state.currentY += (state.targetY - state.currentY) * config.lerpFactor;
          state.currentRotation +=
            (state.targetRotation - state.currentRotation) * config.lerpFactor;
          state.currentScale +=
            (state.targetScale - state.currentScale) * config.lerpFactor;

          const angle = state.angle;
          const x = config.radius * Math.cos(angle);
          const y = config.radius * Math.sin(angle);

          gsap.set(card, {
            x: x + state.currentX,
            y: y + state.currentY,
            rotationY: state.currentRotation,
            scale: state.currentScale,
            rotation: (angle * 180) / Math.PI + 90,
            transformPerspective: 1000,
          });
        });
      }

      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  return (
    <div className="container">
      <div className="gallery-container">
        <div className="gallery"></div>
      </div>
      <div className="title-container"></div>
      <div className="desc-text-container">
        <p className="desc-text">Check out these Photographs!</p>
      </div>
    </div>
  );
}


  
