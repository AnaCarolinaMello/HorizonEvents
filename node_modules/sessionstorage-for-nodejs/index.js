const _sessionStorage = {}

const sessionStorage = {
  setItem: (key, value) => _sessionStorage[key] = value,
  getItem: (key) => _sessionStorage[key],
  removeItem: (key) => delete _sessionStorage[key],
}

module.exports = sessionStorage

