// src/utils/regex.js

const CIN_REGEX = /^[A-Z]{1,2}[0-9]{6}$/;

const PHONE_REGEX = /^(?:\+212|0)[5-7][0-9]{8}$/;

module.exports = {
  CIN_REGEX,
  PHONE_REGEX,
};