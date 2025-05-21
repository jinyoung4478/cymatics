use std::f64::consts::PI;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn generate_chladni_pattern(
    n: f64,
    m: f64,
    a: f64,
    b: f64,
    width: usize,
    height: usize,
    threshold: f64,
) -> Vec<u8> {
    // Set up panic hook for better WASM error messages in the console
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();

    let mut data = vec![0u8; width * height * 4]; // RGBA

    for y_idx in 0..height {
        for x_idx in 0..width {
            // Normalize coordinates from -1 to 1
            let x = (x_idx as f64 / (width - 1) as f64) * 2.0 - 1.0;
            let y = (y_idx as f64 / (height - 1) as f64) * 2.0 - 1.0;

            // Chladni equation: s(x, y) = a*sin(πnx)sin(πmy) + b*sin(πmx)sin(πny)
            let term1 = a * (PI * n * x).sin() * (PI * m * y).sin();
            let term2 = b * (PI * m * x).sin() * (PI * n * y).sin();
            let s_val = term1 + term2;

            let base_idx = (y_idx * width + x_idx) * 4;
            if s_val.abs() < threshold {
                // Node: draw as black
                data[base_idx] = 0; // R
                data[base_idx + 1] = 0; // G
                data[base_idx + 2] = 0; // B
                data[base_idx + 3] = 255; // A (opaque)
            } else {
                // Anti-node: draw as white
                data[base_idx] = 255; // R
                data[base_idx + 1] = 255; // G
                data[base_idx + 2] = 255; // B
                data[base_idx + 3] = 255; // A (opaque)
            }
        }
    }
    data
}
