import React, {Component} from 'react';
import {
  Axis,
  BoxHelper,
  Grid,
  HemisphereLight,
  MeshBox,
  MeshContainer,
  OrthographicCamera,
} from "../threeX";
import * as Utils from "../../utils/utils";
import {fullColorHex} from "../utils";
import {getMousePositionOnCanvas} from "../threeX/fiber/utils";
import * as THREE from "three";

const SIZE = 50;

class VoxViewerThree extends Component {
  constructor(props) {
    super(props);
    this.state = {data: {}};
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.objects = [];
    this.offsetVector = new THREE.Vector3(0, 0, 0);
    this.isShiftDown = false;
    this.boxHelper = null;
    this.tools = props.tools;
  }

  renderVoxel(voxelData) {
    if (!voxelData.voxels) {
      return [];
    }
    let divisions = Math.max(voxelData.size.x, voxelData.size.y);
    let elements = [<Grid size={divisions * SIZE} divisions={divisions} key='grid' color1={0xffffff} color2={0xffffff}
                          position={{x: 0, y: -SIZE * voxelData.size.z / 2, z: 0}}/>];
    Utils.ObjGetValues(voxelData.voxels).forEach((voxel) => {
      let position = {
        x: SIZE / 2 + SIZE * voxel.x - this.offsetVector.x,
        y: SIZE / 2 + SIZE * voxel.z - this.offsetVector.y,
        z: SIZE / 2 + SIZE * voxel.y - this.offsetVector.z
      };
      let color = voxel['color']['hex'] ? voxel['color']['hex'].replace('#', '') : fullColorHex(voxel['color']);
      elements.push(<MeshBox size={SIZE} ref={(ref) => {
        this.objects.push(ref)
      }}
                             position={position} color={color} key={`${voxel.x}-${voxel.y}-${voxel.z}`}/>)
    });
    return elements;
  }

  setNewVoxelData(voxelData) {
    this.offsetVector = new THREE.Vector3(SIZE * Math.floor(voxelData.size.x / 2), SIZE * voxelData.size.z / 2, Math.floor(SIZE * voxelData.size.y / 2));
    this.objects = [];
    this.setState({
      data: voxelData || {}
    }, () => {
      this.updateHighLightLayer();
    });
  }

  setNewTools(tools) {
    this.tools = tools;
    this.updateHoverBoxColor();
    this.updateHighLightLayer();
  }

  updateHoverBoxColor() {
    let colorHex = '0x' + fullColorHex(this.tools.color.value);
    this.rollOverMesh.renderer.material.color.setHex(colorHex);
  }

  updateHighLightLayer() {
    let center = {
      x: 0,
      y: 0,
      z: 0
    };

    let size = {x: this.state.data.size.x * SIZE, y: this.state.data.size.z * SIZE, z: this.state.data.size.y * SIZE};

    switch (this.tools['view-2d'].value.key) {
      case 'front':
        center.x = -SIZE / 2 + this.state.data.size.x * SIZE - this.offsetVector.x - (this.tools['layer-index'].value - 1) * SIZE;
        size.x = SIZE;
        break;
      case 'top':
        center.y = -SIZE / 2 + this.state.data.size.z * SIZE - this.offsetVector.y - (this.tools['layer-index'].value - 1) * SIZE;
        size.y = SIZE;
        break;
      case 'side':
        center.z = -SIZE / 2 + this.state.data.size.y * SIZE - this.offsetVector.z - (this.tools['layer-index'].value - 1) * SIZE;
        size.z = SIZE;
        break;
    }

    this.boxHelper.setFromCenterAndSize(center, size);
  }

  componentDidMount() {
    this.canvas = document.getElementById('canvas3D');
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    document.addEventListener('keydown', this.onDocumentKeyDown.bind(this), false);
    document.addEventListener('keyup', this.onDocumentKeyUp.bind(this), false);
    this.updateHoverBoxColor();
  }

  componentWillUnmount() {
    this.canvas = document.getElementById('canvas3D');
    this.canvas.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.canvas.removeEventListener('mousedown', this.onMouseDown.bind(this), false);
    document.removeEventListener('keydown', this.onDocumentKeyDown.bind(this), false);
    document.removeEventListener('keyup', this.onDocumentKeyUp.bind(this), false);
  }

  getRendererObject() {
    return this.objects.filter((object) => {
      return !!object
    }).map((object) => {
      return object.renderer
    });
  }

  onDocumentKeyDown(event) {
    switch (event.keyCode) {
      case 16:
        this.isShiftDown = true;
        break
    }

  }

  onDocumentKeyUp(event) {
    switch (event.keyCode) {
      case 16:
        this.isShiftDown = false;
        break;
    }
  }

  onMouseDown(event) {
    let mousePos = getMousePositionOnCanvas(event, this.canvas);
    this.mouse.set((mousePos.x / this.canvas.width) * 2 - 1, -(mousePos.y / this.canvas.height) * 2 + 1);
    this.raycaster.setFromCamera(this.mouse, this.camera._renderer);
    let intersects = this.raycaster.intersectObjects(this.getRendererObject());
    if (intersects.length > 0) {
      let intersect = intersects[0];
      let position;
      if (this.isShiftDown) {
        position = new THREE.Vector3().copy(intersect.point).add(intersect.face.normal).clone();
      } else {
        position = intersect.object.position.clone();
      }
      let cubePos = position.add(this.offsetVector).divideScalar(SIZE).floor();
      this.props.onCellClicked && this.props.onCellClicked({
        ['x']: cubePos.x,
        ['y']: cubePos.z,
        ['z']: cubePos.y,
      })
    }
  }

  onMouseMove(event) {
    event.preventDefault();
    let mousePos = getMousePositionOnCanvas(event, this.canvas);
    this.mouse.set((mousePos.x / this.canvas.width) * 2 - 1, -(mousePos.y / this.canvas.height) * 2 + 1);
    this.raycaster.setFromCamera(this.mouse, this.camera._renderer);
    let intersects = this.raycaster.intersectObjects(this.getRendererObject());
    if (intersects.length > 0) {
      this.rollOverMesh.renderer.visible = true;
      let intersect = intersects[0];
      if (this.isShiftDown) {
        let position = new THREE.Vector3().copy(intersect.point).add(intersect.face.normal);
        position.divideScalar(SIZE).floor();
        position.multiplyScalar(SIZE).addScalar(SIZE/2);
        this.rollOverMesh.renderer.position.copy(position);
      } else {
        this.rollOverMesh.renderer.position.copy(intersect.object.position);
      }
    } else {
      this.rollOverMesh.renderer.visible = false;
    }
  }

  render() {
    return (
      <MeshContainer position={{x: 0, y: 0, z: 0}}>
        <Axis/>
        <OrthographicCamera ref={(ref) => {
          this.camera = ref
        }} position={{x: 1000, y: 1600, z: 2600}} lookAt={{x: 0, y: 300, z: 0}} fov={45} near={1} far={5000}/>
        <HemisphereLight/>
        <MeshBox size={SIZE + 1} color='ff0000' ref={(ref) => {
          this.rollOverMesh = ref
        }}/>
        <BoxHelper ref={(ref) => {
          this.boxHelper = ref
        }}/>
        {this.renderVoxel(this.state.data)}
      </MeshContainer>
    );
  }
}

export default VoxViewerThree;
