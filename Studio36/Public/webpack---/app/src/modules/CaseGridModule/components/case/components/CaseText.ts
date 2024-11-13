import { AbstractCaseBlock } from './AbstractCaseBlock';
import { Globals } from '../../../../../data/Globals';

export class CaseText extends AbstractCaseBlock {
	private _content: HTMLDivElement;
	private _marker: HTMLSpanElement;

	constructor(element: HTMLDivElement, type: string) {
		super(element, type);

		this._content = element.querySelector('.content');
		this._marker = this._content.querySelector('.marker');

		let pTags = this._content.querySelectorAll('p');
		let pTagsLength = pTags.length;
		if (pTagsLength > 2) {
			let lastPTag = pTags[pTagsLength - 1];
			if (lastPTag.innerHTML === '' || lastPTag.innerHTML === '&nbsp;') {
				// Hide the last pTag if its empty
				lastPTag.style.display = 'none';
				// Also check if the previous pTag is just a &nbsp;
				let secondLastPTag = pTags[pTagsLength - 2];
				if (secondLastPTag.innerHTML === '&nbsp;' || secondLastPTag.innerHTML === '') {
					secondLastPTag.style.display = 'none';
				}
			}
		}

		// Loop through all A Tags - and look for internal search values
		let aTags = this._content.querySelectorAll('a');
		let aTagsLength = aTags.length;
		for (var i = 0; i < aTagsLength; i++) {
			let currentTag = aTags[i];
			var getHref = currentTag.href;
			if (getHref.indexOf(document.location.host) >= 0) {
				getHref = getHref.replace(/^[a-zA-Z]{3,5}\:\/{2}[a-zA-Z0-9_.:-]+\//, '');
				console.log('--- ' + getHref);
				if (getHref.indexOf('?') === 0) {
					currentTag.addEventListener('click', this.searchForProject);
				}
			}
		}
	}

	private searchForProject = e => {
		var href = e.currentTarget.href;
		href = href.replace(/^[a-zA-Z]{3,5}\:\/{2}[a-zA-Z0-9_.:-]+\//, '');

		var getSearch = href.substring(1, href.length);
		console.log('search for project : ' + getSearch);
		getSearch = getSearch.replaceAll('-', ' ');

		Globals.MENU_SEARCH.searchFor(getSearch);

		e.preventDefault();
	};

	// @ts-ignore
	public resize = (height: number): void => {
		//this.element.style.paddingLeft = '1500px';
		var calcHeight = height;
		let columns: number = Math.ceil(this._marker.offsetLeft / 330) + 1;
		if (this._marker.offsetLeft === 0) {
			columns = 1;
		}

		/*console.log('height : ' + height);
		console.log('this._marker.offsetLeft : ' + this._marker.offsetLeft)
		console.log('this._content.offsetWidth : ' + this._content.offsetWidth)
		console.log('columns : ' + columns);*/
		this.element.style.height = height + 'px';
		this.element.style.paddingLeft = Math.round(290 * columns + 40 * (columns - 1)) + 'px';
		this.element.style.width = this.element.style.paddingLeft;
		//	this.reResize();
	};

	/*private reResize = () => {
		let columns: number = Math.ceil(this._marker.offsetLeft / 330);
		if (this._marker.offsetLeft === 0) {
			columns = 1;
		}


		console.log('this._marker.offsetLeft : ' + this._marker.offsetLeft)
		console.log('this._content.offsetWidth : ' + this._content.offsetWidth)
		console.log('columns : ' + columns);
		this.element.style.paddingLeft = Math.round(290 * columns + 40 * (columns - 1)) + 'px';
	}*/

	public kill = () => {
		// super.kill();
	};
}
