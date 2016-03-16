import React from 'react'

const EmptySearchResult = React.createClass({
  render() {
    return (
      <strong>No manga contains the search term '{ this.props.term }'</strong>
    )
  }
})

export default EmptySearchResult
