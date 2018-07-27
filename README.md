# Validation

http://node-modules.com/search?q=validation

### Joi

https://github.com/hapijs/joi

- Best supported, most current
- No custom error messages
    - https://github.com/hapijs/joi/issues/1434
    - https://medium.com/@Yuschick/building-custom-localised-error-messages-with-joi-4a348d8cc2ba
- No browser support
- Good docs

### Ajv

https://github.com/epoberezkin/ajv

- Very popular
- Uses JSON schema (a bit too fiddly?)
- Can add documentation for properties
- No custom errors, but can be casted using a modue with ugly interface
    - https://github.com/epoberezkin/ajv-errors
- Ok docs for ajv itself, but AWFUL for JSON schema
    - https://ajv.js.org
    - https://jsonschema.net/
    - https://spacetelescope.github.io/understanding-json-schema/index.html

### Yup

https://github.com/jquense/yup

- All the features we need (including help messages)
- Not as popular as others, but seems to be going up
- Will have to create custom help page display, api spec serving
- Will have to fix a few bugs or bad quirks in a wrapper
- Fluent api, pleasent to use but non-portable?
- Good docs

### Validate

https://github.com/eivindfjeldstad/validate

- Not very popular, but in active development
- Custom errors
- Doesn't stop validating missing schemas (same as yup)
- Awful documentation, doesn't instill confidence

### Validate.js

http://validatejs.org/

- Good declarative interface, support for custom messages
- Browser support
- Good documentation
- No nested schemas
- No casting the result object, whitelisting
- Seems abandoned

### spected

https://github.com/25th-floor/spected

TODO

### schema-inspector

https://github.com/Atinux/schema-inspector

- Unmaintained



