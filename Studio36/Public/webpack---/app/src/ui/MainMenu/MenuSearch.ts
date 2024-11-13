import { gsap } from 'gsap';
import { clamp } from '../../../lib/com/hellomonday/utils/MathUtils';
import { Globals } from '../../data/Globals';
import { KeyboardControls } from '../../input/KeyboardControls';
import { CaseEntry } from '../../modules/CaseGridModule/components/case/CaseEntry';
import { MainFilter } from './MainFilter';

interface AutoCompleteTerm {
	value: string;
	count: number;
	domElement: HTMLDivElement;
	id: number;
	active: boolean;
	isAutoRotation: boolean;
}

export class MenuSearch {
	private _element: HTMLDivElement;
	private _filter: MainFilter;

	private _input: HTMLInputElement;

	private _active: boolean = false;

	private _terms: Array<string>;
	private _totalTerms: number;
	private _currentTerm: number = 0;

	private _termsContainer: HTMLDivElement;

	private _sidebarContainer: HTMLDivElement;
	private _autocompletionSortTerms = ['New', 'Newest', 'Chronological', 'Alphabetical'];
	private _autocompletionSortTermsDirection = ['desc', 'desc', 'desc', 'asc'];
	private _autoCompletionTerms: Array<AutoCompleteTerm> = [];
	private _autoCompleteContainer: HTMLDivElement;
	private _autoCompleteCountActive: number = -1;
	private _currentlySelectedAutoCompleteTerm: HTMLDivElement;

	private _keyboardControls: KeyboardControls;

	private _populated: boolean = false;

	private _closeX: SVGElement;

	private _termCount: number = 0;
	private _bg: HTMLDivElement;

	private _activeTermCount: number = 0;

	private _icon: HTMLDivElement;

	private _mobileLayout: boolean = false;
	private _collapsed: boolean = false;

	private _parent: HTMLDivElement;

	private _filterCount: HTMLDivElement;

	private _currentTermID;

	private _matches = [];

	constructor(element: HTMLDivElement, filter: MainFilter, bg: HTMLDivElement) {
		Globals.MENU_SEARCH = this;

		this._element = element;
		this._icon = element.querySelector('.icon');
		this._bg = bg;
		this._filter = filter;
		this._filterCount = element.querySelector('.filterCount');

		this._parent = this._element.parentNode as HTMLDivElement;

		this._autoCompleteContainer = element.querySelector('.autoComplete');
		this._sidebarContainer = element.querySelector('.sidebar');

		this._keyboardControls = KeyboardControls.getInstance();
		this._termsContainer = element.querySelector('.lockedTerms');
		this._terms = this._element.dataset.terms.split(',');
		this._totalTerms = clamp(this._terms.length, 0, 5);

		for (let i = 0; i < this._totalTerms; i++) {
			this.initTerm(this._terms[i].toLowerCase(), true);
		}
		var filter = this._filter;

		this._input = element.querySelector('.searchInput');
		var input = this._input;

		if (Globals.MOBILE_OS === 'Android') {
			gsap.set(this._input, { x: 3, y: 4 });
		}
		if (Globals.MOBILE_OS === 'iOS') {
			gsap.set(this._input, { y: 4, x: -6 });
		}

		this._input.addEventListener('keypress', this.hitEnter);

		this._icon.addEventListener('click', this.onIconClick);

		window.addEventListener('keydown', this.keyDown);
	}

	private keyDown = (e: KeyboardEvent) => {
		var getKey = e.key;
		if (getKey == 'Escape') {
			this.onBlur();
		} else if (getKey == 'Enter') {
			//	this.hitEnter(e);
		} else if (getKey == 'ArrowUp') {
			this.upArrow();
		} else if (getKey == 'ArrowDown') {
			this.downArrow();
		}
	};

	private upArrow = () => {
		this.deslectCurrentlySeletedAutoCompleteTerm();
		if (this._autoCompleteCountActive >= -1 && this._autoCompleteCountActive < this._autoCompleteContainer.children.length) {
			this._autoCompleteCountActive--;
			if (this._autoCompleteCountActive >= 0) {
				this.onTermSelectActivate(this._autoCompleteContainer.children[this._autoCompleteCountActive]);
			}
		}
	};

	private deslectCurrentlySeletedAutoCompleteTerm = () => {
		if (this._currentlySelectedAutoCompleteTerm) {
			this.onTermDeselectActivate(this._currentlySelectedAutoCompleteTerm);
		}
	};

	private downArrow = () => {
		this.deslectCurrentlySeletedAutoCompleteTerm();
		if (this._autoCompleteCountActive >= -1 && this._autoCompleteCountActive < this._autoCompleteContainer.children.length) {
			this._autoCompleteCountActive++;
			this.onTermSelectActivate(this._autoCompleteContainer.children[this._autoCompleteCountActive]);
		}
	};

	private hitEnter = (e?) => {
		if (e.key === 'Enter') {
			if (this._autoCompleteContainer.children.length > 0) {
				if (this._autoCompleteCountActive === -1) {
					// If Keyboard has not moved - use the first item
					//@ts-ignore
					this.onTermClicked(this._autoCompleteContainer.children[0].dataset.id);
				} else {
					//@ts-ignore
					this.onTermClicked(this._autoCompleteContainer.children[this._autoCompleteCountActive].dataset.id);
				}
			}
			//filter.addFilter(input.value);
		}
	};

	private onIconClick = e => {
		e.preventDefault();
		this._input.focus();
	};

	public searchFor = searchValue => {
		var length = this._autoCompletionTerms.length;
		for (var i = 0; i < length; i++) {
			var currentTerm = this._autoCompletionTerms[i];
			if (searchValue === currentTerm.value) {
				this.onTermClickActivate(currentTerm.id);
				return;
			}
		}
	};

	private onTermSelect = e => {
		var target = e.currentTarget;
		this.onTermSelectActivate(target);
	};

	private onTermSelectActivate = target => {
		Globals.CASE_CONTROLLER.clearProjectURL();
		gsap.to(target, { duration: 0.2, color: '#000000', ease: 'power3.out' });
		this._currentlySelectedAutoCompleteTerm = target;
	};

	private onTermDeselect = e => {
		var target = e.currentTarget;
		this.onTermDeselectActivate(target);
	};

	private onTermDeselectActivate = target => {
		gsap.to(target, { duration: 0.2, color: '#969696', ease: 'power3.out' });
		this._currentlySelectedAutoCompleteTerm = null;
	};

	private onTermClick = e => {
		Globals.CASE_CONTROLLER.clearProjectURL();
		this.onTermClicked(e.currentTarget.dataset.id);
		e.preventDefault();
		e.stopPropagation();
	};

	private onTermClicked = id => {
		this.onTermClickActivate(parseInt(id));
	};

	private isSortTerm = (term: string) => {
		return this._autocompletionSortTerms.map(_ => _.toLowerCase()).indexOf(term.toLowerCase()) > -1;
	};

	private getSortDirection = (term: string) => {
		const sortTermIndex = this._autocompletionSortTerms.map(_ => _.toLowerCase()).indexOf(term.toLowerCase());
		return this._autocompletionSortTermsDirection[sortTermIndex] || 'desc';
	};

	private onTermClickActivate = (useID, showAutoComplete?: boolean) => {
		Globals.CASE_CONTROLLER.clearProjectURL();
		Globals.MAIN_FILTER.removeCurrentFilter();
		let id: number = useID;
		let term = this._autoCompletionTerms.find(term => term.id === id);

		if (id !== this._currentTermID) {
			this.removeExistingTerm();
		}

		console.log('onTermClickActivate', useID, term, this.isSortTerm(term.value));

		if (term.active === false) {
			term.active = true;
			this._activeTermCount = 1;

			if (this.isSortTerm(term.value)) {
				this._filter.setSort(term.value, this.getSortDirection(term.value));
			} else {
				this._filter.addFilter(term.value);
			}

			if (term.isAutoRotation) {
				this.removeTermFromAutoRotation(term.value);
			}

			this._input.value = term.value;
			this._input.textContent = term.value;
		} else {
			term.active = false;
			this._activeTermCount = 0;

			if (this.isSortTerm(term.value)) {
				this._filter.setSort('standard', this.getSortDirection(term.value));
			} else {
				this._filter.removeFilter(term.value);
			}

			if (term.isAutoRotation) {
				this.addTermToAutoRotation(term.value);
			}
		}

		this._currentTermID = id;

		Globals.MAIN_FILTER.hideSecondaryMenu();

		this.onInput();
		this._input.blur();
	};

	public removeExistingTerm = () => {
		if (this._currentTermID) {
			let id: number = this._currentTermID;
			let term = this._autoCompletionTerms.find(term => term.id === id);
			term.active = false;
			this._activeTermCount = 0;
			this._filter.removeFilter(term.value);
			if (term.isAutoRotation) {
				this.addTermToAutoRotation(term.value);
			}

			if (this._activeTermCount > 0) {
				this._filterCount.innerText = '(' + this._activeTermCount + ')';
			} else {
				this._filterCount.innerText = '';
			}

			this._input.value = '';
			this._input.textContent = '';

			this._currentTermID = null;
		}
	};

	private removeTermFromAutoRotation = (term: string) => {
		let l = this._terms.length;
		for (let i = 0; i < l; i++) {
			if (this._terms[i].toLowerCase() === term) {
				this._terms.splice(i, 1);
				break;
			}
		}

		this._totalTerms = clamp(this._terms.length, 0, 5);
		this._currentTerm = 0;
	};

	private addTermToAutoRotation = (term: string) => {
		this._terms.push(term);
		this._totalTerms = clamp(this._terms.length, 0, 5);
		this._currentTerm = 0;
	};

	public populateAutocompletion = (entries: Array<CaseEntry>) => {
		if (this._populated) {
			return;
		}

		let l = entries.length;

		for (let i = 0; i < l; i++) {
			this.addAutocompletionValues(entries[i].filters.searchValues);
		}

		this.addAutocompletionValues(this._autocompletionSortTerms);

		// Sort autocompletion entries alphabetically
		this._autoCompletionTerms = this._autoCompletionTerms.sort((a: AutoCompleteTerm, b: AutoCompleteTerm) => {
			return a.value == b.value ? 0 : a.value > b.value ? 1 : -1;
		});

		this._populated = true;

		this.init();
	};

	private addAutocompletionValues = (values: Array<string>) => {
		let l = values.length;
		let value;
		let index;

		for (let i = 0; i < l; i++) {
			value = values[i].toLowerCase();
			index = this._autoCompletionTerms.findIndex(x => x.value == value);

			if (index === -1) {
				this.initTerm(value);
			} else {
				this._autoCompletionTerms[index].count++;
			}
		}
	};

	private initTerm = (value: string, isAutoRotation: boolean = false) => {
		const domElement = document.createElement('div');
		domElement.classList.add('autoCompleteItem');
		domElement.innerText = value;
		domElement.dataset.id = this._termCount + '';
		domElement.addEventListener('mousedown', this.onTermClick);

		this._autoCompletionTerms.push({
			value: value,
			count: 1,
			domElement: domElement,
			id: this._termCount,
			active: false,
			isAutoRotation: isAutoRotation
		});
		this._termCount++;
	};

	private init = () => {
		this._input.addEventListener('focus', this.onFocus);
		this._input.addEventListener('blur', this.onBlur);
		this._input.addEventListener('input', this.onInput);

		this.setDefault();
		gsap.delayedCall(4, this.nextTerm);
	};

	public hide = () => {
		gsap.to(this._sidebarContainer, { duration: 0.3, ease: 'power2.in', x: 300 });
	};

	private nextTerm = () => {
		let next = this._currentTerm + 1;

		if (next > this._totalTerms - 1) {
			next = 0;
		}

		// TODO: Skip terms that are already added to the filter list
		// let term = this._autoCompletionTerms.find(term => term.id === next);
		//
		// if (term.active) {
		// 	this.nextTerm();
		// 	return;
		// }

		this._currentTerm = next;
		this.setDefault();

		gsap.delayedCall(2, this.nextTerm);
	};

	private setDefault = () => {
		let term = this._totalTerms === 0 ? '' : this._terms[this._currentTerm];

		this._input.value = term;
		this._input.textContent = term;
	};

	private onInput = (e?) => {
		this._autoCompleteContainer.innerText = '';
		this.updateBgHeight();

		if (Globals.MOBILE_LAYOUT === true) {
			if (this._input.value.length === 0) {
				gsap.to(this._sidebarContainer, { duration: 0.3, ease: 'power2.in', x: 300 });
			} else {
				gsap.to(this._sidebarContainer, { duration: 0.3, ease: 'power2.out', x: 0 });
			}
		}

		if (this._input.value.length === 0) {
			if (this._active) {
				this.setAutocompleteListToDefault();
			}
			return;
		}

		let wordMatches = [];
		let matches = [];

		var searchFor = this._input.value.toLowerCase();
		var allCaseEntries = Globals.CASE_CONTROLLER.getAllCaseEntries();
		var length = allCaseEntries.length;

		// First Priority is Keyword matchs
		for (var i = 0; i < length; i++) {
			var currentEntry: CaseEntry = allCaseEntries[i];
			var searchValuesKeywordsArray = currentEntry.filters.searchValuesKeywords;
			for (var q = 0; q < searchValuesKeywordsArray.length; q++) {
				var currentItem = searchValuesKeywordsArray[q].toLowerCase();
				if (currentItem.indexOf(searchFor) >= 0) {
					wordMatches.push(currentItem);
				}
			}
		}

		// 2nd Priority is Keyword matchs
		for (var i = 0; i < length; i++) {
			var currentEntry: CaseEntry = allCaseEntries[i];
			var searchValuesKeywordsArray = currentEntry.filters.searchValuesProjectTitles;
			for (var q = 0; q < searchValuesKeywordsArray.length; q++) {
				var currentItem = searchValuesKeywordsArray[q].toLowerCase();
				if (currentItem.indexOf(searchFor) >= 0) {
					wordMatches.push(currentItem);
				}
			}
		}

		// 3rd everything else
		for (var i = 0; i < length; i++) {
			var currentEntry: CaseEntry = allCaseEntries[i];
			var searchValuesKeywordsArray = currentEntry.filters.searchValuesOthers;
			for (var q = 0; q < searchValuesKeywordsArray.length; q++) {
				var currentItem = searchValuesKeywordsArray[q].toLowerCase();
				if (currentItem.indexOf(searchFor) >= 0) {
					wordMatches.push(currentItem);
				}
			}
		}

		// 4th static terms
		for (var i = 0; i < this._autocompletionSortTerms.length; i++) {
			var currentSortTerm = this._autocompletionSortTerms[i].toLowerCase();
			if (currentSortTerm.indexOf(searchFor) >= 0) {
				wordMatches.push(currentSortTerm);
			}
		}

		let wordMatchesUnique = [...new Set(wordMatches)];
		for (var x = 0; x < 10; x++) {
			var wordMatchItem = wordMatchesUnique[x];
			for (var z = 0; z < this._autoCompletionTerms.length; z++) {
				var currentTerm = this._autoCompletionTerms[z];
				if (currentTerm.value.toLowerCase() === wordMatchItem) {
					matches.push(currentTerm);
				}
			}
		}

		let l = matches.length;

		for (let i = 0; i < l; i++) {
			if (i > 10 - this._activeTermCount) {
				break;
			}

			gsap.set(matches[i].domElement, { opacity: 0 });
			this._autoCompleteContainer.appendChild(matches[i].domElement);
			gsap.to(matches[i].domElement, { opacity: 1, duration: 0.1, delay: 0.0 });
		}

		this._matches = matches;
		// Reset Keyboard selection
		this._autoCompleteCountActive = -1;
		this.deslectCurrentlySeletedAutoCompleteTerm();

		this.updateBgHeight();
	};

	private setAutocompleteListToDefault = () => {
		for (let i = 0; i < this._totalTerms; i++) {
			let term = this._autoCompletionTerms.find(term => term.value.toLowerCase() === this._terms[i].toLowerCase());

			if (!term.active) {
				gsap.set(term.domElement, { opacity: 0 });
				this._autoCompleteContainer.appendChild(term.domElement);
				gsap.to(term.domElement, { opacity: 1, duration: 0.1, delay: 0.0 });
			}
		}

		this.updateBgHeight();
	};

	private updateBgHeight = () => {
		return;
	};

	private onFocus = e => {
		this._active = true;
		this.setAutocompleteListToDefault();
		this._keyboardControls.disabled = true;
		gsap.killTweensOf(this.nextTerm);

		this._input.value = '';
		this._input.textContent = '';

		if (Globals.MOBILE_LAYOUT === false) {
			gsap.to(this._sidebarContainer, { duration: 0.3, ease: 'power2.out', x: 0 });
		}

		if (this._collapsed) {
			this.expand();
		}
	};

	private onBlur = () => {
		if (Globals.IS_TOUCH_DEVICE && Globals.MOBILE_LAYOUT) {
			return;
		}

		this._active = false;
		this._keyboardControls.disabled = false;
		this._autoCompleteContainer.innerText = '';
		gsap.to(this._sidebarContainer, { duration: 0.5, ease: 'power2.in', x: 300 });
		this.updateBgHeight();
		this.collapse();

		if (this._input.value === '') {
			this.setDefault();
			gsap.delayedCall(2, this.nextTerm);
		}

		this._input.blur();
		this.deslectCurrentlySeletedAutoCompleteTerm();
		this._autoCompleteCountActive = -1;
		this.hideTerms();
	};

	public collapse = () => {
		this._collapsed = true;
		this.updateBgHeight();
		// this._input.blur();

		this.hideTerms();

		//gsap.to(this._termsContainer, {opacity: 0, onComplete: this.hideTerms, duration: 0.3});
	};

	private hideTerms = () => {
		this._termsContainer.style.display = 'none';
	};

	private expand = () => {
		this._collapsed = false;
		this._termsContainer.style.display = 'block';
		gsap.to(this._termsContainer, { opacity: 1, duration: 0.3 });
		this.updateBgHeight();
	};

	public resize = () => {
		if (!this._mobileLayout && Globals.MOBILE_LAYOUT) {
			this._mobileLayout = true;
			//	this._parent.parentNode.appendChild(this._element);
			this.updateBgHeight();
		} else if (this._mobileLayout && !Globals.MOBILE_LAYOUT) {
			this._mobileLayout = false;
			this._parent.appendChild(this._element);
			this.updateBgHeight();
		}

		if (Globals.MOBILE_LAYOUT && !this._active) {
			//	Globals.MAIN_MENU.mobileButton.style.display = 'block';
		} else {
			//	Globals.MAIN_MENU.mobileButton.style.display = 'none';
		}
	};

	set active(boolean: boolean) {
		this._active = boolean;
	}

	get active() {
		return this._active;
	}

	get collapsed() {
		return this._collapsed;
	}
}
