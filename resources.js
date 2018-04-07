const assert = require('assert')
const Alexa = require('alexa-sdk')
const makeImage = Alexa.utils.ImageUtils.makeImage

const sightWordsImage =  makeImage('https://s3.amazonaws.com/madziki.com/reading/sight-words-280-280.png', 280, 280)

const hoorayImage = makeImage('https://s3.amazonaws.com/madziki.com/reading/hooray-340-340.png')

const sadImage = makeImage('https://s3.amazonaws.com/madziki.com/reading/sad.png')

const level1Words = `
  a, about, all, an, and, are, as, at, be, been, but, by, called, can, come, could, day, did, do, down, each, find, 
  first, for, from, get, go, had, has, have, he, her, him, his, how, I, if, in, into, is, it, like, long, look, made, 
  make, many, may, more, my, no, not, now, number, of, oil, on, one, or, other, out, part, people, said, see, she, sit,
  so, some, than, that, the, their, them, then, there, these, they, this, time, to, two, up, use, was, water, way, we, 
  were, what, when, which, who, will, with, words, would, write, you, your
`.split(",").map(item => item.trim())

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
  'in': 'This word is not out but what?',
  'three': 'This word is a number and it comes after two.'
}

const acceptableAnswers = new Map()

const addAcceptableAnswers = function(a) {
  assert(a)
  assert(Array.isArray(a))

  for (let item of a) {
    acceptableAnswers.set(item, a)
  }
}

addAcceptableAnswers(['one, 1'])
addAcceptableAnswers(['been', 'ben'])
addAcceptableAnswers(['first', '1st'])
addAcceptableAnswers(['to', 'too', 'two', '2'])
addAcceptableAnswers(['for', 'four', '4'])
addAcceptableAnswers(['hi', 'i'])
addAcceptableAnswers(['there', 'they\'re', 'their'])
addAcceptableAnswers(['three', '3'])
addAcceptableAnswers(['right', 'write'])
addAcceptableAnswers(['you\'re', 'your'])

const isAcceptable = function (word, answer) {
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
exports.sightWordsImage = sightWordsImage
exports.hoorayImage = hoorayImage
exports.sadImage = sadImage