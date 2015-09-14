import React, { Component } from 'react';
import { connect } from 'react-redux';
import App from './AsyncApp';


export function mapStateToProps({ selectedReddit, postsByReddit }) {
  const {
    isFetching,
    lastUpdated,
    items: posts
  } = postsByReddit[selectedReddit] || {
    isFetching: true,
    items: []
  };

  return {
    selectedReddit,
    posts,
    isFetching,
    lastUpdated
  };
}

export default connect(mapStateToProps)(App);
