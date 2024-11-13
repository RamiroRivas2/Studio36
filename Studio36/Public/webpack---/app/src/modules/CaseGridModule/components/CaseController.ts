import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import * as Stats from 'stats.js';
import { clamp } from '../../../../lib/com/hellomonday/utils/MathUtils';
import { WheelController } from '../../../controllers/WheelController';
import { Globals } from '../../../data/Globals';
import { ProjectWorker } from '../../../fallbacks/ProjectWorker';
import { KeyboardControls } from '../../../input/KeyboardControls';
import { WindowManager } from '../../../utils/WindowManager';
import { CaseEntry } from './case/CaseEntry';
import { IProjectPositionData } from './case/IProjectPositionData';

const MAX_WIDTH: number = 1080;
const SCALE_OFFSET: number = 0.2;

interface ScaleOffset {
	value: number;
}

export class CaseController {
	private _element: HTMLDivElement;
	private _caseContainer: HTMLDivElement;
	private _gridContainer: HTMLDivElement;
	private _caseElements: NodeListOf<HTMLDivElement>;
	private _entries: Array<CaseEntry> = [];
	private _totalCases: number;

	private _mainDraggable: Draggable;

	private _snapping: boolean = false;
	private _snapId: number = 0;
	private _mobileSnapID: number = 0;
	private _currentCaseEntry: CaseEntry;

	private _prevY: number = 0;
	private _velocityScale: number = 0.55;

	private _hasOnWheelBeenCalled: boolean = false;

	private _scaleOffset: ScaleOffset = { value: SCALE_OFFSET };

	private _mainCaseInfoContainer: HTMLDivElement;
	private _caseInfoContainers: Array<HTMLDivElement> = [];

	private _ignoreScrollVelocity: boolean = false;

	private _overlayLeft;
	private _overlayRight;
	private _backToOverview;

	private _projectURL;

	private _allowZoomBack: boolean = true;

	private _mousePositionState = 'none';

	private _forcedDisplayStateCount = -1;

	private _observer: IntersectionObserver;

	private _containerHeight: number;

	private _initial: boolean = true;

	private _keySnap: boolean = false;

	private _wheelController: WheelController = new WheelController();

	private _stats: Stats;

	private _isDragging: boolean = false;

	private _totalHeight: number;
	private _prevTotalHeight: number = -1;

	private _prevWheelDelta: number = 0;
	private _scrollDirection: string = 'down';

	private _wheelScrolling: boolean = false;

	private _shuffleMoveContainerOnX = { value: 0 };

	private _shuffleOptions = { shouldScale: false };

	private _shuffleTime = 0.35; //0.35; //0.15 -- ws 0.8 -- 0.65

	private _settings = { scrollSpeed: 1.5, scrollSpeedDragging: 0.22 };

	private _elementDisplayStates: Array<boolean> = [];

	private _gridSpacer: HTMLDivElement;

	private _introElementOffset = { value: -2000 };

	private _previousScale: number = 0;

	private _entrySpacing = { value: 40 };
	private _entrySpacingConstValue = 40;

	private _renderedSnapId: number = 0;
	private _snapIdDirty: boolean = false;

	private _projectPositionData: Array<IProjectPositionData> = [];

	private _projectWorker: Worker | ProjectWorker;

	private _currentScale: number = 1;

	private _proxy: HTMLDivElement;

	private _draggable;

	private _previousWindowHeight = 0;
	private _previousScreenHeight = 0;

	private _compensateFirstItem = { value: 0 };

	private _compensateOnY = 0;
	private _compensateOnYOnScroll = 0;
	private _secondaryFilterShown = false;

	private minimumScaleOffset = 0.65; //0.55;

	private _previousScrollY: number = 0;

	private _portrait;

	constructor(element: HTMLDivElement) {
		this._element = element;

		if (window.location.pathname.indexOf('/projects') > -1) {
			var getLastIndex = window.location.pathname.lastIndexOf('/');
			var getProjectURL = window.location.pathname.substring(getLastIndex + 1);
			this._projectURL = getProjectURL;
			Globals.INITIAL_SEARCH_VALUE = 'gotoProject-' + this._projectURL;
		}

		Globals.MOBILE_LAYOUT_FIRST_LOAD = Globals.MOBILE_LAYOUT;

		const queryString = new URLSearchParams(window.location.search);
		var getSearchValue = queryString.get('filter');
		if (getSearchValue != '' && getSearchValue != null) {
			var getResults = getSearchValue.split(',');

			Globals.INITIAL_SEARCH_VALUE = getResults[0];

			if (getResults.length > 1) {
				Globals.INITIAL_SEARCH_VALUE_SECONDARY = getResults[1];
			}
		}

		var getZoomValue = queryString.get('zoom');
		if (getZoomValue != '' && getZoomValue != null) {
			this.minimumScaleOffset = parseFloat(getZoomValue);
		}

		this._element = element;
		this._caseContainer = this._element.querySelector('.cases');

		this._gridContainer = this._element.querySelector('.gridContainer');

		Globals.MAIN_FILTER.toggle(true);
		Globals.PROGRESS_INDICATOR = this._element.parentNode.querySelector('.progressIndicator');
		Globals.INTRO.completeSignal.add(this.onIntroCompleted);

		window.addEventListener('scroll', this.onScrollEvent);

		this.setupArrowOverlay();

		this._projectWorker = new ProjectWorker();

		this._projectWorker.onmessage = this.workerUpdate;

		if (Globals.DEBUG_SHOW_STATS) {
			this._stats = new Stats();
			this._stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
			this._stats.dom.style.right = '0px';
			this._stats.dom.style.left = 'unset';

			document.body.appendChild(this._stats.dom);
		}

		this._gridSpacer = document.body.querySelector('.CaseGridSpacer');
		this._gridSpacer.style.minHeight = '100vh';

		this._caseElements = element.querySelectorAll('.CaseEntry');

		this._totalCases = this._caseElements.length;

		for (let i = 0; i < this._totalCases; i++) {
			this._elementDisplayStates.push(true);

			let entry = new CaseEntry(this._caseElements[i] as HTMLDivElement, i, this, this._caseElements[i].querySelector('.CaseInfo'), this._wheelController);
			this._entries.push(entry);

			entry.element.dataset.id = i + '';
			entry.element.style.display = 'none';

			this._projectPositionData.push({ y: 0 + i * WindowManager.height, inView: false, scale: 1 });
		}

		Globals.MAIN_MENU.filter.search.populateAutocompletion(this._entries);

		Globals.CASE_CONTROLLER = this;

		this.setupArrowOverlay();

		this._prevWheelDelta = 0;

		if (Globals.FIRST_INIT === true) {
			Globals.MAIN_MENU.filter.onUpdate.add(this.onFilterUpdate);
			Globals.MAIN_FILTER.checkForInitialSearchValue();

			gsap.to(this._introElementOffset, { value: 0, duration: 2, ease: 'power1.out', delay: 1, overwrite: true });
			gsap.to(this, { _velocityScale: 1, duration: 2, ease: 'power1.out', delay: 1, overwrite: true, onUpdate: this.render });
		} else {
			gsap.delayedCall(0, this.delayedFilterUpdate);
			gsap.to(this._introElementOffset, { value: 0, duration: 0.01, ease: 'power1.out', delay: 0, overwrite: true });
			gsap.to(this, { _velocityScale: 1, duration: 0.01, ease: 'power1.out', delay: 0, overwrite: true, onUpdate: this.render });
		}

		gsap.delayedCall(0.01, this.firstScroll);

		this._portrait = window.matchMedia('(orientation: portrait)');
		var resizeThis = this.resizeSpecific;
		this._portrait.addEventListener('change', function(e) {
			try {
				if (e.matches) {
					gsap.killTweensOf(this._caseContainer);
					gsap.killTweensOf(this);
					gsap.killTweensOf(window);

					gsap.delayedCall(0.0, resizeThis, [null, true]);
				} else {
					gsap.killTweensOf(this._caseContainer);
					gsap.killTweensOf(this);
					gsap.killTweensOf(window);

					gsap.delayedCall(0.0, resizeThis, [null, true]);
				}
			} catch (e) {}
		});
		this.resizeSpecific();
		this.start();
	}

	private mobileSnapTo = () => {
		gsap.killTweensOf(this._caseContainer);
		gsap.killTweensOf(this);
		gsap.killTweensOf(window);

		this._snapId = this._mobileSnapID;
		this.setSnapId(this._snapId);
		this.snap(this._snapId, 0.0, true);
		if (this._currentCaseEntry) {
			this._currentCaseEntry.mobileUpdateSnapPrevious();
		}
	};

	public setMobileSnapID = (snapID, caseEntry) => {
		this._mobileSnapID = snapID;
		this._currentCaseEntry = caseEntry;
	};

	public clearProjectURL = () => {
		this._projectURL = null;
	};

	public handleProjectDeeplink = (path: string, setCaseOpen = false) => {
		if (path === 'home') {
			this._projectURL = null;
			Globals.INITIAL_SEARCH_VALUE = '';
			Globals.INITIAL_SEARCH_VALUE_SECONDARY = '';
			Globals.MAIN_MENU.resetFilter();
		} else {
			var getLastIndex = path.lastIndexOf('/');
			var getProjectURL = path.substring(getLastIndex + 1);

			this._projectURL = getProjectURL;

			for (var i = 0; i < this._entries.length; i++) {
				var getEntry = this._entries[i];
				var getEntryProjectID = getEntry.getProjectID();
				if (getEntryProjectID == getProjectURL) {
					if (getEntry.disabled === false) {
						Globals.CASE_OPEN = setCaseOpen;
						getEntry.clickStartedInitiate();
					} else {
						Globals.MAIN_MENU.resetFilter();
					}
				}
			}
		}
	};

	public goToProjectUrl = (projectUrl: string) => {
		var timer = 1;
		if (Globals.MAIN_FILTER.haveFilters) {
			this._projectURL = null;
			Globals.INITIAL_SEARCH_VALUE = '';
			Globals.INITIAL_SEARCH_VALUE_SECONDARY = '';
			Globals.MAIN_MENU.resetFilter();
			Globals.MAIN_FILTER.removeCurrentFilter();
			timer = 800;
		}

		setTimeout(() => {
			var getLastIndex = projectUrl.lastIndexOf('/');
			var getProjectURL = projectUrl.substring(getLastIndex + 1);
			this._projectURL = getProjectURL;

			for (var i = 0; i < this._entries.length; i++) {
				var getEntry = this._entries[i];
				var getEntryProjectID = getEntry.getProjectID();
				if (getEntryProjectID == getProjectURL) {
					Globals.TEMPLATE_MANAGER.path('projects/' + this._projectURL);
					Globals.CASE_OPEN = true;
					break;
				}
			}
		}, timer);
	};

	private orientationChange() {}

	private mobileResize(e) {
		if (e.matches) {
		} else {
		}
	}

	private firstScroll = () => {
		gsap.set(window, {
			scrollTo: { y: 0, autoKill: true }
		});
	};

	private onScrollEvent = event => {
		if (this._allowZoomBack === true) {
			this._hasOnWheelBeenCalled = false;

			gsap.killTweensOf(this.zoomBack);
			gsap.delayedCall(0.3, this.zoomBack);
		}
	};

	private allowZoomBack = () => {
		this._allowZoomBack = true;
	};

	private zoomBack = () => {
		if (this._hasOnWheelBeenCalled === false && Globals.CASE_OPEN === false) {
			gsap.to(this, { _velocityScale: 1, duration: 1.5, ease: 'power1.out', overwrite: true });
		}
	};

	private cancelDrag = event => {
		this._isDragging = false;
	};

	private setupGUI = () => {};

	private start = () => {
		Globals.INTRO.completeSignal.remove(this.start);
		Globals.SCROLL_CONTROLLER.onUpdate.add(this.onScroll);
		if (Globals.IS_TOUCH_DEVICE !== true) {
			this._wheelController.onScroll.add(this.onWheel);

			this._wheelController.onDragUpdate.add(this.onWheelDragUpdate, this, 0);
		}

		this.addMainDraggable();

		KeyboardControls.getInstance().add(this.onKeyboardInput);

		gsap.ticker.add(this.render);
	};

	private onIntroCompleted = () => {
		Globals.INTRO.completeSignal.remove(this.onIntroCompleted);
		setTimeout(() => {
			try {
				if (Globals.TEMPLATE_MANAGER.getPath().includes('/projects/')) {
					var firstEntryNotDisabled = this._entries.find(entry => !entry.disabled);
					if (firstEntryNotDisabled) {
						firstEntryNotDisabled.clickStarted();
					}
				}
			} catch (err) {}
		}, 10);
	};

	private addMainDraggable = () => {
		if (Globals.MAIN_DRAGABLE == null) {
			var proxy = document.createElement('div');

			var onWheel = this.onWheel;
			this._proxy = proxy;

			var tracker = InertiaPlugin.track(proxy, 'y')[0];

			var firstDrag = false;
			var allowVelocity = false;

			if (Globals.IS_TOUCH_DEVICE !== true) {
				// @ts-ignore
				this._mainDraggable = Draggable.create(proxy, {
					trigger: document.body,
					minimumMovement: 16,
					throwProps: true,
					inertia: true,
					allowEventDefault: true,
					dragClickables: true,
					edgeResistance: 1,
					throwResistance: 100,
					onThrowUpdate: function(event) {
						if (Globals.IS_DRAGGING === false) {
							var velocityY = tracker.get('y') / 10;

							if (Globals.DRAG_IS_OVER_DELTA == true) {
								allowVelocity = true;
								firstDrag = false;
								Globals.DRAG_IS_OVER_DELTA = false;
							}

							if (allowVelocity === true) {
								this._isDragging = true;
								onWheel(velocityY, true);
								this._isDragging = false;
							}
						}
					},
					onDrag: function(event) {
						firstDrag = true;
						allowVelocity = false;
					},
					onRelease: function() {}
				});

				Globals.MAIN_DRAGABLE = this._mainDraggable[0];
			}
		} else {
			this._mainDraggable = Globals.MAIN_DRAGABLE;
		}
	};

	private delayedFilterUpdate = () => {
		Globals.MAIN_MENU.filter.onUpdate.add(this.onFilterUpdate);
		Globals.MAIN_FILTER.checkForInitialSearchValue();
	};

	private draggableUpdate = event => {
		var yPos = event.y;

		window.scrollTo(0, yPos);
	};

	public onFilterUpdate = ({ filters, sort, sortDirection }) => {
		if (Globals.INITIAL_SEARCH_VALUE !== null) {
			this._shuffleTime = 0;
		}

		Globals.IS_SHUFFLING = true;

		let distanceTop = window.scrollY / 4000;
		let delay = distanceTop + 0.1;
		if (distanceTop > 1) {
			distanceTop = 1;
		}
		delay = 0;
		Globals.SHUFFLE_CLOSE_DELAY = 0;
		Globals.SHUFFLE_ANIM_TIME = this._shuffleTime;

		var maxNumberOfCases = this._entries.length; //getCasesUpToThisNumberAndFold;
		if (maxNumberOfCases > 7) {
			maxNumberOfCases = 7;
		}

		if (Globals.CASE_CONTROLLER !== null) {
			if (Globals.CASE_OPEN) {
				Globals.CASE_OPEN_IS.collapse();
			}

			this.setSnapId(0);
		}

		gsap.to(this._caseContainer, { duration: this._shuffleTime, ease: 'power1.in', y: -WindowManager.height * 2 });
		for (let i = 0; i < maxNumberOfCases; i++) {
			var getCase = this._entries[i];

			if (this._caseElements[i].style.display === 'block') {
				gsap.to(getCase, { delay: delay, shuffleYPosModifier: 0, yPosSubstraction: 500, duration: this._shuffleTime, ease: 'power1.in' });
			}
		}
		gsap.delayedCall(this._shuffleTime + delay + 0.1, this.shuffleIntoPlace, [{ filters, sort, sortDirection }]);
	};

	private resetScaleAndVelocity = () => {
		gsap.killTweensOf(this._caseContainer);
		gsap.killTweensOf(this);
		gsap.killTweensOf(window);

		this._previousScrollY = 0;
		this._velocityScale = 1;
		this._scaleOffset.value = SCALE_OFFSET;
		var calcScale = clamp(this._velocityScale - this._scaleOffset.value, this.minimumScaleOffset, 1);

		if (Globals.MOBILE_LAYOUT === false && this._previousScale !== calcScale) {
			gsap.set(this._caseContainer, { scale: calcScale, duration: 0.4, ease: 'power1.out' });
		}
		gsap.killTweensOf(this._caseContainer);
		Globals.CASE_CONTROLLER_SCALE_VALUE = calcScale;
	};

	public reOrderCaseEntries = ({ filters, sort, sortDirection }: { filters: any[]; sort: string; sortDirection: 'asc' | 'desc' }) => {
		if (filters.includes('landscape')) {
			this._entries = this._entries.sort((a, b) => {
				if (sort === 'chronological' || sort === 'newest' || sort === 'new') {
					return sortDirection === 'asc' ? a.projectDateSort - b.projectDateSort : b.projectDateSort - a.projectDateSort;
				} else if (sort === 'alphabetical') {
					return sortDirection === 'asc' ? a.projectTitle.localeCompare(b.projectTitle) : b.projectTitle.localeCompare(a.projectTitle);
				}

				return a.positionLandscape - b.positionLandscape;
			});
		} else if (filters.includes('engineering')) {
			this._entries = this._entries.sort((a, b) => {
				if (sort === 'chronological' || sort === 'newest' || sort === 'new') {
					return sortDirection === 'asc' ? a.projectDateSort - b.projectDateSort : b.projectDateSort - a.projectDateSort;
				} else if (sort === 'alphabetical') {
					return sortDirection === 'asc' ? a.projectTitle.localeCompare(b.projectTitle) : b.projectTitle.localeCompare(a.projectTitle);
				}

				return a.positionEngineering - b.positionEngineering;
			});
		} else if (filters.includes('planning')) {
			this._entries = this._entries.sort((a, b) => {
				if (sort === 'chronological' || sort === 'newest' || sort === 'new') {
					return sortDirection === 'asc' ? a.projectDateSort - b.projectDateSort : b.projectDateSort - a.projectDateSort;
				} else if (sort === 'alphabetical') {
					return sortDirection === 'asc' ? a.projectTitle.localeCompare(b.projectTitle) : b.projectTitle.localeCompare(a.projectTitle);
				}

				return a.positionPlanning - b.positionPlanning;
			});
		} else if (filters.includes('products')) {
			this._entries = this._entries.sort((a, b) => {
				if (sort === 'chronological' || sort === 'newest' || sort === 'new') {
					return sortDirection === 'asc' ? a.projectDateSort - b.projectDateSort : b.projectDateSort - a.projectDateSort;
				} else if (sort === 'alphabetical') {
					return sortDirection === 'asc' ? a.projectTitle.localeCompare(b.projectTitle) : b.projectTitle.localeCompare(a.projectTitle);
				}

				return a.positionProducts - b.positionProducts;
			});
		} else {
			this._entries = this._entries.sort((a, b) => {
				if (sort === 'chronological' || sort === 'newest' || sort === 'new') {
					return sortDirection === 'asc' ? a.projectDateSort - b.projectDateSort : b.projectDateSort - a.projectDateSort;
				} else if (sort === 'alphabetical') {
					return sortDirection === 'asc' ? a.projectTitle.localeCompare(b.projectTitle) : b.projectTitle.localeCompare(a.projectTitle);
				}

				return sortDirection === 'desc' ? a.originalID - b.originalID : b.originalID - a.originalID;
			});
		}

		var list = this._element.querySelector('.cases');
		list.innerHTML = '';

		for (var i = 0; i < this._entries.length; i++) {
			list.appendChild(this._entries[i].element);
		}

		this._caseElements = this._element.querySelectorAll('.CaseEntry');

		for (let i = 0; i < this._entries.length; i++) {
			this._entries[i]._id = i;

			// @ts-ignore
			this._entries[i].element.dataset.id = i;
		}
	};

	private shuffleIntoPlace = ({ filters, sort, sortDirection }) => {
		this.reOrderCaseEntries({ filters, sort, sortDirection });
		this.resetScaleAndVelocity();

		Globals.SCROLL_CONTROLLER.enabledScroll();

		this._prevWheelDelta = WindowManager.halfHeight * 1.4 + 30;

		gsap.killTweensOf(window);

		this._ignoreScrollVelocity = true;
		gsap.set(window, {
			scrollTo: { y: 0, autoKill: false },
			overwrite: true,
			delay: 0.0,
			duration: 0,
			ease: Globals.PROJECT_ANIMATION_EASE
		});

		var countToTwentyCasesThatAreNowDisabled = 0;
		var getCasesUpToThisNumberAndFold = 0;
		var length = this._entries.length;

		for (let i = 0; i < length; i++) {
			if (this._entries[i].disabled === false) {
				countToTwentyCasesThatAreNowDisabled++;
			}
			if (countToTwentyCasesThatAreNowDisabled <= 4) {
				getCasesUpToThisNumberAndFold = i;
			}

			this._entries[i].checkFilter(filters, this._projectURL);
		}
		this._projectURL = null;
		Globals.INITIAL_SEARCH_VALUE = '';
		Globals.INITIAL_SEARCH_VALUE_SECONDARY = '';

		let l = this._entries.length;
		let numberOfEnabledCasesFound = 0;
		for (let i = 0; i < l; i++) {
			var getCase = this._entries[i];
			getCase.closeCompletely();
			getCase.forceSetDisabled();

			if (getCase.disabled === false) {
				numberOfEnabledCasesFound++;
				if (numberOfEnabledCasesFound < 7) {
					getCase.shuffleYPosModifier = 0;
					getCase.yPosSubstraction = 500;
				} else {
					getCase.shuffleYPosModifier = 1;
					getCase.yPosSubstraction = 0;
				}
			}
		}

		this.render();

		gsap.to(this._caseContainer, { duration: this._shuffleTime / 2, ease: 'power1.out', y: 0 });
		for (let i = 0; i < this._entries.length; i++) {
			var getCase = this._entries[i];

			gsap.to(getCase, { shuffleYPosModifier: 1, yPosSubstraction: 0, duration: this._shuffleTime, ease: 'power1.out' });
		}

		this.adjustMarginTop();

		this.firstScroll();

		gsap.delayedCall(this._shuffleTime, this.shuffleCompleted);
	};

	private shuffleCompleted = () => {
		this.resetScaleAndVelocity();

		Globals.SCROLL_CONTROLLER.enabledScroll();

		this._forcedDisplayStateCount = -1;
		let l = this._entries.length;
		for (let i = 0; i < l; i++) {
			var getCase = this._entries[i];
			getCase.shuffleYPosModifier = 1;
		}
		this._ignoreScrollVelocity = false;

		Globals.INITIAL_SEARCH_VALUE = null;
		Globals.INITIAL_SEARCH_VALUE_SECONDARY = null;
		this._shuffleTime = 0.35;

		gsap.delayedCall(0.1, this.openProject);
	};

	private openProject = () => {
		if (Globals.INITIAL_SEARCH_VALUE !== null && Globals.INITIAL_SEARCH_VALUE !== '') {
			var findFirstEntryNotHidden = null;

			var numberOfEntries = 0;
			let l = this._entries.length;

			for (let i = 0; i < l; i++) {
				if (this._entries[i].fullHeight != 0) {
					findFirstEntryNotHidden = i;
					numberOfEntries++;
				}
			}

			if (findFirstEntryNotHidden && numberOfEntries === 1) {
				this._entries[findFirstEntryNotHidden].activate();
			}

			Globals.INITIAL_SEARCH_VALUE = null;
			Globals.INITIAL_SEARCH_VALUE_SECONDARY = null;
		}
	};

	private onWheelDragUpdate = (state: string) => {
		if (state === 'dragStart') {
			this._isDragging = true;
		} else {
			this._isDragging = false;
		}

		return;
	};

	public moveToNewID = newId => {
		gsap.killTweensOf(this.snapComplete);
		gsap.killTweensOf(this.snap);
		this._snapping = false;
		this._snapId = newId;
		this._snapIdDirty = true;
		this._keySnap = true;
		this.snap(newId, 1);
		if (Globals.CASE_OPEN) {
			Globals.CASE_OPEN_IS.collapse();
		}
		gsap.to(this._scaleOffset, { value: SCALE_OFFSET, duration: 1, ease: 'power2.out' });
	};

	private onKeyboardInput = (type: string, key: string, code: number) => {
		if (type === KeyboardControls.KEY_DOWN) {
			if (key === 'ArrowDown' || key === 'Escape') {
				this.closeInfo();

				let newId = this._snapId + 1;
				if (key === 'Escape') {
					newId = this._snapId + 0;
					if (Globals.CASE_OPEN === false) {
						return;
					}
				}

				if (newId < this._totalCases) {
					gsap.killTweensOf(this.snapComplete);
					gsap.killTweensOf(this.snap);
					this._snapping = false;
					this._snapId = newId;
					this._snapIdDirty = true;
					this._keySnap = true;
					this.snap(newId, 0.4);
					if (Globals.CASE_OPEN) {
						Globals.CASE_OPEN_IS.collapse();
					}
				} else if (newId === this._totalCases) {
					gsap.killTweensOf(this.snapComplete);
					gsap.killTweensOf(this.snap);
					this._snapping = false;
					this._snapId = newId;
					this._snapIdDirty = true;
					this._keySnap = true;

					if (Globals.CASE_OPEN) {
						Globals.CASE_OPEN_IS.collapse();
					}

					gsap.to(window, {
						scrollTo: { y: Globals.FOOTER.element.offsetTop - 40, autoKill: false },
						overwrite: true, //!skipOverwrite,
						duration: 0.4,
						ease: 'power2.out',
						onComplete: this.snapComplete
					});
				}
				gsap.to(this._scaleOffset, { value: SCALE_OFFSET, duration: 1, ease: 'power2.out' });
			} else if (key === 'ArrowUp') {
				this.closeInfo();

				let newId = this._snapId - 1;

				if (newId > -1) {
					gsap.killTweensOf(this.snapComplete);
					gsap.killTweensOf(this.snap);
					this._snapping = false;
					this._snapId = newId;
					this._snapIdDirty = true;
					this._keySnap = true;

					this.snap(newId, 0.4);
					if (Globals.CASE_OPEN) {
						Globals.CASE_OPEN_IS.collapse();
					}
				}
				gsap.to(this._scaleOffset, { value: SCALE_OFFSET, duration: 1, ease: 'power2.out' });
			}
			if (key === 'Enter' || code === 32 || key === 'Space') {
				this._entries[this._snapId].activate();
			}

			if (this._entries[this._snapId] !== undefined) {
				if (this._entries[this._snapId].state === 'OPEN' || this._entries[this._snapId].state === 'LOCKED') {
					if (key === 'ArrowRight') {
						this._entries[this._snapId].stepRight();
					} else if (key === 'ArrowLeft') {
						this._entries[this._snapId].stepLeft();
					}
				}
			}
		}
	};

	private render = () => {
		if (Globals.DEBUG_SHOW_STATS) {
			this._stats.begin();
		}

		let scrollCenter = this._entrySpacingConstValue;
		let scale = clamp(this._velocityScale - this._scaleOffset.value, this.minimumScaleOffset, 1);
		if (Globals.CASE_OPEN) {
		}
		this._currentScale = scale;
		let y = 30 + this._introElementOffset.value - window.scrollY + (Globals.MOBILE_LAYOUT ? 40 : 0) + this._compensateFirstItem.value;
		let scaledY = y * scale;
		let l = this._entries.length;
		let i = 0;
		let total = 0;
		let entryHeight;
		let showing = 0;

		for (i; i < l; i++) {
			this._projectWorker.postMessage([
				y,
				scale,
				scaledY * this._entries[i].shuffleYPosModifier,
				scrollCenter,
				WindowManager.halfHeight,
				this._entries[i].fullHeight,
				this._entries[i].mainInfoHeight,
				this._entries[i].state,
				i,
				WindowManager.height,
				this._entries[i].centerPercent
			]);

			entryHeight = this._entries[i].fullHeight + this._entrySpacing.value + (Globals.MOBILE_LAYOUT ? 0 : 0);

			y += entryHeight * this._entries[i].disabledScale * this._entries[i].shuffleYPosModifier; // - this._entries[i].yPosSubstraction;
			/*	if (i===0) {
					console.log(y)
				}*/
			scaledY += entryHeight * scale * this._entries[i].disabledScale;
			total += entryHeight * this._entries[i].disabledScale;

			this._entries[i].setScaledY(scale);
		}

		this._totalHeight = total + this._entrySpacing.value + scrollCenter + 100;

		if (this._prevTotalHeight !== this._totalHeight) {
			this._prevTotalHeight = this._totalHeight;
			gsap.set(this._gridSpacer, { height: this._totalHeight });
		}

		if (!Globals.MOBILE_LAYOUT) {
			this.updateVelocityScale();
		}
		if (Globals.DEBUG_SHOW_STATS) {
			this._stats.end();
		}
	};

	public workerUpdate = (e): any => {
		let data = JSON.parse(e.data);

		this._elementDisplayStates[data.id] = data.displayState;
		gsap.set(this._caseElements[data.id], { display: data.displayState ? 'block' : 'none' });
		if (this._entries[data.id].disabled === true) {
			gsap.set(this._caseElements[data.id], { display: 'none' });
		}

		this._entries[data.id].inView = data.displayState;

		if (data.displayState === true) {
			gsap.set(this._caseElements[data.id], { y: data.y });

			this._entries[data.id].loadSmallImage();

			if (this._entries[data.id].state === 'CLOSED') {
				this._entries[data.id].centerPercent = data.clampedCenterPercent;
			}
			if (this._entries[data.id].state === 'OPEN') {
				this._entries[data.id].lock();
				gsap.to(this._entries[data.id], { centerPercent: 0, infoScale: 1, duration: Globals.PROJECT_ANIMATION_SPEED, overwrite: true, ease: Globals.PROJECT_ANIMATION_EASE });
			}

			if (data.entryCenterPercent >= 0 && data.entryCenterPercent <= 1) {
				this._renderedSnapId = data.id;
			}

			this._entries[data.id].caseInfo.scale = 1;
		}
	};

	private updateVelocityScale = () => {
		var getWindowScrollPosition = window.scrollY;
		var differenceScroll = getWindowScrollPosition - this._previousScrollY;
		if (differenceScroll < 0) {
			differenceScroll = differenceScroll * -1;
		}
		differenceScroll = differenceScroll + 50;

		this._previousScrollY = getWindowScrollPosition;

		var calcScale = clamp(this._velocityScale - differenceScroll / 200, this.minimumScaleOffset, 1);

		if (Globals.CASE_OPEN) {
			calcScale = 1;
		}

		if (this._previousScale !== calcScale) {
			var calcTransformY = WindowManager.halfHeight - 80;

			gsap.to(this._caseContainer, { scale: calcScale, duration: 0.5, transformOrigin: '50% ' + calcTransformY + 'px', ease: 'none' });
		}

		Globals.CASE_CONTROLLER_SCALE_VALUE = this._caseContainer._gsap.scaleX;
		this._previousScale = calcScale;
	};

	private onScroll = () => {
		if (this._wheelScrolling === false) {
			this._prevWheelDelta = window.scrollY;
		}

		if (!Globals.MOBILE_LAYOUT && this._ignoreScrollVelocity === false) {
			this.updateScrollSpeed();
		}
	};

	public onWheel = (deltaY: number, forceDrag?: boolean, deltaX?) => {
		this._hasOnWheelBeenCalled = true;

		if (this._snapping) {
			return;
		}

		var normalizeDeltaY = deltaY;
		if (deltaY < 0) {
			normalizeDeltaY = deltaY * -1;
		}
		var normalizeDeltaX = deltaX;
		if (deltaX < 0) {
			normalizeDeltaX = deltaX * -1;
		}

		if (normalizeDeltaX >= normalizeDeltaY) {
			if (Globals.CASE_OPEN === true) {
				Globals.CASE_OPEN_IS.scrollY(deltaX);
				return;
			}
		}

		if (forceDrag === true) {
			this._isDragging = true;
		} else if (forceDrag === false) {
			this._isDragging = false;
		}

		deltaY = deltaY * this._settings.scrollSpeed;

		if (this._isDragging) {
			deltaY = deltaY * this._settings.scrollSpeedDragging;
		}

		this._scrollDirection = deltaY < 0 ? 'up' : 'down';

		this._wheelScrolling = true;

		this.closeInfo();

		if (Globals.CASE_OPEN_IS) {
			Globals.CASE_OPEN_IS.collapse();
		}

		let newDelta = Math.round(clamp(this._prevWheelDelta + deltaY, 0, this._totalHeight + Globals.FOOTER.totalHeight - WindowManager.height + 250));

		this._prevWheelDelta = newDelta;

		if (!this._snapping) {
			var duration = 1;
			if (this._isDragging) {
				duration = 0.0;
				gsap.set(window, {
					scrollTo: { y: newDelta },
					onComplete: this.onWheelComplete
				});
				gsap.to(this._scaleOffset, { value: SCALE_OFFSET, duration: 0.5, ease: 'none' });
			} else {
				gsap.to(window, {
					scrollTo: { y: newDelta, autoKill: true },
					overwrite: true, //!skipOverwrite,
					duration: duration, //0.5,
					ease: 'power2.out',
					onComplete: this.onWheelComplete
				});

				gsap.to(this._scaleOffset, { value: SCALE_OFFSET, duration: duration, ease: 'none' });
			}
		}
	};

	private updateScrollSpeed = () => {
		return;
	};

	private onWheelComplete = () => {
		gsap.killTweensOf(this.zoomBack);
		this._hasOnWheelBeenCalled = true;
		this._prevWheelDelta = window.scrollY;
		this._wheelScrolling = false;
		this._allowZoomBack = false;
		gsap.killTweensOf(this.allowZoomBack);
		gsap.delayedCall(0.5, this.allowZoomBack);
	};

	public setSnapId = (id: number) => {
		gsap.killTweensOf(this.snap);
		gsap.killTweensOf(window);
		this._snapId = id;
		this._snapIdDirty = true;
	};

	public snap = (id: number, speed?: number, force?: boolean) => {
		if (force === true) {
		} else {
			if (id !== this._snapId || id > this._entries.length - 1) {
				return;
			}
		}

		let s = speed !== undefined && speed !== null ? speed : Globals.PROJECT_ANIMATION_SPEED; //speed || 0.5;

		this._initial = false;

		this._wheelScrolling = false;

		this._snapping = true;

		let pos = Math.round(this.getElementSnapPosition(id));

		gsap.killTweensOf(this._scaleOffset);
		gsap.killTweensOf(this);
		gsap.killTweensOf(window);

		gsap.to(this._scaleOffset, { value: 0, duration: s, ease: 'none', overwrite: true });

		gsap.to(window, {
			scrollTo: { y: Math.abs(pos) + this._compensateOnYOnScroll, autoKill: false },
			overwrite: true,
			duration: s,
			ease: Globals.PROJECT_ANIMATION_EASE,
			onComplete: this.snapComplete
		});
	};

	private closeInfo = () => {
		let l = this._entries.length;

		for (let i = 0; i < l; i++) {
			this._entries[i].closeInfo();
		}
	};

	private getElementSnapPosition = (id: number) => {
		let l = this._entries.length;
		let y = Globals.MOBILE_LAYOUT ? 0 : 0;

		var firstNonDisabledId = -1;
		for (let i = 0; i < l; i++) {
			if (this._entries[i].disabled === false) {
				firstNonDisabledId = i;
				break;
			}
		}

		if (id !== firstNonDisabledId) {
			if (this._secondaryFilterShown === true) {
				y -= 107;
			} else {
				y -= 133;
			}

			if (Globals.MOBILE_LAYOUT) {
				y = (this._entries[id].fullHeight + 60) / 2 - window.innerHeight / 2 + 60;
			} else {
				if (WindowManager.height < 600) {
					y += 60;
				}
			}
		} else {
			if (Globals.MOBILE_LAYOUT === true) {
				gsap.to(this._compensateFirstItem, { value: 10, duration: Globals.PROJECT_ANIMATION_SPEED, ease: 'none', overwrite: true });
			} else {
				var calculateCompensetation = WindowManager.height / 10;

				gsap.to(this._compensateFirstItem, { value: calculateCompensetation, duration: Globals.PROJECT_ANIMATION_SPEED, ease: 'none', overwrite: true });
			}

			if (this._secondaryFilterShown === true) {
				y = 0;
			} else {
				y = 0;
			}

			if (Globals.MOBILE_LAYOUT) {
				y = 0;
			}
		}

		if (id === firstNonDisabledId) {
			Globals.OFFSET_OVERLAYS = true;
		} else {
			Globals.OFFSET_OVERLAYS = false;
		}

		for (let i = 0; i < l; i++) {
			if (i === id) {
				break;
			}

			if (!this._entries[i].disabled) {
				y += this._entries[i].fullHeight + this._entrySpacing.value + (Globals.MOBILE_LAYOUT ? 0 : 0); //this._entries[i].state === CLOSED ? this._entries[i].halfHeight : this._entries[i].halfContainerHeight;
			}
		}

		return y;
	};

	public resetCompensateYValue = () => {
		gsap.to(this._compensateFirstItem, { value: 0, duration: Globals.PROJECT_ANIMATION_SPEED, ease: 'none', overwrite: true });
	};

	private snapComplete = () => {
		this.updateScrollSpeed();

		this._keySnap = false;

		gsap.delayedCall(0.2, this.allowSnapping);
	};

	private allowSnapping = () => {
		this._snapping = false;
	};

	private adjustMarginTop = () => {
		this._secondaryFilterShown = false;

		var calcTransformY = WindowManager.halfHeight - 80;

		gsap.set(this._caseContainer, { transformOrigin: '50% ' + calcTransformY + 'px' });

		var calculateHeightOffset = (1000 - WindowManager.height) / 35;

		if (Globals.MAIN_FILTER.getCurrentSecondaryFilter() == null) {
		} else {
			calculateHeightOffset = calculateHeightOffset - 40;
			this._secondaryFilterShown = true;
		}

		this._gridContainer.style.marginTop = Math.round((calcTransformY / 4) * -1 + 60 - calculateHeightOffset) + 'px';
	};

	public resize = (onlyUpdateThisID?) => {
		if ((Globals.MOBILE_OS !== 'Android' && Globals.MOBILE_OS !== 'iOS') || onlyUpdateThisID !== undefined) {
			this.resizeSpecific(onlyUpdateThisID);
		}
	};

	private resizeSpecific = (onlyUpdateThisID?, mobileSnap?: boolean) => {
		this.adjustMarginTop();

		if (Globals.CASE_OPEN) {
		}

		var allowContinue = true;

		if (Globals.MOBILE_OS === 'iOS' || Globals.MOBILE_OS === 'Android') {
			if (window.outerHeight === this._previousScreenHeight) {
				allowContinue = false;
			}
		}

		this._previousScreenHeight = window.outerHeight;
		this._previousWindowHeight = window.innerHeight;

		if (Globals.MOBILE_LAYOUT === true) {
			this._entrySpacing.value = 70;
			this._entrySpacingConstValue = 70;
		} else {
			this._entrySpacing.value = 40;
			this._entrySpacingConstValue = 40;
		}

		let bounds = this._caseContainer.getBoundingClientRect();
		this._containerHeight = bounds.height;

		let minimumContainerHeight = 350;

		var useHeight = WindowManager.height - 120 - Math.round(this._entrySpacing.value * 2);

		if (Globals.MOBILE_LAYOUT) {
			minimumContainerHeight = 150;
			useHeight = WindowManager.height - 0 - Math.round(this._entrySpacing.value * 0);
			if (Globals.MOBILE_OS === 'iOS' || Globals.MOBILE_OS === 'Android') {
				useHeight = window.innerHeight - 100;
			}
		}

		let containerHeight = Math.round(clamp(useHeight, minimumContainerHeight, Infinity));

		let gridWidth = window.innerWidth - 40;
		let w = Globals.MOBILE_LAYOUT ? gridWidth : 0.4285714286 * gridWidth;
		let containerWidth = Math.round(Math.min(w, MAX_WIDTH));

		if (containerHeight > containerWidth) {
		}

		if (!this._initial) {
			if (Globals.MOBILE_LAYOUT) {
			} else {
				if (Globals.CASE_OPEN === true) {
					this.snap(this._snapId, 0); //0.01);
				}
			}
		}

		let l = this._entries.length;
		for (let i = 0; i < l; i++) {
			this._entries[i].resize(containerWidth, containerHeight, gridWidth, false);
			this._entries[i].infoScale = this._entries[i].infoScale;
		}

		gsap.set(this._gridSpacer, { height: this._totalHeight });

		if (mobileSnap) {
			this.resizeSpecific();
			this.mobileSnapTo();
		}
	};

	public kill = () => {
		window.removeEventListener('scroll', this.onScrollEvent);
		this.clearArrowOverlay();
		Globals.SCROLL_CONTROLLER.enabledScroll();

		gsap.ticker.remove(this.render);

		Globals.CASE_OPEN = false;
		Globals.CASE_OPEN_IS = null;

		Globals.CASE_CONTROLLER = null;

		this._projectWorker.terminate();

		let l = this._entries.length;

		for (let i = 0; i < l; i++) {
			this._entries[i].kill();
		}

		Globals.SCROLL_CONTROLLER.onUpdate.remove(this.onScroll);

		this._wheelController.onScroll.remove(this.onWheel);
		this._wheelController.onDragUpdate.remove(this.onWheelDragUpdate);
		this._wheelController.kill();

		Globals.RESET_FILTER_AFTER_TRANSITION = true;
		Globals.MAIN_MENU.filter.onUpdate.remove(this.onFilterUpdate);
		Globals.MAIN_MENU.resetFilter();
		Globals.MAIN_FILTER.toggle(false);

		if (!Globals.IS_TOUCH_DEVICE) {
			KeyboardControls.getInstance().remove(this.onKeyboardInput);
		}
	};

	private setupArrowOverlay = () => {
		document.documentElement.addEventListener('mousemove', this.onMouseMove);

		document.documentElement.addEventListener('click', this.clickBody);

		this._overlayLeft = this._element.querySelector('.leftOverlay');
		this._overlayRight = this._element.querySelector('.rightOverlay');
		return;
	};

	private clearArrowOverlay = () => {
		document.documentElement.removeEventListener('mousemove', this.onMouseMove);

		document.documentElement.removeEventListener('click', this.clickBody);
	};

	private onMouseMove = (event?) => {
		if (Globals.CASE_OPEN) {
			var x = event.clientX;
			var y = event.clientY;

			var calculateArea = window.innerWidth / 5;

			if (x < calculateArea && y > 50 && x > 0) {
				if (Globals.BURGER_MENU.open === true && x <= 150) {
					this._mousePositionState = 'none';
					if (Globals.GLOBAL_CURSOR.isDragging !== true && Globals.GLOBAL_CURSOR.isHoveringItem !== true) {
						Globals.GLOBAL_CURSOR.showCursorType('up');
					}
				} else {
					this._mousePositionState = 'left';

					if (Globals.GLOBAL_CURSOR.isDragging !== true) {
						if (Globals.CASE_OPEN_IS.getSnapID() > 0) {
							Globals.GLOBAL_CURSOR.showCursorType('arrow_left');
						}
					}
				}
			} else if (x > window.innerWidth - calculateArea && y > 50 && x < window.innerWidth) {
				if (Globals.MENU_SEARCH.active === true && x > window.innerWidth - 170) {
					this._mousePositionState = 'none';
					if (Globals.GLOBAL_CURSOR.isDragging !== true && Globals.GLOBAL_CURSOR.isHoveringItem !== true) {
						Globals.GLOBAL_CURSOR.showCursorType('up');
					}
				} else {
					this._mousePositionState = 'right';
					if (Globals.GLOBAL_CURSOR.isDragging !== true) {
						Globals.GLOBAL_CURSOR.showCursorType('arrow_right');
					}
				}
			} else {
				this._mousePositionState = 'none';
				if (Globals.GLOBAL_CURSOR.isDragging !== true && Globals.GLOBAL_CURSOR.isHoveringItem !== true) {
					Globals.GLOBAL_CURSOR.showCursorType('up');
				}
			}
		} else {
			Globals.GLOBAL_CURSOR.showCursorType('none');
		}
	};

	private clickBody = event => {
		if (Globals.CASE_OPEN === true) {
			if (this._mousePositionState === 'left') {
				if (Globals.CASE_OPEN === true) {
					Globals.CASE_OPEN_IS.stepLeft();
					event.stopPropagation();
				}
			} else if (this._mousePositionState === 'right') {
				if (Globals.CASE_OPEN === true) {
					Globals.CASE_OPEN_IS.stepRight();
					event.stopPropagation();
				}
			}
		}
	};

	public getAllCaseEntries = () => {
		return this._entries;
	};
}
