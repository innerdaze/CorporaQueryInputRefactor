import React, { Component } from 'react'
import PT from 'prop-types'
import { CSSTransition } from 'react-transition-group'

class ADVTokens extends Component {
  static propTypes = {
    query: PT.string, // initial state query
    onQueryChange: PT.func.isRequired,
    languageFromMain: PT.string.isRequired
  }

  constructor(props) {
    super(props)

    this.queryStrCache = {}

    var match = queryToTokens(this.props.query)

    if (match === null) {
      this.state = {
        tokens: ['token-' + nextId()]
      }
    } else {
      var tokens = []
      match.forEach(m => {
        var id = 'token-' + nextId()
        tokens.push(id)
        this.queryStrCache[id] = m
      })
      this.state = {
        tokens: tokens
      }
    }
  }

  addADVToken = () => {
    this.setState(oldSt => {
      oldSt.tokens.push('token-' + nextId())
      return { tokens: oldSt.tokens }
    })
  }

  removeADVToken = id => {
    this.setState(oldSt => {
      delete this.queryStrCache[id]
      oldSt.tokens.splice(oldSt.tokens.indexOf(id), 1)
      return { tokens: oldSt.tokens }
    }, this.fireQueryChange)
  }

  fireQueryChange = () => {
    var tokenParts = this.state.tokens.map(id => this.queryStrCache[id])
    const queryString = tokenParts.join(' ')
    this.props.onQueryChange(queryString)
  }

  onQueryChange = (tokenId, queryStr) => {
    this.queryStrCache[tokenId] = queryStr
    this.fireQueryChange()
  }

  render() {
    var i = 0
    var tokens = this.state.tokens.map((tokenId, i) => {
      return (
        <CSSTransition
          key={tokenId}
          classNames='token'
          timeout={{ enter: 250, exit: 250 }}
        >
          <ADVToken
            query={this.queryStrCache[tokenId]}
            onQueryChange={qs => this.onQueryChange(tokenId, qs)}
            handleRemoveADVToken={() => this.removeADVToken(tokenId)}
            languageFromMain={this.props.languageFromMain}
          />
        </CSSTransition>
      )
    })

    return (
      <div id='adv-tokens' className='d-flex flex-row flex-nowrap'>
        <TransitionGroup>{tokens}</TransitionGroup>
        <button
          className='btn btn-xs btn-default image_button insert_token'
          type='button'
          onClick={this.addADVToken}
        >
          <i className='fa fa-plus' />
        </button>
      </div>
    )
  }
}
