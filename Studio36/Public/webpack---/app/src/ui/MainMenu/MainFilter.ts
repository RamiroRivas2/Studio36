import { gsap } from 'gsap';
import { Signal } from '../../../lib/com/hellomonday/signals/Signal';
import { Globals } from '../../data/Globals';
import { WindowManager } from '../../utils/WindowManager';
import { MenuSearch } from './MenuSearch';

export class MainFilter {
	private _element: HTMLDivElement;
	private _updateSignal: Signal = new Signal();
	private _filterButtons: NodeListOf<HTMLDivElement>;
	private _currentId: number = 999;

	private _active: boolean = false;

	private _activeFilters: Array<string> = [];
	private _activeSort: 'standard' | string = 'standard';
	private _activeSortDirection: 'asc' | 'desc' = 'desc';

	private _search: MenuSearch;

	private _mobileMenuOpen: boolean = false;

	private _secondaryMenu;

	private _currentlySelectedSecondaryMenu = null;

	constructor(element: HTMLDivElement, searchBg: HTMLDivElement) {
		this._element = element;

		Globals.MAIN_FILTER = this;

		this._secondaryMenu = element.parentNode.querySelectorAll('.itemSecondaryMenu');

		this._filterButtons = element.parentNode.querySelectorAll('.item');

		let l = this._filterButtons.length;

		var mainFilterCount = 0;

		for (let i = 0; i < l; i++) {
			var getFilterButton = this._filterButtons[i];
			if (getFilterButton.dataset.main == 'true') {
				//@ts-ignore
				getFilterButton._storeMatchingSecondaryMenu = this._secondaryMenu[mainFilterCount];
				mainFilterCount++;
			}

			//console.log('this._filterButtons[i]._storeMatchingSecondaryMenu : ' + this._filterButtons[i]._storeMatchingSecondaryMenu)
			getFilterButton.addEventListener('click', this.onFilterButtonClick);
		}

		this._search = new MenuSearch(this._element.querySelector('.MenuSearch'), this, searchBg);

		if (Globals.MOBILE_LAYOUT) {
			this._element.style.height = 0 + 'px';
			this._element.style.opacity = '0';
		}
	}

	public setSort = (sort: 'standard' | string, direction: string) => {
		gsap.killTweensOf(this.triggerUpdate);

		this._activeSort = sort.toLowerCase();
		this._activeSortDirection = direction as any;

		gsap.delayedCall(0.1, this.triggerUpdate);
	};

	public setSortDirection = (direction: 'asc' | 'desc') => {
		gsap.killTweensOf(this.triggerUpdate);

		this._activeSortDirection = direction;

		gsap.delayedCall(0.1, this.triggerUpdate);
	};

	public toggle = (state: boolean) => {
		if (this._currentlySelectedSecondaryMenu) {
			this._currentlySelectedSecondaryMenu.style.display = 'none';
			this._currentlySelectedSecondaryMenu = null;
		}

		this._active = state;
		var targets = [this._element, this._element.parentNode.querySelector('.MenuSearch'), this._element.parentNode.querySelector('.mobileButton')];
		if (Globals.MOBILE_LAYOUT === true) {
			targets = [this._element.parentNode.querySelector('.MenuSearch'), this._element.parentNode.querySelector('.mobileButton')];
		}

		gsap.to(targets, {
			opacity: this._active ? 1 : 0,
			y: this._active ? 0 : 0,
			duration: 0.3,
			ease: 'power2.inOut'
		});

		if (this._active === true) {
			if (Globals.MOBILE_LAYOUT === true) {
				this._element.style.pointerEvents = 'none';
			} else {
				this._element.style.pointerEvents = 'all';
			}
			//@ts-ignore
			this._element.parentNode.querySelector('.MenuSearch').style.pointerEvents = 'all';
			//@ts-ignore
			this._element.parentNode.querySelector('.mobileButton').style.pointerEvents = 'all';
		} else {
			this._element.style.pointerEvents = 'none';
			//@ts-ignore
			this._element.parentNode.querySelector('.MenuSearch').style.pointerEvents = 'none';
			//@ts-ignore
			this._element.parentNode.querySelector('.mobileButton').style.pointerEvents = 'none';
			if (Globals.MOBILE_LAYOUT) {
				this.toggleMobileMenu(false);
			}
		}
	};

	public checkForInitialSearchValue = () => {
		if (Globals.INITIAL_SEARCH_VALUE !== null && Globals.INITIAL_SEARCH_VALUE !== '') {
			Globals.MAIN_FILTER.addFilter(Globals.INITIAL_SEARCH_VALUE, Globals.INITIAL_SEARCH_VALUE_SECONDARY);
			//this._activeFilters.push(Globals.INITIAL_SEARCH_VALUE);
		}
	};

	public toggleMobileMenu = (state: boolean) => {
		this._active = state;
		var gotoHeight = 0;
		if (this._active) {
			gotoHeight = 120;
			this._mobileMenuOpen = true;
		} else {
			this._mobileMenuOpen = false;
		}

		gsap.to(this._element, { opacity: this._active ? 1 : 0, y: this._active ? 0 : 0, duration: 0.3, height: gotoHeight + 'px', ease: 'power2.inOut' });

		if (this._active === true) {
			this._element.style.pointerEvents = 'all';
		} else {
			this._element.style.pointerEvents = 'none';
		}
	};

	// private onFilterButtonClick = (e) => {
	// 	console.log(e.currentTarget.dataset.id);
	// }

	private onFilterButtonClick = e => {
		Globals.CASE_CONTROLLER.clearProjectURL();
		Globals.MENU_SEARCH.removeExistingTerm();
		//@ts-ignore
		var getMatchingSecondaryMenu = event.currentTarget._storeMatchingSecondaryMenu;

		if (getMatchingSecondaryMenu) {
			if (this._currentlySelectedSecondaryMenu) {
				this._currentlySelectedSecondaryMenu.style.display = 'none';
			}
			getMatchingSecondaryMenu.style.display = 'flex';
			this._currentlySelectedSecondaryMenu = getMatchingSecondaryMenu;
		}

		let id = parseInt(e.currentTarget.dataset.id);
		if (id === this._currentId) {
			id = 999;

			if (getMatchingSecondaryMenu) {
				getMatchingSecondaryMenu.style.display = 'none';
				this._currentlySelectedSecondaryMenu = null;
			}
		}

		if (WindowManager.width < 1025) {
			Globals.MAIN_FILTER.toggleMobileMenu(false);
		}

		this.updateId(id);
	};

	private updateId = (id: number) => {
		let l = this._filterButtons.length;

		//	console.log('updateId: ' + id);
		var selectedFilter = null;

		for (let i = 0; i < l; i++) {
			//console.log(this._filterButtons[i].dataset.value);
			if (i === id) {
				this._filterButtons[i].classList.add('highlight');
				//console.log('*** this._filterButtons[i].dataset.value : ' + this._filterButtons[i].dataset.value);
				this.addFilter(this._filterButtons[i].dataset.value, this._filterButtons[i].dataset.leapp);
				selectedFilter = this._filterButtons[i].dataset.value;
			} else {
				if (selectedFilter !== this._filterButtons[i].dataset.value) {
					this._filterButtons[i].classList.remove('highlight');
					this.removeFilter(this._filterButtons[i].dataset.value);
				}
			}
		}

		this._currentId = id;
	};

	public addFilter = (value: string, secondValue?: string) => {
		gsap.killTweensOf(this.triggerUpdate);

		const v = value.toLowerCase();

		this._activeFilters = [];
		this._activeFilters.push(v);

		if (secondValue) {
			this._activeFilters.push(secondValue);
		}

		gsap.delayedCall(0.1, this.triggerUpdate);
	};

	public removeFilter = (value: string) => {
		gsap.killTweensOf(this.triggerUpdate);

		let l = this._activeFilters.length;
		let v = value.toLowerCase();

		for (let i = 0; i < l; i++) {
			if (v === this._activeFilters[i]) {
				this._activeFilters.splice(i, 1);
				break;
			}
		}

		let delay = 0.1;
		if (Globals.RESET_FILTER_AFTER_TRANSITION === true) {
			delay = 0.1;
		}

		gsap.delayedCall(delay, this.triggerUpdate);
	};

	public removeCurrentFilter = () => {
		if (this._activeFilters.length > 0) {
			this.removeFilter(this._activeFilters[0]);

			let q = this._filterButtons.length;
			for (let i = 0; i < q; i++) {
				this._filterButtons[i].classList.remove('highlight');
			}
		}
	};

	private triggerUpdate = () => {
		this._updateSignal.dispatch({ filters: this._activeFilters, sort: this._activeSort, sortDirection: this._activeSortDirection });
		Globals.RESET_FILTER_AFTER_TRANSITION = false;
		Globals.MAIN_MENU.closeMobileMenu();
	};

	public reset = () => {
		this.updateId(999);
	};

	public hideSecondaryMenu = () => {
		if (this._currentlySelectedSecondaryMenu) {
			if (this._currentlySelectedSecondaryMenu) {
				this._currentlySelectedSecondaryMenu.style.display = 'none';
			}
			this._currentlySelectedSecondaryMenu = null;
		}
	};

	get haveFilters() {
		return this._activeFilters.length > 0;
	}

	get onUpdate() {
		return this._updateSignal;
	}

	get search() {
		return this._search;
	}

	public getCurrentSecondaryFilter = () => {
		return this._currentlySelectedSecondaryMenu;
	};
}
