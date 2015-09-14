import 'babel-core/polyfill';

import React from 'react';
import { Provider } from 'react-redux';
import Root from './containers/Root';
import { store } from './store';

React.render(
  <Provider store={store}>
    {() => <Root />}
  </Provider>,
  document.getElementById('root')
);
