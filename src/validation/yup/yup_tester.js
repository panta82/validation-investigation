const { UserSchema } = require("./yup_schemas");
const translate = require("../../i18n");

/**
 * @param {ValidationError[]} errors
 */
function processValidationErrors(errors) {
  // Filter out duplicates for .required() validator against arrays
  // https://github.com/jquense/yup/issues/261
  const seenErrors = {};
  const result = [];
  
  errors.forEach(err => {
    if (err.type === "required" && err.path && seenErrors[err.path]) {
      return;
    }
    seenErrors[err.path] = true;
    
    err.id = err.message;
    err.message = translate("errors." + err.id);
    
    result.push(err);
  });
  
  return result;
}

function test(schema, ob) {
  try {
    const res = schema.validateSync(ob, {
      abortEarly: false,
      stripUnknown: true,
    });
    console.log(res);
  } catch (err) {
    const errors = processValidationErrors(err.inner || [err]);
    errors.forEach(err => {
      console.log(
        String(err.id).padEnd(50),
        err.message.padEnd(50),
        err.type,
        err.path
      );
    });
  }
}

function testYup() {
  //test(UserSchema, {});
  
  // Problem: when "secondary_address" is undefined, it recurses into a fictional object and throws
  // street_address_required for identities[0].secondary_address.address_line_1
  // (instead of stopping)
  // Would have to use something flakey, like custom test function
  
  test(UserSchema, {
    whatsThis: '!??',
    identities: [{
      secondary_address: undefined
    }]
  });
}

module.exports = {
  testYup
};