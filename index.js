'use strict'

const assert = require('assert')
const _ = require('underscore')
const Alexa = require('alexa-sdk')
const makeImage = Alexa.utils.ImageUtils.makeImage
const textUtils = Alexa.utils.TextUtils

const templates = require('./ssml-speech')
const helpers = require('./helpers')
const resources = require('./resources')
// const images = require('./images')

const DEFAULT_TITLE = 'Learn to Read'

/**
 * ---------- Common Handlers ----------
 */

const newSession = function () {
  console.log(`Invoking new session: ${this.handler.state}`)
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
    this.response.renderTemplate(getDisplayTemplate({
      primary: templates.welcome_display()
    }))
  }
  this.emit(':responseReady')
}

/**
 * Prompt the user for the skill they would like to practice.
 */
const getSkill = function () {
  const skillSlot = helpers.slot(this, 'skill')

  if (skillSlot.value === 'sight words') {
    sightWordsQuestion.call(this)
  } else {
    const speech = templates.unknown_skill({skill: skillSlot.value})
    this.response.speak(speech).listen(speech)
    this.emit(':responseReady')
  }
}

const sightWordsQuestion = function (answerSpeech) {
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
  this.response.speak((answerSpeech ? answerSpeech : ' ') + speech).listen(hintSpeech ? hintSpeech : speech)
  this.emit(':responseReady')
}

const sightWordsAnswer = function () {
  const words = this.attributes.sightWords.words
  const word = this.attributes.sightWords.word
  assert(word)

  const answerSlot = helpers.slot(this, 'word')
  assert(answerSlot)

  console.log(`The user responded with: ${answerSlot.value}`)

  const isCorrect = resources.isAcceptable(word, answerSlot.value)
  const context = {
    answer: answerSlot.value,
    word: word,
    correct: isCorrect
  }

  if (isCorrect) {
    this.attributes.sightWords.words = _.without(words, word)
  }

  sightWordsQuestion.call(this, templates.sight_words_answer(context))
}

const sightWordsHandlers = {
  'SightWordsAnswer': sightWordsAnswer
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
  'Reset': reset
}

//
// Utils.
//

const getDisplayTemplate = function (params = {}) {
  const builder = new Alexa.templateBuilders.BodyTemplate1Builder()
  const primaryRichText = params.primary ? textUtils.makeRichText(params.primary) : undefined
  // const secondaryRichText = params.secondary ? textUtils.makeRichText(params.secondary) : undefined
  // const tertiaryRichText = params.tertiary ? textUtils.makeRichText(params.tertiary) : undefined
  builder.setTitle(params.title ? params.title : DEFAULT_TITLE)
  builder.setBackButtonBehavior('HIDDEN')
  builder.setTextContent(primaryRichText, null, null)
  if (params.background) {
    builder.setBackgroundImage(makeImage(params.background))
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
  for (let k of Object.keys(commonHandlers)) {
    if (includeNewSession === false && k === 'NewSession') {
      continue
    }

    if (!o[k]) {
      o[k] = commonHandlers[k]
    }
  }
  return o
}

function createStateHandler(state, handlers) {
  return Alexa.CreateStateHandler(state, extend(handlers))
}

function createHandler(handlers) {
  return extend(handlers, false)
}

function random(max) {
  assert(max)
  return Math.floor(Math.random() * max)
}

/**
 * Handler function.
 */
module.exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context, callback)
  alexa.appId = 'amzn1.ask.skill.e095a6af-12cd-4398-b46e-07ab3410d96f'
  alexa.dynamoDBTableName = 'alexa-reading'
  alexa.registerHandlers(createHandler(defaultHandlers), createStateHandler('sight-words', sightWordsHandlers))
  alexa.execute()
}
