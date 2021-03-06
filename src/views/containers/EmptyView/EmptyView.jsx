import React from 'react';

import { ButtonNew } from '../../widgets/Button/Button.jsx';
import { URLS } from '../../../constants/general.js';

require('style-loader!./EmptyView.scss');

export const GeneralEmptyView = ({ content, action }) => (
  <div className="general-empty-view">
    <div className="label">
      {content}
    </div>
    <ButtonNew label={action.label} onClick={action.onClick} />
  </div>
);

export const EmptyCubegoList = ({ _t, history }) => (
  <GeneralEmptyView
    content={_t('you_dont_have_cubego')}
    action={{ label: _t('purchase now'), onClick: () => { history.push(`/${URLS.STORE}`); } }}
  />
);

export const EmptyCubegonList = ({ _t, history }) => (
  <GeneralEmptyView
    content={_t('you_dont_have_cubegon')}
    action={{ label: _t('build now'), onClick: () => { history.push(`/${URLS.BUILD_GON}`); } }}
  />
);
