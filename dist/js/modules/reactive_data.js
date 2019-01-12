/* Tabulator v4.1.5 (c) Oliver Folkerd */

var ReactiveData = function ReactiveData(table) {
	this.table = table; //hold Tabulator object

	this.blocked = false; //block reactivity while performing update
};

ReactiveData.prototype.watchData = function (data) {};

ReactiveData.prototype.unwatchData = function (data) {};

ReactiveData.prototype.watchRow = function (row) {
	var self = this,
	    data = row.getData();

	this.blocked = true;

	for (var key in data) {
		this.watchKey(row, data, key);
	}

	console.log("data", data);

	this.blocked = false;
};

ReactiveData.prototype.watchKey = function (row, data, key) {
	var self = this,
	    value = data[key];

	Object.defineProperty(data, key, {
		set: function set(newValue) {
			console.log("set", newValue);
			value = newValue;

			if (!self.blocked) {
				var update = {};
				update[key] = newValue;
				row.updateData(update);
			}
		},
		get: function get() {
			return value;
		}
	});
};

ReactiveData.prototype.unwatchRow = function (row) {
	var data = row.getData();

	for (var key in data) {
		Object.defineProperty(data, key, {
			value: data[key]
		});
	}
};

ReactiveData.prototype.block = function () {
	this.blocked = true;
};

ReactiveData.prototype.unblock = function () {
	this.blocked = false;
};

Tabulator.prototype.registerModule("reactiveData", ReactiveData);