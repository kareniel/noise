var { Scheduler, Synth } = require('../src')

var scheduler = new Scheduler()
var synth = new Synth(scheduler.ctx)

scheduler.register(synth)

document.addEventListener('click', function onClick () {
  document.removeEventListener('click', onClick)
  scheduler.start()
})
