module.exports = {
	type: (value) => `не ${value}`,
	required: (value) => `обязательное поле "${value}"`,

	minimum: (value) => `не менее ${value}`,
	maximum: (value) => `не более ${value}`,
	multipleOf: (value) => `не кратно ${value}`,

	minLength: (value) => {
		let text = `не короче чем ${value} символ`;
		if (value === 1) {
			return text;
		}
		if (value >= 2 && value <= 4) {
			text += 'a';
		} else {
			text += 'ов';
		}
		return text;
	},
	maxLength: (value) => {
		let text = `не дольше чем ${value} символ`;
		if (value === 1) {
			return text;
		}
		if (value >= 2 && value <= 4) {
			text += 'a';
		} else {
			text += 'ов';
		}
		return text;
	},
	minItems: (value) => {
		let text = `не меньше чем ${value} элемент`;
		if (value === 1) {
			return text;
		}
		if (value >= 2 && value <= 4) {
			text += 'a';
		} else {
			text += 'ов';
		}
		return text;
	},
	maxItems: (value) => {
		let text = `не больше чем ${value} элемент`;
		if (value === 1) {
			return text;
		}
		if (value >= 2 && value <= 4) {
			text += 'a';
		} else {
			text += 'ов';
		}
		return text;
	},
	uniqueItems: () => 'присутствуют идентичные значения',

	format: (value) => `необходимо соответствие формату ${value}`,
	pattern: (value) => `необходимо соответствие образцу ${value}`,
	enum: () => 'не равно одному из заданных значений',
	const: () => 'не равно заданному значению'
};
