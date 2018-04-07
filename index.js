'use strict'

const assert = require('assert')
// const _ = require('underscore')
const Alexa = require('alexa-sdk')
const makeImage = Alexa.utils.ImageUtils.makeImage
const textUtils = Alexa.utils.TextUtils

const templates = require('./ssml-speech')
const helpers = require('./helpers')
const resources = require('./resources')
// const images = require('./images')

const DEFAULT_TITLE = 'Learn to Read'

const states = {
  SIGHT_WORDS: 'sight-words',
  SIGHT_WORDS_NEXT: 'sight-words-next'
}

/**
 * ---------- Common Handlers ----------
 */

const newSession = function () {
  this.handler.state = ''
  delete this.attributes.STATE
  this.emit('LaunchRequest')
}

const unhandled = function () {
  console.log('Entering the unhandled intent')
  console.log(JSON.stringify(this, null, 2))
  const message = templates.unhandled()
  this.response.speak(message).listen(message)
  this.emit(':responseReady')
}

/**
 * Standard skill help.
 */
const help = function () {
  const message = templates.help()
  this.response.speak(message).listen(message)
  this.emit(':responseReady')
}

/**
 * Cancel the skill.
 */
const cancel = function () {
  this.response.speak(templates.goodbye())
  if (helpers.supportsDisplay(this)) {
    this.response.renderTemplate(getGoodbyeTemplate())
  }
  this.emit(':responseReady')
}

/**
 * ---------- Default Handlers ----------
 */

/**
 * Handle the launch request.
 */
const launch = function () {
  const hasDisplay = helpers.supportsDisplay(this)
  const userWarned = this.attributes.userWarned
  const skill = helpers.slot(this, 'skill')

  const speech = templates.welcome({
    skill: skill,
    userWarned: userWarned,
    hasDisplay: hasDisplay
  })

  if (userWarned === false) {
    this.attributes.userWarned = true
  }

  this.response.speak(speech).listen(speech)
  if (hasDisplay) {
    const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder()
    listItemBuilder.addItem(resources.sightWordsImage, 'sight-words', textUtils.makePlainText('Sight Words'))
    this.response.renderTemplate(getOptionTemplate({
      title: 'Welcome to Alexa Reading',
      listItems: listItemBuilder.build()
    }))
  }
  this.emit(':responseReady')
}

/**
 * Prompt the user for the skill they would like to practice.
 */
const getSkill = function () {
  const skillSlot = helpers.slot(this, 'skill')

  if (this.event.request.token === 'sight-words' || skillSlot.value === 'sight words') {
    sightWordsNext.call(this)
  } else {
    const speech = templates.unknown_skill({skill: skillSlot.value})
    this.response.speak(speech).listen(speech)
    this.emit(':responseReady')
  }
}

const elementSelected = function() {
  getSkill.call(this)
}

const reset = function() {
  const skillSlot = helpers.slot(this, 'skill')

  if (skillSlot.value === 'sight words') {
    delete this.attributes.sightWords
  }

  const speech = templates.reset({
    skill: skillSlot.value
  })

  this.response.speak(speech)
  this.emit(':responseReady')
}

/**
 * The handlers.
 */
const defaultHandlers = {
  'LaunchRequest': launch,
  'GetSkill': getSkill,
  'ElementSelected': elementSelected,
  'Reset': reset
}

const sightWordsUnhandled = function() {
  this.handler.state = states.SIGHT_WORDS
  this.response.speak(templates.sight_words_unhandled()).listen(templates.sight_words_unhandled())
  this.emit(':responseReady')
}

const sightWordsNext = function() {
  const hasDisplay = helpers.supportsDisplay(this)
  const speech = templates.sight_word_question()

  let words, word, hint

  if (!this.attributes.sightWords || this.attributes.sightWords.words.length === 0) {
    words = resources.words[0]
    word = words[random(words.length)]
    hint = resources.hints[word]

    this.attributes.sightWords = {
      level: 0,
      word: word,
      words: words
    }
  } else {
    words = this.attributes.sightWords.words
    word = words[random(words.length)]
    hint = resources.hints[word]

    this.attributes.sightWords.word = word
  }

  if (hasDisplay) {
    this.response.renderTemplate(getDisplayTemplate({
      primary: templates.sight_word_question_display({
        word: word
      })
    }))
  }

  let hintSpeech
  if (hint) {
    hintSpeech = templates.hint({ hint: hint })
  }
  this.handler.state = 'sight-words'
  this.response.speak(speech).listen(hintSpeech ? hintSpeech : speech)
  this.emit(':responseReady')
}

const sightWordsAnswer = function () {
  const word = this.attributes.sightWords.word
  assert(word)

  const answerSlot = helpers.slot(this, 'word')
  assert(answerSlot)

  const isCorrect = resources.isAcceptable(word, answerSlot.value)

  const context = {
    answer: answerSlot.value,
    word: word,
    correct: isCorrect,
    congrats: congrats()
  }

  if (!isCorrect) {
    console.log(`Correct answer: ${word}, users answer: ${answerSlot.value}`)
  }

  const hasDisplay = helpers.supportsDisplay(this)
  if (hasDisplay) {
    this.response.renderTemplate(getAnswerTemplate({
      word: word,
      isCorrect: isCorrect
    }))
  }

  this.handler.state = states.SIGHT_WORDS_NEXT
  const speech = templates.sight_words_answer(context)
  this.response.speak(speech).listen(templates.next())
  this.emit(':responseReady')
}

const dontKnow = function() {
  const hasDisplay = helpers.supportsDisplay(this)
  const word = this.attributes.sightWords.word
  assert(word)

  const context = {
    word: word
  }

  if (hasDisplay) {
    this.response.renderTemplate(getDisplayTemplate({
      primary: templates.dont_know_display(context)
    }))
  }
  this.handler.state = states.SIGHT_WORDS_NEXT
  this.response.speak(templates.dont_know(context)).listen(templates.next())
  this.emit(':responseReady')
}

const nextUnhandled = function() {
  this.handler.state = states.SIGHT_WORDS_NEXT
  this.response.speak(templates.next_unhandled()).listen(templates.next_unhandled())
  this.emit(':responseReady')
}

const sightWordsHandlers = {
  'NewSession': newSession,
  'Unhandled': sightWordsUnhandled,
  'AMAZON.HelpIntent': help,
  'AMAZON.CancelIntent': cancel,
  'AMAZON.StopIntent': cancel,
  'SightWordsAnswer': sightWordsAnswer,
  'DontKnow': dontKnow
}

const sightWordsNextHandlers = {
  'NewSession': newSession,
  'Unhandled': nextUnhandled,
  'AMAZON.HelpIntent': help,
  'AMAZON.CancelIntent': cancel,
  'AMAZON.StopIntent': cancel,
  'NextSightWord': sightWordsNext
}


//
// Utils.
//

const getOptionTemplate = function(params = {}) {
  const builder = new Alexa.templateBuilders.ListTemplate2Builder();
  if (params.title) {
    builder.setTitle(params.title)
  }
  if (params.token) {
    builder.setToken(params.token)
  }
  if (params.listItems) {
    builder.setListItems(params.listItems)
  }
  return builder.build()
}

const getDisplayTemplate = function (params = {}) {
  const builder = new Alexa.templateBuilders.BodyTemplate1Builder()
  const primaryRichText = params.primary ? textUtils.makeRichText(params.primary) : undefined
  builder.setTitle(params.title ? params.title : DEFAULT_TITLE)
  builder.setBackButtonBehavior('HIDDEN')
  builder.setTextContent(primaryRichText, null, null)
  if (params.background) {
    builder.setBackgroundImage(makeImage(params.background))
  }
  return builder.build()
}

const getAnswerTemplate = function(params = {}) {
  assert(params)
  assert(params.word)

  const builder = new Alexa.templateBuilders.BodyTemplate2Builder()
  builder.setTitle(params.word)
  builder.setBackButtonBehavior('HIDDEN')
  builder.setTitle(DEFAULT_TITLE)
  builder.setTextContent(textUtils.makeRichText(templates.sight_word_question_display({word: params.word})),
    null, textUtils.makePlainText('Say "next" to continue.'))
  if (params.isCorrect === true) {
    builder.setImage(resources.hoorayImage)
  } else {
    builder.setImage(resources.sadImage)
  }

  return builder.build()
}

const getGoodbyeTemplate = function () {
  return getDisplayTemplate({
    title: DEFAULT_TITLE,
    primary: templates.welcome_display()
  })
}

const commonHandlers = {
  'NewSession': newSession,
  'Unhandled': unhandled,
  'AMAZON.HelpIntent': help,
  'AMAZON.CancelIntent': cancel,
  'AMAZON.StopIntent': cancel
}

function extend(o = {}, includeNewSession = true) {
  const result = {}

  for (let k of Object.keys(o)) {
    result[k] = o[k]
  }

  for (let k of Object.keys(commonHandlers)) {
    if (includeNewSession === false && k === 'NewSession') {
      continue
    }

    if (!o[k]) {
      result[k] = commonHandlers[k]
    }
  }

  return result
}

// function createStateHandler(state, handlers) {
//   return Alexa.CreateStateHandler(state, extend(handlers))
// }

function createHandler(handlers) {
  return extend(handlers, false)
}

function random(max) {
  assert(max)
  return Math.floor(Math.random() * max)
}

const interjections = [
  'booya', 'dynomite', 'kapow', 'spoiler alert', 'woo hoo'
]

function congrats() {
  const i = random(interjections.length)
  const b = interjections[i]
  return `${b}!`
}

/**
 * Handler function.
 */
module.exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context, callback)
  alexa.appId = 'amzn1.ask.skill.e095a6af-12cd-4398-b46e-07ab3410d96f'
  alexa.dynamoDBTableName = 'alexa-reading'
  alexa.registerHandlers(
    createHandler(defaultHandlers),
    Alexa.CreateStateHandler(states.SIGHT_WORDS, sightWordsHandlers),
    Alexa.CreateStateHandler(states.SIGHT_WORDS_NEXT, sightWordsNextHandlers)
  )
  alexa.execute()
}
