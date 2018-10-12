import {CUBE_MATERIALS, CUBE_MATERIALS_NAME_TO_ID} from "../constants/cubego";
import * as ObjUtils from "./objUtils";

export const ReformatModel = (model) => {
  let newModel = {
    palette: model.palette,
    size: {
      x: model.size.x,
      y: model.size.y,
      z: model.size.z,
    },
    modelSize: {
      x: [0, model.size.x-1],
      y: [0, model.size.y-1],
      z: [0, model.size.z-1],
    },
    spaceSize: {
    },
    layerCount: {
      x: {},
      y: {},
      z: {},
    }
  };

  let variants = ObjUtils.GetValues(CUBE_MATERIALS[CUBE_MATERIALS_NAME_TO_ID.plastic].variants);

  newModel.voxels = {};
  model.voxels.forEach(cell => {
    let bar = 20;
    let cellColor = newModel.palette[cell.colorIndex];
    let variant = variants.find((va) => (Math.abs(va.r-cellColor.r) <= bar && Math.abs(va.g-cellColor.g) <= bar && Math.abs(va.b-cellColor.b) <= bar)) || variants[0];

    let v = {
      ...cell,
      x: model.size.x-1-cell.x,
      y: cell.y,
      z: cell.z,
      color: {
        ...variant
      },
    };

    if (!newModel.voxels[GetCellKey(v.x, v.y, v.z)]) {
      newModel.voxels[GetCellKey(v.x, v.y, v.z)] = v;
      newModel.layerCount.x[v.x] = !newModel.layerCount.x[v.x] ? 1 : newModel.layerCount.x[v.x]+1;
      newModel.layerCount.y[v.y] = !newModel.layerCount.y[v.y] ? 1 : newModel.layerCount.y[v.y]+1;
      newModel.layerCount.z[v.z] = !newModel.layerCount.z[v.z] ? 1 : newModel.layerCount.z[v.z]+1;
    }
  });

  return newModel;
};

export const GetCellKey = (x, y, z) => (`${x}_${y}_${z}`);