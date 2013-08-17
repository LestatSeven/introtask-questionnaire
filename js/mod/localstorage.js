	var Local = {
		state: [[],[]],
		get: function (key) {
			var i = this.state[0].indexOf(key);
			if(i == -1) {
				this.state[0].push(key);
				this.state[1].push(false);
				i = this.state[0].length-1;
			}

			try {
				var ls = localStorage[key];
				if([undefined, ''].indexOf(ls.trim()) == -1) {
					this.state[1][i] = true;
					return ls;
				}
			} catch(e) {
				return '';
			}
		},
		set: function (key, val) {
			var i = this.state[0].indexOf(key);
			if(val.trim() !== '') {
				this.state[1][i] = true;
				try {
					localStorage.setItem(key, val);
				} catch(e) {};
			} else {
				this.state[1][i] = false;
				try {
					localStorage.removeItem(key);
				} catch(e) {};
			}
		}
	}