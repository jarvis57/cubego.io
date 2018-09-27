import render from "./fiber/render";
import {TYPES} from "./components";

export const MeshContainer = TYPES.MESH_CONTAINER;
export const PerspectiveCamera = TYPES.PERSPECTIVE_CAMERA;
export const Grid = TYPES.GRID;
export const HemisphereLight = TYPES.HEMISPHERE_LIGHT;
export const MeshBox = TYPES.MESH_BOX;
export const Axis = TYPES.AXIS;
export const BoxHelper = TYPES.BOX_HELPER;
export const OrthographicCamera = TYPES.ORTHOGRAPHIC_CAMERA;

const ThreeX = {render};
export default ThreeX;
