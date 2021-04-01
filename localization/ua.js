module.exports = {
	type: (value) => `не ${value}`,
	required: (value) => `обов'язкове поле "${value}"`,

	minimum: (value) => `не менше нiж ${value}`,
	maximum: (value) => `не бiльше нiж ${value}`,
	multipleOf: (value) => `не кратне ${value}`,

	minLength: (value) => {
		let text = `не коротше нiж ${value} символ`;
		if (value === 1) {
			return text;
		}
		if (value >= 2 && value <= 4) {
			text += 'a';
		} else {
			text += 'ів';
		}
		return text;
	},
	maxLength: (value) => {
		let text = `не довше нiж ${value} символ`;
		if (value === 1) {
			return text;
		}
		if (value >= 2 && value <= 4) {
			text += 'a';
		} else {
			text += 'ів';
		}
		return text;
	},
	minItems: (value) => {
		let text = `не менше нiж ${value} елемент`;
		if (value === 1) {
			return text;
		}
		if (value >= 2 && value <= 4) {
			text += 'a';
		} else {
			text += 'ів';
		}
		return text;
	},
	maxItems: (value) => {
		let text = `не бiльше нiж ${value} елемент`;
		if (value === 1) {
			return text;
		}
		if (value >= 2 && value <= 4) {
			text += 'a';
		} else {
			text += 'ів';
		}
		return text;
	},
	uniqueItems: () => 'наявні ідентичні значення',

	format: (value) => `необхідна відповідність формату ${value}`,
	pattern: (value) => `необхідна відповідність зразку ${value}`,
	enum: () => 'не дорівнює одному із заданих значень',
	const: () => 'не дорівнює заданому значенню'
};
