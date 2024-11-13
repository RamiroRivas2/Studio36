import { TemplateManager } from "../../lib/com/hellomonday/templateManager/TemplateManager";
import { KeyboardControls } from '../input/KeyboardControls';
import { AbstractTemplate } from './AbstractTemplate';

export class EthicalTemplate extends AbstractTemplate {

	private _formElement: HTMLDivElement;
	private _successElement: HTMLDivElement;
	private _subjectErrorElement: HTMLDivElement;
	private _fromErrorElement: HTMLDivElement;
	private _messageErrorElement: HTMLDivElement;

	constructor(element: HTMLDivElement, templateManager: TemplateManager) {
		super(element, templateManager);

		KeyboardControls.getInstance().disabled = true;

		this._successElement = element.querySelector('#form-success');
		this._formElement = element.querySelector('#form');

		this._subjectErrorElement = element.querySelector('#subject-error');
		this._fromErrorElement = element.querySelector('#from-error');
		this._messageErrorElement = element.querySelector('#message-error');

		this._formElement.addEventListener('submit', async (event) => {
			event.preventDefault();
			const data = {
				subject: element.querySelector<HTMLInputElement>('input[name="subject"]').value || '',
				from: element.querySelector<HTMLInputElement>('input[name="from"]').value || '',
				message: element.querySelector<HTMLTextAreaElement>('textarea[name="message"]').value || '',
			};

			if (!data.subject.trim()) {
				this._subjectErrorElement.style.display = 'block';
				return;
			}

			if (!data.message.trim()) {
				this._messageErrorElement.style.display = 'block';
				return;
			}

			await this.postForm(data);
		});
	}

	async postForm(data: any) {
		try {
			await fetch("/api/ethics-hotline", {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			});
		} catch (error) {}

		if (this._successElement) {
			this._successElement.style.display = 'block';
		}

		this._formElement.querySelector<HTMLInputElement>('input[name="subject"]').value = '';
		this._formElement.querySelector<HTMLInputElement>('input[name="from"]').value = '';
		this._formElement.querySelector<HTMLTextAreaElement>('textarea[name="message"]').value = '';
	}

	kill() {
		super.kill();
	}

	resize() {
		super.resize();
	}
}
