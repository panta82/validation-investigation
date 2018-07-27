# Validation investigation

http://node-modules.com/search?q=validation

### Joi

https://github.com/hapijs/joi

- The most popular that uses fluent API
- Some good automated documentation generators
- No custom error messages. Can be manually shoved in, but it sucks.
    - https://github.com/hapijs/joi/issues/1434
    - https://medium.com/@Yuschick/building-custom-localised-error-messages-with-joi-4a348d8cc2ba
- No browser support
- Good docs

### Ajv

https://github.com/epoberezkin/ajv

- Very popular
- Uses JSON schema (a bit too fiddly?)
- Browser support
- Can add documentation for properties (very good!)
- No custom errors, but can be added using ajv-errors module (ugly API)
    - https://github.com/epoberezkin/ajv-errors
- A lot of docs, but a bit of a mess and all over the place
    - https://ajv.js.org
    - https://jsonschema.net/
    - https://spacetelescope.github.io/understanding-json-schema/index.html
- With correct switches, it seems it produces correct errors for deeply nested schemas

### Yup

https://github.com/jquense/yup

- Not as popular as others, but seems to be going up
- Custom error messages
- Browser support
- We would have to create custom help page display, api spec serving
- Some quirks that needs custom coding to work around
    - https://github.com/jquense/yup/issues/261
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

- Unpopular
- Maintained but no longer updated, it seems

### schema-inspector

https://github.com/Atinux/schema-inspector

- Unmaintained

## JSON schema further steps

AJV, get it to print out schemas with all resolved children?
- https://github.com/epoberezkin/ajv#api

Get DOCA to do without reading JSON-s from HDD (or maybe generate JSONs
on hdd before doing anything else)
- https://github.com/cloudflare/doca
- https://github.com/cloudflare/json-schema-loader
- https://github.com/cloudflare/json-schema-example-loader

