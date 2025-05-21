use rand::Rng;
use std::f64::consts::PI;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone, Copy, Debug)]
pub struct Particle {
    pub x: f64,
    pub y: f64,
}

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum PlateShape {
    Square = 0,
    Circle = 1,
    RectangleWide = 2, // e.g., 2:1 aspect ratio, x in [-2, 2], y in [-1, 1]
    RectangleTall = 3, // e.g., 1:2 aspect ratio, x in [-1, 1], y in [-2, 2]
    Hexagon = 4,
}

// Helper function to check if a point is inside a regular hexagon centered at (0,0) with radius R (distance from center to vertex)
// For a hexagon with radius R=1 (normalized space, aspect_ratio_x/y = 1.0)
fn is_inside_hexagon(px: f64, py: f64, r: f64) -> bool {
    let q2x = px.abs();
    let q2y = py.abs();
    // Check bounding box first (optional optimization)
    if q2x > r || q2y > r * 0.86602540378 {
        // r * sqrt(3)/2
        return false;
    }
    // Check against the slanted edge of the hexagon
    // The line equation for the relevant edge in the first quadrant is y = -sqrt(3)x + sqrt(3)R
    // Or, sqrt(3)x + y - sqrt(3)R = 0. We want points where sqrt(3)x + y <= sqrt(3)R
    // This can be simplified to a dot product check or slope comparison.
    // A common check for a hexagon aligned with y-axis:
    // (sqrt(3)/2)*R is the distance from center to the midpoint of a side (apothem)
    // The hexagon has flat tops/bottoms if radius R is center to vertex.
    // If R is from center to vertex:
    // |y| <= R * sqrt(3)/2 (apothem)
    // |x| <= R
    // and for the slanted edges: |y| <= sqrt(3) * (R - |x|/2)
    // Let's use a simpler formulation based on transforming coordinates.
    // More robust: sum of distances to sides, or point in triangle test for 6 triangles.
    // A simpler geometric check for a regular hexagon (flat top/bottom):
    // Max x is R. Max y is R*sqrt(3)/2.
    // The side slope involves sqrt(3).
    // Alternative check for hexagon (pointy top/bottom):
    // if q2x * 0.57735 + q2y > 1.0 * r { return false; } // 0.57735 = 1/sqrt(3)
    // return true;
    // For flat top/bottom hexagon, radius R to vertex:
    let apothem = r * 3.0_f64.sqrt() / 2.0; // R * sqrt(3)/2
    if q2y > apothem {
        return false;
    } // outside horizontal bounds
    if q2x > r {
        return false;
    } // should be caught by initial check but good for clarity
      // Check against slanted edges using y = m*x + c form
      // In the first quadrant, the line is from (R/2, apothem) to (R, 0)
      // More simply: if x > R/2, then y must be <= sqrt(3) * (R - x)
    if q2x > r / 2.0 {
        if q2y > 3.0_f64.sqrt() * (r - q2x) {
            return false;
        }
    }
    true
}

#[wasm_bindgen]
pub fn init_particles(
    num_particles: usize,
    shape: PlateShape,
    aspect_ratio_x: f64,
    aspect_ratio_y: f64,
) -> Vec<f64> {
    // Set up panic hook for better WASM error messages in the console
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();

    let mut rng = rand::thread_rng();
    let mut particles_flat = Vec::with_capacity(num_particles * 2);
    let mut count = 0;

    // Define effective bounds based on aspect ratio for particle generation
    // For the Chladni equation, we still use normalized coordinates later.
    let gen_bound_x = aspect_ratio_x; // e.g. 1.0 for square/circle, 2.0 for wide rect
    let gen_bound_y = aspect_ratio_y; // e.g. 1.0 for square/circle, 1.0 for wide rect

    while count < num_particles {
        let px = rng.gen_range(-gen_bound_x..gen_bound_x);
        let py = rng.gen_range(-gen_bound_y..gen_bound_y);

        match shape {
            PlateShape::Square | PlateShape::RectangleWide | PlateShape::RectangleTall => {
                particles_flat.push(px);
                particles_flat.push(py);
                count += 1;
            }
            PlateShape::Circle => {
                // Check if inside unit circle (radius 1, as aspect_ratio for circle will be 1,1)
                if px * px + py * py <= 1.0 * 1.0 {
                    // Circle radius is effectively 1.0 in this normalized context
                    particles_flat.push(px);
                    particles_flat.push(py);
                    count += 1;
                }
            }
            PlateShape::Hexagon => {
                // For hexagon, aspect_ratio_x is treated as R (center to vertex)
                if is_inside_hexagon(px, py, gen_bound_x) {
                    particles_flat.push(px);
                    particles_flat.push(py);
                    count += 1;
                }
            }
        }
    }
    particles_flat
}

#[wasm_bindgen]
pub fn update_particles(
    current_particles_flat: Vec<f64>,
    n: f64,
    m: f64,
    a: f64,
    b: f64,
    dt: f64,      // Delta time / step size for movement
    k_force: f64, // Force strength factor
    shape: PlateShape,
    aspect_ratio_x: f64,  // e.g., 1.0 for square, 2.0 for 2:1 rectangle_wide
    aspect_ratio_y: f64,  // e.g., 1.0 for square, 1.0 for 2:1 rectangle_wide
    jitter_strength: f64, // New parameter for random displacement
) -> Vec<f64> {
    let num_coords = current_particles_flat.len();
    if num_coords == 0 {
        return Vec::new();
    }
    let mut new_particles_flat = Vec::with_capacity(num_coords);
    let mut rng = rand::thread_rng(); // Initialize RNG if not already available

    for i in (0..num_coords).step_by(2) {
        let mut px = current_particles_flat[i]; // Particle x position (can be e.g. -2 to 2 for wide rect)
        let mut py = current_particles_flat[i + 1]; // Particle y position

        // Normalize particle coordinates for Chladni equation
        // The equation s(x,y) assumes x,y are in [-1, 1]
        // So we scale px, py by their respective aspect ratios
        let norm_x_for_eq = px / aspect_ratio_x;
        let norm_y_for_eq = py / aspect_ratio_y;

        // Chladni equation using normalized coordinates
        let s_val = a * (PI * n * norm_x_for_eq).sin() * (PI * m * norm_y_for_eq).sin()
            + b * (PI * m * norm_x_for_eq).sin() * (PI * n * norm_y_for_eq).sin();

        // Partial derivatives of s(x_norm, y_norm) w.r.t x_norm and y_norm
        let ds_dx_norm =
            a * PI * n * (PI * n * norm_x_for_eq).cos() * (PI * m * norm_y_for_eq).sin()
                + b * PI * m * (PI * m * norm_x_for_eq).cos() * (PI * n * norm_y_for_eq).sin();
        let ds_dy_norm =
            a * PI * m * (PI * n * norm_x_for_eq).sin() * (PI * m * norm_y_for_eq).cos()
                + b * PI * n * (PI * m * norm_x_for_eq).sin() * (PI * n * norm_y_for_eq).cos();

        // Gradient of s^2 w.r.t. x_norm, y_norm
        let grad_s_sq_x_norm = 2.0 * s_val * ds_dx_norm;
        let grad_s_sq_y_norm = 2.0 * s_val * ds_dy_norm;

        // Convert gradient back to particle coordinate system (chain rule)
        // d(s^2)/d(px) = d(s^2)/d(x_norm) * d(x_norm)/d(px) = grad_s_sq_x_norm / aspect_ratio_x
        let force_x = grad_s_sq_x_norm / aspect_ratio_x;
        let force_y = grad_s_sq_y_norm / aspect_ratio_y;

        px -= dt * k_force * force_x;
        py -= dt * k_force * force_y;

        // Add jitter AFTER main force calculation but BEFORE boundary clamping
        if jitter_strength > 0.0 {
            px += rng.gen_range(-jitter_strength..jitter_strength);
            py += rng.gen_range(-jitter_strength..jitter_strength);
        }

        // Boundary conditions based on shape
        match shape {
            PlateShape::Square | PlateShape::RectangleWide | PlateShape::RectangleTall => {
                px = px.max(-aspect_ratio_x).min(aspect_ratio_x);
                py = py.max(-aspect_ratio_y).min(aspect_ratio_y);
            }
            PlateShape::Circle => {
                let r_circ = aspect_ratio_x; // radius is aspect_ratio_x
                let dist_sq = px * px + py * py;
                if dist_sq > r_circ * r_circ {
                    let dist = dist_sq.sqrt();
                    px = (px / dist) * r_circ;
                    py = (py / dist) * r_circ;
                }
            }
            PlateShape::Hexagon => {
                let r_hex = aspect_ratio_x;
                let apothem = r_hex * 3.0_f64.sqrt() / 2.0;

                // Apply jitter first, then clamp to hexagon
                // The is_inside_hexagon check and clamping logic needs to be robust for points slightly outside
                if !is_inside_hexagon(px, py, r_hex) {
                    // If jitter pushed it out, try to bring it back.
                    // This simple clamping to inscribed circle might be aggressive with jitter.
                    // A more sophisticated boundary would be better for jitter near edges.
                    // For now, let's test this simpler fallback.
                    let dist_sq = px * px + py * py;
                    let inscribed_radius_sq = apothem * apothem; // Inscribed circle for hexagon
                    if dist_sq > inscribed_radius_sq {
                        // If far out, pull to inscribed circle boundary
                        let dist = dist_sq.sqrt();
                        px = (px / dist) * apothem;
                        py = (py / dist) * apothem;
                    } else {
                        // If slightly outside but within circumscribed circle, it might be complex to perfectly clamp.
                        // The is_inside_hexagon will handle points. If jitter makes it fail, this is a fallback.
                        // The original clamping in is_inside_hexagon might be better after jitter. Re-evaluating.
                        // Let's refine hexagon clamping: first check primary bounds, then slanted if needed.
                        let mut q2x_abs = px.abs();
                        let mut q2y_abs = py.abs();

                        if q2y_abs > apothem {
                            py = py.signum() * apothem;
                        }
                        // Update abs values after y-clamp
                        q2x_abs = px.abs();
                        q2y_abs = py.abs();

                        if q2x_abs > r_hex {
                            // Clamp to vertical edges of bounding box for hexagon
                            px = px.signum() * r_hex;
                        }
                        // Update abs values after x-clamp
                        q2x_abs = px.abs();
                        q2y_abs = py.abs();

                        if q2x_abs > r_hex / 2.0 && q2y_abs > 3.0_f64.sqrt() * (r_hex - q2x_abs) {
                            // Simplified: if outside slanted, pull towards center until it meets apothem based radius as fallback
                            // This is not a true projection but a fallback for points kicked out by jitter.
                            let dist_sq_inner = px * px + py * py;
                            if dist_sq_inner > apothem * apothem {
                                // Using apothem as a general inner bound for simplicity
                                let dist_inner = dist_sq_inner.sqrt();
                                px = (px / dist_inner) * apothem;
                                py = (py / dist_inner) * apothem;
                            }
                        }
                    }
                }
            }
        }
        new_particles_flat.push(px);
        new_particles_flat.push(py);
    }
    new_particles_flat
}
