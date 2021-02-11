export const config = {
  DEFAULT_X_PIXELS: 15,
  DEFAULT_Y_PIXELS: 15,
  DEFAULT_PIXEL_SIZE: 20,
  DEFAULT_BG_COLOR_PRIMARY: '#FFFFFF',
  DEFAULT_BG_COLOR_SECONDARY: '#eeeeee',
  DEFAULT_PAINT_COLOR: '#000000',
  MAX_X_PIXELS: 30,
  MAX_Y_PIXELS: 30,
  MAX_LAYERS: 10,
  MAX_GROUPS: 10,
};

let z = config.MAX_LAYERS;
export const zIndexes = {
  BG: 0,
  HUD: ++z,
  EVENT_HOLDER: ++z,
  POPUP_BASE: ++z,
  POPUP: ++z
};
