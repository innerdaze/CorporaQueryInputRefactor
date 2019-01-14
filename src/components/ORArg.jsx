import React, { PureComponent } from 'react'
import PT from 'prop-types'
import dictionary from '../../../translations/dictionary'

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
    var qp = queryParse(this.props.query)

    if (qp !== null) {
      var layer = qp.layer
      var op = qp.op
      var val = qp.val
    }

    this.state = {
      layer: layer || 'word',
      argOpt: op || 'is',
      argValue: val || '',

      editingText: false
    }
  }

  fireQueryChange() {
    const queryString = layerToQueryString(
      this.state.layer,
      this.state.argOpt,
      this.state.argValue
    )
    this.props.onQueryChange(queryString)
  }

  onlayerChange = evt => {
    var layer = evt.target.value
    this.setState(st => {
      var argOpt = getLayerArgOpts(layer)[0].value
      var lvo = getLayerValueOptions(layer, argOpt, st.argValue)
      var argValue = ''
      if (lvo === undefined) argValue = ''
      else argValue = lvo[0].value

      return {
        layer,
        argOpt,
        argValue
      }
    })
  }

  onArgOptChange = evt => {
    var argOpt = evt.target.value
    this.setState({ argOpt })
  }

  onArgValueChange = evt => {
    var value = evt.target.value
    //console.log("picked arg value", value);

    this.setState({ argValue: value })
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

  renderInput() {
    var valueOptions = getLayerValueOptions(
      this.state.layer,
      this.state.argOpt,
      this.state.argValue
    )
    if (valueOptions === undefined) {
      return (
        <input
          type='text'
          className='form-control'
          value={this.state.argValue}
          onChange={this.onArgValueChange}
          onFocus={() => this.setState({ editingText: true })}
          onBlur={() => this.setState({ editingText: false })}
        />
      )
    } else {
      return (
        <select
          className='form-control'
          value={this.state.argValue}
          onChange={this.onArgValueChange}
          onFocus={() => this.setState({ editingText: true })}
          onBlur={() => this.setState({ editingText: false })}
        >
          {valueOptions.map(valOpt => {
            return <option value={valOpt.value}>{valOpt.label}</option>
          })}
        </select>
      )
    }
  }

  getLayerLabel(layer) {
    return dictionary[this.props.languageFromMain].queryinput.layers[layer]
      .label
  }

  getLayerArgOpts(layer) {
    return dictionary[this.props.languageFromMain].queryinput.layers[layer]
      .argOpts
  }

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
          {' '}
          {/* , margin-left: "5px" */}
          <div className='arg_selects form-inline'>
            <select
              className='arg_type form-control'
              value={this.state.layer}
              onChange={this.onlayerChange}
            >
              {dictionary[
                this.props.languageFromMain
              ].queryinput.layerCategories.map(cat => {
                return (
                  <optgroup key={cat.cat} label={cat.label}>
                    {cat.layers.map(layer => {
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
              value={this.state.argOpt}
              onChange={this.onArgOptChange}
            >
              {dictionary[this.props.languageFromMain].queryinput[
                this.getLayerArgOpts(this.state.layer)
              ].map(argOpt => {
                return (
                  <option key={argOpt.value} value={argOpt.value}>
                    {argOpt.label}
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
