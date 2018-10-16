import {ThreeComponent} from "./threeComponent";
import * as THREE from "three";

export class ThreePointLight extends ThreeComponent {
  constructor() {
    super();
    this.helper = null;
  }

  static create({}, props) {
    let threePointLight = new ThreePointLight();
    let pointLight = new THREE.PointLight(props.color || 0xffffff, 1, 0);
    if (props.position) {
      pointLight.position.set(props.position.x, props.position.y, props.position.z);
    }
    threePointLight.renderer = pointLight;
    return threePointLight;
  }
}