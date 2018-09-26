import {EDITOR_COLORS} from "../utils/constants";
import * as Utils from "../utils/utils";
import {CloneDeep} from "../utils/objUtils";

export class ToolManager {
  constructor(props) {
    this._tools = {};
    this._model = undefined;
    this._layer = undefined;
    this._numLayers = 0;
    this.drawMode = null;
    this.history = {
      idx: props.models.length - 1,
      models: props.models,
    };

    Utils.ObjGetValues(props.tools).forEach((tool, idx) => {
      this._tools[tool.key] = tool;
      if (tool.type === ToolTypes.mode && tool.value === true) {
        this.drawMode = tool;
      }
    });

    this.onToolClicked = this.onToolClicked.bind(this);
    this.onCellClicked = this.onCellClicked.bind(this);
    this.addModel = this.addModel.bind(this);
    this.getToolValue = this.getToolValue.bind(this);
    this.updateCurrent = this.updateCurrent.bind(this);

    this.updateCurrent();
  }

  addModel({model}) {
    this.history.idx += 1;
    this.history.models[this.history.idx] = CloneDeep(model);

    this.updateCurrent();
  }

  onToolClicked({key, value}) {
    if (!this._tools[key]) {
      console.warn("Unknown tool!");
      return;
    }

    // TODO: check if the value is valid
    // Case All Tools (includes effects)
    this._tools[key].value = value;

    // Case Tool Mode
    if (this._tools[key].type === ToolTypes.mode) {
      // Only 1 mode at a time
      Object.keys(this._tools).forEach((key) => {
        if (this._tools[key].type === ToolTypes.mode)
          this._tools[key].value = false;
      });

      // Set mode
      this.drawMode = this._tools[key];
      this._tools[key].value = true;
    }

    // Case Tool Action
    if (this._tools[key].type === ToolTypes.action) {
      this._tools[key].onToolClicked({
        toolManager: this,
        key: key,
        value: value,
      });
      this.updateCurrent();
    }
  }

  onCellClicked({cell, cells=[]}) {
    if (!this.drawMode) {
      console.warn("no draw mode!");
    } else {

      let newModel = this.drawMode.onCellClicked({
        tools: this._tools, model: this._model, cell, cells,
      });

      this.history.idx += 1;
      this.history.models[this.history.idx] = newModel;

      this.updateCurrent();
    }
  }

  updateCurrent() {
    this._model = this.history.models[this.history.idx];
    if (!this._model) return null;

    let x = this._tools['view-2d'].x;
    let y = this._tools['view-2d'].y;
    let z = this._tools['view-2d'].z;
    let size = this._model.size;

    this._numLayers = size[z[1]];
    let layerIdx = Utils.BoundVal(this._tools['layer-index'].value, 1, this._numLayers);
    this._tools['layer-index'].value = layerIdx;

    let zIdx = z[0] === '+' ? layerIdx - 1 : this._numLayers - layerIdx;
    let voxels = Utils.ObjFilter(this._model.voxels, cell => cell[z[1]] === zIdx);

    this._layer = {
      voxels,
      idx: zIdx,
      size: size,
      x: x[1], y: y[1], z: z[1],
      cal2dPos: (i, j) => {
        i = (x[0] === '+') ? i : size[x[1]]-1-i;
        j = (y[0] === '+') ? j : size[y[1]]-1-j;
        return {x: i, y: j};
      }
    };
  }

  get model() {
    return this._model;
  }

  get layer() {
    return this._layer;
  }

  get numLayers() {
    return this._numLayers;
  }

  get tools() {
    return this._tools;
  }

  getToolValue(toolKey) {
    return this._tools[toolKey].value;
  }

  isToolAvailable(toolKey) {
    return this._tools[toolKey] && this._tools[toolKey].isActive && this._tools[toolKey].isActive({toolManager: this});
  }
}

export const ToolTypes = {
  mode: 'mode',       // draw mode => this does not affect/change 3D model & 2D layer.
  effect: 'effect',   // effects  => this does not affect/change 3D model & 2D layer.
  action: 'action',   // single-used actions => this will affect/change either 3D model / 2D layer
};

export const Tools = {};

Tools.color = ({key='color', value=EDITOR_COLORS[0]}) => ({
  key,
  value,
  type: ToolTypes.effect,
  options: EDITOR_COLORS,
});

Tools.draw = ({key='draw', value=true}) => ({
  key,
  value,
  type: ToolTypes.mode,
  onCellClicked: ({tools, model, cell}) => {
    let newModel = CloneDeep(model);
    let updateIdx = 0;
    if (newModel['voxels'][`${cell.x}-${cell.y}-${cell.z}`]) {
      updateIdx = newModel['voxels'][`${cell.x}-${cell.y}-${cell.z}`].updateIdx;
      updateIdx = updateIdx ? updateIdx + 1 : 0;
    }

    newModel['voxels'][`${cell.x}-${cell.y}-${cell.z}`] = {
      ...cell,
      color: CloneDeep(tools.color.value),
      updateIdx
    };
    return newModel;
  },
});

Tools.erase = ({key='erase', value=false}) => ({
  key,
  value,
  type: ToolTypes.mode,
  onCellClicked: ({model, cell}) => {
    let newModel = CloneDeep(model);
    delete newModel['voxels'][`${cell.x}-${cell.y}-${cell.z}`];
    return newModel;
  },
});

Tools.clear = ({key='clear'}) => ({
  key,
  type: ToolTypes.action,
  onToolClicked: ({toolManager}) => {
    toolManager.history.idx += 1;
    toolManager.history.models[toolManager.history.idx] = CloneDeep(toolManager._model);
    toolManager.history.models[toolManager.history.idx].voxels = {};
    toolManager.history.models.length = toolManager.history.idx+1;
  },
  isActive: ({toolManager}) => (toolManager._model && !Utils.ObjIsEmpty(toolManager._model.voxels)),
});

Tools.clearLayer = ({key='clear-layer'}) => ({
  key,
  type: ToolTypes.action,
  onToolClicked: ({toolManager}) => {
    toolManager.history.idx += 1;
    toolManager.history.models[toolManager.history.idx] = CloneDeep(toolManager._model);
    toolManager.history.models[toolManager.history.idx].voxels = Utils.ObjFilter(
      toolManager.history.models[toolManager.history.idx].voxels,
      (voxel) => voxel[toolManager._layer.z] !== toolManager._layer.idx,
    );
    toolManager.history.models.length = toolManager.history.idx+1;
  },
  isActive: ({toolManager}) => (toolManager._layer && !Utils.ObjIsEmpty(toolManager._layer.voxels)),
});

Tools.undo = ({key='undo'}) => ({
  key,
  type: ToolTypes.action,
  onToolClicked: ({toolManager}) => {
    if (toolManager.history.idx > 0) toolManager.history.idx -= 1;
  },
  isActive: ({toolManager}) => (toolManager.history.idx > 0),
});

Tools.redo = ({key='redo'}) => ({
  key,
  type: ToolTypes.action,
  onToolClicked: ({toolManager}) => {
    if (toolManager.history.idx < toolManager.history.models.length-1)
      toolManager.history.idx += 1;
  },
  isActive: ({toolManager}) => (toolManager.history.idx < toolManager.history.models.length - 1),
});

Tools.view2D = ({key='view-2d', value={key: 'front', label: 'front_view'}}) => ({
  key,
  value,
  type: ToolTypes.action,
  options: [{
    key: 'front',
    label: 'front_view',
  }, {
    key: 'side',
    label: 'side_view',
  }, {
    key: 'top',
    label: 'top_view',
  }],
  x: '+y',
  y: '-z',
  z: '-x',
  onToolClicked: ({toolManager, key, value}) => {
    if (value.key === 'front') {
      toolManager.tools[key].x = '+y';
      toolManager.tools[key].y = '-z';
      toolManager.tools[key].z = '-x';
    } else if (value.key === 'side') {
      toolManager.tools[key].x = '+x';
      toolManager.tools[key].y = '-z';
      toolManager.tools[key].z = '+y';
    } else if (value.key === 'top') {
      toolManager.tools[key].x = '+y';
      toolManager.tools[key].y = '+x';
      toolManager.tools[key].z = '+z';
    }
  }
});

Tools.layerIndex = ({key='layer-index', value=0}) => ({
  key,
  value,
  type: ToolTypes.action,
  onToolClicked: ({toolManager, value}) => {
  }
});
