import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { clamp } from '../../../../../lib/com/hellomonday/utils/MathUtils';
import { Resizer } from '../../../../../lib/com/hellomonday/utils/Resizer';
import { WheelController } from '../../../../controllers/WheelController';
import { Globals } from '../../../../data/Globals';
import { WindowManager } from '../../../../utils/WindowManager';
import { CaseController } from '../CaseController';
import { AbstractCaseBlock } from './components/AbstractCaseBlock';
import { CaseGallery } from './components/CaseGallery';
import { CaseImage } from './components/CaseImage';
import { CaseInfo } from './components/CaseInfo';
import { CaseMap } from './components/CaseMap';
import { CaseQuote } from './components/CaseQuote';
import { CaseTeam } from './components/CaseTeam';
import { CaseText } from './components/CaseText';
import { CaseVideo } from './components/CaseVideo';
import { CaseEntryFilters } from './data/CaseEntryFilters';

export const CLOSED: string = 'CLOSED';
export const OPEN: string = 'OPEN';
export const COLLAPSED: string = 'COLLAPSED';
export const LOCKED: string = 'LOCKED';

const TYPE_LANDSCAPE: string = 'landscape';
const TYPE_PORTRAIT: string = 'portrait';

interface Bounds {
	width: number;
	height: number;
}

const INFO_MIN_WIDTH: number = 300;

let SPACING: number = 40;

export class CaseEntry {
	private _isDoingAnimationIn: boolean = false;
	private _yPosSubstraction = 0;
	private _storeXPosition: number = 0;

	private _draggableInitialized: boolean = false;

	private _boundsHeight: number = 0;

	private _scaledY: number = 0;

	public _draggable: Draggable[];

	private _openCompleted: boolean = false;

	private _element: HTMLElement;
	private _mainContainer: HTMLDivElement;
	private _iconTitle: HTMLDivElement;
	private _contentContainer: HTMLDivElement;
	private _heroImage;

	private _storeOriginalBlockData;

	private _tinyImage;
	private _smallImage;
	private _fullImage;

	private _tinyImageLoaded = false;
	private _smallImageLoaded = false;
	private _fullImageLoaded = false;

	private _storeYValue = 0;
	private _shuffleYPosModifier = 1;

	private _type: string;
	private _state: string = CLOSED;
	private _bounds: Bounds;

	private _blocks: Array<AbstractCaseBlock> = [];
	private _blockWidths = [];
	private _blockPositions = [];
	private _blockPositionalData = [];
	private _totalBlockCount: number = 0;

	private _imageBlocks = [];

	private _openPercent = { value: 0 };
	private _disabledScale = { value: 1 };
	public _wheelController: WheelController;
	private _filters: CaseEntryFilters;
	private _controller: CaseController;
	private _caseInfo: CaseInfo;

	private _initialAnimationCanceled: boolean = false;

	private _containerWidth: number;
	private _containerHeight: number;
	private _gridWidth: number;

	private _containerWidthPrevious: number;
	private _containerHeightPrevious: number;
	private _gridWidthPrevious: number;

	private _currentScale: number;
	public _id: number;
	private _projectURL: string;
	private _currentHeight: number;
	private _ratio: number;
	private _snapId: number = 0;
	private _previousSnapID: number = 0;
	private _heroWidth: number;
	private _dragStartX: number;
	private _prevXOffset: number = 0;
	private _xOffset: number = 0; // Offset main container if there is not enough room for the info text
	private _currentWidth: number = 9999999;
	private _halfWidth: number = 0;
	private _centerPercent: number;

	private _blocksEnabled: boolean = false;
	private _visible: boolean = false;
	private _paused: boolean = false;
	private _disabled: boolean = false;
	private _inView: boolean = false;
	private _open: boolean = false;
	private _draggingEnabled = false;

	private _caseHasBeenOpenedBefore: boolean = false;
	private _storeTotalWidth: number = 0;

	private _isOpen: boolean = false;

	private _previousScaleDifference: number = -1;

	private _scrolledToPercentageOfBounds: number = 0;

	private _debug: boolean = false;

	private _mobileInfo;

	private _heroImageRatio;

	private _originalChildPosition: number;

	private _snapPositions = { x: [0] };

	private _videoHasUpdatedSizes: boolean = false;

	private _directionalDrag = 'right';
	private _directionalDragStartPosition: number = 0;

	public positionLandscape: number;
	public positionEngineering: number;
	public positionPlanning: number;
	public positionProducts: number;
	public originalID: number;
	public projectDate: Date;
	public projectDateSort: number = 0;
	public projectUrl = '';
	public projectCode = '';
	public projectTitle = '';
	public projectLocation = { latitude: 0, longitude: 0 };
	public projectPopuplocation = '';

	private _src: string;

	private _firstTextBlockFound: boolean = false;
	private _firstTextBlock;
	private _firstTextBlockIndex: number = -1;

	constructor(element: HTMLElement, id: number, controller: CaseController, caseInfo: HTMLDivElement, wheelController: WheelController) {
		this._element = element;
		this._id = id;
		this._projectURL = element.getAttribute('data-project-url');
		this._controller = controller;
		this._wheelController = wheelController;
		this._type = element.getAttribute('data-type');
		this._ratio = parseFloat(element.dataset.ratio);

		this.originalID = this._id;
		this.positionLandscape = parseFloat(element.dataset.landscapepriority);
		this.positionEngineering = parseFloat(element.dataset.engineeringpriority);
		this.positionPlanning = parseFloat(element.dataset.planningpriority);
		this.positionProducts = parseFloat(element.dataset.productpriority);

		var projectDatasetDate = element.dataset.date;
		this.projectDate = new Date(
			Number(projectDatasetDate.substring(0, 4)),
			Number(projectDatasetDate.substring(4, 6)) - 1,
			Number(projectDatasetDate.substring(6, 8)),
			Number(projectDatasetDate.substring(8, 10)),
			Number(projectDatasetDate.substring(10, 12))
		);

		this.projectDateSort = this.projectDate.getTime();
		this.projectCode = (element.dataset.code || '').toLowerCase();
		this.projectUrl = element.dataset.projectUrl || '';
		this.projectTitle = this._element.querySelector('.projectTitle').textContent || '';
		this.projectPopuplocation = this._element.dataset.popuplocation || '';

		const location = this._element.dataset.location;
		if (location) {
			const latitude = parseFloat(location.split(',')[0]) || 0;
			const longitude = parseFloat(location.split(',')[1]) || 0;
			this.projectLocation = { latitude, longitude };
		}

		var getHeroBlock: HTMLDivElement = this._element.querySelector('.hero');

		this._src = getHeroBlock.dataset.src;
		if (Globals.MOBILE_LAYOUT) {
			var mobileSrc = getHeroBlock.getAttribute('data-mobile-src');
			if (mobileSrc !== '' && mobileSrc !== null) {
				this._src = mobileSrc;
			}
			this._ratio = 0.66666666666666667; // parseFloat(getHeroBlock.dataset.mobileHeight) / parseFloat(getHeroBlock.dataset.mobileWidth);
		}

		if (isNaN(this.positionLandscape)) {
			this.positionLandscape = this._id + 9999999999;
		}
		if (isNaN(this.positionEngineering)) {
			this.positionEngineering = this._id + 9999999999;
		}
		if (isNaN(this.positionPlanning)) {
			this.positionPlanning = this._id + 9999999999;
		}
		if (isNaN(this.positionProducts)) {
			this.positionProducts = this._id + 9999999999;
		}

		/*	console.log(this._id);

		console.log(this._positionLandscape)
		console.log(this._positionEngineering)*/

		this._mainContainer = element.querySelector('.mainContainer');
		this._heroImage = element.querySelector('.hero');

		// let caseInfoData = element.querySelector('.CaseInfo');

		this._caseInfo = new CaseInfo(caseInfo, id, this);
		this._mobileInfo = this._caseInfo.getMobileInfoElement();

		this._filters = new CaseEntryFilters(this._caseInfo);

		this._contentContainer = this._element.querySelector('.content');

		this._tinyImage = this._element.querySelector('.tiny');
		this._smallImage = this._element.querySelector('.small');
		this._fullImage = this._element.querySelector('.full');
		this.initHeroBlock();

		this._element.addEventListener('mouseover', this.mouseOver);
		this._element.addEventListener('mouseout', this.mouseOut);
		this._element.addEventListener('click', this.clickStarted);

		if (Globals.MOBILE_LAYOUT) {
			this._iconTitle = this._element.querySelector('.iconTitle');
		}
	}

	private mouseOver = e => {};

	private mouseOut = e => {};

	get draggingEnabled() {
		return this._draggingEnabled;
	}

	set draggingEnabled(value: boolean) {
		this._draggingEnabled = value;

		if (this._draggable && this._draggingEnabled) {
			this._draggable[0].enable();
		} else if (this._draggable) {
			this._draggable[0].disable();
		}
	}

	public clickStarted = () => {
		if (Globals.TEMPLATE_MANAGER.getPath().includes('projects/' + this._projectURL)) {
			this.clickStartedInitiate();
		} else {
			if (this._isOpen === false && this._isDoingAnimationIn !== true) {
				Globals.TEMPLATE_MANAGER.path('projects/' + this._projectURL);
			}
		}

		this.updateMetaInformation();
	};

	public updateMetaInformation = () => {
		const titleElement = document.head.querySelector('title');
		const ogTitleElement = document.head.querySelector('meta[property="og:title"]');
		const twitterTitleElement = document.head.querySelector('meta[name="twitter:title"]');
		const projectTitle = this._element.querySelector('.projectTitle').textContent;
		const title = `${projectTitle} | BIG | Bjarke Ingels Group`;

		if (titleElement) {
			titleElement.textContent = title;
		}

		if (ogTitleElement) {
			ogTitleElement.setAttribute('content', title);
		}

		if (twitterTitleElement) {
			twitterTitleElement.setAttribute('content', title);
		}

		const ogUrlElement = document.head.querySelector('meta[property="og:url"]');
		if (ogUrlElement) {
			ogUrlElement.setAttribute('content', window.location.href);
		}

		const ogImageElement = document.head.querySelector('meta[property="og:image"]');
		const ogSecureImageElement = document.head.querySelector('meta[property="og:image:secure_url"]');
		const twitterImageElement = document.head.querySelector('meta[name="twitter:image"]');
		const projectImage = this._element.querySelector('.image.hero').getAttribute('data-src');
		const image = projectImage;

		if (image && ogImageElement) {
			ogImageElement.setAttribute('content', image);
		}

		if (image && ogSecureImageElement) {
			ogSecureImageElement.setAttribute('content', image);
		}

		if (image && twitterImageElement) {
			twitterImageElement.setAttribute('content', image);
		}
	};

	public clickStartedInitiate = (event?) => {
		this._wheelController.dragged;

		if (Globals.MAIN_MENU.isMobileMenuOpen || Globals.IS_DRAGGING) {
			return;
		}

		if (Globals.CASE_OPEN === true && Globals.CASE_OPEN_IS !== this && Globals.MOBILE_LAYOUT === false) {
			Globals.CASE_CONTROLLER.moveToNewID(this._id);
		} else {
			if (this._isOpen === false && this._isDoingAnimationIn !== true) {
				this._isDoingAnimationIn = true;

				if (Globals.PROGRESS_BAR) {
					Globals.PROGRESS_BAR.style.width = this._scrolledToPercentageOfBounds * -100 + 'vw';
					gsap.to(Globals.PROGRESS_BAR, { duration: 0.2, bottom: '0px', ease: 'power2.out' });
				}

				var dragged = this._wheelController.dragged;
				if (dragged === false) {
					Globals.CASE_OPEN = true;
					Globals.CASE_OPEN_IS = this;
					this._isOpen = true;

					// Load High Res Image
					this.loadFullImage();

					this._element.style.overflow = 'initial';
					this._blocks[0].domElement.classList.remove('collapsed');

					// Start animating the project and set it to open
					this._openPercent.value = this._currentScale;
					this._state = OPEN;

					// Set the ID for the element in focus
					this._controller.setSnapId(this._id);
					// Zoom into the ID
					this._controller.snap(this._id);

					gsap.killTweensOf(this._openPercent);
					// Start displaying additional information
					this._caseInfo.displayAdditionalInfo();

					var useTime = Globals.PROJECT_ANIMATION_SPEED;
					if (Globals.MOBILE_LAYOUT) {
						useTime = 0.3;
					}

					gsap.to(this._openPercent, {
						value: 1,
						delay: 0,
						duration: useTime,
						ease: Globals.PROJECT_ANIMATION_EASE,
						onUpdate: this.updateBoundsWhileZooming,
						onComplete: this.openComplete
					});
					gsap.delayedCall(useTime - 0.1, this.startBlocksEarly);

					Globals.CASE_CONTROLLER.setMobileSnapID(this._id, this);
				}
			}
		}
	};

	private startBlocksEarly = () => {
		if (this._caseHasBeenOpenedBefore === false) {
			this.initBlocks();
		}
	};

	public stepRight = () => {
		let newSnapId = this._snapId + 1;
		if (newSnapId >= this._blocks.length) {
			newSnapId = this._blocks.length - 1;
		}

		this._snapId = newSnapId;
		this.updateSnap();
	};

	public stepLeft = () => {
		let newSnapId = this._snapId - 1;
		if (newSnapId < 0) {
			newSnapId = 0;
		}
		this._snapId = newSnapId;
		this.updateSnap();
	};

	public mobileUpdateSnapPrevious = () => {
		this._snapId = this._previousSnapID;
		this.updateSnap();
	};

	public updateSnap = (fast?: boolean, directionalSnap?: boolean) => {
		// If we are in the Team section (last block) - turn off snapping
		if (this._snapId >= this._blocks.length) {
			return;
		}

		let total = 0;
		for (let i = 0; i < this._totalBlockCount; i++) {
			if (i > this._snapId - 1) {
				break;
			}
			total += this._blockWidths[i] * 0.5;
			if (this._blockWidths[i + 1]) {
				total += this._blockWidths[i + 1] * 0.5;
			}
		}

		total = total + this._snapId * (SPACING / 2) - SPACING;

		if (this._snapId > this._blockPositionalData.length) {
			this._snapId = this._blockPositionalData.length - 1;
		}

		if (this._blockPositionalData[this._snapId]) {
			if (this._snapId === 0) {
				total = 0;
			} else {
				if (Globals.MOBILE_LAYOUT) {
					total = this._blockPositionalData[this._snapId].startX - (WindowManager.halfWidth - this._blockPositionalData[this._snapId].width / 2) + SPACING + this._storeXPosition;
				} else {
					total = this._blockPositionalData[this._snapId].startX - this._blockPositionalData[0].width / 2 + this._blockPositionalData[this._snapId].width / 2 + 0; // - (WindowManager.halfWidth - this._blockPositionalData[this._snapId].width / 2);
				}
			}

			var time = 0.5;
			if (fast === true) {
				time = 0.0;
			}

			if (total < 0) {
				total = 0;
			}
			var moveToDiff = -total - (this._draggable && this._draggable[0] ? this._draggable[0].x : 0);

			// Tweak according to directional
			if (directionalSnap === true) {
				if (this._directionalDrag === 'right') {
					if (moveToDiff < 0) {
						this._snapId = this._snapId - 1;
						this.updateSnap();
						return;
					}
				} else if (this._directionalDrag === 'left') {
					if (moveToDiff > 0) {
						this._snapId = this._snapId + 1;
						this.updateSnap();
						return;
					}
				}
			}

			if (this._snapId < 0) {
				this._snapId = 0;
			} else if (this._snapId > this._blockPositionalData.length - 1) {
				this._snapId = this._blockPositionalData.length - 1;
			}

			gsap.to(this._contentContainer, {
				x: -total * 1,
				ease: 'power1.inOut',
				duration: time,
				onUpdate: this.snapUpdate,
				onComplete: this.snapUpdate
			});
		}
	};

	private onDragDone = () => {
		this.calculateSnapId();

		if (Globals.MOBILE_LAYOUT) {
			this.updateSnap(false, true);
		}
	};

	private snapUpdate = () => {
		if (this._draggable && this._draggable[0]) {
			this._draggable[0].update();
		}
		if (this._iconTitle) {
			gsap.set(this._iconTitle, { x: this._draggable[0].x });
		}
		//this._caseInfo.draggedX = this._draggable[0].x;
		//this._caseInfo.update(this._draggable[0].x);
		this.checkIfBlockIsWithinViewPort();
	};

	private initHeroBlock = () => {
		let blockData = this._element.querySelectorAll('.block');
		let block = new CaseImage(blockData[0] as HTMLDivElement, 'image', true);
		this._imageBlocks.push(blockData[0]);
		this._blocks.push(block);
		this._blockWidths.push(0);
		this._blockPositions[0] = 0;
		this._blocks[0].domElement.classList.add('collapsed');

		let hero = this._blocks[0] as CaseImage;
		let ratio = hero.ratio;
		this._heroImageRatio = ratio;
	};

	private initBlocks = () => {
		//console.log('initBlocks()');

		let blockData = this._element.querySelectorAll('.block');

		//	console.log(blockData);
		this._totalBlockCount = blockData.length;
		this._storeOriginalBlockData = [];

		for (let i = 1; i < this._totalBlockCount; i++) {
			var currentBlock = blockData[i];
			if (currentBlock.classList.contains('text')) {
				if (this._firstTextBlockFound === false) {
					this._firstTextBlockFound = true;
					this._firstTextBlock = currentBlock;
					this._firstTextBlockIndex = i;
				}
			}

			this._storeOriginalBlockData.push(currentBlock.cloneNode(true));
		}

		// If mobile - we move the first text piece to the 2nd last position
		if (Globals.MOBILE_LAYOUT) {
			if (this._firstTextBlock) {
				//array_move(blockData, this._firstTextBlockIndex, blockData.length - 2);
				//this._firstTextBlock.parentNode.removeChild(this._firstTextBlock)
				var getSecondLastChild = blockData[blockData.length - 1];
				this._contentContainer.insertBefore(this._firstTextBlock, getSecondLastChild);
			}
		}

		let block;

		this._blocksEnabled = true;

		blockData = this._element.querySelectorAll('.block');

		var blockCount = 1;

		// We start at 1 - since the Hero Block is already initialized
		for (let i = 1; i < this._totalBlockCount; i++) {
			if (blockData[i].classList.contains('image')) {
				block = new CaseImage(blockData[i] as HTMLDivElement, 'image');
				this._imageBlocks.push(blockData[i]);
			}
			if (blockData[i].classList.contains('text')) {
				block = new CaseText(blockData[i] as HTMLDivElement, 'text');
			}
			if (blockData[i].classList.contains('quoteContent')) {
				block = new CaseQuote(blockData[i] as HTMLDivElement, 'quote');
			}
			if (blockData[i].classList.contains('team')) {
				block = new CaseTeam(blockData[i] as HTMLDivElement, 'team');
			}
			if (blockData[i].classList.contains('gallery')) {
				block = new CaseGallery(blockData[i] as HTMLDivElement, 'gallery');
			}
			if (blockData[i].classList.contains('video')) {
				block = new CaseVideo(blockData[i] as HTMLDivElement, 'video', this);
			}
			if (blockData[i].classList.contains('map')) {
				block = new CaseMap(blockData[i] as HTMLDivElement, this);
			}

			// We assume the first 2 items are not in view and needs to be animated in
			if (i <= 2) {
				if (block.isInView) {
					block.isInView();
				}
				/*console.log(' -- init blocks --');
				console.log(block.domElement);
				console.log(blockData);*/
			} else {
				//	gsap.set(block.domElement, {x: 100});
			}

			block.domElement.parentNode.removeChild(block.domElement);

			if (block) {
				if (blockData[i] !== this._firstTextBlock && i >= 2 && (blockData[i].classList.contains('text') || blockData[i].classList.contains('quoteContent')) && Globals.MOBILE_LAYOUT === true) {
				} else {
					this._blocks.push(block);
					this._blockWidths.push(0);
				}
			}
			if (blockData[i] !== this._firstTextBlock && i >= 2 && (blockData[i].classList.contains('text') || blockData[i].classList.contains('quoteContent')) && Globals.MOBILE_LAYOUT === true) {
			} else {
				this._blocks[0].domElement.parentNode.appendChild(block.domElement);
			}
			//	this._blocks[i].domElement.style.opacity = '1';
			//	this._blocks[i].domElement.style.display = 'inline-block';

			// Lets only animate the first block (the rest should be out of view?)
			// FIXME - lets only move the elements that are in view - dont think it can be more than 2 items?
			if (blockCount <= 2) {
				if (blockCount === 1) {
					// Show Mobile info
					gsap.set(this._mobileInfo, { x: 300, opacity: 1 });
					gsap.to(this._mobileInfo, { x: 0, force3D: true, ease: 'power2.out', duration: 0.4 });
				}
				if (blockData[i] !== this._firstTextBlock && i >= 2 && (blockData[i].classList.contains('text') || blockData[i].classList.contains('quoteContent')) && Globals.MOBILE_LAYOUT === true) {
				} else {
					gsap.set(block.domElement, { x: 300, opacity: 0 });
					gsap.to(block.domElement, { x: 0, opacity: 1, ease: 'power2.out', duration: 0.4 });
					blockCount++;
				}
			} else {
				//gsap.set(this._blocks[i].domElement, { x: 0, force3D: true, ease: 'power2.out', duration: 0 });
			}

			block = null;
		}

		if (this._mobileInfo.style.display === 'block') {
			this._blocks.splice(1, 0, this._mobileInfo);
			this._blockWidths.push(0);
		}

		this._totalBlockCount = this._blocks.length;
	};

	private initDraggable = () => {
		if (this._draggableInitialized === false) {
			this._draggableInitialized = true;

			var dragResistanceSet = 0;
			if (Globals.MOBILE_LAYOUT) {
				dragResistanceSet = -0.5;
			}

			this._draggable = Draggable.create(this._contentContainer, {
				type: 'x',
				lockAxis: true,
				minimumMovement: 16, //3,//10,//3,
				allowEventDefault: false, //true,
				allowNativeTouchScrolling: true, //!Globals.IS_TOUCH_DEVICE,
				inertia: true,
				onDrag: this.draggableUpdate,
				onThrowUpdate: this.draggableUpdate,
				onThrowComplete: this.onDragDone,
				onDragStart: this.dragStart,
				onDragEnd: this.dragEnd,
				onPressInit: this.onPressInit,
				bounds: { minX: -30000, maxX: 0, minY: -Infinity, maxY: Infinity },
				throwProps: true,
				edgeResistance: 0.5,
				dragResistance: dragResistanceSet,
				overshootTolerance: 0.1,
				maxDuration: 0.5
			});
			//	this._contentContainer.addEventListener('wheel', this.checkIfBlockIsWithinViewPort);

			//	this._draggable[0].disable();
			//	this.draggingEnabled = false;
		}
	};

	private activeCursor = () => {
		return 'grabbing';
	};

	private onPressInit = () => {
		//console.log('onPressInit()');
	};

	private dragStart = () => {
		//console.log('CaseEntry.dragStart()');
		this._dragStartX = this._draggable[0].x;
		// this._wheelController.dragActive = false;
		Globals.GLOBAL_CURSOR.showCursorType('side');
		Globals.GLOBAL_CURSOR.isDragging = true;

		Globals.CASE_CONTROLLER.setMobileSnapID(this._id, this);
	};

	private dragEnd = () => {
		//console.log('dragEnd()');
		this._wheelController.dragActive = true;
		//	this.calculateSnapId();
		Globals.GLOBAL_CURSOR.isDragging = false;
		Globals.GLOBAL_CURSOR.showCursorType('up');
		var calculateDirection = this._draggable[0].x - this._dragStartX;
		if (calculateDirection >= 0) {
			this._directionalDrag = 'right';
		} else {
			this._directionalDrag = 'left';
		}
		//	console.log('DIRECTION = ' + this._directionalDrag);
	};

	private draggableUpdate = event => {
		//console.log(event)
		//	console.log('draggableUpdate()');

		if (Globals.IS_DRAGGING === false) {
			if (this._draggable) {
				if (event !== undefined && this._initialAnimationCanceled === false) {
					this._initialAnimationCanceled = true;
					gsap.killTweensOf(this._contentContainer);
					gsap.killTweensOf(this._iconTitle);
				}

				this._directionalDragStartPosition = this._draggable[0].x;

				//this._caseInfo.draggedX = this._draggable[0].x;

				this._scrolledToPercentageOfBounds = this._draggable[0].x / (this._storeTotalWidth - WindowManager.halfHeight);
				gsap.to(Globals.PROGRESS_BAR, { duration: 0.1, width: this._scrolledToPercentageOfBounds * -100 + 'vw', force3D: true, ease: 'power2.out' });

				if (Globals.MOBILE_LAYOUT && this._iconTitle) {
					gsap.set(this._iconTitle, { x: this._draggable[0].x });
				}
				var dragDifference = Math.abs(this._dragStartX - this._draggable[0].x);
				//console.log('dragDifference : ' + dragDifference);

				if (Math.abs(this._dragStartX - this._draggable[0].x) >= 10 && this._wheelController.dragActive) {
					//	this._dragStartX = this._draggable[0].x;
					this._wheelController.dragActive = false;
					//this._wheelController.dragActive = false;
					Globals.SCROLL_CONTROLLER.disableScroll();
				}
				/*	console.log(' this._draggable[0].x = ' + this._draggable[0].x);
				console.log('this._caseHasBeenOpenedBefore : ' + this._caseHasBeenOpenedBefore);
				console.log('Globals.IS_DRAGGING : ' + Globals.IS_DRAGGING);
				console.log('dragDifference : ' + dragDifference);*/
				if (this._caseHasBeenOpenedBefore === false && dragDifference >= 1 && Globals.IS_DRAGGING === false) {
					//	console.log(' this._draggable[0].x = ' + this._draggable[0].x);
					this.clickStarted();
				}
				this._draggable[0].update();
				this.checkIfBlockIsWithinViewPort();

				this._previousSnapID = this._snapId;

				this.calculateSnapId();
			}
		} else {
			this._draggable[0].endDrag(null);
		}
	};

	private checkIfBlockIsWithinViewPort = () => {
		if (this._caseHasBeenOpenedBefore && this._blockPositionalData.length === this._totalBlockCount) {
			//if (this._isAnimating === false) {

			var offset = this._blockPositionalData[0].width * 0.5;
			var distanceDragged = (this._draggable[0].x - offset) * this._scaledY;
			var distanceDraggedNoOffset = this._draggable[0].x;
			var previousBlockWidth = 0;
			var middlePos = 0; //Math.round(this._heroWidth * 0.5) - WindowManager.halfWidth + 20;
			previousBlockWidth = 0;

			var blocksXPosition = 0;
			var blocksXPositionIncludingWidth = 0;

			var scaleDiff = 1 / this._scaledY;

			//console.log('distanceDragged : ' + distanceDragged);

			for (let i = 0; i < this._totalBlockCount; i++) {
				var getBlockPositionalData = this._blockPositionalData[i];

				if (getBlockPositionalData.width !== 0) {
					//	var elementsXPosition = previousBlockWidth;
					/*	if (i === 0) {
						blocksXPosition = WindowManager.halfWidth - getBlockPositionalData.width / 2;
						blocksXPositionIncludingWidth = blocksXPosition;
					} else {
						blocksXPosition = blocksXPositionIncludingWidth;
					}

					blocksXPositionIncludingWidth = this._blockPositionalData[i].endX + this._blockPositionalData[i].width + SPACING;
*/

					var numberToDebug = 3;
					if (i === numberToDebug) {
						/*	console.log('this._blockPositionalData[i].startX : ' + this._blockPositionalData[i].startX);
						console.log('offset : ' + offset);

						console.log('this._blockPositionalData[i].startX + distanceDragged : ' + (this._blockPositionalData[i].startX + distanceDragged));
						console.log('this._blockPositionalData[i].endX + distanceDragged : ' + (this._blockPositionalData[i].endX + distanceDraggedNoOffset));
						*/
						/*	console.log('scaleDiff; : ' + scaleDiff);
						console.log('this._blockPositionalData[i].width : ' + this._blockPositionalData[i].width);
						console.log('this._scaledY . ' + this._scaledY);*/
					}

					var hide = false;
					if (this._blockPositionalData[i].startX + distanceDragged > WindowManager.halfWidth * 2 + 250) {
						hide = true;
						if (i === numberToDebug) {
							//	console.log('more than : ' + (this._blockPositionalData[i].startX + offset + distanceDragged));
						}
					} else if (this._blockPositionalData[i].endX + distanceDragged < WindowManager.halfWidth * 1 * -1 - 250) {
						hide = true;
						if (i === numberToDebug) {
							//	console.log('less than : ' + (this._blockPositionalData[i].endX + offset + distanceDragged));
						}
					}

					var block = this._blocks[i];
					if (block !== this._mobileInfo) {
						if (hide === true) {
							/*	if (block.domElement.classList.contains('text') || block.domElement.classList.contains('team') || block.domElement.classList.contains('quote')) {
							} else {*/
							//	getBlockElement.style.display = 'none';
							if (this._debug) {
								//@ts-ignore
								this._blocks[i].domElement._debugLabel.style.backgroundColor = 'red';
							}

							if (block.domElement.classList.contains('video')) {
								//@ts-ignore
								block.outOfView();
							}
							//}
						} else {
							//	getBlockElement.style.display = 'inline-block';
							//@ts-ignore
							if (block.isInView && i > 0) {
								//@ts-ignore
								block.isInView(this._boundsHeight, this._state);
							}
							if (this._debug) {
								//@ts-ignore
								this._blocks[i].domElement._debugLabel.style.backgroundColor = 'green';
							}
						}
					}
				}
			}
		}
	};

	private calculateSnapId = (useDirectionalDrag?: boolean) => {
		this._wheelController.dragActive = true;
		if (this._draggable) {
			let draggedX = Math.abs(this._draggable[0].x);
			let id = 0;

			let distance = 9999999999;
			let distanceReal = 9999999999;

			var distanceBetweenDraggedAndCenter = null;
			var distanceBetweenDraggedAndCenterReal = null;

			for (let i = 0; i < this._blockPositionalData.length; i++) {
				var getDistanceToCenter = this._blockPositionalData[i].startX;
				distanceBetweenDraggedAndCenter = Math.abs(draggedX - getDistanceToCenter);
				distanceBetweenDraggedAndCenterReal = draggedX - getDistanceToCenter;
				/*	if (this._directionalDrag === 'left') {
						addToSnap = this._snapId + 1;
					}
					else if (this._directionalDrag === 'right') {
						addToSnap = this._snapId - 1;
					}*/

				//	console.log('distanceBetweenDraggedAndCenter : ' + distanceBetweenDraggedAndCenter);

				if (distanceBetweenDraggedAndCenter < distance) {
					id = i;
					distance = distanceBetweenDraggedAndCenter;
					distanceReal = distanceBetweenDraggedAndCenterReal;
				}
			}

			this._snapId = id;

			if (this._snapId === this._blocks.length - 1) {
				if (draggedX > this._blockPositionalData[this._snapId].startX) {
					this._snapId = this._snapId + 1;
				}
			}

			/*	console.log('draggedX : ' + draggedX);

				console.log('distanceReal : ' + distanceReal)
				console.log('distance : ' + distance)
				console.log('--- this._snapId : ' + this._snapId + ' - distance : ' + distance);*/

			/*	for (let i = 0; i < this._totalBlockCount; i++) {
			//	if (foundResult === false) {
					if (x >= total) {
						id = i + 1;
						foundResult = true;
					//	break;
					}
					console.log(' i : ' + i + ' total : ' + total);

					total += this._blockPositionalData[i].startX + this._blockPositionalData[i].width / 2; // * this._scaledY;
			//	}
			}
//this._blockPositionalData[this._snapId].startX - this._blockPositionalData[0].width / 2 + this._blockPositionalData[this._snapId].width / 2
			console.log('total dragged to ; ' + total);

			this._snapId = id;


			console.log('this._blockPositionalData[id].startX : ' + this._blockPositionalData[id].startX)
			console.log('this._blockPositionalData[id].middleX : ' + this._blockPositionalData[id].middleX)

			console.log('this._blockPositionalData[NEXT].startX : ' + this._blockPositionalData[id + 1].startX)
			console.log('this._blockPositionalData[NEXT].middleX : ' + this._blockPositionalData[id + 1].middleX)*/

			//console.log('calculateSnapId(), this._snapId : ' + this._snapId);
		}
	};

	public activate = () => {
		this.clickStarted();
	};

	public closeInfo = () => {
		if (Globals.MOBILE_LAYOUT === false) {
			this._caseInfo.toggleInfo(false);
		}
	};

	public collapse = () => {
		//console.log('*** collapse');
		//	console.log('*** collapse');
		this._state = COLLAPSED;

		if (this._isOpen === true && Globals.MOBILE_LAYOUT === false) {
			this._element.style.cursor = 'pointer';
			Globals.GLOBAL_CURSOR.showCursorType('up');
			Globals.CASE_CONTROLLER.resetCompensateYValue();
			Globals.SCROLL_CONTROLLER.enabledScroll();
			gsap.killTweensOf(this._openPercent);
			gsap.killTweensOf(this.openCompleteDelayed);
			this._isDoingAnimationIn = false;
			/*	if (Globals.CASE_CONTROLLER && Globals.CASE_CONTROLLER.hideArrowOverlay) {
					Globals.CASE_CONTROLLER.hideArrowOverlay();
				}*/
			// FIXME - DISABLE SCROLL AGAIN
			this.draggingEnabled = false;
			if (this._draggable && this._draggable[0]) {
				//if (Globals.MOBILE_LAYOUT === false) {
				this._draggable[0].disable();
				//}
			}

			this.resize(this._containerWidth, this._containerHeight, this._gridWidth, false);
			this.calculateSnapId();
			this.snapUpdate();

			gsap.to(Globals.PROGRESS_BAR, { duration: 0.2, bottom: '-2px', ease: 'power2.in' });

			this._isOpen = false;
			Globals.CASE_OPEN = false;
			Globals.CASE_OPEN_IS = null;

			//this._caseInfo.collapse();

			this.pauseAllBlocks();
			this.showAllSmallImages();

			// Allow Case Controller to drag again
			this._wheelController.dragActive = true;
		}
	};

	public closeCompletely = () => {
		//console.log('*** closeCompletely');
		this.collapse();

		if (this._state === COLLAPSED) {
			// If it has ever been open - we do a complete cleanup
			//this._element.style.overflow = 'initial';
			this._blocks[0].domElement.classList.add('collapsed');
			this._caseHasBeenOpenedBefore = false;
			if (Globals.MOBILE_LAYOUT === false) {
				if (this._draggable && this._draggable[0]) {
					this._draggable[0].kill();
				}
			}
			if (this._iconTitle) {
				gsap.set(this._iconTitle, {
					x: 0
				});
			}
			this._snapId = 0;
			this._blocksEnabled = false;

			if (Globals.MOBILE_LAYOUT === false) {
				this._openPercent.value = 0;
			}

			this._disabledScale.value = 1;

			gsap.set(this._mobileInfo, { opacity: 0, force3D: true, ease: 'power2.out', duration: 0.4 });

			// We start at 1 - since the Hero Block is already initialized
			if (this._storeOriginalBlockData) {
				for (let i = 1; i < this._totalBlockCount; i++) {
					var getBlock = this._blocks[i];

					var useBlock;
					if (getBlock === this._mobileInfo) {
						useBlock = getBlock;
					} else {
						useBlock = getBlock.domElement;
					}

					//	console.log(this._blocks);
					/*for (let i = 1; i < this._totalBlockCount; i++) {
						var currentBlock = blockData[i];
						this._storeOriginalBlockData[i - 1] = currentBlock.cloneNode(true);
					}*/
					//console.log(this._blocks[0]);
					//console.log(this._blocks[i]);
					//	console.log(useBlock);
					useBlock.style.display = 'none';
					useBlock.style.opacity = '0';
					if (useBlock.parentNode) {
						useBlock.parentNode.removeChild(useBlock);
					}

					if (getBlock !== this._mobileInfo) {
						if (this._storeOriginalBlockData[i - 1] !== undefined) {
							this._element.appendChild(this._storeOriginalBlockData[i - 1]);
						}
					}

					//	console.log(this._storeOriginalBlockData[i - 1])
					//	this._blocks[0].domElement.parentNode.appendChild(this._storeOriginalBlockData[i - 1]);
					/*
									if (block) {
										this._blocks.push(block);
										this._blockWidths.push(0);
									}

									this._blocks[i].domElement.style.display = 'inline-block';
									this._blocks[0].domElement.parentNode.appendChild(this._blocks[i].domElement);
									this._blocks[i].domElement.style.opacity = '1';*/
				}
			}

			this._state = CLOSED;
			gsap.killTweensOf(this._contentContainer);
			gsap.set(this._contentContainer, { x: 0 });
			this.updateBounds();
			this._caseInfo.toggleInfo(false);

			//this._blocks = [];
			//this._blockWidths = [];
		}
	};

	private pauseAllBlocks = () => {
		let block;

		for (let i = 0; i < this._totalBlockCount; i++) {
			if (this._blocks[i].type === 'gallery' || this._blocks[i].type === 'video') {
				block = this._blocks[i] as any;
				block.pause();
			}
		}
	};

	private openComplete = () => {
		this.openCompleteDelayed();
	};

	private openCompleteDelayed = () => {
		this._isDoingAnimationIn = false;
		this._openCompleted = true;
		this._open = true;

		var automaticallySnapToFirstItem = false;

		if (this._caseHasBeenOpenedBefore === false) {
			if (Globals.MOBILE_LAYOUT) {
				automaticallySnapToFirstItem = true;
			}
		} else {
			this.showAllFullImagesOnReopen();
		}

		this._caseHasBeenOpenedBefore = true;

		if (this._draggable && this._draggable[0]) {
			this._draggable[0].enable();
		}

		Globals.CASE_CONTROLLER.resize(this._id);

		if (automaticallySnapToFirstItem) {
			this._snapId = 1;
			this.updateSnap();
		}
	};

	public videoLoadedResize = () => {
		if (this._isDoingAnimationIn === false && this._videoHasUpdatedSizes === false) {
			this._videoHasUpdatedSizes = true;
			this.updateBounds();
		}
	};

	public resize = (containerWidth: number, containerHeight: number, gridWidth: number, calledAfterZoomIn?: boolean) => {
		this._containerWidth = containerWidth;
		this._containerHeight = containerHeight;
		this._gridWidth = gridWidth;

		if (Globals.MOBILE_LAYOUT) {
			this._openPercent.value = 1;
			SPACING = 20;
		} else {
			if (this._caseHasBeenOpenedBefore === false) {
				this._openPercent.value = 0;
			}
			SPACING = 40;
		}

		if (
			this._containerHeight !== this._containerHeightPrevious ||
			this._containerWidth !== this._containerWidthPrevious ||
			this._gridWidth !== this._gridWidthPrevious ||
			calledAfterZoomIn === true ||
			Globals.CASE_OPEN_IS === this
		) {
			this._caseInfo.resize();

			if (Globals.MOBILE_LAYOUT === true) {
				if (!this._caseInfo.mobileAdditionalInfoActive) {
					this._caseInfo.displayAdditionalInfo();
				}
				this._xOffset = 0;
			}

			this.updateBounds();

			if (this._openCompleted === true) {
				//this.calculateSnapId();
				// Making sure that the item in focus - stays in focus
				// passing 'true' to make it happen immediately
				// Unless the resize is called manually after the zoom in

				if (calledAfterZoomIn !== true) {
					this.updateSnap();
				}
			}
		}

		this._containerWidthPrevious = this._containerWidth;
		this._containerHeightPrevious = this._containerHeight;
		this._gridWidthPrevious = this._gridWidth;
	};

	private updateDragableAndBounds = () => {
		//	console.log('updateDragableBounds - this._storeTotalWidth: ' + this._storeTotalWidth);
		var minX = -this._storeTotalWidth + WindowManager.halfWidth;
		if (Globals.CASE_OPEN_IS === this) {
			var maxX = 0;
			if (Globals.MOBILE_LAYOUT) {
				//minX = minX * 1.6;
				maxX = this._heroWidth * 0.5 - WindowManager.halfWidth + 30;
				//console.log(maxX)
				maxX = 0;
			}

			//var maxX = Math.round(this._heroWidth * 0.5) - WindowManager.halfWidth + 30;

			//	console.log('minx : ' + minX + ' , maxX : ' + maxX);

			if (this._draggable && this._draggable[0]) {
				//	console.log('Applying Bounds');
				this._draggable[0].applyBounds({
					minX: minX, // * (1 / this._scaledY),
					maxX: maxX,
					minY: 0,
					maxY: 0
				});
				//@ts-ignore
				this.draggableUpdate();
			}
		}
	};

	private updateBoundsWhileZooming = () => {
		//this._caseInfo.scale = 1 / this._scaledY;
		this.updateBounds(true);
	};

	public updateBounds = (doNotUpdateBounds?) => {
		let bounds = this.getBounds();

		this._currentScale = this._bounds.height / this._containerHeight;

		this._currentHeight = bounds.height;
		this._heroWidth = bounds.width;

		this._storeXPosition = this._containerWidth * 0.5 - bounds.width * 0.5;

		/*	gsap.set(this._element, {
			width: bounds.width,
			height: bounds.height,
			x: this._storeXPosition
		});*/

		this._element.style.width = bounds.width + 'px';
		this._element.style.height = bounds.height + 'px';
		this._element.style.left = this._storeXPosition + 'px';
		this.resizeBlocks(bounds.height);
	};

	private getBounds = (forceFullSize: boolean = false) => {
		let scale;
		let openPercent = this._openPercent.value;

		switch (this._state) {
			case CLOSED: {
				let widthScale = clamp(this._containerWidth / 1080, 0, 1);
				// let heightScale = clamp(containerH / 1144, 0, 1);
				let heightScale = clamp(this._containerHeight / 1440, 0, 1);
				scale = Math.min(widthScale, heightScale);
				break;
			}
			case OPEN: {
				scale = this._openPercent.value;
				break;
			}
			case LOCKED: {
				scale = this._openPercent.value;
				break;
			}
			case COLLAPSED: {
				scale = this._openPercent.value;
				break;
			}
		}

		//	console.log('scale : ' + scale);
		//	console.log('openPercent : ' + openPercent);

		if (forceFullSize) {
			scale = 1;
			openPercent = 1;
		}

		let heightDiff = this._state === CLOSED ? this._containerHeight : this._containerHeight * scale;

		let portraitBounds = Resizer.getFitInside(1080, 1440, this._containerWidth + 5000 * openPercent, heightDiff);

		//if (this._type === TYPE_LANDSCAPE) {
		this._bounds = Resizer.getFitInside(1080, 1080 * this._ratio, portraitBounds.width + 5000 * openPercent, heightDiff);
		//	} else if (this._type === TYPE_PORTRAIT) {
		//	this._bounds = portraitBounds;
		//}
		if (this._id === 0 || this._id === 1) {
			/*	console.log(' --- id : ' + this._id + ' , this._bounds : ' + this._bounds.width + ' , ' + this._bounds.height);
			console.log('Globals.MOBILE_LAYOUT : ' + Globals.MOBILE_LAYOUT);
			console.log('Globals.TOUCH_DEVICE : ' + Globals.IS_TOUCH_DEVICE);
			console.log('scale : ' + scale);
			console.log('this._state : ' + this._state);
			console.log(this._type);
			console.log('this._ratio : ' + this._ratio);
			console.log('heightDiff : ' + heightDiff);
			console.log('this._bounds.width : ' + this._bounds.width);*/
		}

		//this._bounds.width = 500;

		var targetBoundsWidth = this._bounds.width;
		var targetBoundsHeight = this._bounds.height;
		/*if (Globals.MOBILE_LAYOUT) {
			targetBoundsWidth = 500;
			//this._bounds.width = 500;
			targetBoundsHeight = 500;
		}*/

		this._bounds = Resizer.getOverscaleToFit(this._bounds.width, this._bounds.height, targetBoundsWidth, targetBoundsHeight);

		//	console.log(this._bounds.width)

		/*	if (this._bounds.height > WindowManager.halfHeight) {
			console.log('bigger than hals height')
			this._bounds = Resizer.getOverscaleToFit(this._bounds.width, this._bounds.height, this._bounds.width, WindowManager.halfHeight);
		}*/

		/*	if (this._bounds.height > this._bounds.width) {
			// Portrait image
			this._bounds = Resizer.getOverscaleToFit(this._bounds.width, this._bounds.height, this._bounds.width + 100, this._bounds.height);


		}*/

		/*if (this._type === TYPE_PORTRAIT) {
			console.log('this._bounds.width : ' + this._bounds.width);
		}*/

		let w = this._bounds.width;
		let h = this._bounds.height;

		// Make sure the images width wont be wider than the viewport
		var maxWidth = WindowManager.width - 40;
		if (w > maxWidth) {
			var difference = w / maxWidth;

			w = maxWidth;
			h = h / difference;

			if (this._isOpen) {
				/*	console.log(difference)
				console.log(w)
				console.log(h)*/
			}
		}

		/*if (this._isOpen) {
			var maxHeight = (WindowManager.height / 4);
			if (h > maxHeight) {
				var difference = h / maxHeight;

				h = maxHeight;
				w = w / difference;

				if (this._isOpen) {

				}
			}
		}*/
		//	console.log('scale : ' + scale);
		return { width: w, height: h };
	};

	private resizeBlocks = (height: number) => {
		//	console.log('resizeBlocks()');
		//console.log('isDisplayed : ' + this._element.style.display);
		var displayState = this._element.style.display;

		//if (height !== this._boundsHeight) {

		this._boundsHeight = height;

		//	console.log('*** UPDATE BLOCKS : ' + height);
		//	console.log('this._openCompleted : ' + this._openCompleted);

		let l = this._blocks.length;

		// If the case has never been opened before - we only want to look at the hero item
		if (this._openCompleted === true) {
		} else {
			l = 1;
		}
		var temporarilySetToBlock = false;
		if (this._openCompleted && displayState === 'none') {
			temporarilySetToBlock = true;
			//this.element.style.visibility = 'hidden';
			this.element.style.display = 'block';
		}

		let accumulatedWidths = 0;
		let lastEntryWidth = 0;

		var scaleDiff = 1 / this._scaledY;

		//	console.log('this._scaledY --- : ' + this._scaledY);

		this._snapPositions.x = [];
		//console.log('starting loop through blocks');
		for (let i = 0; i < l; i++) {
			if (this._blocks[i] !== this._mobileInfo) {
				this._blocks[i].domElement.style.opacity = '1';
				this._blocks[i].domElement.style.display = 'inline-block';
				this._blocks[i].resize(height);
			} else {
			}

			if (this._openCompleted === true || i < 1) {
				var useDomElement;
				var useWidth;
				if (this._blocks[i] === this._mobileInfo) {
					useDomElement = this._mobileInfo;
					useWidth = this._mobileInfo.offsetWidth;
				} else {
					useDomElement = this._blocks[i].domElement;
					useWidth = useDomElement.dataset.useWidth ? parseInt(useDomElement.dataset.useWidth) : parseInt(useDomElement.style.paddingLeft);
				}

				this._blockPositions[i] = accumulatedWidths;
				var getBlockWidth = useWidth; //;this._blocks[i].domElement.offsetWidth;// * this._scaledY;
				//console.log(this._blocks[i]);
				this._blockPositionalData[i] = { width: getBlockWidth, startX: accumulatedWidths, endX: accumulatedWidths + getBlockWidth, middleX: accumulatedWidths - getBlockWidth / 2 };
				this._snapPositions.x.push(this._blockPositionalData[i].startX * -1);
				//	console.log(this._snapPositions.x);
				this._blockWidths[i] = getBlockWidth;
				accumulatedWidths += this._blockWidths[i];

				if (i !== l - 1) {
					// Add margin
					if (this._scaledY < 1) {
						accumulatedWidths += SPACING * 1;
					} else {
						accumulatedWidths += SPACING * 1;
					}
					//20;
				} else {
					// add last entry width in order to center the last entry
					//lastEntryWidth = Math.round(this._blockWidths[i] * 0.5);
					//lastEntryWidth = Math.round(window.innerWidth * 0.5);
				}

				if (this._debug) {
					if (useDomElement._hasDebugLabel != true) {
						var createDebugLabel = document.createElement('div');
						createDebugLabel.style.backgroundColor = 'red';
						createDebugLabel.style.position = 'absolute';
						createDebugLabel.style.width = '100%';
						createDebugLabel.style.left = '0px';
						createDebugLabel.style.top = '0px';
						createDebugLabel.style.zIndex = '99999';
						useDomElement.appendChild(createDebugLabel);
						useDomElement._debugLabel = createDebugLabel;
						useDomElement._hasDebugLabel = true;
					}
					useDomElement._debugLabel.innerHTML =
						'startX / ' +
						Math.floor(this._blockPositionalData[i].startX) +
						' midX / ' +
						Math.floor(this._blockPositionalData[i].middleX) +
						' endX / ' +
						Math.floor(this._blockPositionalData[i].endX) +
						' w / ' +
						this._blockPositionalData[i].width;
				}
			}
		}

		if (this._snapPositions.x.length > 0 && this._draggable) {
			/*this._draggable[0].vars.snap = this._snapPositions.x;
			console.log('here');
			console.log(this._draggable[0].snap);
			this._draggable[0].update();*/
		}
		if (this._openCompleted === true) {
			this._element.style.width = Math.max(this._blockPositionalData[0].width, accumulatedWidths) + 'px';

			// FIXME: this does not work completely right yet
			accumulatedWidths -= 0; //WindowManager.width; // halfWidth
			//	width += lastEntryWidth;

			// TODO: only update bounds if they actually changed
			//if (width !== this._currentWidth) {
			//	this._currentWidth = width;

			/*let w = ratio * height;
				this._halfWidth = Math.round(w * 0.5);*/

			//if (width > this._storeTotalWidth) {

			//	if (this._isOpen === true) {
			this._storeTotalWidth = accumulatedWidths;
			//	console.log('isOpen : this._storeTotalWidth : ' + this._storeTotalWidth);
			//}
			//	}

			/*	console.log('this._currentScale : ' + this._currentScale);
					console.log('this._openpercent : ' + this._openPercent.value);
					console.log('this._storeTotalWidth : ' + this._storeTotalWidth);*/

			//}
			if (this._isDoingAnimationIn === false) {
				this.updateDragableAndBounds();
			}
		}

		if (temporarilySetToBlock) {
			this.element.style.display = 'none';
			//	this.element.style.opacity = '1';
		}
	};

	public lock = () => {
		this._state = LOCKED;
	};

	/**
	 * Used for cleanup when exitting the main Cases page
	 */
	public kill = () => {
		for (let i = 0; i < this._blocks.length; i++) {
			var getBlock = this._blocks[i];
			if (getBlock !== this._mobileInfo) {
				getBlock.kill();
			}
		}

		this._caseInfo.kill();

		this._element.removeEventListener('mouseover', this.mouseOver);
		this._element.removeEventListener('mouseout', this.mouseOut);
		this._element.removeEventListener('click', this.clickStarted);
	};

	public checkFilter = (values: Array<string>, projectURL) => {
		this.disabled = !this._filters.checkMatch(values, projectURL);

		if (this.disabled === true) {
			if (Globals.INITIAL_SEARCH_VALUE_SECONDARY != '' && Globals.INITIAL_SEARCH_VALUE_SECONDARY != null) {
				var hasSecondaryMatch = this._filters.checkMatchSecondaryFilter(Globals.INITIAL_SEARCH_VALUE_SECONDARY);
				//console.log(hasSecondaryMatch);
				if (hasSecondaryMatch) {
					this.disabled = false;
				}

				//	this.disabled = !this._filters.checkMatchSecondaryFilter(Globals.INITIAL_SEARCH_VALUE_SECONDARY);
			}
		}
	};

	get filters() {
		return this._filters;
	}

	get disabled() {
		return this._disabled;
	}

	set disabled(value: boolean) {
		//gsap.delayedCall(Globals.SHUFFLE_CLOSE_DELAY, this.close);

		this._disabled = value;

		/*	gsap.to(this._disabledScale, {
				value: this._disabled ? 0 : 1,
				duration: 1,
				ease: Globals.PROJECT_ANIMATION_EASE
				// delay: this._disabled ? 0 : Globals.PROJECT_ANIMATION_SPEED
			});

			gsap.to(this._element, {
				opacity:  this._disabled ? 0 : 1,
				duration: 0.5 //0.2,
				// delay: this._disabled ? 0 : Globals.PROJECT_ANIMATION_SPEED
			});
	*/
		/*	gsap.to(this._caseInfo.element, {
				opacity: this._disabled ? 0 : 1,
				scale: 0,
				duration: 0.5 //0.2,
				// delay: this._disabled ? 0 : Globals.PROJECT_ANIMATION_SPEED
			});*/

		// if (value) {
		// 	this._draggable[0].disable();
		// }

		this._caseInfo.disabled = value;
	}

	public setScaledY = value => {
		this._scaledY = value;
	};

	public forceSetDisabled = () => {
		//if (this._caseInfo.disabled === true) {

		this._disabledScale.value = this._disabled ? 0 : 1;

		gsap.set(this._disabledScale, {
			value: this._disabled ? 0 : 1,
			duration: 0,
			ease: Globals.PROJECT_ANIMATION_EASE
			// delay: this._disabled ? 0 : Globals.PROJECT_ANIMATION_SPEED
		});

		gsap.set(this._element, {
			opacity: this._disabled ? 0 : 1,
			duration: 0.0 //0.2,
			// delay: this._disabled ? 0 : Globals.PROJECT_ANIMATION_SPEED
		});

		gsap.set(this._caseInfo.element, {
			opacity: this._disabled ? 0 : 1,
			duration: 0.0 //0.2,
			// delay: this._disabled ? 0 : Globals.PROJECT_ANIMATION_SPEED
		});
		//}

		// if (value) {
		// 	this._draggable[0].disable();
		// }
	};

	get element() {
		return this._element;
	}

	get fullHeight() {
		return this._currentHeight * this._disabledScale.value;
	}

	get halfHeight() {
		return Math.round(this._currentHeight * 0.5) * this._disabledScale.value;
	}

	get halfContainerHeight() {
		return Math.round(this._containerHeight * 0.5) * this._disabledScale.value;
	}

	get mainInfoHeight() {
		return this._caseInfo.mainInfoH;
	}

	get halfWidth() {
		return this._halfWidth;
	}

	get infoScale() {
		return this._caseInfo.scale;
	}

	set infoScale(value: number) {
		this._caseInfo.scale = value;
	}

	get caseInfo() {
		return this._caseInfo;
	}

	get centerPercent() {
		return this._centerPercent;
	}

	set centerPercent(value: number) {
		this._centerPercent = value;
	}

	get contentContainer() {
		return this._contentContainer;
	}

	get disabledScale() {
		return this._disabledScale.value;
	}

	get paused() {
		return this._paused;
	}

	set paused(value: boolean) {
		// if (this._paused && !value && this._mouseOver) {
		// 	this._paused = value;
		// 	this.onMouseOver();
		// } else {
		// 	this._paused = value;
		// 	// this.onMouseOut();
		// }
	}

	get state() {
		return this._state;
	}

	get inView() {
		return this._inView;
	}

	set inView(value: boolean) {
		this._inView = value;
		return;

		let block;

		for (let i = 0; i < this._blocks.length; i++) {
			if (this._inView === false) {
				if (this._blocks[i] !== this._mobileInfo) {
					if (this._blocks[i].type === 'gallery' || this._blocks[i].type === 'video') {
						block = this._blocks[i] as any;
						block.pause();
					}
				}
			} else {
				/*	if (this._blocks[i].type === 'gallery' || this._blocks[i].type === 'video') {
						block = this._blocks[i] as any;
						block.resume();
					}*/
			}
		}

		// if (this._blocksEnabled) {
		// 	let l = this._blocks.length;
		//
		// 	for (let i = 0; i < l; i++) {
		// 		if (i !== 0 && !this._inView) {
		// 			this._blocks[i].domElement.parentNode.removeChild(this._blocks[i].domElement);
		// 		} else {
		// 			if (i !== 0) {
		// 				this._blocks[0].domElement.parentNode.appendChild(this._blocks[i].domElement);
		// 			}
		// 		}
		// 	}
		//
		// 	this.updateBounds();
		// }
	}

	public loadSmallImage = () => {
		if (this._smallImageLoaded === false) {
			this.initDraggable();
			this._smallImageLoaded = true;
			if (this._smallImage) {
				this._smallImage.addEventListener('load', this.imageLoadedSmall);
				//var getURL = this._smallImage.getAttribute('data-src');
				//	console.log(this._src);

				var getURL = Globals.loadThroughImageKit(this._src, null, 700);
				if (Globals.MOBILE_LAYOUT_FIRST_LOAD) {
					getURL = Globals.loadThroughImageKit(this._src, null, 700, '3-2');
				}
				this._smallImage.setAttribute('src', getURL);

				//this._smallImage.style.opacity = 1;
				this._smallImage.style.zIndex = 2;
			}
			this._caseInfo.loadIcon();
		}
	};

	public loadTinyImage = () => {
		if (this._tinyImageLoaded === false) {
			this._tinyImageLoaded = true;
			if (this._tinyImage) {
				this._tinyImage.addEventListener('load', this.imageLoaded);
				this._tinyImage.setAttribute('src', this._src);

				this._tinyImage.style.opacity = 1;
				this._tinyImage.style.zIndex = 0;
			}
		}
	};

	/**
	 * REDO THIS FUNCTIONALITY WITHIN THE CASE IMAGE.TS FILE INSTEAD
	 * MAKE SURE WE CHECK IF THE SMALL IMAGE ISLOADED - IF IT IS NOT - THE TINY IMAGE NEEDS TO BE SHOWED INSTEAD
	 */

	private showAllSmallImages = () => {
		/*	for (var i = 0; i < this._imageBlocks.length; i++) {
				var getImage = this._imageBlocks[i].querySelector('.small');
				getImage.style.display = 'block';
				gsap.killTweensOf(getImage);
				getImage.style.opacity = 1;

				var getImage = this._imageBlocks[i].querySelector('.full');
				gsap.killTweensOf(getImage);
				getImage.style.display = 'none';
			}*/
	};

	private showAllFullImagesOnReopen = () => {
		/*for (var i = 1; i < this._imageBlocks.length; i++) {
			var getImage = this._imageBlocks[i].querySelector('.small');
			getImage.style.display = 'none';
			gsap.killTweensOf(getImage);
			getImage.style.opacity = 0;

			var getImage = this._imageBlocks[i].querySelector('.full');
			getImage.style.display = 'block';
			gsap.killTweensOf(getImage);
			getImage.style.opacity = 1;
		}*/
	};

	private imageLoadedSmall = event => {
		var target = event.currentTarget;
		var getTinyImage = target.parentNode.querySelector('.tiny');
		gsap.to(target, { duration: 0.3, opacity: 1, onComplete: this.hideTinyImage, onCompleteParams: [getTinyImage] });
	};

	private hideTinyImage = target => {
		target.style.display = 'none';
	};

	private imageLoaded = event => {
		var target = event.currentTarget;
		var getTinyImage = target.parentNode.querySelector('.tiny');
		gsap.to(target, { duration: 0.3, opacity: 1, onComplete: this.hideBG });
	};

	private hideBG = () => {
		if (Globals.USE_NIGHTSHIFT === true) {
			this._fullImage.parentNode.style.backgroundColor = '#000000';
		} else {
			this._fullImage.parentNode.style.backgroundColor = '#ffffff';
		}
	};

	public loadFullImage = () => {
		if (this._fullImageLoaded === false) {
			this._fullImageLoaded = true;
			if (this._fullImage) {
				this._fullImage.addEventListener('load', this.imageLoaded);
				//console.log('Case Entry - load full image');
				var getURL = Globals.loadThroughImageKit(this._src, null, 1200);
				if (Globals.MOBILE_LAYOUT_FIRST_LOAD) {
					//console.log('setting ratio');
					getURL = Globals.loadThroughImageKit(this._src, null, 1200, '3-2');
				}

				this._fullImage.setAttribute('src', getURL);
				//this._fullImage.style.opacity = 1;
				this._fullImage.style.zIndex = 3;
			}
		} else {
			// Reopen
			this._fullImage.style.opacity = 0;
			this._fullImage.style.display = 'block';
			gsap.to(this._fullImage, { duration: 0.3, opacity: 1 });
		}
	};

	public scrollY = value => {
		var newPosition = this._draggable[0].x + value;

		gsap.set(this._contentContainer, { x: newPosition });
		if (this._draggable && this._draggable[0]) {
			this._draggable[0].update(true);
		}
		this.checkIfBlockIsWithinViewPort();
	};

	get id() {
		return this._id;
	}

	get isOpen() {
		return this._isOpen;
	}

	public storeTheYValue = value => {
		this._storeYValue = value;
	};

	get storeYValue() {
		return this._storeYValue;
	}

	set shuffleYPosModifier(value) {
		this._shuffleYPosModifier = value;
	}

	get shuffleYPosModifier() {
		return this._shuffleYPosModifier;
	}

	set yPosSubstraction(value) {
		this._yPosSubstraction = value;
	}

	get yPosSubstraction() {
		return this._yPosSubstraction;
	}

	get heroImage() {
		return this._heroImage;
	}

	public getSnapID() {
		return this._snapId;
	}

	public getElement = () => {
		return this._contentContainer;
	};

	public getProjectID = () => {
		return this._projectURL;
	};
}
