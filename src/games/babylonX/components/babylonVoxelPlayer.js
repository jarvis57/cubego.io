import * as BABYLON from 'babylonjs';
import {BabylonComponent} from "./babylonComponent";
import {fullColorHex} from "../../utils";
import React from "react";
import {BabylonMeshBox} from "./babylonMeshBox";
import {hexToColor3} from "../utils";
import {BabylonMeshContainer} from "./babylonMeshContainer";

const HURT_COLOR = BABYLON.Color3.White();

export class BabylonVoxelPlayer extends BabylonComponent {
  constructor() {
    super();
    this.healthPercent = 100;
    this._opponent = null;
    this.isCollision = false;
    this.ske = null;
    this.isAttacking = false;
  }

  static create({scene}, props) {
    let voxelPlayer = new BabylonVoxelPlayer();
    let containerMesh = BabylonMeshContainer.create({scene}, {
      name: props.name || 'voxelPlayer',
      position: {x: 0, y: 0, z: 0}
    });
    if (props.rotate === -1)
      containerMesh.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.WORLD);

    voxelPlayer.renderer = containerMesh;
    voxelPlayer.scene = scene;
    voxelPlayer.createPlayerMesh(props.size, props.data, props.rotate);
    voxelPlayer.createFakeShadow();
    voxelPlayer.createHealthBar();
    voxelPlayer.createHurtPoint();
    scene.registerBeforeRender(() => {
      voxelPlayer.renderer.position.z = voxelPlayer.playerMesh.position.z;
      voxelPlayer.playerMesh.position.z = 0;
      voxelPlayer.sps.setParticles();
    });
    voxelPlayer.registerBeforeRender();
    return voxelPlayer;
  }

  set parent(parent) {
    this._parent = parent;
    this.renderer.parent = parent;
  }

  registerBeforeRender() {
    this.scene.registerBeforeRender(() => {
      if (!this._opponent.playerMesh || !this._opponent.isAttacking) return;
      if (this.playerMesh.intersectsMesh(this._opponent.playerMesh, true)) {
        if (!this.isCollision) {
          this.hurt(15);
          this.isCollision = true;
        }
      } else {
        this.isCollision = false;
      }
    });
  }

  set opponent(opponent) {
    this._opponent = opponent;
  }

  hurt(percent) {
    this.healthPercent -= percent;
    if (this.healthPercent < 0) {
      this.healthPercent = 0;
      this.die();
    } else {
      this.isCollision = true;
      setTimeout(() => {
        this.isCollision = false;
      }, 100);
    }
    this.animateHurtPoint(percent);
    this.updateHealthBar();
  }

  createHurtPoint() {
    let texture = new BABYLON.DynamicTexture("dynamic texture", 512, this.scene, true);
    texture.hasAlpha = true;
    this.hpPlane = BABYLON.MeshBuilder.CreatePlane('hpPlane', {width: 2, height: 2}, this.scene);
    this.hpPlane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
    this.hpPlane.material = new BABYLON.StandardMaterial("outputplane", this.scene);
    this.hpPlane.position.y = 2.5;
    this.hpPlane.material.opacityTexture = texture;
    this.hpPlane.material.specularColor = new BABYLON.Color3(0, 0, 0);
    this.hpPlane.material.emissiveColor = new BABYLON.Color3(1, 0, 0);
    this.hpPlane.material.backFaceCulling = false;
    this.hpPlane.parent = this.renderer;
  }

  animateHurtPoint(hurtPoint) {
    let texture = this.hpPlane.material.opacityTexture;
    let context2D = texture.getContext();
    context2D.clearRect(0, 0, 512, 512);
    let size = 150 + Math.random() * 100;
    let x = Math.random() * 100;
    texture.drawText(hurtPoint.toString(), x, 200, "bold " + size + "px verdana", "white", "transparent");
    let anim = new BABYLON.Animation("anim", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let keys = [
      {frame: 0, value: this.hpPlane.position.y},
      {frame: 60, value: this.hpPlane.position.y + 1}
    ];
    anim.setKeys(keys);
    this.hpPlane.animations.push(anim);

    let animFade = new BABYLON.Animation("anim", "material.alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let fadeKeys = [
      {frame: 0, value: 1},
      {frame: 60, value: 0}
    ];
    animFade.setKeys(fadeKeys);
    this.hpPlane.animations.push(animFade);

    this.scene.beginAnimation(this.hpPlane, 0, 100, false, 1, () => {
      context2D.clearRect(0, 0, 512, 512);
      this.hpPlane.position.y -= 1;
    });

  }

  createPlayerMesh(size, data, rotate) {
    let elements = [];
    let spsVoxel = new BABYLON.SolidParticleSystem('playerMesh', this.scene, {isPickable: true});
    data.voxels.forEach((voxel) => {
      let meshBox = BabylonMeshBox.create({scene: this.scene}, {size: size * 1, position: {x: 0, y: 0, z: 0}});
      spsVoxel.addShape(meshBox, 1);
      elements.push(meshBox);
    });
    spsVoxel.initParticles = function () {
      elements.forEach((element, idx) => {
        let voxel = data.voxels[idx];
        let position = {
          x: -size * data.size.y / 2 + size * voxel.y,
          y: size * voxel.z,
          z: size * data.size.x / 2 - size * voxel.x
        };
        let color = hexToColor3(fullColorHex(data.palette[voxel.colorIndex]));
        this.particles[idx].position = position;
        this.particles[idx].color = color;
        this.particles[idx].originalColor = color;
      });
    };
    let playerMesh = spsVoxel.buildMesh();
    spsVoxel.computeBoundingBox = true;
    elements.forEach((element) => {
      element.dispose();
    });
    spsVoxel.updateParticle = (p) => {
      if (this.isCollision && !this.isAttacking) {
        p.color = HURT_COLOR;
      } else {
        p.color = p.originalColor;
      }
    };
    spsVoxel.initParticles();
    spsVoxel.setParticles();
    this.sps = spsVoxel;
    let pivotAt = new BABYLON.Vector3(0, -1.8, 0);
    let translation = playerMesh.position.subtract(pivotAt);
    playerMesh.setPivotMatrix(BABYLON.Matrix.Translation(translation.x, translation.y, translation.z));
    playerMesh.parent = this.renderer;
    this.playerMesh = playerMesh;
  }

  createFakeShadow() {
    let greenMat = new BABYLON.StandardMaterial("greenMat", scene);
    greenMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    greenMat.alpha = 0.3;
    let fakeShadow = BABYLON.MeshBuilder.CreateGround("fakeShadow", {width: 2, height: 2}, scene);
    fakeShadow.position.y = 0.01;
    fakeShadow.material = greenMat;
    fakeShadow.parent = this.renderer;
    this.shadow = fakeShadow;
  }

  createHealthBar() {
    let greenMat = new BABYLON.StandardMaterial("greenMat", scene);
    greenMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    greenMat.alpha = 0.5;
    let healthMat = new BABYLON.StandardMaterial("redMat", scene);
    healthMat.diffuseColor = new BABYLON.Color3(1, 0, 0);

    this.healthBarBg = BABYLON.MeshBuilder.CreatePlane('healthBar', {width: 5, height: 0.3}, this.scene);
    this.healthBarBg.position.y = 5;
    this.healthBarBg.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    this.healthBarBg.material = greenMat;
    this.healthBarBg.parent = this.renderer;

    this.healthBar = BABYLON.MeshBuilder.CreatePlane('healthBar', {width: 5, height: 0.3}, scene);
    this.healthBar.position.z = -0.01;
    this.healthBar.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    this.healthBar.material = healthMat;
    this.healthBar.parent = this.healthBarBg;
    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.scaling.x = this.healthPercent / 100;
    this.healthBar.position.x = (100 - this.healthPercent) / 100 * -2.5;
  }

  playAnimation(animations, loop, scaleSpeed) {
    let listAnimation = [];
    this.renderer.animations.forEach((animation) => {
      if (animations.indexOf(animation.name) > -1) {
        listAnimation.push(animation);
      }
      this.scene.beginDirectAnimation(this.playerMesh, listAnimation, 0, 100, loop, scaleSpeed);
    });
  }

  createShieldParticle() {
    let matrix = this.playerMesh.getWorldMatrix();
    let position = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, 0), matrix);
    position.y += 1;
    let emitter = position;
    let pSystem = new BABYLON.ParticleSystem("particles", 2000, this.scene);
    pSystem.particleTexture = new BABYLON.Texture("assets/particle/cube.png", this.scene);

    pSystem.emitter = emitter;
    let emitterType = new BABYLON.SphereParticleEmitter();
    emitterType.radius = 2;
    emitterType.radiusRange = 0;
    pSystem.particleEmitterType = emitterType;

    pSystem.minSize = 0.1;
    pSystem.maxSize = 0.5;

    pSystem.isBillboardBased = false;

    pSystem.minLifeTime = 50.0;
    pSystem.maxLifeTime = 50.0;

    pSystem.emitRate = 50;
    pSystem.manualEmitCount = 100;
    pSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    pSystem.gravity = new BABYLON.Vector3(0, 0, 0);

    pSystem.minAngularSpeed = 0;
    pSystem.maxAngularSpeed = Math.PI;

    pSystem.color1 = new BABYLON.Color4(1.0, 0.05, 0.05, .9);
    pSystem.color2 = new BABYLON.Color4(0.85, 0.05, 0, .9);
    pSystem.colorDead = new BABYLON.Color4(.5, .02, 0, .5);

    pSystem.minEmitPower = 0;
    pSystem.maxEmitPower = 0;
    pSystem.updateSpeed = 0.005;
    pSystem.isBillboardBased = false;
    pSystem.start();
    setTimeout(() => {
      pSystem.stop();
      pSystem.dispose();
    }, 2000);
  }

  createFireParticle() {
    let fistMesh = BABYLON.Mesh.CreateBox("fist", 0.4, this.scene);
    let matrix = this.playerMesh.getWorldMatrix();
    let isCollision = false;
    fistMesh.position = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, 0), matrix);
    let pSystem = new BABYLON.ParticleSystem("particles", 2000, this.scene);
    pSystem.emitter = fistMesh;
    pSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    // pSystem.light = new BABYLON.PointLight("Omni1", new BABYLON.Vector3(0, 0, 0), this.scene);
    // pSystem.light.diffuse = new BABYLON.Color3(.8, 0, 0);
    // pSystem.light.range = 15;

    pSystem.particleTexture = new BABYLON.Texture("assets/particle/flare.png", this.scene);
    pSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0);
    pSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
    pSystem.color1 = new BABYLON.Color4(1.0, 0.05, 0.05, .9);
    pSystem.color2 = new BABYLON.Color4(0.85, 0.05, 0, .9);
    pSystem.colorDead = new BABYLON.Color4(.5, .02, 0, .5);
    pSystem.minSize = 0.75;
    pSystem.maxSize = 1.0;
    pSystem.minLifeTime = 0.075;
    pSystem.maxLifeTime = 0.1;
    pSystem.emitRate = 400;
    pSystem.gravity = new BABYLON.Vector3(0, 0, 0);
    pSystem.direction1 = new BABYLON.Vector3(0, .05, 0);
    pSystem.direction2 = new BABYLON.Vector3(0, -.05, 0);
    pSystem.minAngularSpeed = 1.5;
    pSystem.maxAngularSpeed = 2.5;
    pSystem.minEmitPower = 0.4;
    pSystem.maxEmitPower = 0.75;
    pSystem.updateSpeed = 0.008;
    let alpha = fistMesh.position.z;
    this.scene.registerBeforeRender(() => {
      if (!isCollision) {
        if (fistMesh.intersectsMesh(this._opponent.playerMesh, false)) {
          this.createHitParticle(fistMesh.position);
          isCollision = true;
          this._opponent.hurt(15);
          pSystem.stop();
          fistMesh.dispose();
        } else {
          pSystem.emitter.position = new BABYLON.Vector3(0, 1, alpha);
          for (let i2 = 0, max2 = pSystem.particles.length; i2 < max2; i2 += 1) {
            if (pSystem.particles[i2].age >= (pSystem.particles[i2].lifeTime * 0.05)) {
              pSystem.particles[i2].size -= 0.1;
            }
          }
          alpha -= 0.2;
        }
      }
    });
    pSystem.start();
  }

  createHitParticle(emitter) {
    let matrix = this.playerMesh.getWorldMatrix();
    // let emitter = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, 0), matrix);
    if (!emitter)
      emitter = new BABYLON.Vector3(0, 4, 0);
    let pSystem = new BABYLON.ParticleSystem("particles", 2000, this.scene);
    pSystem.emitter = emitter;
    pSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    pSystem.particleTexture = new BABYLON.Texture("assets/particle/cube.png", this.scene);
    pSystem.minSize = 0.2;
    pSystem.maxSize = 0.5;
    pSystem.manualEmitCount = 20;
    pSystem.minEmitPower = 20;
    pSystem.maxEmitPower = 20;
    pSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    pSystem.minAngularSpeed = 0;
    pSystem.maxAngularSpeed = Math.PI;
    pSystem.minLifeTime = 0.05;
    pSystem.maxLifeTime = 0.1;
    pSystem.disposeOnStop = true;
    // pSystem.color1 = new BABYLON.Color4(1.0, 1.0, 1.0, 1);
    // pSystem.color2 = new BABYLON.Color4(0.85, 0.05, 0, 1);
    // pSystem.colorDead = new BABYLON.Color4(.5, .02, 0, 1);
    pSystem.createSphereEmitter(0.2);
    pSystem.start();
    return pSystem;
  }

  mountSkeleton(skeletonData, boneName) {
    let ske = BABYLON.Skeleton.Parse(skeletonData, this.scene);
    let obj = this.playerMesh;
    let matricesWeights = [];
    let floatIndices = [];
    let boneIndice = -1;
    for (let i = 0; i < ske.bones.length; i++) {
      if (ske.bones[i].name === boneName) {
        boneIndice = i;
        break;
      }
    }
    if (boneIndice === -1) {
      console.log("Could not find bone");
      return;
    }
    for (let ii = 0; ii < obj.getTotalVertices(); ii++) {
      matricesWeights[ii * 4 + 0] = 1.0;
      matricesWeights[ii * 4 + 1] = 0.0;
      matricesWeights[ii * 4 + 2] = 0.0;
      matricesWeights[ii * 4 + 3] = 0.0;
      floatIndices[ii * 4 + 0] = boneIndice;
      floatIndices[ii * 4 + 1] = boneIndice;
      floatIndices[ii * 4 + 2] = boneIndice;
      floatIndices[ii * 4 + 3] = boneIndice;
    }
    obj.skeleton = ske;

    obj.setVerticesData(BABYLON.VertexBuffer.MatricesWeightsKind, matricesWeights, false);
    obj.setVerticesData(BABYLON.VertexBuffer.MatricesIndicesKind, floatIndices, false);
    this.skeleton = ske;
  };

  playSkeletonAnimation(animationName, loop, scaleSpeed) {
    let animation = this.skeleton.beginAnimation(animationName, loop, scaleSpeed);
    return animation.waitAsync();
  }

  die() {
    //Implement in view side
  }

  destroyAll() {
    this.playerMesh.dispose();
    this.shadow.dispose();
    this.healthBar.dispose();
    this.healthBarBg.dispose();
  }

}