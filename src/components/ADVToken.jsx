import React, { Component } from 'react'
import PT from 'prop-types'
import ANDQueryArgs from './ANDQueryArgs'

export default class ADVToken extends Component {
  static propTypes = {
    query: PT.string,
    onQueryChange: PT.func.isRequired,
    handleRemoveADVToken: PT.func.isRequired,
    languageFromMain: PT.string.isRequired
  }

  render() {
    return (
      <div
        className='token query_token inline btn-group'
        style={{ display: 'inline-block' }}
      >
        <div className='token_header'>
          <span
            className='image_button close_btn'
            type='button'
            onClick={this.props.handleRemoveADVToken}
          >
            <i className='fa fa-times-circle' />
          </span>
          <div style={{ clear: 'both' }} />
        </div>
        <div className='args'>
          {/* and.query_arg* and token_footer */}
          <ANDQueryArgs
            onQueryChange={this.props.onQueryChange}
            query={this.props.query}
            languageFromMain={this.props.languageFromMain}
          />
          <div className='lower_footer' />
        </div>
      </div>
    )
  }
}
