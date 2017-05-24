/* global Ptypo */
(function(window) {
	window.Ptypo = {};

	const values = Ptypo.values = {};
	const init = Ptypo.init = {};
	const tweens = Ptypo.tweens = {};

	Ptypo.createFont = function(name, font) {
		return PrototypoCanvas.init({
			canvas: document.getElementById('canvas'),
			workerUrl: 'lib/ptypo/worker.js',
			workerDeps: document.querySelector('script[src*=prototypo\\.]').src,
			onlyWorker: true,
			familyName: name,
		}).then(function(instance) {
			return instance.loadFont(font, `lib/ptypo/${ font }.json`);
		}).then(function(instance) {
			const myHeaders = new Headers();

			myHeaders.append("Content-Type", "application/json");
			Ptypo[name] = instance;
			return fetch(`lib/ptypo/${ font }.json`, {
				headers: myHeaders,
			});

		}).then(function(data) {
			return data.json();
		}).then(function(data) {
			console.log(data);
			values[name] = {};
			tweens[name] = {};
			init[name] = {};
			data.controls.forEach(function(control) {
				control.parameters.forEach(function(param) {
					init[name][param.name] = param.init;
					values[name][param.name] = param.init;
				});
			});
			Ptypo[name].subset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890,;.éèàùÉ';
			Ptypo[name].update(values[name]);

		});
	};

	Ptypo.changeParam = function(value, name, font) {
	if (values[font]) {
	values[font][name] = value;
		Ptypo[font].update(values[font]);
	}
	};

	Ptypo.getParam = function(name, font) {
		return values[font][name];
	};

	Ptypo.reset = function(font) {
		Object.keys(init[font]).forEach(function(key) {
			values[font][key] = init[font][key];
		});
		Ptypo[font].update(values[font]);
	};

	Ptypo.tween = function(value, name, font, steps, aDuration, cb) {
		const duration = aDuration * 1000;

		if (tweens[font][name]) {
			clearInterval(tweens[font][name].intervalId);
		}

		const start = values[font][name];

		tweens[font][name] = {
			target: value,
		};

		let elapsed = 0;
		var id = setInterval(function() {
			if (elapsed >= duration) {
				clearInterval(id);
				if (cb) {
					cb(name, font);
				}
				return;
			}
			const newValue = (start * (duration - elapsed) + value * elapsed) / duration;

			Ptypo.changeParam(newValue, name, font);
			elapsed += duration / steps;
		}, duration / steps);

		tweens[font][name].intervalId = id;
	};
}(window));
