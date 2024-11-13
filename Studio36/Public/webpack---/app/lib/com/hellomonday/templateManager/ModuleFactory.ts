import {AbstractModule} from './AbstractModule';

export const ModuleFactory = {
	registeredTypes: {},

	register(className: string, classConstructor) {
		if (!(ModuleFactory.registeredTypes[className] && classConstructor.prototype instanceof AbstractModule)) {
			ModuleFactory.registeredTypes[className] = classConstructor;
		} else {
			console.log(`Module class (${className}) must extend AbstractModule`);
		}
	},

	create(className: string, ...options) {
		if (!ModuleFactory.registeredTypes[className]) {
			console.error(`!!!${className} is not a registered module!!!`);
			return null;
		}

		let classConstructor = this.registeredTypes[className];
		return new classConstructor(...options);
	},

	registerModules(modules: { [key: string]: typeof AbstractModule }) {
		Object.keys(modules).forEach(key => ModuleFactory.register(key, modules[key]));
	}
};

export function buildComponent(name, data, module) {
	if (window[name] !== null && window[name] !== undefined) {

		//@ts-ignore
		let component = new window[name](data);
		component.name = name;
		component.module = module;

		return component;
	} else {
		console.log("ModuleFactory can't find component with name: " + name);
		return null;
	}
}

export function buildSubModules(data) {
	var i = 0;
	var l = data.length;
	var moduleName;
	var submodules = [];

	for (i; i < l; i++) {
		moduleName = data[i].getAttribute('data-module');

		if (moduleName) {
			var module = ModuleFactory.create(moduleName, data[i]);

			submodules.push(module);
		}
	}

	return submodules;
}
