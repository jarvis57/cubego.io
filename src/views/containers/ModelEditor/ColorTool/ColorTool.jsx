import React from 'react';

import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';

import withRouter from 'react-router-dom/es/withRouter';
import * as ObjUtils from '../../../../utils/objUtils';

require('style-loader!./ColorTool.scss');

class _ColorTool extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.onColorChange = this.onColorChange.bind(this);
  }

  componentDidMount() {
  }

  onColorChange(c) {
    this.props.onChange && this.props.onChange(c);
  }

  render() {
    const { value, options } = this.props;
    const isSelected = (c) => value.material_id === c.material_id && value.sub_material_id === c.sub_material_id;

    return (
      <div className="color-tool">
        <div className="color-tool__list">
          {ObjUtils.GetValues(options).map((c, idx) => (
            <div
              className={
                `color-tool__cell ${isSelected(c) ? 'selected' : ''}`
              }
              key={idx}
              onClick={() => { this.onColorChange(c); }}
            >
              <img
                src={c.img ? c.img : require('../../../../shared/img/cubego-variants/placeholder.png')}
                style={c.color ? { backgroundColor: `${c.color}` } : {}}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (store, props) => {
  const pathName = props.pathname;
  return {
    pathName,
    _t: getTranslate(store.localeReducer),
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

export const ColorTool = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(_ColorTool));
