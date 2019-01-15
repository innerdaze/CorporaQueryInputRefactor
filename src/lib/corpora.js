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
