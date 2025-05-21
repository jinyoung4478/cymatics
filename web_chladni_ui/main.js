import init, { generate_chladni_pattern } from '../rust_chladni_logic/pkg/rust_chladni_logic.js';

async function run() {
    await init();

    const canvas = document.getElementById('chladniCanvas');
    const ctx = canvas.getContext('2d');

    const nSlider = document.getElementById('nSlider');
    const mSlider = document.getElementById('mSlider');
    const aSlider = document.getElementById('aSlider');
    const bSlider = document.getElementById('bSlider');
    const resolutionSlider = document.getElementById('resolutionSlider');
    const thresholdSlider = document.getElementById('thresholdSlider');

    const nValueSpan = document.getElementById('nValue');
    const mValueSpan = document.getElementById('mValue');
    const aValueSpan = document.getElementById('aValue');
    const bValueSpan = document.getElementById('bValue');
    const resolutionValueSpan = document.getElementById('resolutionValue');
    const thresholdValueSpan = document.getElementById('thresholdValue');

    function drawPattern() {
        const n = parseFloat(nSlider.value);
        const m = parseFloat(mSlider.value);
        const a = parseFloat(aSlider.value);
        const b = parseFloat(bSlider.value);
        const resolution = parseInt(resolutionSlider.value);
        const threshold = parseFloat(thresholdSlider.value);

        nValueSpan.textContent = n.toFixed(1);
        mValueSpan.textContent = m.toFixed(1);
        aValueSpan.textContent = a.toFixed(1);
        bValueSpan.textContent = b.toFixed(1);
        resolutionValueSpan.textContent = resolution;
        thresholdValueSpan.textContent = threshold.toFixed(3);

        canvas.width = resolution;
        canvas.height = resolution;

        // Generate pattern data from Rust/WASM
        const imageDataArray = generate_chladni_pattern(n, m, a, b, resolution, resolution, threshold);
        
        // Create ImageData object
        const imageData = new ImageData(new Uint8ClampedArray(imageDataArray), resolution, resolution);

        // Draw the ImageData onto the canvas
        ctx.putImageData(imageData, 0, 0);
    }

    // Event listeners for sliders
    [nSlider, mSlider, aSlider, bSlider, resolutionSlider, thresholdSlider].forEach(slider => {
        slider.addEventListener('input', drawPattern);
    });

    // Initial draw
    drawPattern();
}

run().catch(console.error); 