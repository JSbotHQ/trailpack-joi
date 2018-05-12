'use strict'

const Trailpack = require('trailpack')
const _ = require('lodash')

module.exports = class JoiTrailpack extends Trailpack {

  /**
   * TODO document method
   */
  validate () {

    if (!_.includes(_.keys(this.app.packs), 'express')) {
      return Promise.reject(new Error('This Trailpack only works for express'));
    }
    if (!this.app.config.validators) {
      return Promise.reject(new Error('There not config.validators !'))
    }
    return Promise.resolve();
  }

  /**
   * TODO document method
   */
  configure () {

    return Promise.resolve()
  }

  /**
   * TODO document method
   */
  initialize () {
    return Promise.resolve()
  }

  constructor (app) {
    super(app, {
      config: require('./config'),
      api: require('./api'),
      pkg: require('./package')
    })
  }
}

