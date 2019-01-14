import React, { Component } from 'react'
import PT from 'prop-types'
import { CSSTransition } from 'react-transition-group'
import dictionary from '../../../translations/dictionary'

class ANDQueryORArgs extends Component {
  static propTypes = {
    query: PT.string,
    onQueryChange: PT.func.isRequired,
    handleRemoveADVAnd: PT.func.isRequired,
    languageFromMain: PT.string.isRequired
  }

  constructor(props) {
    super(props)
    this.queryStrCache = {}
    var match = queryToORArgs(this.props.query)
    if (match === null) {
      this.state = {
        ors: ['or-' + nextId()]
      }
    } else {
      var ors = []
      match.forEach(m => {
        var id = 'or-' + nextId()
        ors.push(id)
        this.queryStrCache[id] = m
      })
      this.state = {
        ors
      }
    }
  }

  validateADV(value) {
    //fixme! - disable SearchButton if not atleast 1 token is in the query filter
    return
  }

  fireQueryChange = () => {
    var orParts = this.state.ors.map(id => this.queryStrCache[id])
    const queryString =
      orParts.length >= 2 ? '( ' + orParts.join(' | ') + ' )' : orParts[0]
    this.props.onQueryChange(queryString)
  }

  addADVOr = e => {
    this.setState(oldSt => {
      oldSt.ors.push('or-' + nextId())
      return { ors: this.state.ors }
    })
  }

  removeADVOr = id => {
    this.setState(
      oldSt => {
        delete this.queryStrCache[id]
        oldSt.ors.splice(oldSt.ors.indexOf(id), 1)
        return { ors: oldSt.ors }
      },
      () => {
        if (this.state.ors.length === 0) {
          this.props.handleRemoveADVAnd()
        } else {
          this.fireQueryChange()
        }
      }
    )
  }

  onQueryChange = (orId, queryStr) => {
    this.queryStrCache[orId] = queryStr
    this.fireQueryChange()
  }

  render() {
    var orArgs = this.state.ors.map(orId => {
      return (
        <CSSTransition
          key={orId}
          classNames='fade'
          timeout={{ enter: 200, exit: 200 }}
        >
          <ORArg
            query={this.queryStrCache[orId]}
            handleRemoveADVOr={() => this.removeADVOr(orId)}
            handleValidateADV={() => {
              return true
            }}
            onQueryChange={qs => this.onQueryChange(orId, qs)}
            languageFromMain={this.props.languageFromMain}
          />
        </CSSTransition>
      )
    })
    return (
      <div>
        <div className='or_container'>
          <TransitionGroup>{orArgs}</TransitionGroup>
        </div>
        <div className='arg_footer'>
          <span className='link' onClick={this.addADVOr}>
            {dictionary[this.props.languageFromMain].queryinput.or}
          </span>
          <div style={{ clear: 'both' }} />
        </div>
      </div>
    )
  }
}
