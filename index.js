const isObject = require('lodash/isObject');
const isArray = require('lodash/isArray');
const isString = require('lodash/isString');
const merge = require('lodash/merge');
const transform = require('lodash/transform');

const defaultKeywordMap = require('./localization/index');

const _isObject = (v) => isObject(v) && !isArray(v);

const noStringsAsKeyValues = (obj) => {
	!Object.values(obj).some((v) => isString(v));
};

/**
	@param {Object} schema - ajv schema
	@param {String} locale - Error messages locale, defaults to 'ua'
	@param {Array} [customErrorKeywords]
	@param {Object} [customKeywordMap]
	@param {Object} customKeywordMap.locale - ua, ru, en ...
	@param {Function} customKeywordMap.locale.someKeyword - e.g.
		{ ua: { someKeyword: (someKeywordVal) => `some error ${someKeywordVal}` } }
*/
const getSchemaErrors = (schema, locale = 'ua', customErrorKeywords = [], customKeywordMap = {}) => {
	if (!isArray(customErrorKeywords)) {
		throw new Error('customErrorKeywords should be an array');
	}
	if (!_isObject(customKeywordMap)) {
		throw new Error('customKeywordMap should be and object');
	}
	let keywordMap = merge(defaultKeywordMap, customKeywordMap);
	let properties = (schema && schema.errorMessage && schema.errorMessage.properties) || null;
	return _getSchemaErrors(schema, properties, locale, customErrorKeywords, keywordMap);
};

/**
	@param {Object} schema - ajv schema
	@param {(Object|null)} errorMessageProperties
	@param {String} locale - Error messages locale, defaults to 'ua'
	@param {Array} [customErrorKeywords]
	@param {Object} [keywordMap]

	The function iterates over ajv schema providing default error messages for keywords.
*/
const _getSchemaErrors = (schema, errorMessageProperties, locale = 'ua', customErrorKeywords = [], keywordMap) => {
	if (!(schema && _isObject(schema)) || isString((schema || {}).errorMessage)) {
		return schema;
	}

	Object.keys(schema).map((key) => {
		let getErrorText = keywordMap[locale][key];
		/*
			Handle those custom keywords, represented by an object i.e.:
			someCustomKeyword: { $data: '1' }
		*/
		if (customErrorKeywords.includes(key)) {
			let shouldAddNewErrorMessage = getErrorText && !(schema.errorMessage || {})[key];
			if (shouldAddNewErrorMessage) {
				Object.assign(schema, {
					errorMessage: {
						...(schema.errorMessage || {}),
						[key]: getErrorText(schema[key], key)
					}
				});
			}
		} else if (key === 'required' && isArray(schema[key])) {
			Object.assign(schema, {
				errorMessage: {
					...(schema.errorMessage || {}),
					[key]: schema[key].reduce(
						(res, val) => ({
							...res,
							[val]: getErrorText(val, key)
						}),
						{}
					)
				}
			});
		}
	});

	return transform(schema, (res, value, key) => {
		if (key === 'errorMessage') {
			res[key] = res.errorMessage || value;
			return;
		}

		/*
			errorMessage.properties are passed down from parent schema, in order to
			skip adding keyword errors to those properties, defined in errorMessage.properties.

			When a new nested properties object is reached, errorMessageProperties are replaced
			with new ones, example:

			{
				properties: {

					// on this level errorMessageProperties === { foo: 'error for foo' },
					// thus 'foo' is skipped

					foo: { type: 'string' },
					bar: { type: 'string' },
					baz: {
                        type: 'object',
						properties: {

                            // on this level errorMessageProperties === { foo: 'nested error for foo' },
                            // thus 'foo' is skipped

							foo: { type: 'number' },
							bar: { type: 'number' }
						},
						errorMessage: { properties: { foo: 'nested error for foo' } }
					}
				},
				errorMessage: { properties: { foo: 'error for foo' } }
			}

			noStringsAsKeyValues assures that 'properties' object that is reached is a parent,
			assuming that a parent can't have srings as key values, example:

            {
                properties: {
                    foo: { type: 'string' },
                    allOf: [{ ... }],

                    // not a parent
                    properties: { 'type': 'number' }

                    // error
                    bar: 'baz'
                },
                errorMessage: { ... }
            }

			https://github.com/ajv-validator/ajv-errors#messages-for-properties-and-items
			https://github.com/ajv-validator/ajv-errors#messages-for-keywords
		*/

		if (_isObject(value) && value.properties && noStringsAsKeyValues(value.properties)) {
			errorMessageProperties = (value.errorMessage || {}).properties;
		}

		if (_isObject(value) && (errorMessageProperties || {})[key]) {
			res[key] = value;
			return;
		}

		if (_isObject(value)) {
			res[key] = _getSchemaErrors(value, errorMessageProperties, locale, customErrorKeywords, keywordMap);
			return;
		}

		if (isArray(value) && ['oneOf', 'allOf', 'anyOf'].includes(key)) {
			res[key] = value.map((v) => _getSchemaErrors(v, errorMessageProperties, locale, customErrorKeywords, keywordMap));
			return;
		}

		let getErrorText = keywordMap[locale][key];
		let shouldAddNewErrorMessage = getErrorText && !(schema && schema.errorMessage && schema.errorMessage[key]);

		Object.assign(res, {
			[key]: value,
			...(shouldAddNewErrorMessage
				? {
						errorMessage: {
							...(schema.errorMessage || {}),
							...(res.errorMessage || {}),
							[key]: getErrorText(value, key)
						}
				  }
				: {})
		});
	});
};

module.exports = getSchemaErrors;
