import $ from 'jquery'

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

Corpora.prototype.getLayers = function() {
  const targetLayers = { word: { argOpts: ['IS'], valueOptions: [] } }

  this.recurse(({ selected, endpoint: { layers } }) => {
    if (selected) {
      layers.forEach(
        ({
          name: sourceName,
          argOpts: sourceArgOptions,
          valueOptions: sourceValueOptions
        }) => {
          if (targetLayers.hasOwnProperty(sourceName)) {
            const {
              argOpts: targetArgOptions,
              valueOptions: targetValueOptions
            } = targetLayers[sourceName]

            sourceArgOptions.forEach(argOpt => {
              !targetArgOptions.includes(argOpt) &&
                targetArgOptions.push(argOpt)
            })

            sourceValueOptions.forEach(valOpt => {
              !targetValueOptions.includes(valOpt) &&
                targetValueOptions.push(valOpt)
            })
          } else {
            targetLayers[sourceName] = {
              argOpts: sourceArgOptions,
              valueOptions: sourceValueOptions
            }
          }
        }
      )
    }

    return true
  })

  return targetLayers
}
