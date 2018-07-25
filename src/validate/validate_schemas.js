const Schema = require('validate');

const ERR = require('../error_codes');

const StreetAddressSchema = {
  address_line_1: {
    type: String,
    required: true,
    message: ERR.street_address_required
  },
  
  address_line_2: {
    type: String,
  },
  
  city: {
    type: String,
    length: {min: 2},
    message: ERR.street_address_city_length
  }
};

const PhoneSchema = {
  calling_hours: {
    type: String,
    match: /^[0-9]+-[0-9]+$/,
    message: ERR.phone_calling_hours_format,
  },
  number: {
    type: String,
    required: true,
    message: ERR.phone_number_required
  }
};

const IdentitySchema = {
  name: {
    type: String,
    required: true,
    message: ERR.identity_name_required
  },
  primary_address: joi
    .object(StreetAddressSchema)
    .required(ERR.identity_primary_address_required),
  secondary_address: joi.object(StreetAddressSchema).nullable(true),
  phone_numbers: joi
    .array()
    .of(joi.object(PhoneSchema))
    .required(ERR.identity_at_least_one_phone_number_required)
};

const UserSchema = {
  username: joi.string().required(ERR.user_username_required),
  identities: joi
    .array()
    .of(joi.object(IdentitySchema))
    .required(ERR.user_at_least_one_identity_required)
};

module.exports = {
  UserSchema: joi.object(UserSchema),
};
