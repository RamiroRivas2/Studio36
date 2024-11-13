export class AbstractCaseBlock {

	protected element: HTMLDivElement;
	protected _type: string;

	constructor(element: HTMLDivElement, type: string) {
		this.element = element;
		this._type = type;
	}

	public resize = (height: number): void => {

	}

	public kill = (): void => {

	}

	get domElement() {
		return this.element;
	}

	get type() {
		return this._type;
	}

	set type(value: string) {
		this._type = value;
	}
}
