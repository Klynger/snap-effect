import anime from 'animejs';
import Chance from "chance";
import React, { useRef } from "react";
import html2canvas from "html2canvas";

const chance = new Chance();
const CANVAS_COUNT = 35;

function createBlankImageData(imageData, imageDataArray) {
  for (let i = 0; i < CANVAS_COUNT; i++) {
    const arr = new Uint8ClampedArray(imageData.data);
    for (let j = 0; j < arr.length; j++) {
      arr[j] = 0;
    }
    imageDataArray.push(arr);
  }
}

function weightedRandomDistrib(peak) {
  const prob = [],
    seq = [];
  for (let i = 0; i < CANVAS_COUNT; i++) {
    prob.push(Math.pow(CANVAS_COUNT - Math.abs(peak - i), 3));
    seq.push(i);
  }

  return chance.weighted(seq, prob);
}

function newCanvasFromImageData(imageDataArray, w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const tempCtx = canvas.getContext("2d");
  tempCtx.putImageData(new ImageData(imageDataArray, w, h), 0, 0);

  return canvas;
}

function animateElements(elem, translateX, translateY, angle, duration) {
  anime({
    targets: elem,
    easing: 'easeInQuad',
    translateX,
    translateY,
    filter: 'blur(4px)',
    rotate: `${angle}deg`,
    duration,
  });

  anime({
    targets: elem,
    delay: duration * 0.2,
    opacity: 0,
    duration: duration * 0.8,
    easing: 'easeInQuint',
  });
}

function SnapEffect() {
  const contentRef = useRef();
  const canvasRef = useRef();

  const handleButtonClick = () => {
    const imageDataArray = [];
    html2canvas(contentRef.current).then(canvas => {
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixelArr = imageData.data;
      createBlankImageData(imageData, imageDataArray);
      for (let i = 0; i < pixelArr.length; i += 4) {
        const p = Math.floor((i / pixelArr.length) * CANVAS_COUNT);
        const a = imageDataArray[weightedRandomDistrib(p)];

        a[i] = pixelArr[i];
        a[i + 1] = pixelArr[i + 1];
        a[i + 2] = pixelArr[i + 2];
        a[i + 3] = pixelArr[i + 3];
      }

      for (let i = 0; i < CANVAS_COUNT; i++) {
        const c = newCanvasFromImageData(
          imageDataArray[i],
          canvas.width,
          canvas.height
        );
        c.classList.add("dust");
        canvasRef.current.append(c);
      }

      anime({
        targets: contentRef.current,
        opacity: 0,
        duration: 3500,
      });

      document.querySelectorAll('.dust').forEach((elem, i) => {
        setTimeout(() => {
          animateElements(
            elem,
            100,
            -100,
            chance.integer({ min: -15, max: 15 }),
            800 + 110 * i, i);
        }, 70 * chance.integer({ min: 5, max: 35 }));
      });
    });
  };

  return (
    <div className="canvas-wrapper" ref={canvasRef}>
      <div className="content" ref={contentRef}>
        <img
          src="./rose-blue.jpeg"
          alt="eu"
        />
        <button className="snap-btn" onClick={handleButtonClick}>Snap</button>
      </div>
    </div>
  );
}

export default SnapEffect;
