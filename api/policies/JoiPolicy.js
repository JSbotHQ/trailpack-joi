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
      let config = validators.config || {}
      if(!validation) throw new Error('please provide validation in config/validators.js')
      let [module, schema] = validation.split('.')

      let Validator = new Schemas[module];

      if (!Validator || !Validator[schema]) {
        throw new Error("Validator not found for this route, Please check your routeId (id)")
      }

      Joi.validate(req.body, Validator[schema](), (err, value) => {
        if(config.byPassError){
          if(!_.isEmpty(err.details)){
            let allPaths = err.details.map(e=>e.path.split('.'))
            let uniquePaths = [], validationErrors=[]
            allPaths.map((p,pindex)=>{
              let pArr = p
              pArr.pop()
              if(!pindex){
                uniquePaths.push(pArr)
              }
              else {
                //console.log(`pArr `,pArr)
                let diff = uniquePaths.findIndex(u=>{
                  return _.isEmpty(_.differenceWith(pArr,u, _.isEqual))
                })
                if(diff===-1) uniquePaths.push(pArr)
              }
            })
            uniquePaths.map(u=>{
              validationErrors.push({
                path:u.join('.'),
                paths:u,
                keys:[]
              })
            })
            err.details.map(d=>{
              d.paths = d.path.split('.')
              d.paths.pop()
              let index = validationErrors.findIndex(u=>{
                return _.isEmpty(_.differenceWith(d.paths,u.paths, _.isEqual))
              })
              if(index>-1){
                validationErrors[index].keys = validationErrors[index].keys.concat([d.context.key])
              }
            })
            req.validationErrors = validationErrors
            let newBody = Object.assign({},req.body)
            validationErrors.map(d=>{
              let keys = d.paths
              let prop = keys.pop();
              let parent =keys.reduce((n, key) => n[key], newBody);
              delete parent[prop];
            })
            req.newBody = newBody
          }
        }
        else{
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

