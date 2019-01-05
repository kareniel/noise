var { Scheduler, Synth, generateArp } = require('../src')

var choo = require('choo')
var html = require('choo/html')

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

var app = choo()

app.route('/', function (state, emit) {
  return html`
    <body onkeypress=${e => emit('keypress', e)}>
      <h1>noise</h1>
      <pre>${JSON.stringify(state.scheduler, null, 2)}</pre>
    </body>`
})

app.use(function (state, emitter) {
  emitter.on('DOMContentLoaded', e => {
    var scheduler = new Scheduler()
    var synth = new Synth(scheduler.ctx)
    var octave = 4
    var bFlatMinor = ['Bb3', 'C4', 'Db4', 'Eb4', 'F4', 'Gb4', 'Ab4', 'Bb4']
    var track = generateArp(bFlatMinor)

    scheduler.register(synth)
    scheduler.load(track)

    scheduler.loop = true
    scheduler.start()

    state.scheduler = scheduler

    render()

    function render () {
      requestAnimationFrame(() => {
        emitter.emit('render')
        render()
      })
    }

    emitter.on('keypress', e => {
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
})

app.mount('body')
