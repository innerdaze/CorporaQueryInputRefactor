import React, { PureComponent } from 'react'
import PT from 'prop-types'
import dictionary from '../../../translations/dictionary'
import {
  layerToQueryString,
  getLayerArgOpts,
  queryParse,
  getLayerValueOptions
} from '../lib'

/* wtf is evt? */
class ORArg extends PureComponent {
  static propTypes = {
    query: PT.string,
    handleValidateADV: PT.func.isRequired,
    handleRemoveADVOr: PT.func.isRequired,
    onQueryChange: PT.func.isRequired,
    languageFromMain: PT.string.isRequired
  }

  constructor(props) {
    super(props)

    const { layer = 'word', op: argOpt = 'is', val: argValue = '' } =
      queryParse(this.props.query) || {}

    this.state = {
      layer,
      argOpt,
      argValue,
      editingText: false
    }
  }

  /* should be bound */
  fireQueryChange = () => {
    const queryString = layerToQueryString(
      this.state.layer,
      this.state.argOpt,
      this.state.argValue
    )

    this.props.onQueryChange(queryString)
  }

  onLayerChange = e => {
    const layer = e.target.value

    this.setState(oldState => {
      const argOpt = getLayerArgOpts(layer)[0].value
      const valueOptions = getLayerValueOptions(
        layer,
        argOpt,
        oldState.argValue
      )

      /* think it through */
      return {
        layer,
        argOpt,
        argValue:
          typeof valueOptions === 'undefined' ? '' : valueOptions[0].value
      }
    })
  }

  onFieldChange = ({ target: { name, value } }) => {
    this.setState({ [name]: value })
  }

  componentDidMount() {
    this.fireQueryChange()
  }

  componentDidUpdate(prevProps, prevState) {
    // after state update.
    if (
      prevState.layer !== this.state.layer ||
      prevState.argOpt !== this.state.argOpt ||
      prevState.argValue !== this.state.argValue
      /*|| (!this.state.editingText && prevState.argValue !== this.state.argValue) // only update text-value input on field blur 
			|| (prevState.editingText !== this.state.editingText && prevState.editingText) // stopped editing text field.
			*/
    ) {
      this.fireQueryChange()
    }
  }

  toggleEditingText = isEditing => () => this.setState({ isEditing })

  /* needs binding */
  renderInput() {
    var valueOptions = getLayerValueOptions(
      this.state.layer,
      this.state.argOpt,
      this.state.argValue
    )

    if (valueOptions === undefined) {
      return (
        <input
          className='form-control'
          name='argValue'
          value={this.state.argValue}
          onChange={this.onArgValueChange}
          onFocus={this.toggleEditingText(true)}
          onBlur={this.toggleEditingText(false)}
        />
      )
    } else {
      return (
        <select
          className='form-control'
          name='argValue'
          value={this.state.argValue}
          onChange={this.onArgValueChange}
          onFocus={this.toggleEditingText(true)}
          onBlur={this.toggleEditingText(false)}
        >
          {valueOptions.map(({ value, label }) => {
            return (
              <option key={value} value={value}>
                {label}
              </option>
            )
          })}
        </select>
      )
    }
  }

  /* needs binding */
  getLayerLabel = layer =>
    dictionary[this.props.languageFromMain].queryinput.layers[layer].label

  /* needs binding */
  getLayerArgOpts = layer =>
    dictionary[this.props.languageFromMain].queryinput.layers[layer].argOpts

  render() {
    return (
      <div className='or or_arg'>
        <div className='left_col'>
          <button
            className='btn btn-xs btn-default image_button remove_arg'
            onClick={this.props.handleRemoveADVOr}
          >
            <i className='fa fa-minus' />
          </button>
        </div>
        <div
          className='right_col inline_block'
          style={{ display: 'inline-block' }}
        >
          {' ' /* why is this here? */}
          <div className='arg_selects form-inline'>
            <select
              className='arg_type form-control'
              value={this.state.layer}
              onChange={this.onLayerChange}
            >
              {dictionary[
                this.props.languageFromMain
              ].queryinput.layerCategories.map(({ cat, label, layers }) => {
                return (
                  <optgroup key={cat} label={label}>
                    {layers.map(layer => {
                      return (
                        <option key={layer} value={layer}>
                          {this.getLayerLabel(layer)}
                        </option>
                      )
                    })}
                  </optgroup>
                )
              })}
            </select>
            <select
              className='arg_opts form-control'
              name='argOpt'
              value={this.state.argOpt}
              onChange={this.onFieldChange}
            >
              {dictionary[this.props.languageFromMain].queryinput[
                this.getLayerArgOpts(this.state.layer)
              ].map(({ value, label }) => {
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              })}
            </select>
          </div>
          <div className='arg_val_container'>{this.renderInput()}</div>
        </div>
      </div>
    )
  }
}
