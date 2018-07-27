const { userSchema } = require("./ajv_schemas");
const translate = require("../i18n");

function test(schema, name, ob) {
  console.log(name + ":");

  try {
    const valid = schema(ob);
    if (valid) {
      console.log(JSON.stringify(ob, null, '  '));
    } else {
      schema.errors.forEach(err => {
        console.error(
          "  ",
          err.dataPath.padEnd(40),
          translate("errors." + err.message)
        );
      });
    }
  } catch (err) {
    console.error("  ", err);
  }

  console.log("");
}

function testAjv() {
  test(userSchema, "Invalid", {
    whatsThis: "!??",
    username: "test",
    identities: [
      {
        primary_address: {
          city: "a"
        },
        secondary_address: undefined
      }
    ]
  });

  test(userSchema, "Valid", {
    whatsThis: "!??",
    username: "test",
    identities: [
      {
        name: 'Identity 1',
        
        primary_address: {
          address_line_1: "Whatever",
          city: "ab"
        },
        secondary_address: undefined,

        phone_numbers: [{ number: "123456" }]
      }
    ]
  });
}

module.exports = {
  testAjv
};
