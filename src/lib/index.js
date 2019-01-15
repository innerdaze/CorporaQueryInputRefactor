/* ok i guess... */
export const nextId = () => nextId.id++

nextId.id = 0

/* unused | impure */
export const getLayers = () => {
  const layers_arr = []

  for (var l in layers) {
    layers_arr.push(l)
  }

  return layers_arr
}

/* impure */
export function getLayerArgOpts(layer) {
  return layers[layer].argOpts
}

/* unused | impure */
export function isValidLayerOperator(layer, operator) {
  return !!layers[layer].argOpts.find(e => e.value === operator)
}

/* unused | impure */
export function isValidLayerValue(layer, operator, value) {
  var valopts = getLayerValueOptions(layer)

  if (!valopts) {
    return true
  }

  return valopts.indexOf(value) !== -1
}

/* impure | retarded return values */
export function layerToQueryString(layer, operator, value) {
  var toStr = layers[layer].toQueryString

  if (!toStr) {
    toStr = getLayerArgOpts(layer).defaultToStr
  }

  if (!toStr) {
    toStr = wordOptions.defaultToStr
    console.warn('layerToQueryString: couldnt find a toQueryString method!')
  }

  var qstr = toStr(layer, operator, value)

  if (qstr === undefined) {
    console.warn('layerToQueryString: qstr undefined!')
    return 'undefined' // WTAF?!?! THAT'S NOT FUCKEN RIGHT.
  }

  return qstr
}

/* unused | impure */
export function getOperatorLabel(layer, operator) {
  return layers[layer].argOpts[operator].label
}

/* impure */
export function getLayerValueOptions(layer, operator, value) {
  var valopts = layers[layer].valueOptions

  if (!valopts) {
    return
  }

  if (typeof valopts === 'function') {
    return valopts(layer, operator, value)
  } else if (valopts.length) {
    return valopts // array
  }
}

// a RE string matching a "double-quote"d string
const quotedStringRE = /(?:"(?:\\"|[^"])*")/.source

// in: 'word = "zebra" '
// out: ['word', '=', 'zebra']

/* impure */

export function queryParse(q) {
  if (!q) return null

  var match = q.match(/^\s*(\w+) *(=|!=) *"((?:\\"|.)*?)"/)

  if (match === null) {
    return null
  }

  const layer = match[1]
  const op = match[2]
  const value = match[3]

  var fromStr = getLayerArgOpts(layer).fromQueryString

  if (!fromStr) {
    fromStr = getLayerArgOpts(layer).defaultFromString
  }

  return fromStr(layer, op, value)
}

// in: '(word = "zebra" | word = "zoo" ...)'
// out: ['word = "zebra" ', ' (word = "zoo" ...)']

/* impure */
export function queryToORArgs(q) {
  if (!q) return null

  var match = q.trim().match(queryToORArgs.re)

  return match
}
queryToORArgs.re = RegExp('(?:' + quotedStringRE + '|[^()|])+', 'g')

// in: '[word = "zebra" & (word = "zoo" ...)]'
// out: ['word = "zebra" ', ' (word = "zoo" ...)']

/* impure */
export function queryToANDArgs(q) {
  if (!q) return null

  var match = q.trim().match(queryToANDArgs.re)

  return match
}
queryToANDArgs.re = RegExp('(?:' + quotedStringRE + '|[^&])+', 'g')

// in: '[word = "zebra"] [word = "zoo"]'
// out: ['[word = "zebra"]', '[word = "zoo"]']

/* impure */
export function queryToTokens(q) {
  if (!q) return null

  var match = q.match(queryToTokens.re)

  return match
}
queryToTokens.re = RegExp(
  '\\[(?:' + quotedStringRE + '|.)*?\\] *(?:\\{.*?\\})?',
  'g'
)

var filteredWords = []
/*To simplify matching regex filter out words within "quotemarks". This help to not stumble on any special characters that can occur there. */

/* impure */
export function filterWords(s, f) {
  const filteredString = s.replace(/("(?:\\"|[^"])*")/g, m => {
    filteredWords.push(m)
    return '""'
  })

  const ret = f(filteredString)
  // restore words

  // return return value
  return ret
}

var wordOptions = [
  { value: 'is', label: 'is' },
  { value: 'is_not', label: 'is not' },
  { value: 'contains', label: 'contains' },
  { value: 'starts_with', label: 'starts with' },
  { value: 'ends_with', label: 'ends with' },
  { value: 'regex', label: 'regex' },
  { value: 'not_regex', label: 'not regex' }
]
var liteOptions = [
  { value: 'is', label: 'is' },
  { value: 'is_not', label: 'is not' }
]
var setOptions = [
  { value: 'is', label: 'is' },
  { value: 'is_not', label: 'is not' }
]
var probabilitySetOptions = [
  { value: 'is', label: 'highest_rank' },
  { value: 'is_not', label: 'not_highest_rank' },
  { value: 'contains', label: 'rank_contains' },
  { value: 'contains_not', label: 'not_rank_contains' }
]

/* nested? */
setOptions.defaultToStr = (layer, op, val) => {
  switch (op) {
    case 'is':
      return `${layer} = "${val}"`
    case 'is_not':
      return `${layer} != "${val}"`
  }
}

/* nested? */
setOptions.defaultFromString = (layer, op, val) => {
  return { layer, op: op === '!=' ? 'is_not' : 'is', val }
}

/* nested? */
wordOptions.defaultToStr = (layer, op, val) => {
  var unescVal = val
  var val = escapeRegExp(val)

  switch (op) {
    case 'is':
      return `${layer} = "${val}"`
    case 'is_not':
      return `${layer} != "${val}"`
    case 'contains':
      return `${layer} = ".*${val}.*"`
    case 'starts_with':
      return `${layer} = "${val}.*"`
    case 'ends_with':
      return `${layer} = ".*${val}"`
    case 'regex':
      return `${layer} = "${unescVal}"`
    case 'not_regex':
      return `${layer} != "${unescVal}"`
  }
}

/* nested? */
wordOptions.defaultFromString = (layer, op, val) => {
  // layer should be good. Now figure out op, and if val is escaped or not
  if (op === '=') {
    var strippedOfSemiRE = val.replace(/^\.\*/, '').replace(/\.\*$/, '')

    if (strippedOfSemiRE.length !== val.length) {
      // could be one of: startswith, contains, endswith.

      if (!guessIfRegexp(strippedOfSemiRE)) {
        // Ok, it is one of: startswith, contains, endswith.

        if (val.startsWith('.*') && val.endsWith('.*')) {
          var op2 = 'contains'
        } else if (val.startsWith('.*')) {
          op2 = 'starts_with'
        } else if (val.endsWith('.*')) {
          op2 = 'ends_with'
        } else {
          console.error('parsing query failed due to coding error')
          return null
        }

        return {
          layer: layer,
          op: op2,
          val: unescapeRegExp(strippedOfSemiRE)
        }
      }
      // its regexp.
    }
  }

  if (guessIfRegexp(val)) {
    // its regexp
    return { layer, op: op === '=' ? 'regex' : 'not_regex', val: val }
  }

  // its not regexp
  return { layer, op: op === '=' ? 'is' : 'is_not', val: unescapeRegExp(val) }
}

export function guessIfRegexp(s) {
  return !!s.match(/[^\\][-[\]{}()*+\\?.,^$|#]/) // find if it contains any unescaped regex characters
}

export function unescapeRegExp(text) {
  return text.replace(/\\([-[\]{}()*+?.,\\^$|#])/g, '$1')
}

export function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&')
}
