"use strict"

const assert = require('assert')

/**
 * Retrieve the intent object from the context.
 * @param context - the skill handlers context.
 * @returns {Object} the intent object from the context or nuil if there was no intent.
 */
function getIntent(context) {
  assert(context)
  if (context && context.event && context.event.request && context.event.request.intent) {
    return context.event.request.intent
  } else {
    return null
  }
}

/**
 * Retrieve the current intent name from the context.
 * @param context - the skill handlers context.
 * @returns {String} the current intent name or null if there was no intent.
 */
function getIntentName(context) {
  const intent = getIntent(context)
  if (intent) {
    return intent.name
  } else {
    return null
  }
}

/**
 * Retrieve the slots object from the context.
 * @param context = the skill handlers context.
 * @returns {Object} the slots object or null if none were preaent.
 */
function getSlots(context) {
  const intent = getIntent(context)
  if (intent) {
    return intent.slots
  } else {
    return null
  }
}

/**
 * Retrieve a slot value.
 * @param context - the skills context.
 * @param slot - the slot name.
 * @returns {String} - the slot value or null.
 */
function getSlot(context, slot) {
  const slots = getSlots(context)
  if (slots) {
    return slots[slot]
  } else {
    return null
  }
}

/**
 * Return whether the device supports a display.
 * @param ctx - the context.
 * @returns true if the device supports a display, false otherwise.
 */
function supportsDisplay(ctx) {
  return ctx.event.context &&
    ctx.event.context.System &&
    ctx.event.context.System.device &&
    ctx.event.context.System.device.supportedInterfaces &&
    ctx.event.context.System.device.supportedInterfaces.Display
}

exports.intent = getIntent
exports.intentName = getIntentName
exports.slots = getSlots
exports.slot = getSlot
exports.supportsDisplay = supportsDisplay
