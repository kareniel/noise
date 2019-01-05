# noise

A small wrapper around the web audio api to make music and sounds for games.

## Usage

```js
var { Scheduler, Synth } = require('./src')
var track = require('./my-track.js')

var scheduler = new Scheduler()
var synth = new Synth(scheduler.ctx, { })

scheduler.register(synth) // synth gets assigned instrument id 0
scheduler.load(track)
scheduler.start()
```

## Instruments

You can use up to four instruments in a given track.
Register them with a `Scheduler` using `scheduler.register()`.

## Track format 

Possible values for notes are listed in [notes.js](src/notes.js).

```js
/* beat -> instrument id, note */

var track = {
  0: [[0, 'C4']],
  4: [[0, 'C3']],
  8: [[0, 'C4']],
  12: [[0, 'C3']],
  16: [[0, 'C4']],
  20: [[0, 'C3']],
  24: [[0, 'C4']],
  28: [[0, 'C3']]
}
```

