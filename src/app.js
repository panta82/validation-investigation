const path = require('path');

const testers = {
  yup: require('./yup/yup_tester').testYup,
  validate: require('./validate/validate_tester').testValidate,
  ajv: require('./ajv/ajv_tester').testAjv,
};

if (process.argv[2] === '-h' || process.argv[2] === '--help') {
  console.log(`
Usage: ${path.basename(process.argv[0])} [-h|--help] <tester>

where <tester> can be one of ${Object.keys(testers).join(', ')}`);
  process.exit(0);
}

const tester = testers[process.argv[2] || 'ajv'];
if (!tester) {
  console.error(`Invalid tester: ${process.argv[2]}`);
  process.exit(1);
}

tester();