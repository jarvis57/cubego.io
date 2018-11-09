import {ThreeComponent} from "./threeComponent";


export class ThreePointLight extends ThreeComponent {
  constructor() {
    super();
    this.helper = null;
  }

  static create({scene}, props) {
    let threePointLight = new ThreePointLight();
    let pointLight = new window.THREE.PointLight(props.color || 0xffffff, 1, 0);
    if (props.position) {
      pointLight.position.set(props.position.x, props.position.y, props.position.z);
    }
    let pointLightHelper = new window.THREE.PointLightHelper( pointLight, 1 );
    scene.add(pointLightHelper);
    threePointLight.renderer = pointLight;
    return threePointLight;
  }
}
