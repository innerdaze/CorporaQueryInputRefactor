import React, { Component } from 'react'
import PT from 'prop-types'

class QueryInput extends Component {
  static propTypes = {
    searchedLanguage: PT.array,
    queryTypeId: PT.string.isRequired,
    query: PT.string,
    placeholder: PT.string,
    onKeyDown: PT.func.isRequired,
    handleKeyTextarea: PT.func.isRequired,
    languageFromMain: PT.string.isRequired,
    onQueryChange: PT.func.isRequired,
    fcsTextAreaVisibility: PT.bool.isRequired
  }

  render() {
    const commonProps = {
      className: 'form-control input-lg search',
      type: 'text',
      value: this.props.query,
      placeholder: this.props.placeholder,
      tabIndex: 1,
      onChange: evt => this.props.onQueryChange(evt.target.value)
    }

    if (this.props.queryTypeId === 'cql') {
      return (
        <input
          {...commonProps}
          id='query-cql'
          name='query-cql'
          onKeyDown={this.props.onKeyDown}
        />
      )
    }

    if (this.props.queryTypeId === 'fcs' && this.props.fcsTextAreaVisibility) {
      return (
        <textarea
          {...commonProps}
          id='query-fcs'
          name='query-fcs'
          rows='1'
          onKeyDown={this.props.handleKeyTextarea}
        />
      )
    }

    return (
      <div>
        <div id='adv_query_input_group' className='container-fluid'>
          <ADVTokens
            query={this.props.query}
            onQueryChange={this.props.onQueryChange}
            languageFromMain={this.props.languageFromMain}
          />
        </div>
      </div>
    )
  }
}
