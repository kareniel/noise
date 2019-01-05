const notes = require('./notes')
const AudioContext = window.AudioContext || webkitAudioContext

class Scheduler {
  constructor () {
    this.ctx = new AudioContext()

    this.scheduleAheadTime = 0.1
    this.currentBeat = 0
    this.currentBar = 0
    this.startTime = 0.0
    this.nextNoteTime = 0.0

    this.instruments = []

    this.setBPM(60)

    this.schedule = this.schedule.bind(this)
  }

  setBPM (bpm) {
    this.bpm = bpm
    this.secondsPerBeat = 60.0 / this.bpm
  }

  start () {
    this.ctx.resume().then(() => {
      this.currentBeat = 0
      this.startTime = this.ctx.currentTime + 0.005

      this.schedule()
    })
  }

  stop () {
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
    this.instruments.forEach(instrument => {
      instrument.playNote('C4', time)
    })
  }

  nextNote () {
    this.nextNoteTime += 0.25 * this.secondsPerBeat
    this.currentBeat++

    if (this.currentBeat === 16) {
      this.currentBar++
      this.currentBeat = 0
    }
  }
}

class Synth {
  constructor (ctx, options = {}) {
    this.ctx = ctx

    this.type = options.type || 'sine'
    this.decay = options.decay || 2
  }

  playNote (note, time) {
    var osc = this.ctx.createOscillator()
    var node = this.ctx.createGain()
    var endTime = time + this.decay

    osc.type = this.type
    osc.frequency.value = notes[note]

    osc.connect(node)
    node.connect(this.ctx.destination)

    osc.start(time)
    node.gain.exponentialRampToValueAtTime(0.00001, endTime)
    osc.stop(endTime + 1)
  }
}

module.exports = {
  Scheduler,
  Synth
}
