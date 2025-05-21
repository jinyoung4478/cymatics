/* tslint:disable */
/* eslint-disable */
export function init_particles(num_particles: number, shape: PlateShape, aspect_ratio_x: number, aspect_ratio_y: number): Float64Array;
export function update_particles(current_particles_flat: Float64Array, n: number, m: number, a: number, b: number, dt: number, k_force: number, shape: PlateShape, aspect_ratio_x: number, aspect_ratio_y: number, jitter_strength: number): Float64Array;
export enum PlateShape {
  Square = 0,
  Circle = 1,
  RectangleWide = 2,
  RectangleTall = 3,
  Hexagon = 4,
}
export class Particle {
  private constructor();
  free(): void;
  x: number;
  y: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_particle_free: (a: number, b: number) => void;
  readonly __wbg_get_particle_x: (a: number) => number;
  readonly __wbg_set_particle_x: (a: number, b: number) => void;
  readonly __wbg_get_particle_y: (a: number) => number;
  readonly __wbg_set_particle_y: (a: number, b: number) => void;
  readonly init_particles: (a: number, b: number, c: number, d: number) => [number, number];
  readonly update_particles: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => [number, number];
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
