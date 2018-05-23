# trailpack-joi

Trailpack validation for Trails application using joi schema validator

## Install

```sh
$ npm install --save trailpack-joi
```

## Configure

```js
// config/main.js
module.exports = {
  packs: [
    // ... other trailpacks
    require('trailpack-joi')
  ]
}
```

Now create a new directory **schemas** in **/api**

```js
//api/schemas/AuthValidator.js

const Joi = require('joi');

module.exports = class AuthValidator {

  signup() {

    return Joi.object().keys({
      name   : Joi.string().min(1).max(20).regex(/^[a-zA-Z ]+$/)
       .error(new Error('Name can contains only letters')),
      username : Joi.string().min(5).max(50).regex(/^[a-zA-Z0-9]+$/).required()
       .error(new Error('Username should contain letters and numbers, also it should contains min 5 characters')),
      email   : Joi.string().email().min(5).max(50).required()
       .error(new Error('Invalid email')),
      password: Joi.string().trim().min(5).max(20).required()
       .error(new Error('Invalid password')),
      country_code: Joi.string().trim().min(1).max(4).required()
       .error(new Error('Invalid country code')),
      mobile: Joi.string().trim().min(4).max(12).required()
       .error(new Error('Invalid mobile')),
    })
  }
}

```

create **index.js** file for schemas

```js
//api/schemas/index.js
'use strict'

exports.AuthValidator = require('./AuthValidator')

```

Then make sure to add schemas directory in **api/index.js**

```
//api/index.js
...
exports.schemas = require('./schemas')
```

And to configure validators:

```js
// config/validators.js
'use strict'

module.exports = {
  AuthController: {
    signup: 'AuthValidator.signup'
  }
};
```

Then make sure to include the new file in **config/index.js**

```
//config/index.js
...
exports.validators = require('./validators')
```

## Usage

### Policies 
Now you can apply some policies to control schema validation under `config/policies.js` 
```
  AuthController: {
    "signup": ['JoiPolicy.validate'],
  }
```
