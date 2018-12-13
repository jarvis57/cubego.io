import React from 'react';
import {Route, Switch, withRouter} from 'react-router-dom'
import {connect} from 'react-redux'

import {getTranslate} from 'react-localize-redux'

import Home from '../HomePage/Home.jsx'

import * as Tracker from '../../../services/tracker'
import * as LS from '../../../services/localStorageService';

// import TxnBar from '../../components/bars/TxnBar/TxnBar.jsx'
import Footer from '../../components/bars/Footer/Footer.jsx'
import {URLS} from "../../../constants/general";
import {ModelEditor} from "../ModelEditor/ModelEditor.jsx";
import ComingSoon from '../../components/ComingSoon/ComingSoon.jsx';
import {GetLocalizationData, GetLoggedInUserId} from '../../../reducers/selectors';
import Loading from '../../components/Loading/Loading.jsx';
import ReviewPage from '../ReviewPage/ReviewPage.jsx';
import ModelDetail from '../ModelDetail/ModelDetail.jsx';
import {GetValues} from "../../../utils/objUtils";
import Inventory from '../Inventory/Inventory.jsx';
import {AuthActions} from "../../../actions/auth";
import SignUp from '../SignIn/SigInForm/SignInForm.jsx';
import SignInPage from "../SignIn/SignInPage/SignInPage.jsx";
import {BattlePage} from "../BattlePage/BattlePage.jsx";
import StorePage from "../StorePage/StorePage.jsx";
import * as Utils from "../../../utils/utils";
import TosPage from "../TosPage/TosPage.jsx";
import PrivacyPage from "../PrivacyPage/PrivacyPage.jsx";

import GameIntro from "../GameIntro/GameIntro.jsx";
import {NotificationActions} from "../../../actions/notification";
import TxnBar from '../../components/bars/TxnBar/TxnBar.jsx';
import RankingPage from '../RankingPage/RankingPage.jsx';
import { UserApi } from '../../../services/api/userApi.js';
import { TIME_TO_REFRESH } from '../../../config';
import LandingPage from '../LandingPage/LandingPage.jsx';
import Gallery from '../Gallery/Gallery.jsx';
import ClaimRewardPage from '../ClaimRewardPage/ClaimRewardPage.jsx';


require("style-loader!./App.scss");

class App extends React.Component {

  constructor(props) {
    super(props);
    this.maintenance = false;

    // Set window onload
    window.onLoadFunctions = {};
    window.onload = () => {
      GetValues(window.onLoadFunctions).forEach(func => {
        func && func()
      })
    }

    this.handleSyncData = this.handleSyncData.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(NotificationActions.LOAD_NOTIFICATION.init.func({forceUpdate: false}));

    let f = (l) => {
      Tracker.AutoTrack(l.pathname);
      this.lastPathname = l.pathname;
    };
    f(location);

    this.props.history.listen((location) => {
      if (location.pathname !== this.lastPathname) f(location);
      if (location.hash) {
        const id = location.hash.replace('#', '');
        let element =  document.getElementById(id);
        if (element) element.scrollIntoView({ block: 'start',  behavior: 'smooth' });
          else window.setTimeout(() => {
            let e =  document.getElementById(id);
            if (e) e.scrollIntoView({ block: 'start',  behavior: 'smooth' });
          }, 200)
      }
    });

    // Check for Ether Account from window.core
    let acc = undefined;

    setInterval(function() {

      if (window.account === undefined) return;

      if (window.account !== acc) {
        if (acc === undefined)
          this.props.dispatch(AuthActions.LOGIN.init.func({userId: window.account || LS.GetItem(LS.Fields.account)}));
        else
          this.props.dispatch(AuthActions.LOGIN.init.func({userId: window.account}));

        acc = window.account;
      }
    }.bind(this), 1000);

    // Scroll to hash-link on page load
    window.onLoadFunctions['general-hash'] = () => {
      let { hash } = window.location;
      if (hash !== '') {
        const id = hash.replace('#', '');
        let element =  document.getElementById(id);
        if (element) element.scrollIntoView();
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.userId !== nextProps.userId && nextProps.userId) {
      this.handleSyncData(nextProps.userId);
    }
  }

  handleSyncData(userId) {
    clearInterval(this.timeToRefresh);

    let syncFunc = () => {
      UserApi.SyncUserData(userId).then((res, rej) => {});
      LS.SetItem(`${LS.Fields.timeToRefresh}-${userId}`, Date.now())
    };

    //force sync data every TIME_TO_REFRESH milliseconds
    let lastSyncTime = LS.GetItem(`${LS.Fields.timeToRefresh}-${userId}`);
    if (!lastSyncTime || Date.now() - lastSyncTime > TIME_TO_REFRESH) {
      syncFunc();
    }
    this.timeToRefresh = setInterval(() => {
      syncFunc();
    }, TIME_TO_REFRESH);
  };

  componentWillUnmount() {
    window.onLoadFunctions['general-hash'] = undefined;
    clearInterval(this.timeToRefresh)
  }

  render () {
    const {alreadyFetchedLocalization} = this.props;

    if (this.maintenance) {
      return (
        <div className={'page-container-wrapper'}>
          <div style={{paddingTop: "80px"}}>
            <ul className="ui list">
              We are under maintenance. Please come back later ....
            </ul>
          </div>
          <Footer/>
        </div>
      );
    }

    if (!alreadyFetchedLocalization) {
      return (
        <div className={'app-page-loading'}>
          <Loading className={'main__page-loader'} type={Loading.types.DOG}/>
        </div>
      );
    }

    return (
      <div className={'page-container-wrapper'}>
        {
          Utils.IsMobile ? 
          <React.Fragment> 
            <img className={'convertion-tagging'} src="https://servedbyadbutler.com/convtrack.spark?MID=169476&zoneID=302433" />
            <img className={'convertion-tagging'} src={'https://servedbyadbutler.com/convtrack.spark?MID=169476&zoneID=323788'} />
          </React.Fragment>
           : 
            <React.Fragment> 
              <img className={'convertion-tagging'} src={'https://servedbyadbutler.com/convtrack.spark?MID=169476&zoneID=282885 '}/>
              <img className={'convertion-tagging'} src="https://servedbyadbutler.com/convtrack.spark?MID=169476&zoneID=282891" /> 
              <img className={'convertion-tagging'} src="https://servedbyadbutler.com/convtrack.spark?MID=169476&zoneID=302430" />
            </React.Fragment>
        }

        <Switch history={history}>
          <Route path={`/${URLS.BUILD_GON}`} component={ModelEditor}/>
          <Route path={`/${URLS.REVIEW_GON}`} component={ReviewPage}/>

          <Route path={`/${URLS.CUBEGONS}/:id`} component={ModelDetail}/>
          <Route path={`/${URLS.INVENTORY}`} component={Inventory}/>
          <Route path={`/${URLS.GALLERY}`} component={Gallery} />

          <Route path={`/${URLS.BATTLE}/:gon1Id?/:gon2Id?`} component={BattlePage}/>
          <Route path={`/${URLS.STORE}`} component={StorePage}/>
          <Route path={`/${URLS.MARKET}`} component={ComingSoon}/>
          <Route path={`/${URLS.RANKING}`} component={RankingPage}/>
          <Route path={`/${URLS.CLAIM_AIR_DROP}`} component={ClaimRewardPage} />

          <Route path={`/${URLS.ABOUT_US}`} component={SignUp}/>
          <Route path={`/${URLS.GUIDE}`} component={GameIntro}/>
          <Route path={`/${URLS.LANDING_PAGE}`} component={LandingPage}/>

          <Route path={`/${URLS.SIGN_IN}`} component={SignInPage}/>

          <Route path={`/${URLS.TERM_OF_SALE}`} component={TosPage}/>
          <Route path={`/${URLS.PRIVACY}`} component={PrivacyPage}/>

          <Route component={Home}/>
        </Switch>

        <TxnBar/>
      </div>
    )
  }
}

const mapStateToProps = (store) => ({
  _t: getTranslate(store.localeReducer),
  userId: GetLoggedInUserId(store),
  alreadyFetchedLocalization: GetLocalizationData(store),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch: dispatch,
});

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(App));
