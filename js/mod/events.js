Events = (function() {
	function addEvent(elem, evt, func) {
		if (document.addEventListener) {
			addEvent = function(elem, evt, func) {
				elem.addEventListener(evt, func, false);
			}
		} else if (document.attachEvent) {
			addEvent = function(elem, evt, func) {
				elem.attachEvent('on' + evt, function() { func.call(elem); });
			}
		} else {
			addEvent = function(elem, evt, func) {
				elem['on' + evt] = func;
			}
		}
		addEvent(elem, evt, func);
	}

	function forceEvent(elem, evt) {
		var event;
		if(document.createEvent) {
			forceEvent = function(elem, evt) {
				event = document.createEvent("HTMLEvents");
				event.initEvent(evt, true, true);
				elem.dispatchEvent(event);
			}
		} else {
			forceEvent = function(elem, evt) {
				event = document.createEventObject();
				event.eventType = evt;
				elem.fireEvent("on" + event.eventType, event);
			}
		}
		forceEvent(elem, evt);
	}

	return {
		add: function(elem, evt, handler) {
			addEvent(elem, evt, handler);
			return this;
		},
		call: function(elem, evt) {
			forceEvent(elem, evt);
		}
	}
}());