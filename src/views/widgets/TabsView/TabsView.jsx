import React from "react"
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {getTranslate} from "react-localize-redux";

require("style-loader!./TabsView.scss");


class TabsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };

  }

  render() {
    let {tabs, centered, handleOnTabSelect, selectedTab} = this.props;
    
    return (
      <div className={`tabs-view ${centered ? 'centered' : ''}`}>
        <div className={'group'}>
          {tabs.map((tab, idx) => (
            <div key={idx}
                 className={`${selectedTab === tab.key ? "active" : ""} item`}
                 onClick={() => {handleOnTabSelect && handleOnTabSelect(tab.key)}}>
                 <span>{tab.content}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

}


TabsView.defaultProps = {

};

TabsView.propTypes = {

};

const mapStateToProps = (store) => ({
  _t: getTranslate(store.localeReducer),
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  {withRef: true},
)(TabsView);