const notes = require('./notes')

function generateArp (notes, instrument = 0) {
  var track = {
    duration: notes.length * 4
  }

  notes.forEach((note, index) => {
    track[index * 4] = [[ instrument, [ note ] ]]
  })

  return track
}

class Scheduler {
  constructor (ctx) {
    this.ctx = ctx

    this.loop = false
    this.scheduleAheadTime = 0.1
    this.currentBeat = 0
    this.startTime = 0.0
    this.nextNoteTime = 0.0

    this.instruments = []
    this.track = null

    this.setBPM(60)

    this.schedule = this.schedule.bind(this)
  }

  load (track) {
    this.track = track
  }

  setBPM (bpm) {
    this.bpm = bpm
    this.secondsPerBeat = 60.0 / this.bpm
  }

  start () {
    if (!this.track) throw new Error('Scheduler: No track loaded.')

    this.ctx.resume().then(() => {
      this.currentBeat = 0
      this.nextNoteTime = 0.0
      this.startTime = this.ctx.currentTime + 0.005

      this.schedule()
    })
  }

  stop () {
    this.ctx.suspend()
    cancelAnimationFrame(this.timer)
  }

  register (instrument) {
    this.instruments.push(instrument)
  }

  schedule () {
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentBeat, this.nextNoteTime)
      this.nextNote()
    }

    this.timer = requestAnimationFrame(this.schedule)
  }

  scheduleNote (beat, time) {
    var actions = this.track[beat]

    if (!actions) return

    var id, note, instrument

    actions.forEach(action => {
      id = action[0]
      note = action[1]
      instrument = this.instruments[id]

      if (!instrument) return

      instrument.playNote(note, time)
    })
  }

  nextNote () {
    this.nextNoteTime += 0.25 * this.secondsPerBeat
    this.currentBeat++

    if (this.loop && this.currentBeat >= this.track.duration) {
      this.currentBeat = 0
    }
  }
}

class Synth {
  constructor (ctx, options = {}) {
    this.ctx = ctx

    this.type = options.type || 'sine'
    this.attack = options.attack || 0
    this.decay = options.decay || 2
    this.output = options.output || this.ctx.destination
  }

  playNote (note, time) {
    time = time || this.ctx.currentTime

    var osc = this.ctx.createOscillator()
    var node = this.ctx.createGain()
    var endTime = time + this.decay

    osc.type = this.type
    osc.frequency.value = notes[note]

    osc.connect(node)
    node.connect(this.output)

    node.gain.exponentialRampToValueAtTime(0.00001, time)
    osc.start(time)
    node.gain.exponentialRampToValueAtTime(1, time + this.attack)
    node.gain.exponentialRampToValueAtTime(0.00001, endTime)
    osc.stop(endTime + 1)
  }
}

class RingMod {
  constructor (ctx, options = {}) {
    var carrier = ctx.createOscillator()
    var node = ctx.createGain()
    var frequency = options.frequency || 2500

    this.ctx = ctx
    this.carrier = carrier
    this.node = node
    this.output = options.output || ctx.destination

    carrier.type = options.type || 'square'

    carrier.connect(node.gain)
    carrier.frequency.setValueAtTime(frequency, 0)
    carrier.start(0)

    node.connect(this.output)
  }

  setFrequency (value) {
    this.carrier.frequency.setValueAtTime(value, this.ctx.currentTime)
  }
}

module.exports = {
  generateArp,
  Scheduler,
  Synth,
  RingMod
}
