Array.prototype.indexOf = Array.prototype.indexOf || function(el) {
	var len = this.length;
	if (len == 0) return -1;
	for(var i = len; i--;){
		if(this[i] == el){
			return i;
		}
	}
	return -1;
}


Array.prototype.reduce = Array.prototype.reduce || function(callback, opt) {
	if (null === this || 'undefined' === typeof this) {
		throw new TypeError('Array.prototype.reduce called on null or undefined');
	}
	if ('function' !== typeof callback) {
		throw new TypeError(callback + ' is not a function');
	}
	var i = 0, len = this.length >>> 0, val, isValSet = false;
	if (1 < arguments.length) {
		val = opt;
		isValSet = true;
	}
	for ( ; len > i; ++i) {
		if (!this.hasOwnProperty(i)) continue;
		if (isValSet) {
			val = callback(val, this[i], i, this);
		} else {
			val = this[i];
			isValSet = true;
		}
	}
	if (!isValSet) {
		throw new TypeError('Reduce of empty array with no initial value');
	}
	return val;
};


String.prototype.trim = String.prototype.trim || function() {
	if (!this) return this;
	return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}