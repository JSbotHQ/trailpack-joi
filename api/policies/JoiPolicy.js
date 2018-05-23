'use strict'

const Policy = require('trails-policy')
const Joi = require('joi')

/**
 * @module JoiPolicy
 * @description joi policy
 */
module.exports = class JoiPolicy extends Policy {

  /**
   * A policy to validate joi schema
   * @param req
   * @param res
   * @param next
   * @returns {*|void|JSON|Promise<any>}
   */
  validate(req, res, next) {

    const Schemas = this.app.api.schemas
    let { routes, validators } = this.app.config

    try {

      if(!validators || !Object.keys(validators).length) throw new Error('The config/validators.js can\'t be empty')
      let reqMethod = Object.keys(req.route.methods)[0].toUpperCase()
      let { handler } = routes.find(r=>r.path==req.route.path && r.method==reqMethod)
      let [ controller, method ] = handler.split('.')
      let validation = validators[controller][method]
      if(!validation) throw new Error('please provide validation in config/validators.js')
      let [module, schema] = validation.split('.')

      let Validator = new Schemas[module];

      if (!Validator || !Validator[schema]) {
        throw new Error("Validator not found for this route, Please check your routeId (id)")
      }

      Joi.validate(req.body, Validator[schema](), (err, value) => {
        if (err){
          if (err.details && err.details[0].type == 'object.allowUnknown') {
            return res.status(400).json({ flag: false, data: {}, message: err.details[0].message, code: 400 });
          }
          else {
            return res.json({ flag: false, data: {}, message: err.message, code: 400 })
          }
        }
        next();
      })
    }
    catch (e) {
      return res.json({ flag: false, data: {}, message: e.message, code: 500 })
    }
  }
}

