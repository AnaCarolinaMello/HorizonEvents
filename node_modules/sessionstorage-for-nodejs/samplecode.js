const sessionStorage = require('./index.js');

sessionStorage.setItem('id', 'value');

console.log('product', sessionStorage.getItem('foo'));

sessionStorage.removeItem('id', 'value');

