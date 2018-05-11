'use strict'
/* global describe, it */

const assert = require('assert')

describe('Joi', () => {
  it('should exist', () => {
    assert(global.app.api.policies['Joi'])
  })
})
