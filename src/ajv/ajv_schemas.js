const Ajv = require('ajv');

const ajv = new Ajv({
  allErrors: true,
  coerceTypes: true,
  removeAdditional: 'all',
  jsonPointers: true
});

require('ajv-errors')(ajv);

const ERR = require('../error_codes');

const SCHEMAS = {
  street_address: 'street_address',
  phone: 'phone',
  identity: 'identity',
  user: 'user',
};

ajv.addSchema({
  $id: SCHEMAS.street_address,
  
  properties: {
    address_line_1: {
      type: 'string',
      title: 'Street address'
    },
    address_line_2: {
      type: 'string'
    },
    city: {
      type: 'string',
      minLength: 2,
      errorMessage: ERR.street_address_city_length
    }
  },
  
  required: [
    'address_line_1',
    'city'
  ],
  
  errorMessage: {
    required: {
      address_line_1: ERR.street_address_required,
      city: ERR.street_address_city_length
    },
  },
});

ajv.addSchema({
  $id: SCHEMAS.phone,
  
  properties: {
    calling_hours: {
      type: 'string',
      pattern: /^[0-9]+-[0-9]+$/.toString(),
      errorMessage: ERR.phone_calling_hours_format
    },
    number: {
      type: 'string',
    },
  },
  
  required: [
    'number',
  ],
  
  errorMessage: {
    required: {
      number: ERR.phone_number_required
    },
  },
});

ajv.addSchema({
  $id: SCHEMAS.identity,
  
  properties: {
    name: {
      type: 'string'
    },
    primary_address: {
      $ref: SCHEMAS.street_address,
    },
    secondary_address: {
      $ref: SCHEMAS.street_address,
    },
    phone_numbers: {
      type: 'array',
      items: {
        $ref: SCHEMAS.phone
      },
      minLength: 1,
      errorMessage: ERR.identity_at_least_one_phone_number_required
    }
  },
  
  required: [
    'name',
    'primary_address',
    'phone_numbers'
  ],
  
  errorMessage: {
    required: {
      name: ERR.identity_name_required,
      primary_address: ERR.identity_primary_address_required,
      phone_numbers: ERR.identity_at_least_one_phone_number_required
    },
  },
});

ajv.addSchema({
  $id: SCHEMAS.user,
  
  properties: {
    username: {
      type: 'string',
    },
    identities: {
      type: 'array',
      items: {
        $ref: SCHEMAS.identity
      },
      minLength: 1,
      errorMessage: ERR.user_at_least_one_identity_required 
    }
  },
  
  required: [
    'username',
    'identities'
  ],
  
  errorMessage: {
    required: {
      username: ERR.user_username_required,
      identities: ERR.user_at_least_one_identity_required,
    },
  },
});

module.exports = {
  userSchema: ajv.getSchema(SCHEMAS.user)
};
