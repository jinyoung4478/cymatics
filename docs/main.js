import init, { init_particles, update_particles, PlateShape } from './pkg/rust_chladni_logic.js';

async function run() {
    await init();

    const canvas = document.getElementById('chladniCanvas');
    const ctx = canvas.getContext('2d');
    const canvasSize = parseInt(window.getComputedStyle(document.querySelector('.canvas-container')).maxWidth) || 1000;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const themeSwitcher = document.getElementById('themeSwitcher');
    const plateShapeSelect = document.getElementById('plateShapeSelect');
    const patternPresetSelect = document.getElementById('patternPreset');
    const nSlider = document.getElementById('nSlider');
    const mSlider = document.getElementById('mSlider');
    const aSlider = document.getElementById('aSlider');
    const bSlider = document.getElementById('bSlider');
    const particleCountSlider = document.getElementById('particleCountSlider');
    const forceSlider = document.getElementById('forceSlider');

    const nValueSpan = document.getElementById('nValue');
    const mValueSpan = document.getElementById('mValue');
    const aValueSpan = document.getElementById('aValue');
    const bValueSpan = document.getElementById('bValue');
    const particleCountValueSpan = document.getElementById('particleCountValue');
    const forceValueSpan = document.getElementById('forceValue');

    let particles_flat = []; // Stores [x1, y1, x2, y2, ...]
    let currentPlateShape = PlateShape.Square;
    let currentAspectRatioX = 1.0;
    let currentAspectRatioY = 1.0;

    // Theme handling
    function applyTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark-mode');
            themeSwitcher.checked = true;
        } else {
            document.documentElement.classList.remove('dark-mode');
            themeSwitcher.checked = false;
        }
    }

    themeSwitcher.addEventListener('change', (event) => {
        applyTheme(event.target.checked);
        localStorage.setItem('chladniTheme', event.target.checked ? 'dark' : 'light');
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('chladniTheme');
    if (savedTheme) {
        applyTheme(savedTheme === 'dark');
    } else {
        // Optional: check for OS preference if no theme is saved
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark);
    }

    const presets = {
        "십자형 (4,4,1,1)": { n: 4, m: 4, a: 1, b: 1 },
        "모래시계형 (2,4,1,1)": { n: 2, m: 4, a: 1, b: 1 },
        "단순 대칭 (3,5,1,1)": { n: 3, m: 5, a: 1, b: 1 },
        "별 모양 (7,2,1,-1)": { n: 7, m: 2, a: 1, b: -1 },
        "복잡한 패턴1 (5,8,1,1)": { n: 5, m: 8, a: 1, b: 1 },
        "복잡한 패턴2 (7,9,1,-1)": { n: 7, m: 9, a: 1, b: -1 },
        "원형에 가까운 (12,13,1,1)": { n: 12, m: 13, a: 1, b: 1},
    };

    function populatePresets() {
        for (const name in presets) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            patternPresetSelect.appendChild(option);
        }
    }

    function applyPreset(presetName) {
        if (presets[presetName]) {
            const p = presets[presetName];
            nSlider.value = p.n;
            mSlider.value = p.m;
            aSlider.value = p.a;
            bSlider.value = p.b;
            updateSliderValueSpans();
            // For presets, we might want to default to square or let user choose plate shape separately
            // For now, applying a preset does not change the plate shape.
            // It will re-init particles with the current plate shape.
            resetAndInitParticles(); 
        }
    }
    
    patternPresetSelect.addEventListener('change', (event) => {
        if (event.target.value === "custom") {
            // Allow user to manually adjust sliders without resetting to a specific preset
            // However, changing to "custom" itself doesn't change slider values
            // If they want to go back to custom from a preset, they just adjust sliders
        } else {
            applyPreset(event.target.value);
        }
    });

    plateShapeSelect.addEventListener('change', (event) => {
        const shapeValue = event.target.value;
        if (shapeValue === 'square') {
            currentPlateShape = PlateShape.Square;
            currentAspectRatioX = 1.0;
            currentAspectRatioY = 1.0;
        } else if (shapeValue === 'circle') {
            currentPlateShape = PlateShape.Circle;
            currentAspectRatioX = 1.0; 
            currentAspectRatioY = 1.0;
        } else if (shapeValue === 'rectangle_wide') {
            currentPlateShape = PlateShape.RectangleWide;
            currentAspectRatioX = 2.0; 
            currentAspectRatioY = 1.0;
        } else if (shapeValue === 'rectangle_tall') {
            currentPlateShape = PlateShape.RectangleTall;
            currentAspectRatioX = 1.0; 
            currentAspectRatioY = 2.0;
        } else if (shapeValue === 'hexagon') {
            currentPlateShape = PlateShape.Hexagon;
            currentAspectRatioX = 1.0; 
            currentAspectRatioY = 1.0; 
        }
        resetAndInitParticles();
    });

    function updateSliderValueSpans() {
        nValueSpan.textContent = parseFloat(nSlider.value).toFixed(1);
        mValueSpan.textContent = parseFloat(mSlider.value).toFixed(1);
        aValueSpan.textContent = parseFloat(aSlider.value).toFixed(1);
        bValueSpan.textContent = parseFloat(bSlider.value).toFixed(1);
        particleCountValueSpan.textContent = particleCountSlider.value;
        forceValueSpan.textContent = parseFloat(forceSlider.value).toExponential(1);
    }

    function resetAndInitParticles() {
        const numParticles = parseInt(particleCountSlider.value);
        particles_flat = init_particles(numParticles, currentPlateShape, currentAspectRatioX, currentAspectRatioY);
    }

    function animationLoop() {
        const n = parseFloat(nSlider.value);
        const m = parseFloat(mSlider.value);
        const a = parseFloat(aSlider.value);
        const b = parseFloat(bSlider.value);
        const k_force = parseFloat(forceSlider.value);
        const jitter = 0.0018; // Fixed jitter value
        const dt = 0.01; // Fixed delta time for simulation step

        if (particles_flat && particles_flat.length > 0) {
            particles_flat = update_particles(
                new Float64Array(particles_flat), 
                n, m, a, b, dt, k_force, 
                currentPlateShape, 
                currentAspectRatioX, 
                currentAspectRatioY,
                jitter
            );
        }

        // Drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const styles = getComputedStyle(document.documentElement); // Get root styles
        const plateColor = styles.getPropertyValue('--canvas-plate-color').trim();
        const particleColor = styles.getPropertyValue('--canvas-particle-color').trim();

        let plateDisplayWidth, plateDisplayHeight, plateDisplayX, plateDisplayY;
        let universalScale = Math.min(canvasSize / (currentAspectRatioX * 2), canvasSize / (currentAspectRatioY * 2));

        plateDisplayWidth = currentAspectRatioX * 2 * universalScale;
        plateDisplayHeight = currentAspectRatioY * 2 * universalScale;
        plateDisplayX = (canvasSize - plateDisplayWidth) / 2;
        plateDisplayY = (canvasSize - plateDisplayHeight) / 2;

        ctx.fillStyle = plateColor;
        if (currentPlateShape === PlateShape.Circle) {
            ctx.beginPath();
            ctx.arc(plateDisplayX + plateDisplayWidth / 2, plateDisplayY + plateDisplayHeight / 2, plateDisplayWidth / 2, 0, 2 * Math.PI);
            ctx.fill();
        } else if (currentPlateShape === PlateShape.Hexagon) {
            ctx.beginPath();
            const hexRadius = plateDisplayWidth / 2; 
            const centerX = plateDisplayX + plateDisplayWidth / 2;
            const centerY = plateDisplayY + plateDisplayHeight / 2; 
            
            for (let i = 0; i < 6; i++) {
                const angle = Math.PI / 3 * i; 
                const x = centerX + hexRadius * Math.cos(angle);
                const y = centerY + hexRadius * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillRect(plateDisplayX, plateDisplayY, plateDisplayWidth, plateDisplayHeight);
        }

        ctx.fillStyle = particleColor;
        if (particles_flat) {
            let particleRenderOffsetX = plateDisplayX; 
            let particleRenderOffsetY = plateDisplayY;

            for (let i = 0; i < particles_flat.length; i += 2) {
                let particleX_from_rust = particles_flat[i]; 
                let particleY_from_rust = particles_flat[i+1]; 

                const canvasX = (particleX_from_rust + currentAspectRatioX) * universalScale + particleRenderOffsetX;
                const canvasY = (particleY_from_rust + currentAspectRatioY) * universalScale + particleRenderOffsetY;
                
                if (canvasX >= plateDisplayX && canvasX <= plateDisplayX + plateDisplayWidth &&
                    canvasY >= plateDisplayY && canvasY <= plateDisplayY + plateDisplayHeight) {
                    ctx.fillRect(canvasX, canvasY, 1, 1); 
                }
            }
        }
        updateSliderValueSpans(); 
        requestAnimationFrame(animationLoop);
    }

    // Initial setup
    populatePresets();
    updateSliderValueSpans();
    resetAndInitParticles();

    // Event listeners for sliders
    [nSlider, mSlider, aSlider, bSlider, forceSlider, particleCountSlider].forEach(slider => {
        slider.addEventListener('input', () => {
             patternPresetSelect.value = "custom"; 
             updateSliderValueSpans();
        });
    });
    
    animationLoop();
}

run().catch(console.error); 
run().catch(console.error); 