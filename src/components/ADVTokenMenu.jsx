import React, { PureComponent } from 'react'
import PT from 'prop-types'
import { compose } from 'ramda'
import dictionary from '../../../translations/dictionary'

const toggleStateProp = prop => oldState => ({ [prop]: !oldState[prop] })

class ADVTokenMenu extends PureComponent {
  static propTypes = {
    onChange: PT.func.isRequired,
    repeat1: PT.string,
    repeat2: PT.string,
    languageFromMain: PT.string.isRequired
  }

  static getDerivedStateFromProps({ repeat1, repeat2 }, state) {
    if (repeat1 !== state.repeat1 || repeat2 !== state.repeat2) {
      return {
        hideMenu: !(repeat1 || repeat2)
      }
    }
  }

  static state = {
    isStart: false,
    isEnd: false
  }

  toggleStateProp = compose(
    this.setState,
    toggleStateProp
  )

  toggleRepeatMenu = toggleStateProp('hideMenu')
  toggleStart = toggleStateProp('isStart')
  toggleEnd = toggleStateProp('isEnd')

  handleClick = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    return (
      <div id='ADVtokenMenu'>
        <button
          className='btn btn-xs btn-default image_button repeat_menu'
          onClick={this.toggleRepeatMenu}
        >
          <i className='fa fa-cog' />
        </button>
        <div id='ADVtokenMenu-items' className={`hide-${this.state.hideMenu}`}>
          <div id='repeatMenu' className={'input-group input-group-sm repeat'}>
            <span>
              {
                dictionary[this.props.languageFromMain].queryinput.repeatMenu
                  .repeat
              }
            </span>
            <input
              type='text'
              id='repeat1'
              name='repeat1'
              value={this.props.repeat1}
              onChange={this.handleClick}
            />
            <span>
              {dictionary[this.props.languageFromMain].queryinput.repeatMenu.to}
            </span>
            <input
              type='text'
              id='repeat2'
              name='repeat2'
              value={this.props.repeat2}
              onChange={this.handleClick}
            />
            <span>
              {
                dictionary[this.props.languageFromMain].queryinput.repeatMenu
                  .times
              }
            </span>
          </div>
          <div id='start-end-menu'>
            <div>
              <label>
                <input
                  type='checkbox'
                  checked={this.state.isStart}
                  onChange={this.toggleStart}
                />
                &nbsp;
                {
                  dictionary[this.props.languageFromMain].queryinput
                    .sentenceStart
                }
              </label>
            </div>
            <div>
              <label>
                <input
                  type='checkbox'
                  checked={this.state.isEnd}
                  onChange={this.toggleEnd}
                />
                &nbsp;
                {dictionary[this.props.languageFromMain].queryinput.sentenceEnd}
              </label>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
