var { Scheduler, Synth } = require('../src')

var scheduler = new Scheduler()
var synth = new Synth(scheduler.ctx)
var octave = 3

scheduler.register(synth)

const keyMaps = {
  0: {
    'a': 'C',
    's': 'D',
    'd': 'E',
    'f': 'F',
    'g': 'G',
    'h': 'A',
    'j': 'B'
  },
  1: {
    'k': 'C'
  }
}

const keys = Object.keys(keyMaps[0]).concat(Object.keys(keyMaps[1]))

document.addEventListener('click', function onClick () {
  document.removeEventListener('click', onClick)
  scheduler.start()

  document.addEventListener('keypress', e => {
    if (e.key === 'z') return octave--
    if (e.key === 'x') return octave++

    if (Object.keys(keyMaps[0]).includes(e.key)) {
      synth.playNote(keyMaps[0][e.key] + octave)
    }

    if (Object.keys(keyMaps[1]).includes(e.key)) {
      synth.playNote(keyMaps[0][e.key] + (octave + 1))
    }
  })
})
