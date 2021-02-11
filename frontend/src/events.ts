import { zIndexes } from './config';
import { CanvasManager, EditMode } from './canvas/manager';
import * as _d from './utils/dom';
import * as _h from './utils/hardware';

export const addCanvasEvents = (cm: CanvasManager): void => {

  /**
  * User actions on caanvas
  */
  cm.eventHolder.addEventListener('mousedown', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    switch (cm.editMode) {
      case EditMode.paint:
      case EditMode.clear:
        cm.createHistory();
        cm.paint(e.offsetX, e.offsetY);
        break;
      case EditMode.fill:
        cm.createHistory();
        cm.fill(e.offsetX, e.offsetY);
        break;
    }
  });

  cm.eventHolder.addEventListener('mousemove', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!_h.isMouseLeftButtonPressed(e)) return; // only allows 'mousedrag'

    switch (cm.editMode) {
      case EditMode.paint:
      case EditMode.clear:
        cm.paint(e.offsetX, e.offsetY);
        break;
    }
  });

  cm.eventHolder.addEventListener('mouseup', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cm.createHistory();
    cm.clearEventPositions();
  });

  cm.eventHolder.addEventListener('mouseout', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cm.createHistory();
    cm.clearEventPositions();
  });

  /**
  * Edit modes
  */
  const paintModeIcon = _d.get('px-editor-mode-paint');
  paintModeIcon.addEventListener('click', (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    cm.editMode = EditMode.paint;
  });

  const cleatModeIcon = _d.get('px-editor-mode-clear');
  cleatModeIcon.addEventListener('click', (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    cm.editMode = EditMode.clear;
  });

  const fillModeIcon = _d.get('px-editor-mode-fill');
  fillModeIcon.addEventListener('click', (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    cm.editMode = EditMode.fill;
  });

  /**
   * Color
   */
  const colorPicker = _d.get('px-editor-color') as HTMLInputElement;
  colorPicker.addEventListener('input', (e: Event) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    cm.paintColor = colorPicker.value;
  });

  /**
  * Edit tools
  */
  const undoTool = _d.get('px-editor-tool-undo');
  undoTool.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cm.undoCanvas();
  });

  const redoTool = _d.get('px-editor-tool-redo');
  redoTool.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cm.redoCanvas();
  });

  const popupBase = _d.get('px-editor-popup-base');
  const cancelButtons = document.getElementsByClassName('px-editor-tool-cancel') as HTMLCollectionOf<HTMLElement>;
  _d.setStyles(popupBase, {
    zIndex: zIndexes.POPUP_BASE
  });
  const cancelPopupTool = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const popupElements = document.getElementsByClassName('px-editor-popup');
    if (popupElements.length > 0) {
      Array.from(popupElements).forEach(el => el.classList.add('inactive'));
    }
    popupBase.classList.add('inactive');
  };
  popupBase.addEventListener('mousedown', cancelPopupTool);
  if (cancelButtons.length > 0) {
    Array.from(cancelButtons).forEach(el => el.addEventListener('mousedown', cancelPopupTool));
  }

  const resizeTool = _d.get('px-editor-tool-resize');
  const resizePopup = _d.get('px-editor-resize-popup');
  const resizeInputX = _d.get('px-editor-input-resize-x') as HTMLInputElement;
  const resizeInputY = _d.get('px-editor-input-resize-y') as HTMLInputElement;
  const resizeExecuteButton = _d.get('px-editor-execute-resize');
  _d.setStyles(resizePopup, {
    zIndex: zIndexes.POPUP
  });
  resizeTool.addEventListener('click', (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = resizeTool.getBoundingClientRect();
    _d.setStyles(resizePopup, {
      top: `${rect.bottom}px`,
      left: `${rect.left}px`
    });
    popupBase.classList.remove('inactive');
    resizePopup.classList.remove('inactive');
    const { xPixels, yPixels } = cm.getXYPixels();
    resizeInputX.valueAsNumber = xPixels;
    resizeInputY.valueAsNumber = yPixels;
  });

  resizeExecuteButton.addEventListener('click', (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    cm.createHistory();
    const destX = resizeInputX.valueAsNumber;
    const destY = resizeInputY.valueAsNumber;
    cm.resize(destX, destY);
    popupBase.classList.add('inactive');
    resizePopup.classList.add('inactive');
    cm.createHistory();
    cm.renderAll();
  });

  const downloadImageTool = _d.get('px-editor-tool-downoad-image');
  const downloadImagePopup = _d.get('px-editor-download-image-popup');
  const downloadImagePixelSize = _d.get('px-editor-input-pixelsize') as HTMLInputElement;
  const downloadImageExecuteButton = _d.get('px-editor-execute-download-image');
  _d.setStyles(downloadImagePopup, {
    zIndex: zIndexes.POPUP
  });
  downloadImageTool.addEventListener('click', (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = downloadImageTool.getBoundingClientRect();
    _d.setStyles(downloadImagePopup, {
      top: `${rect.bottom}px`,
      left: `${rect.left}px`
    });
    popupBase.classList.remove('inactive');
    downloadImagePopup.classList.remove('inactive');
  });
  downloadImageExecuteButton.addEventListener('click', (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const pixelSize = downloadImagePixelSize.valueAsNumber;
    const downloadURL = cm.createDownloadImageURL(pixelSize);
    const dummyLink = _d.create('a', {
      href: downloadURL,
      download: 'canvas.png'
    });
    dummyLink.click();
  });
};
