const joi = require('joi');

const ERR = require('../../error_codes');

// NOTE: No custom error messages?!

const StreetAddressSchema = {
  address_line_1: joi.string().required(ERR.street_address_required),
  address_line_2: joi.string(),
  city: joi.string().min(2, ERR.street_address_city_length)
};

const PhoneSchema = {
  calling_hours: joi
    .string()
    .matches(/[0-9]+-[0-9]+/, ERR.phone_calling_hours_format),
  number: joi.string().required(ERR.phone_number_required)
};

const IdentitySchema = {
  name: joi.string().required(ERR.identity_name_required),
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
