const Schema = require('validate.js');

const ERR = require('../error_codes');

const StreetAddressSchema = {
  address_line_1: {
    presence: {
      message: ERR.street_address_required 
    }, 
  },
  
  address_line_2: {},
  
  city: {
    presence: {
      message: ERR.street_address_city_length
    },
    length: {
      minimum: 2,
      message: ERR.street_address_city_length
    },
  }
};

const PhoneSchema = {
  calling_hours: {
    format: {
      pattern: /^[0-9]+-[0-9]+$/,
      message: ERR.phone_calling_hours_format
    }
  },
  number: {
    presence: {
      message: ERR.phone_number_required
    }
  }
};

const IdentitySchema = {
  name: {
    presence: {
      message: ERR.identity_name_required
    },
  },
  primary_address: {
  	schema: StreetAddressSchema,
		presence: {
      message: ERR.identity_primary_address_required
    },
	},
  secondary_address: {
		schema: StreetAddressSchema,
	},
  phone_numbers: {
  	type: Array,
		each: PhoneSchema,
		presence: true,
		message: ERR.identity_at_least_one_phone_number_required
	}
};

const UserSchema = {
  username: {
  	type: String,
		presence: true,
		message: ERR.user_username_required
	},
  identities: {
  	type: Array,
		each: IdentitySchema,
		required: true,
		message: ERR.user_at_least_one_identity_required
	}
};

module.exports = {
  UserSchema: new Schema(UserSchema),
};
