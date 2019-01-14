import $ from 'jquery'

const nextId = () => nextId.id++

nextId.id = 0

function getLayers() {
  const layers_arr = []
  for (var l in layers) {
    layers_arr.push(l)
  }
  return layers_arr
}

function getLayerArgOpts(layer) {
  return layers[layer].argOpts
}

function isValidLayerOperator(layer, operator) {
  return !!layers[layer].argOpts.find(e => e.value === operator)
}
function isValidLayerValue(layer, operator, value) {
  var valopts = getLayerValueOptions(layer)
  if (!valopts) {
    return true
  }
  return valopts.indexOf(value) !== -1
}

function layerToQueryString(layer, operator, value) {
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
    return 'undefined'
  }
  return qstr
}

function getOperatorLabel(layer, operator) {
  return layers[layer].argOpts[operator].label
}

function getLayerValueOptions(layer, operator, value) {
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
function queryParse(q) {
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
function queryToORArgs(q) {
  if (!q) return null
  var match = q.trim().match(queryToORArgs.re)
  return match
}
queryToORArgs.re = RegExp('(?:' + quotedStringRE + '|[^()|])+', 'g')

// in: '[word = "zebra" & (word = "zoo" ...)]'
// out: ['word = "zebra" ', ' (word = "zoo" ...)']
function queryToANDArgs(q) {
  if (!q) return null

  var match = q.trim().match(queryToANDArgs.re)
  return match
}
queryToANDArgs.re = RegExp('(?:' + quotedStringRE + '|[^&])+', 'g')

// in: '[word = "zebra"] [word = "zoo"]'
// out: ['[word = "zebra"]', '[word = "zoo"]']
function queryToTokens(q) {
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
function filterWords(s, f) {
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

setOptions.defaultToStr = (layer, op, val) => {
  switch (op) {
    case 'is':
      return `${layer} = "${val}"`
    case 'is_not':
      return `${layer} != "${val}"`
  }
}
setOptions.defaultFromString = (layer, op, val) => {
  return { layer, op: op === '!=' ? 'is_not' : 'is', val }
}

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
function guessIfRegexp(s) {
  return !!s.match(/[^\\][-[\]{}()*+\\?.,^$|#]/) // find if it contains any unescaped regex characters
}
function unescapeRegExp(text) {
  return text.replace(/\\([-[\]{}()*+?.,\\^$|#])/g, '$1')
}
function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&')
}

const layers = {
  word: {
    label: 'word',
    argOpts: wordOptions
  },
  pos: {
    label: 'part-of-speech UD v2.0 tagset',
    argOpts: setOptions,
    valueOptions: [
      { value: 'ADJ', label: 'Adjective' },
      { value: 'ADV', label: 'Adverb' },
      { value: 'INTJ', label: 'Interjection' },
      { value: 'NOUN', label: 'Noun' },
      { value: 'PROPN', label: 'Proper noun' },
      { value: 'VERB', label: 'Verb' },
      { value: 'ADP', label: 'Adposition' },
      { value: 'AUX', label: 'Auxiliary' },
      { value: 'CCONJ', label: 'Coordinating conjunction' },
      { value: 'DET', label: 'Determiner' },
      { value: 'NUM', label: 'Numeral' },
      { value: 'PART', label: 'Particle' },
      { value: 'PRON', label: 'Pronoun' },
      { value: 'SCONJ', label: 'Subordinating conjunction' },
      { value: 'PUNCT', label: 'Punctuation' },
      { value: 'SYM', label: 'Symbol' },
      { value: 'X', label: 'Other' }
    ]
  },
  lemma: {
    label: 'lemmatization of tokens',
    argOpts: wordOptions
  },
  orth: {
    label: 'orthographic transcription',
    argOpts: wordOptions
  },
  norm: {
    label: 'orthographic normalization',
    argOpts: wordOptions
  },
  phonetic: {
    label: 'phonetic transcription SAMPA',
    argOpts: wordOptions // TODO special toString/parse? (probably due to regex character handling)
  },
  text: {
    label: 'Layer only for Basic Search',
    argOpts: wordOptions
  },
  '_.text_language': {
    label: 'language',
    argOpts: wordOptions
  }
}

const layerCategories = [
  { cat: 'word', label: 'Word', layers: ['word'] },
  {
    cat: 'wordAttribute',
    label: 'Word attribute',
    layers: ['pos', 'lemma', 'orth', 'norm', 'phonetic', 'text']
  },
  { cat: 'textAttribute', label: 'Text attribute', layers: ['_.text_language'] }
]

export default QueryInput
