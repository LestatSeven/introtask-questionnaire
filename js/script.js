(function() {
	var elBody = document.getElementsByTagName('body')[0];


	/*  ----------------
		helper functions
		----------------
	*/


	/* fill progress bar */
	function fillProgress() {
		var el = document.getElementById('bar'),
			total = Local.state[1].length,
			filled = 0;

		for(var i = total; i--;) {
			if(Local.state[1][i]) {
				filled++;
				setChecked(Local.state[0][i], true);
			} else {
				setChecked(Local.state[0][i], false);
			}
		}

		el.style.height = elBody.offsetHeight / total * filled + 'px';
		el.querySelector('.marker').innerHTML = parseInt(filled * 100 / total, 10) + '%';
	}


	/* set question as checked / unchecked */
	function setChecked(id, val) {
		var ic = document.getElementById(id),
			tg = ic.parentNode;

		if(val) {
			tg.className = 'trigger' + (tg.className == 'trigger ic-red' ? ' ic-red' : ' ic-green');
			ic.className = 'icon-ok';
		} else {
			tg.className = 'trigger' + (tg.className == 'trigger ic-red' ? ' ic-red' : '');
			ic.className = tg.className.indexOf('ic-red') !== -1 ? 'icon-plus-sign' : 'icon-minus-sign';
		}
	}

	/* set error class to invalidated question */
	function setErrClass(el, val) {
		var curClass = el.className,
			origClass = curClass.indexOf('errel') !== -1 ? curClass.substr(0, curClass.indexOf("errel") - 1) : curClass;

		el.className = val ? origClass + ' errel' : origClass;
	}

	/* collapse blocks */
	function collapse(tg, col) {
		var ic = tg.querySelector('span'),
			content = col.querySelector('div');

		if(ic.className == 'icon-ok') {
			if(tg.className == 'trigger ic-green') {
				tg.className = 'trigger ic-red';
				content.style.display = 'none';
				setTimeout(function () {
					content.style.opacity = 0;
				});
			} else {
				tg.className = 'trigger ic-green';
				content.style.display = 'block';
				setTimeout(function () {
					content.style.opacity = 1;
				});
			}
		} else {
			if(tg.className == 'trigger') {
				ic.className = 'icon-plus-sign';
				tg.className = 'trigger ic-red';
				content.style.display = 'none';
				setTimeout(function () {
					content.style.opacity = 0;
				});
			} else {
				ic.className = 'icon-minus-sign';
				tg.className = 'trigger';
				content.style.display = 'block';
				setTimeout(function () {
					content.style.opacity = 1;
				});
			}
		}
	}

	/* get file size (c.) Captain Obvious */
	function getFileSize(elem) {
		if(undefined !== elem.files) {
			getFileSize = function(elem) {
				var files = elem.files;
				return !!files.length ? files[0].size : 0;
			}
			// strange, but after redefine itself, function doesn't work at first time
			var files = elem.files;
			return !!files.length ? files[0].size : 0;
		} else {
			getFileSize = function(elem) {
				var fileObj = new ActiveXObject("Scripting.FileSystemObject");
				try {
					var file = fileObj.GetFile(elem.value);
					return file.Size;
				} catch(e) { return 0; }
			}
			var fileObj = new ActiveXObject("Scripting.FileSystemObject");
			try {
				var file = fileObj.GetFile(elem.value);
				return file.Size;
			} catch(e) { return 0; }
		}
		getFileSize(elem);
	}

	/* little ajax helper */
	function ajax() {
		this.request = null;
		try {
			this.request = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				this.request = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (E) {
				this.request = false;
			}
		}
		if (!this.request && 'undefined' != typeof XMLHttpRequest) {
			this.request = new XMLHttpRequest();
		}
		this.send = function(options, success, error) {
			var method = options.method,
				url = options.url,
				params = options.params;

			var u = method == 'GET' ? url + '?' + params : url;
			this.request.open(method, u, true);
			this.request.send(method == 'GET' ? null : params);
			var req = this.request;
			this.request.onreadystatechange = function() {
				if(4 == req.readyState) {
					if (200 == req.status) {
						if('function' == typeof success) success(req.responseText);
					} else {
						if('function' == typeof error) error(req);
					}
				}
			}
		}
	}




	/*  ----------
		set events
		----------
	*/
	function initEvents() {
		var elTrigger = document.querySelectorAll('.trigger'),
			elHead = document.querySelectorAll('.head_content'),
			tLen = elTrigger.length,
			hLen = elHead.length,
			elsToValidate = [];


		/* collapse blocks on head_content click */
		for(var i = tLen; i--;) {
			Events.add(elTrigger[i], 'click', (function() {
				var current = elHead[i];
				return function() {
					collapse(this, current);
				}
			})());
		}

		for(var i = hLen; i--;) {
			/* collapse blocks on trigger click */
			var le = elHead[i].getElementsByTagName('h3')[0];
			Events.add(le, 'click', (function() {
				var scThis = le.parentNode.parentNode.querySelector('.trigger'),
					scCurrent = elHead[i];
				return function() {
					collapse(scThis, scCurrent);
				}
			})());


			/* set localstorage on change content */
			var textarea = elHead[i].querySelector('textarea');
			if(['q_task1', 'q_task2', 'q_task3'].indexOf(textarea.name) == -1) {
				Events.add(textarea, 'change', function() {
					Local.set(this.name, this.value);
					fillProgress();
				});
			} else {
				elsToValidate.push(textarea);
				Events.add(textarea, 'change', (function() {
					var t = textarea,
						err = t.parentNode.querySelector('.err');
					return function() {
						new Validator().set({
							value: t.value,
							message: 'Пожалуйста, заполните поле'
						}).validate('isEmpty').callback(function(self) {
							if(!self.result) {
								err.innerHTML = self.message;
								setErrClass(t, true);
							} else {
								err.innerHTML = '';
								setErrClass(t, false);
							}
						});
						Local.set(t.name, t.value);
						fillProgress();
					}
				})());
			}
		}


		/* on change file input */
		var flfrms = document.querySelector('.filefrm'),
			inp = flfrms.querySelector('.inp');

		/* put filename into fake label */
		elsToValidate.push(inp);
		Events.add(inp, 'change', function() {
			var lbl = this.parentNode.querySelector('.lbl'),
				str = this.value,
				flname = '';
			if(str.indexOf('\\') !== -1) {
				flname = str.substr(str.lastIndexOf('\\') + 1);
				} else {
				flname = str.substr(str.lastIndexOf('/') + 1);
			}
			lbl.innerHTML = flname;
		/* validate value */
		}).add(inp, 'change', function() {
			var fileSize = getFileSize(this),
				err = this.parentNode.parentNode.querySelector('.err');
			new Validator().set({
				value: this.value,
				message: 'Пожалуйста, выберите файл'
			}).validate('isEmpty').callback(function(self) {
				if(!self.result) {
					err.innerHTML = self.message;
					setErrClass(flfrms, true);
				} else {
					err.innerHTML = '';
					setErrClass(flfrms, false);
				}
			}).set({
				value: fileSize / 1024,
				max: 250,
				message: 'Файл слишком большого размера'
			}).validate('isBetween').callback(function(self) {
				if(!self.result) {
					err.innerHTML = self.message;
					setErrClass(flfrms, true);
				} else {
					err.innerHTML = '';
					setErrClass(flfrms, false);
				}
			}).set({
				value: this.value,
				message: 'Запрещенный формат файла'
			}).validate(/\.(zip|rar|tar|gz|7z|gif|jpg|jpeg|png|eml|exe|m4a|ogg|mp3|wav|wma|flv|mov|wmv|mp4|avi|xls|doc|ocx|txt|pdf|ppt)$/i).callback(function(self) {
				if(!self.result) {
					err.innerHTML = self.message;
					setErrClass(flfrms, true);
				} else {
					err.innerHTML = '';
					setErrClass(flfrms, false);
				}
			});
		});


		/* validate fio */
		var vFio = document.getElementsByName('a_fio')[0];
		elsToValidate.push(vFio);

		Events.add(vFio, 'change', function() {
			var err = this.parentNode.parentNode.querySelector('.err');
			new Validator().set({
				value: this.value,
				message: 'Пожалуйста, укажите свои Имя и Фамилию'
			}).validate('isEmpty').callback(function(self) {
				if(!self.result) {
					err.innerHTML = self.message;
					setErrClass(vFio, true);
				} else {
					err.innerHTML = '';
					setErrClass(vFio, false);
				}
			});
		});


		/* validate e-mail */
		var vMail = document.getElementsByName('a_mail')[0];
		elsToValidate.push(vMail);

		Events.add(vMail, 'change', function() {
			var err = this.parentNode.parentNode.querySelector('.err');
			new Validator().set({
				value: this.value,
				message: 'Пожалуйста, укажите свой e-mail'
			}).validate('isEmail').callback(function(self) {
				if(!self.result) {
					err.innerHTML = self.message;
					setErrClass(vMail, true);
				} else {
					err.innerHTML = '';
					setErrClass(vMail, false);
				}
			});
		});


		/* validate select */
		var vWh = document.getElementsByName('a_wh')[0];
		elsToValidate.push(vWh);
		Events.add(vWh, 'change', function() {
			var val = this.options[this.options.selectedIndex].value,
				notValid = this.options[0].value,
				err = this.parentNode.parentNode.querySelector('.err');
			new Validator().set({
				value: val,
				equal: notValid,
				message: 'Пожалуйста, укажите, откуда вы узнали о предложении'
			}).validate('isEqual').callback(function(self) {
				if(self.result) {
					err.innerHTML = self.message;
					setErrClass(vWh, false);
				} else {
					err.innerHTML = '';
					setErrClass(vWh, false);
				}
			});
		});


		/* submit form */
		var form = document.getElementsByTagName('form')[0];
		Events.add(form, 'submit', function(e) {
			var evt = e || window.event,
				err = [],
				elsLen = elsToValidate.length;

			for(var i = elsLen; i--;) {
				Events.call(elsToValidate[i], 'change');
				err.push('' !== elsToValidate[i].parentNode.parentNode.querySelector('.err').innerHTML ? false : true);
			}
			if(err.indexOf(false) !== -1) {
				if(evt.preventDefault) {
					evt.preventDefault();
				} else {
					evt.returnValue = false;
				}
				if(evt.stopPropagation) {
					evt.stopPropagation()
				} else {
					evt.cancelBubble = true;
				}
			}						
		});

		var sbmtbtn = document.querySelector('.sbmtbtn'),
			sbmtbtn_fake = document.querySelector('.sbmtbtn_fake');
		Events.add(sbmtbtn_fake, 'click', function(e) {
			Events.call(sbmtbtn, 'click');
		});

	}




	/*  ----------------
		render templates
		---------------- 
	*/

	function initTpl() {
		var aj = new ajax();
		aj.send({method: 'GET', url: './js/data.json', params: ''}, function(data) {
			var json = eval("(" + data + ")");
			var m = Mustache.render(elBody.innerHTML, json),
				s = m.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x2F;/g, '/').replace(/&#039;/g, '\'');
			elBody.innerHTML = s;
			fillProgress();
			initEvents();
		}, function(err) {
			console.log(err);
		});
	}

	initTpl();

}());