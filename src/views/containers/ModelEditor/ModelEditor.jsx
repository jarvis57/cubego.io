import React from 'react';

import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';

import withRouter from 'react-router-dom/es/withRouter';
import { Model3D } from '../../../games/react_views/Model3D/Model3D.jsx';
import { Layer2D } from '../../../games/react_views/Layer2D/Layer2D.jsx';

import { ColorTool } from './ColorTool/ColorTool.jsx';
import { Container } from '../../widgets/Container/Container.jsx';
import { PageWrapper } from '../../widgets/PageWrapper/PageWrapper.jsx';
import { ToggleTool } from './ToggleTool/ToggleTool.jsx';
import { ToolManager, Tools, ToolTypes } from '../../../services/toolManager';
import * as Utils from '../../../utils/utils';
import Navbar from '../../components/bars/Navbar/Navbar.jsx';
import { PickerBar } from '../../widgets/PickerBar/PickerBar.jsx';
import { HeaderBar } from '../../components/bars/HeaderBar/HeaderBar.jsx';
import { MODEL_TEMPLATES } from '../../../constants/model';
import * as ObjUtils from '../../../utils/objUtils';
import {
  CUBE_MATERIALS,
  CUBE_MATERIALS_MAP,
} from '../../../constants/cubego';
import Footer from '../../components/bars/Footer/Footer.jsx';
import { ButtonNew } from '../../widgets/Button/Button.jsx';
import {
  GetCubegonInfo,
  GetSavedModel,
} from '../../../reducers/selectors';
import { ModelActions } from '../../../actions/model';
import Popup from '../../widgets/Popup/Popup.jsx';
import { GON_TIER } from '../../../constants/cubegon';
import { IsEqual } from '../../../utils/objUtils';
import * as LogicUtils from '../../../utils/logicUtils';

import { Image } from '../../components/Image/Image.jsx';
import { ImportFromFile } from '../../widgets/FileInput/FileInput.jsx';

require('style-loader!./ModelEditor.scss');

class _ModelEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showTemplates: false,
      scale2D: 1,
      saved: false,
    };

    this.tools = {
      move: Tools.move({
        value: true,
        hotKey: 'W',
        onClick: () => {
          const currentVal = this.toolManager.getToolValue(this.tools.move.key);
          this.onToolChange(this.tools.move.key, !currentVal);
        },
      }),
      draw: Tools.draw({
        value: false,
        hotKey: 'A',
        onClick: () => {
          const currentVal = this.toolManager.getToolValue(this.tools.draw.key);
          this.onToolChange(this.tools.draw.key, !currentVal);
        },
      }),
      paint: Tools.paint({
        value: false,
        hotKey: 'S',
        onClick: () => {
          const currentVal = this.toolManager.getToolValue(this.tools.paint.key);
          this.onToolChange(this.tools.paint.key, !currentVal);
        },
      }),
      erase: Tools.erase({
        value: false,
        hotKey: 'D',
        onClick: () => {
          const currentVal = this.toolManager.getToolValue(this.tools.erase.key);
          this.onToolChange(this.tools.erase.key, !currentVal);
        },
      }),
      pickColor: Tools.pickColor({
        value: false,
        hotKey: 'F',
        onClick: () => {
          const currentVal = this.toolManager.getToolValue(
            this.tools.pickColor.key,
          );
          this.onToolChange(this.tools.pickColor.key, !currentVal);
        },
      }),
      copyLayer: Tools.copyLayer({
        hotKey: 'V',
        onClick: () => {
          this.onToolChange(this.tools.copyLayer.key, true);
        },
      }),
      pasteLayer: Tools.pasteLayer({
        hotKey: 'B',
        onClick: () => {
          this.onToolChange(this.tools.pasteLayer.key, true);
        },
      }),
      clear: Tools.clear({
        hotKey: 'H',
        onClick: () => {
          this.onToolChange(this.tools.clear.key, true);
        },
      }),
      clearLayer: Tools.clearLayer({
        hotKey: 'G',
        onClick: () => {
          this.onToolChange(this.tools.clearLayer.key, true);
        },
      }),
      undo: Tools.undo({
        hotKey: 'Q',
        onClick: () => {
          this.onToolChange(this.tools.undo.key, true);
        },
      }),
      redo: Tools.redo({
        hotKey: 'E',
        onClick: () => {
          this.onToolChange(this.tools.redo.key, true);
        },
      }),
      nextLayer: {
        hotKey: 'C',
        onClick: () => {
          this.pickerBar && this.pickerBar.wrappedInstance.nextLayer();
        },
      },
      prevLayer: {
        hotKey: 'Z',
        onClick: () => {
          this.pickerBar && this.pickerBar.wrappedInstance.prevLayer();
        },
      },
      color: Tools.color({
        value:
          CUBE_MATERIALS[CUBE_MATERIALS_MAP.plastic].sub_materials[
            CUBE_MATERIALS_MAP.plastic * 100 + 1
          ],
      }),
      view2D: Tools.view2D({
        hotKey: 'X',
        onClick: (val) => {
          this.onToolChange(this.tools.view2D.key, val);
        },
      }),
      layerIndex: Tools.layerIndex({ value: 1 }),
    };

    // NOTE: Tool Manager does not touch UI Component. It is only managing the tools & model history.
    this.toolManager = new ToolManager({
      tools: ObjUtils.CloneDeep(this.tools),
      models: [],
    });

    this.onToolChange = this.onToolChange.bind(this);
    this.onCellClicked = this.onCellClicked.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onTemplateSelect = this.onTemplateSelect.bind(this);
    this.onZoomIn = this.onZoomIn.bind(this);
    this.onZoomOut = this.onZoomOut.bind(this);
    this.onZoomReset = this.onZoomReset.bind(this);

    this.saveModel = this.saveModel.bind(this);
    this.onSavedModelSelect = this.onSavedModelSelect.bind(this);

    this.capturePhoto = this.capturePhoto.bind(this);
    this.exportModel = this.exportModel.bind(this);

    this.isHoldingKey = {};
    this.selectedVariants = {};
    this.selectedModelIndex = -1;
  }

  componentDidMount() {
    if (this.props.gonInfo && this.props.gonInfo.structure) {
      this.toolManager.addModel({
        model: LogicUtils.GetModelFromStructure(this.props.gonInfo.structure),
      });
      this.selectedModelIndex = -1;
      this.forceUpdate();
    } else if (this.props.savedModel && this.props.savedModel.length) {
      const selectedIdx = this.props.savedModel.length - 1;
      this.toolManager.addModel({
        model: this.props.savedModel[selectedIdx].model,
      });
      this.selectedModelIndex = selectedIdx;
      this.forceUpdate();
    } else {
      this.onTemplateSelect(MODEL_TEMPLATES[1]);
    }

    if (this.props.userCubes) this.toolManager.updateUserCubes(this.props.userCubes);

    window.addEventListener('keydown', this.onKeyDown, false);
    window.addEventListener('keyup', this.onKeyUp, false);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  componentWillReceiveProps(nextProps) {
    if (
      !IsEqual(nextProps.gonInfo, this.props.gonInfo)
      && nextProps.gonInfo
      && nextProps.gonInfo.structure
    ) {
      this.toolManager.addModel({
        model: LogicUtils.GetModelFromStructure(nextProps.gonInfo.structure),
      });
      this.selectedModelIndex = -1;
      this.forceUpdate();
    }

    if (!IsEqual(nextProps.userCubes, this.props.userCubes)) {
      this.toolManager.updateUserCubes(nextProps.userCubes);
    }

    if (
      nextProps.savedModel.length > this.props.savedModel.length
      && nextProps.savedModel.length > 0
    ) {
      // this.onSavedModelSelect(nextProps.savedModel[nextProps.savedModel.length - 1], nextProps.savedModel.length - 1)
      this.selectedModelIndex = nextProps.savedModel.length - 1;
    }
  }

  onKeyDown(key) {
    if (this.state.showRegisterPopup) return;
    if (this.isHoldingKey[key.keyCode]) return;
    this.isHoldingKey[key.keyCode] = true;
    ObjUtils.GetValues(this.tools).forEach((tool) => {
      if (
        tool.hotKey
        && tool.onClick
        && key.key === tool.hotKey.toLowerCase()
        && tool.type === ToolTypes.mode
      ) {
        this.toolManager.onModeChangeTempStart({ key: tool.key });
        this.forceUpdate();
      }
    });
  }

  onKeyUp(key) {
    if (this.state.showRegisterPopup) return;
    this.isHoldingKey[key.keyCode] = false;
    ObjUtils.GetValues(this.tools).forEach((tool) => {
      if (
        tool.hotKey
        && tool.onClick
        && key.key === tool.hotKey.toLowerCase()
        && tool.type === ToolTypes.mode
      ) {
        this.toolManager.onModeChangeTempStop({ key: tool.key });
        this.forceUpdate();
      } else if (
        tool.hotKey
        && tool.onClick
        && key.key === tool.hotKey.toLowerCase()
        && tool.type !== ToolTypes.mode
      ) {
        tool.onClick();
      }
    });
  }

  onToolChange(key, value) {
    this.toolManager.onToolClicked({ key, value });
    this.forceUpdate();
  }

  onCellClicked(cell) {
    if (Array.isArray(cell)) this.toolManager.onCellClicked(cell);
    else this.toolManager.onCellClicked([cell]);

    this.forceUpdate();
  }

  onTemplateSelect(template) {
    if (template.model_str) {
      this.toolManager.addModel({
        model: LogicUtils.GetFullModel(template.model_str).model,
      });
      this.forceUpdate();
    }
    this.selectedModelIndex = -1;
    this.setState({ showTemplates: false });
  }

  onSavedModelSelect(model, idx) {
    if (model) {
      this.toolManager.addModel({ model: model.model });
    }
    this.selectedModelIndex = idx;
    this.setState({ showTemplates: false });
  }

  onZoomIn() {
    this.setState({ scale2D: this.state.scale2D + 0.1 });
  }

  onZoomOut() {
    this.setState({ scale2D: Math.max(0.1, this.state.scale2D - 0.1) });
  }

  onZoomReset() {
    this.setState({ scale2D: 1 });
  }

  saveModel() {
    if (this.modelCanvas) {
      this.modelCanvas
        .getBase64Image({ width: 128, height: 128 })
        .then((data) => {
          this.setState({ saved: true });
          this.props.dispatch(
            ModelActions.SAVE_MODEL.init.func({
              model: { ...this.toolManager.model, image: data },
              modelIndex: this.selectedModelIndex,
            }),
          );
        });
    }
  }

  exportModel() {
    if (this.modelCanvas) {
      this.modelCanvas
        .getBase64Image({ width: 128, height: 128 })
        .then((data) => {
          this.setState({ saved: true });
          this.props.dispatch(
            ModelActions.SAVE_MODEL.init.func({
              model: { ...this.toolManager.model, image: data },
              modelIndex: this.selectedModelIndex,
            }),
          );
        });
    }
  }

  capturePhoto() {
    if (this.modelCanvas) {
      this.modelCanvas
        .getBase64Image({ width: 512, height: 512 })
        .then((data) => {
          this.imageBase64 = data;
          this.modelString = JSON.stringify(
            LogicUtils.GetSimplifiedModel({
              ...this.toolManager.model,
              image: data,
            }),
          );
          this.setState({ showModelCapturing: true });
        });
    }
  }

  render() {
    const { _t, savedModel, userInfo } = this.props;

    const { saved } = this.state;
    const selectedColor = this.toolManager.getToolValue(this.tools.color.key);

    const selectedMaterial = CUBE_MATERIALS[selectedColor.material_id];

    const btns = [
      <ButtonNew
        label={saved ? _t('saved') : _t('save')}
        color={ButtonNew.colors.TURQUOISE}
        key={0}
        onClick={this.saveModel}
        onMouseOut={() => {
          this.setState({ saved: false });
        }}
      />,
    ];

    return (
      <PageWrapper type={PageWrapper.types.BLUE_NEW}>
        <Navbar
          size={Container.sizes.BIG}
          minifying
          label={_t('build_cubegon')}
        />

        <div className="model-editor__container">
          {this.state.showModelCapturing ? (
            <Popup
              onUnmount={() => {
                this.setState({ showModelCapturing: false });
              }}
              open={this.state.showModelCapturing}
            >
              <div className="model-editor__model-capture">
                <div className="image">
                  <img src={this.imageBase64} />
                </div>
                <div className="actions">
                  <a
                    href={this.imageBase64}
                    className="action"
                    download="cubego.png"
                  >
                    <ButtonNew
                      color={ButtonNew.colors.BLUE}
                      label={_t('save image')}
                    />
                  </a>
                  <a
                    href={`data:text/plain;charset=utf-8,${this.modelString}`}
                    className="action"
                    download="cubego.txt"
                  >
                    <ButtonNew label={_t('export model')} />
                  </a>
                </div>
              </div>
            </Popup>
          ) : null}

          <HeaderBar
            size={Container.sizes.BIG}
            label={_t('build_cubegon')}
            userInfo={userInfo}
            onBackClicked={() => {
              this.props.history.goBack();
            }}
          />
          <Container size={Container.sizes.BIG} className="main-tool">
            <div className="model-editor__tool-bar">
              <div className="bar">
                <div className="group">
                  <div className="item">
                    <ToggleTool
                      label={_t('template')}
                      img={require('../../../shared/img/icons/icon-template.png')}
                      active={this.state.showTemplates}
                      onClick={() => {
                        this.setState({
                          showTemplates: !this.state.showTemplates,
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="group">
                  <div
                    className="item"
                    tooltip={_t('quick_use_guide', {
                      key: this.tools.move.hotKey,
                    })}
                    tooltip-position="bottom"
                  >
                    <ToggleTool
                      label={_t('move')}
                      img={require('../../../shared/img/icons/icon-move.png')}
                      active={this.toolManager.getToolValue(
                        this.tools.move.key,
                      )}
                      onClick={this.tools.move.onClick}
                      hotKey={this.tools.move.hotKey}
                    />
                  </div>
                  <div
                    className="item"
                    tooltip={_t('quick_use_guide', {
                      key: this.tools.draw.hotKey,
                    })}
                    tooltip-position="bottom"
                  >
                    <ToggleTool
                      label={_t('add')}
                      img={require('../../../shared/img/icons/icon-draw.png')}
                      active={this.toolManager.getToolValue(
                        this.tools.draw.key,
                      )}
                      onClick={this.tools.draw.onClick}
                      hotKey={this.tools.draw.hotKey}
                    />
                  </div>
                  <div
                    className="item"
                    tooltip={_t('quick_use_guide', {
                      key: this.tools.paint.hotKey,
                    })}
                    tooltip-position="bottom"
                  >
                    <ToggleTool
                      label={_t('paint')}
                      img={require('../../../shared/img/icons/icon-paint.png')}
                      active={this.toolManager.getToolValue(
                        this.tools.paint.key,
                      )}
                      onClick={this.tools.paint.onClick}
                      hotKey={this.tools.paint.hotKey}
                    />
                  </div>
                  <div
                    className="item"
                    tooltip={_t('quick_use_guide', {
                      key: this.tools.erase.hotKey,
                    })}
                    tooltip-position="bottom"
                  >
                    <ToggleTool
                      label={_t('erase')}
                      img={require('../../../shared/img/icons/icon-erase.png')}
                      active={this.toolManager.getToolValue(
                        this.tools.erase.key,
                      )}
                      onClick={this.tools.erase.onClick}
                      hotKey={this.tools.erase.hotKey}
                    />
                  </div>
                  <div
                    className="item"
                    tooltip={_t('quick_use_guide', {
                      key: this.tools.pickColor.hotKey,
                    })}
                    tooltip-position="bottom"
                  >
                    <ToggleTool
                      label={_t('pick_color')}
                      img={require('../../../shared/img/icons/icon-picker.png')}
                      active={this.toolManager.getToolValue(
                        this.tools.pickColor.key,
                      )}
                      onClick={this.tools.pickColor.onClick}
                      hotKey={this.tools.pickColor.hotKey}
                    />
                  </div>
                </div>
                <div className="group">
                  <div className="item">
                    <ToggleTool
                      label={_t('undo')}
                      img={require('../../../shared/img/icons/icon-undo.png')}
                      disabled={
                        !this.toolManager.isToolAvailable(this.tools.undo.key)
                      }
                      onClick={this.tools.undo.onClick}
                      hotKey={this.tools.undo.hotKey}
                    />
                  </div>
                  <div className="item">
                    <ToggleTool
                      label={_t('redo')}
                      img={require('../../../shared/img/icons/icon-redo.png')}
                      disabled={
                        !this.toolManager.isToolAvailable(this.tools.redo.key)
                      }
                      onClick={this.tools.redo.onClick}
                      hotKey={this.tools.redo.hotKey}
                    />
                  </div>
                </div>

                <div className="group">
                  <div className="item">
                    <ToggleTool
                      label={_t('copy_layer')}
                      img={require('../../../shared/img/icons/icon-copy.png')}
                      disabled={
                        !this.toolManager.isToolAvailable(
                          this.tools.copyLayer.key,
                        )
                      }
                      onClick={this.tools.copyLayer.onClick}
                      hotKey={this.tools.copyLayer.hotKey}
                    />
                  </div>
                  <div className="item">
                    <ToggleTool
                      label={_t('paste_layer')}
                      img={require('../../../shared/img/icons/icon-paste.png')}
                      disabled={
                        !this.toolManager.isToolAvailable(
                          this.tools.pasteLayer.key,
                        )
                      }
                      onClick={this.tools.pasteLayer.onClick}
                      hotKey={this.tools.pasteLayer.hotKey}
                    />
                  </div>
                  <div className="item">
                    <ToggleTool
                      label={_t('clear_all')}
                      img={require('../../../shared/img/icons/icon-clear-all.png')}
                      disabled={
                        !this.toolManager.isToolAvailable(this.tools.clear.key)
                      }
                      onClick={this.tools.clear.onClick}
                      hotKey={this.tools.clear.hotKey}
                    />
                  </div>
                  <div className="item">
                    <ToggleTool
                      label={_t('clear_layer')}
                      img={require('../../../shared/img/icons/icon-clear.png')}
                      disabled={
                        !this.toolManager.isToolAvailable(
                          this.tools.clearLayer.key,
                        )
                      }
                      onClick={this.tools.clearLayer.onClick}
                      hotKey={this.tools.clearLayer.hotKey}
                    />
                  </div>
                </div>

                <div className="group">
                  <ToggleTool
                    label={_t(
                      this.toolManager.getToolValue(this.tools.view2D.key).label,
                    )}
                    img={require(`../../../shared/img/icons/icon-view-${
                      this.toolManager.getToolValue(this.tools.view2D.key)
                        .viewKey
                    }.png`)}
                    onClick={() => {
                      this.tools.view2D.onClick();
                    }}
                    hotKey={this.tools.view2D.hotKey}
                  />
                </div>
              </div>

              {this.state.showTemplates ? (
                <div className="model-editor__templates">
                  {MODEL_TEMPLATES.map((template, idx) => (
                    <div
                      key={idx}
                      className="template"
                      onClick={() => {
                        this.onTemplateSelect(template);
                      }}
                    >
                      <img className="img" src={template.img} />
                      <div className="name">{_t(template.name)}</div>
                    </div>
                  ))}
                  {savedModel.map((item, idx) => (
                    <div
                      className="template"
                      key={idx}
                      onClick={() => {
                        this.onSavedModelSelect(item, idx);
                      }}
                    >
                      <img
                        className="img"
                        src={
                            item.image
                              ? item.image
                              : require('../../../shared/sample_models/0.png')
                          }
                      />
                      <div className="name">{_t(`saved model ${idx}`)}</div>
                      <i
                        className="far fa-times-circle"
                        onClick={(e) => {
                          e.stopPropagation();
                          this.props.dispatch(
                            ModelActions.DELETE_MODEL.init.func({
                              modelIndex: idx,
                            }),
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="model-editor__tier-bar">
              <div
                className="bar"
                style={{
                  width: '0%',
                }}
              />
              {[
                GON_TIER.challenger,
                GON_TIER.elite,
                GON_TIER.champion,
                GON_TIER.god,
              ].map((tier, idx) => (
                <div
                  key={idx}
                  className={`tier active ${tier.name}`}
                  style={{ left: `${33 * idx}%` }}
                  tooltip={_t(`${tier.name}`.toLowerCase())}
                  tooltip-position="bottom"
                >
                  <img className="with-effect" src={tier.img} />
                  <img className="no-effect" src={tier.img_ne} />
                </div>
              ))}
            </div>

            <div className="model-editor__canvas">
              <div className="model-editor__left">
                <div className="model-editor__3d">
                  <div
                    className="model-editor__3d-capture"
                    tooltip={_t('take a picture')}
                    tooltip-position="bottom"
                    onClick={this.capturePhoto}
                  >
                    <Image img="icon_camera" />
                  </div>
                  <div
                    className="model-editor__3d-file-loader"
                    tooltip={_t('load model from file')}
                    tooltip-position="bottom"
                  >
                    <ImportFromFile
                      text={_t('template from file')}
                      handleData={(dataFile) => {
                        try {
                          const modelFromFile = LogicUtils.GetFullModel(JSON.parse(dataFile));
                          if (modelFromFile) {
                            this.toolManager.addModel({
                              model: modelFromFile.model,
                            });
                            this.selectedModelIndex = -1;
                            this.forceUpdate();
                          } else {
                            alert(_t('template file is invalid'));
                          }
                        } catch (err) {
                          alert(err);
                        }
                      }}
                    />
                  </div>

                  <Model3D
                    model={this.toolManager.model}
                    tools={ObjUtils.CloneDeep(this.toolManager.tools)}
                    onCellClicked={this.onCellClicked}
                    ref={(canvas) => {
                      window.modelCanvas = canvas;
                      this.modelCanvas = canvas;
                    }}
                    _t={_t}
                  />
                </div>
              </div>

              <div className="model-editor__right">
                <div
                  className="model-editor__2d"
                  onWheel={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Layer2D
                    layer={this.toolManager.layer}
                    style={{
                      transform: `scale(${this.state.scale2D})`,
                      transformOrigin: 'top left',
                    }}
                    tools={ObjUtils.CloneDeep(this.toolManager.tools)}
                    onCellClicked={this.onCellClicked}
                  />
                </div>
                <div className="model-editor__2d-zoom">
                  <div className="item" onClick={this.onZoomIn}>
                    <img
                      src={require('../../../shared/img/icons/icon-zoom-in.png')}
                    />
                  </div>
                  <div className="item" onClick={this.onZoomOut}>
                    <img
                      src={require('../../../shared/img/icons/icon-zoom-out.png')}
                    />
                  </div>
                  <div className="item" onClick={this.onZoomReset}>
                    <img
                      src={require('../../../shared/img/icons/icon-zoom-reset.png')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="model-editor__material">
              {ObjUtils.GetValues(CUBE_MATERIALS).map((material, idx) => {
                const numCubes = 0;
                const numCubesUsed = (this.toolManager.stats.materials || {})[
                  material.material_id
                ] || 0;

                return (
                  <div
                    key={idx}
                    className={`cube ${
                      selectedMaterial.name === material.name ? 'active' : ''
                    } ${numCubesUsed > numCubes ? 'overused' : ''} ${
                      material.is_for_sale ? 'for-sale' : ''
                    }`}
                    tooltip={_t(material.name)}
                    tooltip-position="bottom"
                    onClick={() => {
                      this.onToolChange(
                        this.tools.color.key,
                        material.sub_materials[
                          this.selectedVariants[material.material_id]
                            || material.material_id * 100 + 1
                        ],
                      );
                    }}
                  >
                    <img src={material.icon} />
                  </div>
                );
              })}
            </div>

            <div className="model-editor__tool">
              <div className="model-editor__colors">
                <ColorTool
                  toolKey={this.tools.color.key}
                  value={selectedColor}
                  options={selectedMaterial.sub_materials}
                  onChange={(val) => {
                    this.onToolChange(this.tools.color.key, val);
                    this.selectedVariants[val.material_id] = val.sub_material_id;
                  }}
                />
              </div>

              <div className="model-editor__layer">
                <PickerBar
                  ref={(bar) => {
                    this.pickerBar = bar;
                  }}
                  valMin={this.toolManager.layer.fromZ}
                  valMax={this.toolManager.layer.toZ}
                  valStep={
                    this.toolManager.layer.fromZ < this.toolManager.layer.toZ
                      ? 1
                      : -1
                  }
                  value={this.toolManager.getToolValue(
                    this.tools.layerIndex.key,
                  )}
                  onChange={(val) => {
                    this.onToolChange(this.tools.layerIndex.key, val);
                  }}
                  label={_t('select_layer')}
                />

                {selectedMaterial
                && Object.keys(selectedMaterial.sub_materials).length >= 16 ? (
                  <div className="model-editor__layer-btns">{btns}</div>
                  ) : null}
              </div>
            </div>

            {selectedMaterial
            && Object.keys(selectedMaterial.sub_materials).length < 16 ? (
              <div className="model-editor__btns">{btns}</div>
              ) : null}
          </Container>
        </div>

        <Footer size={Container.sizes.BIG} type={Footer.types.DARK} />
      </PageWrapper>
    );
  }
}

const mapStateToProps = (store, props) => {
  const pathName = props.pathname;
  const gonId = Utils.ParseQueryString(props.location.search).gon_id;
  return {
    pathName,
    _t: getTranslate(store.localeReducer),
    savedModel: GetSavedModel(store),
    gonId,
    gonInfo: GetCubegonInfo(store, gonId),
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

export const ModelEditor = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(_ModelEditor),
);
