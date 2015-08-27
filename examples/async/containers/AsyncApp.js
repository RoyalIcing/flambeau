import React, { Component, PropTypes } from 'react';
import { connectedActions as actions } from '../store';
import Picker from '../components/Picker';
import Posts from '../components/Posts';

const { selectReddit } = actions.SelectionActions;
const { fetchPostsIfNeeded, invalidateReddit } = actions.PostsActions;

class AsyncApp extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleRefreshClick = this.handleRefreshClick.bind(this);
  }

  componentDidMount() {
    const { selectedReddit } = this.props;
    fetchPostsIfNeeded({ reddit: selectedReddit });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedReddit !== this.props.selectedReddit) {
      const { selectedReddit } = nextProps;
      fetchPostsIfNeeded({ reddit: selectedReddit });
    }
  }

  handleChange(nextReddit) {
    selectReddit({ reddit: nextReddit });
  }

  handleRefreshClick(e) {
    e.preventDefault();

    const { selectedReddit } = this.props;
    invalidateReddit({ reddit: selectedReddit });
    fetchPostsIfNeeded({ reddit: selectedReddit });
  }

  render () {
    const { selectedReddit, posts, isFetching, lastUpdated } = this.props;
    return (
      <div>
        <Picker value={selectedReddit}
                onChange={this.handleChange}
                options={['reactjs', 'frontend']} />
        <p>
          {lastUpdated &&
            <span>
              Last updated at {new Date(lastUpdated).toLocaleTimeString()}.
              {' '}
            </span>
          }
          {!isFetching &&
            <a href='#'
               onClick={this.handleRefreshClick}>
              Refresh
            </a>
          }
        </p>
        {isFetching && posts.length === 0 &&
          <h2>Loading...</h2>
        }
        {!isFetching && posts.length === 0 &&
          <h2>Empty.</h2>
        }
        {posts.length > 0 &&
          <div style={{ opacity: isFetching ? 0.5 : 1 }}>
            <Posts posts={posts} />
          </div>
        }
      </div>
    );
  }
}

AsyncApp.propTypes = {
  selectedReddit: PropTypes.string.isRequired,
  posts: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number
};

export default AsyncApp;
//export default connect(mapStateToProps)(AsyncApp);
