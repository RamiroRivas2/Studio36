import {TemplateManager} from '../templateManager/TemplateManager';

export class LinkParser {
	private static instance: LinkParser;
	public static templateManager: TemplateManager;

	private constructor(templateManager: TemplateManager) {
		LinkParser.templateManager = templateManager;
	}

	public static getInstance(templateManager?: TemplateManager): LinkParser {
		if (!LinkParser.instance) {
			if (!templateManager) {
				console.error('First LinkParser.getInstance must receive a TemplateManager instance as the first parameter');
			}
			LinkParser.instance = new LinkParser(templateManager);
		}

		return LinkParser.instance;
	}

	parse(element: HTMLElement, callback?: Function) {
		if (callback) {
			(element as any)._callback = callback;
		}

		element.addEventListener('click', this.onClick);
	}

	parseNodeList(nodeList: NodeListOf<HTMLElement>) {
		for (let i = 0; i < nodeList.length; i++) {
			this.parse(nodeList[i]);
		}
	}

	kill(element) {
		element.removeEventListener('click', this.onClick);

		if (element._callback) {
			element._callback = null;
		}
	}

	killNodeList(nodeList: NodeListOf<HTMLElement>) {
		for (let i = 0; i < nodeList.length; i++) {
			this.kill(nodeList[i]);
		}
	}

	onClick = event => {
		// Make sure that open in new tab is still allowed.
		if (
			event.ctrlKey ||
			event.shiftKey ||
			event.metaKey || // apple
			(event.button && event.button == 1) // middle click, >IE9 + everyone else
		) {
			return;
		} else {
			event.preventDefault();
		}

		if (event.currentTarget._callback) {
			event.currentTarget._callback(event.currentTarget);
		}

		let href = event.currentTarget.href || event.target.parentNode.href;

		if (href === undefined) {
			href = '';
		}

		if (this.isInternal(href)) {
			let base = document.location.protocol + '//' + window.location.host + '/';

			let path = href.replace(base, '');

			LinkParser.templateManager.path(path);
		} else {
			if (href.indexOf('mailto') !== -1) {
				window.location.href = href;
			} else {

				if (href === 'https://jobs.lever.co/wintermute-trading') {
					if (typeof (window as any).gtag !== 'undefined') {
						(window as any).gtag('event', 'Apply', {
							'event_category': 'Click',
							'event_label': 'Apply'
						});
					}
				}

				window.open(href, '_blank');
			}
		}
	};

	click(href) {
		if (this.isInternal(href)) {
			let base = document.location.protocol + '//' + window.location.host + '/';

			let path = href.replace(base, '');

			LinkParser.templateManager.path(path);
		} else {
			if (href.indexOf('mailto') !== -1) {
				window.location.href = href;
			} else {
				window.open(href, '_blank');
			}
		}
	}

	isInternal(url) {
		let valid = false;

		if (url.indexOf(window.location.hostname) !== -1) {
			valid = true;
		}

		if (isFile(url)) {
			valid = false;
		}

		return valid;
	}
}

export function isFile(pathname: string) {
	return (
		pathname
			.split('/')
			.pop()
			.split('.').length > 1
	);
}
