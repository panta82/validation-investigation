const yup = require('yup');

const ERR = require('../../error_codes');

const StreetAddressSchema = {
  address_line_1: yup.string().required(ERR.street_address_required),
  address_line_2: yup.string(),
  city: yup.string().min(2, ERR.street_address_city_length)
};

const PhoneSchema = {
  calling_hours: yup
    .string()
    .matches(/[0-9]+-[0-9]+/, ERR.phone_calling_hours_format),
  number: yup.string().required(ERR.phone_number_required)
};

const IdentitySchema = {
  name: yup.string().required(ERR.identity_name_required),
  primary_address: yup
    .object(StreetAddressSchema)
    .required(ERR.identity_primary_address_required),
  secondary_address: yup.object(StreetAddressSchema).nullable(true),
  phone_numbers: yup
    .array()
    .of(yup.object(PhoneSchema))
    .required(ERR.identity_at_least_one_phone_number_required)
};

const UserSchema = {
  username: yup.string().required(ERR.user_username_required),
  identities: yup
    .array()
    .of(yup.object(IdentitySchema))
    .required(ERR.user_at_least_one_identity_required)
};

module.exports = {
  UserSchema: yup.object(UserSchema),
};
