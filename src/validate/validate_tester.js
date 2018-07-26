const { UserSchema } = require("./validate_schemas");
const translate = require("../i18n");

// Poor documentation
// Doesn't stop recursing into sub-schemas

function test(schema, ob) {
	try {
		const errors = schema.validate(ob);
		if (errors) {
			errors.forEach(err => {
				console.log(err);
			});
		}
	} catch (err) {
		console.log(err);
	}
}

function testValidate() {
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
	testValidate
};