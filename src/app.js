const {UserSchema} = require('./yup');
const translate = require('./i18n');

function test(schema, ob) {
  try {
    const res = schema.validateSync(ob, {
      abortEarly: false
    });
    console.log(res);
  }
  catch(err) {
    console.log(err);
  }
}

test(UserSchema, {});