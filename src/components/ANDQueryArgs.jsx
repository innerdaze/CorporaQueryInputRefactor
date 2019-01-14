import React, { Component } from 'react'
import PT from 'prop-types'
import { CSSTransition } from 'react-transition-group'

class ANDQueryArgs extends Component {
  static propTypes = {
    query: PT.string,
    onQueryChange: PT.func.isRequired,
    languageFromMain: PT.string.isRequired
  }

  constructor(props) {
    super(props)
    this.queryStrCache = {}

    var repeat1, repeat2
    var qlean = this.props.query
    if (qlean) {
      var repeatMatch = qlean.match(/{ *(\d)* *(?:, *(\d)*)? *} *$/)

      if (repeatMatch !== null) {
        repeat1 = repeatMatch[1]
        repeat2 = repeatMatch[2] || repeat1
        qlean = qlean.substring(0, qlean.length - repeatMatch[0].length)
      }

      // replace token's [ and ]
      qlean = qlean.replace(/^\s*\[\s*/, '').replace(/\s*\]\s*$/, '')
    }

    var match = queryToANDArgs(qlean)
    if (match === null) {
      this.state = {
        ands: ['and-' + nextId()]
      }
    } else {
      var ands = []
      match.forEach(m => {
        var id = 'and-' + nextId()
        ands.push(id)
        this.queryStrCache[id] = m
      })
      this.state = {
        ands,
        repeat1,
        repeat2
      }
    }
  }

  addADVAnd = () => {
    this.setState(oldSt => {
      oldSt.ands.push('and-' + nextId())
      return { ands: this.state.ands }
    })
  }

  removeADVAnd = id => {
    this.setState(oldSt => {
      delete this.queryStrCache[id]
      oldSt.ands.splice(oldSt.ands.indexOf(id), 1)
      return { ands: oldSt.ands }
    }, this.fireQueryChange)
  }

  onMenuChange = menust => {
    this.setState(
      {
        menuState_isStart: menust.isStart,
        menuState_isEnd: menust.isEnd,
        menuState_repeat1: menust.repeat1,
        menuState_repeat2: menust.repeat2
      },
      () => this.fireQueryChange()
    )
  }

  fireQueryChange = () => {
    var andParts = this.state.ands.map(id => this.queryStrCache[id])

    if (this.state.menuState_isStart) {
      andParts.push('lbound(sentence)')
    }
    if (this.state.menuState_isEnd) {
      andParts.push('rbound(sentence)')
    }

    var queryString = andParts.length >= 2 ? andParts.join(' & ') : andParts[0]
    queryString = `[ ${queryString} ]`

    if (this.state.menuState_repeat1 || this.state.menuState_repeat2) {
      queryString =
        queryString +
        '{' +
        (this.state.menuState_repeat1 || this.state.menuState_repeat2) +
        ',' +
        (this.state.menuState_repeat2 || this.state.menuState_repeat1) +
        '}'
    }

    this.props.onQueryChange(queryString)
  }

  onQueryChange = (andId, queryStr) => {
    this.queryStrCache[andId] = queryStr
    this.fireQueryChange()
  }

  renderANDTokenFooter = () => {
    return (
      <div className='token_footer'>
        <button
          className='btn btn-xs btn-default image_button insert_arg'
          onClick={this.addADVAnd}
          ref='addAndButton'
        >
          <i className='fa fa-plus' />
        </button>
        <ADVTokenMenu
          ref={ref => (this.menuRef = ref)}
          onChange={this.onMenuChange}
          repeat1={this.state.repeat1}
          repeat2={this.state.repeat2}
          languageFromMain={this.props.languageFromMain}
        />
        <div style={{ clear: 'both' }} />
      </div>
    )
  }

  render() {
    var andQueryArgs = this.state.ands.map(andId => {
      return (
        <CSSTransition
          key={andId}
          classNames='fade'
          timeout={{ enter: 200, exit: 200 }}
        >
          <div className='and query_arg'>
            <ANDQueryORArgs
              query={this.queryStrCache[andId]}
              onQueryChange={qs => this.onQueryChange(andId, qs)}
              handleRemoveADVAnd={() => this.removeADVAnd(andId)}
              languageFromMain={this.props.languageFromMain}
            />
          </div>
        </CSSTransition>
      )
    })
    return (
      <div>
        <TransitionGroup>{andQueryArgs}</TransitionGroup>
        {this.renderANDTokenFooter()}
      </div>
    )
  }
}
