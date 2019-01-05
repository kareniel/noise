var choo = require('choo')
var html = require('choo/html')
var { Scheduler, Synth, RingMod, generateArp } = require('../src')
var keyMaps = require('./key-maps')

var app = choo()

app.route('/', function (state, emit) {
  return html`
    <body onkeypress=${e => emit('keypress', e)}>
      <h1>noise</h1>
      <p>octave: ${state.octave}</p>
      <button onclick=${e => emit('scheduler:start')}>start</button>
      <button onclick=${e => emit('scheduler:stop')}>stop</button>
    </body>`
})

app.use(function (state, emitter) {
  var ctx = new AudioContext()
  var bFlatMinor = ['Bb3', 'C4', 'Db4', 'Eb4', 'F4', 'Gb4', 'Ab4', 'Bb4']
  var track = generateArp(bFlatMinor)
  var scheduler = new Scheduler(ctx)

  var ringMod = new RingMod(ctx, {
    frequency: 600,
    output: ctx.destination
  })

  var synth = new Synth(ctx, {
    output: ringMod.node,
    attack: 2.75,
    decay: 5,
    type: 'square'
  })

  emitter.on('DOMContentLoaded', e => {
    state.octave = 4
    state.scheduler = scheduler
    state.ringMod = ringMod
    scheduler.loop = true

    emitter.on('keypress', handleKeyPress)

    scheduler.register(synth)
    scheduler.load(track)

    emitter.on('scheduler:start', e => scheduler.start())
    emitter.on('scheduler:stop', e => scheduler.stop())
    emitter.emit('render')
  })

  function incrementOctave () {
    state.octave++
    emitter.emit('render')
  }

  function decrementOctave () {
    state.octave--
    emitter.emit('render')
  }

  function handleKeyPress (e) {
    if (e.key === 'z' && state.octave > 1) return decrementOctave()
    if (e.key === 'x' && state.octave < 6) return incrementOctave()

    if (keyMaps.isLow(e.key)) synth.playNote(keyMaps[0][e.key] + state.octave)
    if (keyMaps.isHigh(e.key)) synth.playNote(keyMaps[0][e.key] + (state.octave + 1))
  }
})

app.mount('body')
