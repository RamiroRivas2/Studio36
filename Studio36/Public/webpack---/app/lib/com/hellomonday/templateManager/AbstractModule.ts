import {AbstractTemplate} from '../../../../src/templates/AbstractTemplate';

export class AbstractModule {
	public element = null;
	public template = null;

	public killed = false;
	public animatedIn = false;

	public triggers = [];
	public components = [];

	constructor(element: HTMLElement, template: AbstractTemplate) {
		this.element = element;
		this.template = template;
	}

	public resize() {

	}

	public kill() {
		this.killed = true;
	}
}
