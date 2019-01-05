module.exports = {
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
  },
  isLow (key) {
    return Object.keys(this[0]).includes(key)
  },
  isHigh (key) {
    return Object.keys(this[1]).includes(key)
  }
}
