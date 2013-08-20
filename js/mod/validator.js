Validator = function() {
	this.value = null;
	this.rule = null;
	this.message = null;
	this.returnTo = null;
	this.min = 0;
	this.max = Number.MAX_VALUE;
	this.equal = null;
	this.result = false;
	this.multi = false;
	
	this.set = function(options) {
		if(!this.multi) {
			var opt = options;
			this.value = undefined !== options.value ? options.value : this.value;
			this.rule = undefined !== options.rule ? options.rule : this.rule;
			if(undefined !== options.min || undefined !== options.max) {
				this.min = undefined !== options.min ? options.min : this.min;
				this.max = undefined !== options.max ? options.max : this.max;
			}
			this.equal = undefined !== options.equal ? options.equal : this.equal;
			this.message = undefined !== options.message ? options.message : this.message;
			this.returnTo = undefined !== options.returnTo ? options.returnTo : this.returnTo;
		}

		return this;
	}
	this.validate = function(rule) {
		var val = this.value,
			regExp;
		this.rule = ((undefined !== rule) && (null !== this.rule || this.rule !== rule) ? rule : this.rule);
		if(this.rule instanceof RegExp) {
			this.result = this.rule.test(val);
			if(!this.result) this.multi = true;
			return this;
		}
		switch(this.rule) {
			case 'isEmpty':
				this.result = ('' !== val);
				if(!this.result) this.multi = true;
				return this;
			case 'isNumber':
				regExp = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
				break;
			case 'isDigit':
				regExp = /^\d+$/;
				break;
			case 'isAlphaNum':
				regExp = /^\w+$/;
				break;
			case 'isEmail':
				regExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))){2,6}$/i;
				break;
			case 'isPhone':
				regExp = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;
				break;
			case 'isBetween':
				this.result = ('' !== val) && (val >= this.min) && (val <= this.max);
				if(!this.result) this.multi = true;
				return this;
			case 'isEqual':
				this.result = ('' !== val) && (val == this.equal);
				if(!this.result) this.multi = true;
				return this;
			default:
				this.result = false;
				return this;
		}

		this.result = regExp.test(val);
		if(!this.result) this.multi = true;
		return this;
	}

	this.callback = function(callback) {
		callback(this);
		return this;
	}
}