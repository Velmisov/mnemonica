'use strict';

module.exports = (instance) => {
	if (!instance) {
		throw new Error('this does not exists');
	}
	const extracted = {};
	for (const name in instance) {
		extracted[name] = instance[name];
	}
	return extracted;
};