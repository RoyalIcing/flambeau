import React, { Component } from 'react';
import AsyncApp from './AsyncApp';
import { subscribe, get } from '../store';


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


// TODO: Reusability
// TODO: Hot loading
export default class Root extends Component {
  constructor(props) {
    super(props);

    this.state = get();
  }

  componentDidMount() {
    this.disposeSubscription = subscribe((idsChanged) => {
      this.setState(get(idsChanged));
    });
  }

  componentWillUnmount() {
    this.disposeSubscription();
    this.disposeSubscription = null;
  }

  render() {
    return (
      <AsyncApp {...mapStateToProps(this.state)} />
    );
  }
}
