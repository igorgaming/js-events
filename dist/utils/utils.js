'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isEmpty = isEmpty;
exports.splitString = splitString;
exports.wrap = wrap;

function wrap(value) {
  return Array.isArray(value) ? value : [value];
}

function splitString(value) {
  if (typeof value === 'string') {
    return value.split(' ');
  }

  return value;
}

function isEmpty(value) {
  return value == null || value == '';
}