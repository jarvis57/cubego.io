import React from 'react';

import {connect} from "react-redux";
import {getTranslate} from 'react-localize-redux';

import { ButtonNew } from '../../widgets/Button/Button.jsx';
import withRouter from 'react-router/es/withRouter';
import { Container } from '../../widgets/Container/Container.jsx';
import * as Utils from "../../../utils/utils";

require("style-loader!./SignUp.scss");

class SignUp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: 'something wrong'
    };

    this.handleValidateInput = this.handleValidateInput.bind(this);
  }

  handleValidateInput (value) {

  }

  render() {
    const {_t} = this.props;

    return (  
      <Container className={'signup__container'} size={Container.sizes.SMALL}>
        <div className="welcome-to">
          {_t('welcome_to_cubego')}
          <img className={'cube_red'} src={require('../../../shared/img/assets/cube_red.png')}/>
          <img className={'cube_yellow'} src={require('../../../shared/img/assets/cube_yellow.png')}/>
          <img className={'cube_blue'} src={require('../../../shared/img/assets/cube_blue.png')}/>
          <img className={'plus_image'} src={require('../../../shared/img/assets/plus_image.png')}/>
          <img className={'cubegon_image'} src={require('../../../shared/img/assets/cubegon_image.png')}/>
        </div>
        <div className="signup-form__container">
          <div className="signup__label">
            {_t('signup_label')}
          </div>
          <form>
            <label>{_t('wallet')}</label>
            <input type="text" value={this.wallet} onChange={this.handleValidateInput}/>
            <label>{_t('user_email')}</label>
            <input type="text" value={this.email} onChange={this.handleValidateInput}/>
            <label>{_t('display_name')}</label>
            <input type="text" value={this.display_name} onChange={this.handleValidateInput}/>
            <label>{_t('invite_code')}</label>
            <input type="text" value={this.invite_code} onChange={this.handleValidateInput}/><br />
            <div className={'invite-code__description'}>{_t('desc.invite_code')}</div>
            <input type="checkbox" checked={this.agreeTermService} onChange={this.handleValidateInput}/>
            <span className={'term-policy__label'}>{_t('term_service_policy')}</span><br />
            <div className={`error__label ${this.state.error !== '' ? 'visibility' : 'hidden'}`}>
              {_t(this.state.error)}
            </div>
            <ButtonNew className={'register__button'} showDeco={ButtonNew.deco.RIGHT} label={_t('register')} onClick={() => {}}/>
          </form>
        </div>
      </Container>
    )
  }
}

const mapStateToProps = (store, props) => {
  return {
    _t: getTranslate(store.localeReducer),
  }
};

const mapDispatchToProps = (dispatch) => ({
  dispatch: dispatch,
});

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(SignUp));