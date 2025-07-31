"use client";
import { useEffect } from "react";

export default function Snowfall() {
  useEffect(() => {
    const script = document.createElement("script");
    script.textContent = `
      (function() {
          const styleSheet = document.createElement("style");
          styleSheet.textContent = \`
              .snowflake {
                  position: fixed;
                  top: -10px;
                  color: white;
                  font-size: 1em;
                  font-family: Arial, sans-serif;
                  text-shadow: 0 0 5px rgba(255,255,255,0.7);
                  filter: drop-shadow(0 0 10px white);
                  cursor: default;
                  user-select: none;
                  z-index: 999999;
                  pointer-events: none;
                  animation-timing-function: linear;
                  animation-iteration-count: infinite;
              }

              @keyframes snowfall {
                  0% {
                      transform: translateY(0vh) translateX(0) rotate(0deg);
                  }
                  100% {
                      transform: translateY(100vh) translateX(20px) rotate(360deg);
                  }
              }

              #snow-container {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  pointer-events: none;
                  z-index: 999999;
              }
          \`;
          document.head.appendChild(styleSheet);

          const config = {
              snowflakes: ['✨', '🍷', '❅'],
              density: 50,
              interval: 200,
              minSize: 0.8,
              maxSize: 1.5,
              minDuration: 5,
              maxDuration: 15,
              wind: 20,
              zIndex: 999999
          };

          const container = document.createElement('div');
          container.id = 'snow-container';
          document.body.appendChild(container);

          function createSnowflake() {
              if (container.children.length >= config.density) return;

              const snowflake = document.createElement('div');
              snowflake.className = 'snowflake';
              snowflake.innerHTML = config.snowflakes[Math.floor(Math.random() * config.snowflakes.length)];

              const startPositionX = Math.random() * window.innerWidth;
              const size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
              const duration = Math.random() * (config.maxDuration - config.minDuration) + config.minDuration;
              const windOffset = Math.random() * config.wind;

              Object.assign(snowflake.style, {
                  left: startPositionX + 'px',
                  transform: \`scale(\${size})\`,
                  opacity: Math.random() * 0.6 + 0.4,
                  animation: \`snowfall \${duration}s linear infinite\`
              });

              container.appendChild(snowflake);
              setTimeout(() => snowflake.remove(), duration * 1000);
          }

          function startSnowfall() {
              for (let i = 0; i < 10; i++) createSnowflake();
              setInterval(createSnowflake, config.interval);
          }

          window.addEventListener('resize', () => {
              const snowflakes = container.getElementsByClassName('snowflake');
              for (let flake of snowflakes) {
                  if (parseInt(flake.style.left) > window.innerWidth) {
                      flake.style.left = Math.random() * window.innerWidth + 'px';
                  }
              }
          });

          startSnowfall();

          window.SnowTheme = {
              config: config,
              container: container,
              start: startSnowfall,
              createSnowflake: createSnowflake
          };
      })();
    `;
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return null;
}
