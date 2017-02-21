'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SubmissionTaskTable = function () {
	function SubmissionTaskTable(options) {
		_classCallCheck(this, SubmissionTaskTable);

		var self = this;

		this.el = options.el;
		this.task_ids = options.task_ids;
		this.interval = null;
		this.refreshRate = options.refreshRate ? options.refreshRate : 1000; // ms
		this.debug = options.debug;
		this.request_pending = false;
		this.onRender = options.onRender ? options.onRender : function () {};

		// debug
		this.stopIntervalling = 1;
		this.curInterval = 0;

		if (this.task_ids.length) {
			this.interval = setInterval(function () {
				self._status();
				self.curInterval += 1;

				// debug
				if (self.debug && self.curInterval == self.stopIntervalling) {
					self._clear();
				}
			}, this.refreshRate);

			self._status();
		}
	}

	// does a status check


	_createClass(SubmissionTaskTable, [{
		key: '_status',
		value: function _status(callback) {

			var self = this;

			// this blocks out making requests if we are already doing a request.
			// this makes every request 'wait' untill all requests did finish.
			if (this.request_pending) return;
			this.request_pending = true;

			this.setStatusText('Getting status...');

			$.ajax({
				url: '/analysis/api/tasks/info/',
				type: 'POST',
				dataType: 'json',
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify({
					"task_ids": self.task_ids
				}),
				success: function success(response) {
					self._data(response);
					self.request_pending = false;
				},
				error: function error(err) {
					self._clear();
					alert('status check failed! check your console for more details.');
					console.log(err);
				}
			});
		}

		// processes the data

	}, {
		key: '_data',
		value: function _data(response) {

			this.setStatusText('Done');

			var data = response.data;

			// building the check, but it's always an object,
			// so do some array formatting here, while keeping
			// the correct order.
			if (!(data instanceof Array)) {
				var arr = [];
				for (var d in response.data) {
					arr.push(response.data[d]);
				}
				data = arr.sort(function (a, b) {
					return a.id > b.id;
				});
			}

			// humanize the date formats, or any other kind of data
			data = data.map(function (item) {
				item.date_added = moment(item.added_on).format('DD/MM/YYYY');
				item.time_added = moment(item.added_on).format('HH:mm');
				item.is_ready = item.status == 'reported';
				return item;
			});

			this._draw(data);
		}

		// draws the table content from Handlebars into the table

	}, {
		key: '_draw',
		value: function _draw(data) {
			var template = HANDLEBARS_TEMPLATES['submission-task-table-body'];
			$(this.el).find('tbody').html(template({ tasks: data }));
			this.onRender($(this.el));
		}

		// clears the interval

	}, {
		key: '_clear',
		value: function _clear() {
			if (this.interval) clearInterval(this.interval);
			this.request_pending = false;
		}
	}, {
		key: 'setStatusText',
		value: function setStatusText(text) {
			$(this.el).find('tfoot .ajax-status').text(text);
		}
	}]);

	return SubmissionTaskTable;
}();

exports.SubmissionTaskTable = SubmissionTaskTable;
//# sourceMappingURL=SubmissionTaskTable.js.map