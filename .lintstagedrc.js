module.exports = {
  '*': 'prettier --ignore-unknown --write',
  '*.{js,ts}?(x)': 'eslint --fix',
  '*.ts?(x)': () => 'tsc -p ./tsconfig.json',
};
