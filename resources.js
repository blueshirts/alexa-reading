const level1Words = [
  'a',
  'and',
  'away',
  'big',
  'blue',
  'can',
  'come',
  'down',
  'find',
  'for',
  'funny',
  'go',
  'help',
  'here',
  'I',
  'in',
  'is',
  'it',
  'jump',
  'little',
  'look',
  'make',
  'me',
  'my',
  'not',
  'one',
  'play',
  'red',
  'run',
  'said',
  'see',
  'the',
  'three',
  'to',
  'two',
  'up',
  'we',
  'where',
  'yellow',
  'you'
]

const hints = {
  'a': 'I think you know this one it\'s the first letter of the alphabet.',
  'away': 'This work is up up and',
  'big': 'This word is not small so it must be what?',
  'blue': 'This word is a color.',
  'down': 'Not up but what?',
  'funny': 'This word rhymes with sunny.',
  'go': 'The opposite of stay is to what?',
  'help': 'Friends do what for each other?',
  'I': "This word is not an L.",
  'in': 'This word is not out but what?'
}

const TO_ANSWERS = ['to', 'too', 'two']
const FOR_ANSWERS = ['for', 'four']
const acceptableAnswers = new Map([
  ['to', TO_ANSWERS],
  ['too', TO_ANSWERS],
  ['two', TO_ANSWERS],
  ['four', FOR_ANSWERS],
  ['for', FOR_ANSWERS]
])

const isAcceptable = function(word, answer) {
  if (word === answer) {
    return true
  } else {
    return acceptableAnswers.has(word) && acceptableAnswers.get(word).includes(answer)
  }
}

exports.level1Words = level1Words
exports.words = [level1Words]
exports.hints = hints
exports.isAcceptable = isAcceptable