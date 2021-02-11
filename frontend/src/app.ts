import axios from 'axios';
import { CanvasManager } from './canvas/manager';
import { addCanvasEvents } from './events';
import * as _d from './utils/dom';
import * as _a from './utils/ajax';
import './styles/editor.css';

class EditorApp {
  constructor() {
    this.canvasId = '';
    this.canvasManager = new CanvasManager();
    addCanvasEvents(this.canvasManager);
    const container = _d.get('px-editor-canvas-container');
    container.appendChild(this.canvasManager.root);
    this.canvasManager.renderAll();

    const saveTool = _d.get('px-editor-tool-save');
    saveTool.addEventListener('click', async (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      this.save();
    });
  }

  private canvasId: string;
  private canvasManager: CanvasManager;

  public initializaApp = async (): Promise<void> => {
    const id = _d.get('px-editor-id').textContent;
    if (id) {
      try {
        this.canvasId = id;
        const res = await axios.get(_a.endPointFullUrl(`/editor/data/${this.canvasId}`));
        const editorState = res.data['editor_state'];
        const { xPixels, yPixels, pixelSize, colorData, selected } = JSON.parse(editorState);
        this.canvasManager.load({
          xPixels,
          yPixels,
          pixelSize,
          colorData,
          selected
        });
      } catch (err) {
        console.error(err);
        this.canvasId = '';
      } finally {
        this.canvasManager.renderAll();
      }
    }
  };

  public save = async (): Promise<void> => {
    const token = _a.getCSRFToken(document.cookie);
    const titleDefault = 'New Canvas';
    const titleEdited = _d.get('px-editor-title').textContent;
    const title = titleEdited ? titleEdited : titleDefault;
    if (this.canvasId) {
      axios.put(_a.endPointFullUrl(`editor/data/${this.canvasId}/`),
        {
          title,
          editor_state: this.canvasManager.dump()
        },
        {
          headers: {
            'X-CSRFToken': token
          }
        }
      );
    } else {
      const res = await axios.post(_a.endPointFullUrl('editor/data/'),
        {
          title,
          editor_state: this.canvasManager.dump()
        },
        {
          headers: {
            'X-CSRFToken': token
          }
        }
      );
      this.canvasId = res.data['id'];
    }
  }
}

(async () => {
  const app = new EditorApp();
  app.initializaApp();
})();
