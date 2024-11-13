import { gsap } from "gsap";
import { TemplateManager } from "../../lib/com/hellomonday/templateManager/TemplateManager";
import { Globals } from "../data/Globals";
import { KeyboardControls } from "../input/KeyboardControls";
import { PeoplePagination } from "../ui/PeoplePagination/PeoplePagination";
import { WindowManager } from "../utils/WindowManager";
import { AbstractTemplate } from './AbstractTemplate';
import { PeoplePartnerProfile } from "./components/PeoplePartnerProfile";

export class PeopleTemplate extends AbstractTemplate {

	private _profiles: NodeListOf<HTMLDivElement>;
	private _blocks: NodeListOf<HTMLDivElement>;
	private _partners: Array<HTMLDivElement> = [];
	private _subPageTitle: HTMLDivElement;

	private _pagination: PeoplePagination;
	private _partnerEntries: Array<PeoplePartnerProfile> = [];

	private _profilesContainer: HTMLDivElement;

	private _paddingTop: number;

	private _prevId: number = null;
	private _currentID: number = -1;

	private _firstRun:boolean = true;
	private _blockCounts = {
		'0': 0,
		'1': 0,
		'2': 0,
		'3': 0,
		'4': 0,
		'5': 0,
		'6': 0,
		'7': 0,
		'8': 0,
		'9': 0,
		'10': 0,
		'11': 0,
	};

	constructor(element: HTMLDivElement, templateManager: TemplateManager) {
		super(element, templateManager);

		this._subPageTitle = element.querySelector('.subPageTitle');

		this._profilesContainer = element.querySelector('.profiles');

		this.setupProfiles();

		this._pagination = new PeoplePagination(element.querySelector('.PeoplePagination'), this._blocks);

		for (const [blockIndex, count] of Object.entries(this._blockCounts)) {
			if (count === 0 && this._blocks[Number(blockIndex)]) {
				this._blocks[Number(blockIndex)].style.display = 'none';
				this._pagination.hide(Number(blockIndex));
			}
		}

		if (Globals.IS_TOUCH_DEVICE) {
			//	this.updateHighlight(0);
		}


		Globals.SCROLL_CONTROLLER.onUpdate.add(this.onScroll);

		KeyboardControls.getInstance().add(this.onKeyboardInput);

		if (Globals.MOBILE_LAYOUT === false) {
			this.updateHighlight(0);
		}
	}

	private closeFirstHighlight = () => {
		if (this._firstRun === true) {
			this._firstRun = false;
			this._partnerEntries[0].toggleHighlight(false);
		}
	}

	private onKeyboardInput = (type: string, key: string, code: number) => {
		if (type === KeyboardControls.KEY_DOWN) {
			if (key === 'ArrowDown') {
				this.updateHighlight(this._currentID + 1);
			} else if (key === 'ArrowUp') {
				this.updateHighlight(this._currentID - 1);
			}
		}
	}

	private onScroll = () => {
		let id = 0;
		let distance = 9999999;
		let tempDistance;

		let l = this._partnerEntries.length;

		for (let i = 0; i < l; i++) {
			tempDistance = Math.abs(WindowManager.halfHeight - this._partnerEntries[i].y);

			if (tempDistance < distance) {
				distance = tempDistance;
				id = i;
			}
		}

		if (id !== this._prevId) {
			// this._prevId = id;
			if (Globals.IS_TOUCH_DEVICE) {
				//this.updateHighlight(id);
			}
		}


		if (this._partnerEntries[id + 1] !== undefined) {
			this._pagination.update(this._partnerEntries[id + 1].officeId);
		}
	}

	public updateHighlight = (id: number) => {
		if (this._prevId) {
			console.log('this._prevId : ' + this._prevId)
			this._partnerEntries[this._prevId].toggleHighlight(false);
		}
		this._prevId = id;
		let l = this._partnerEntries.length;

		for (let i = 0; i < l; i++) {
			if (i === id) {
				this._partnerEntries[i].toggleHighlight(true)
			} else {
				this._partnerEntries[i].toggleHighlight(false)
			}
		}
	}

	private setupProfiles = () => {
		this._profiles = this.element.querySelectorAll('.profile');
		this._blocks = this.element.querySelectorAll('.block');

		let l = this._profiles.length;

		for (let i = 0; i < l; i++) {
			if (this._profiles[i].dataset.partner === 'true') {
				this._profiles[i].dataset.officeId = '0';
				this._blocks[0].appendChild(this._profiles[i]);
				this._partners.push(this._profiles[i]);
				this._blockCounts['0'] += 1;
			} else if (this._profiles[i].dataset.associate === 'true' || this._profiles[i].dataset.director === 'true') {
				this._profiles[i].dataset.officeId = '1';
				this._blocks[1].appendChild(this._profiles[i]);
				this._blockCounts['1'] += 1;
			} else if (this._profiles[i].dataset.location === 'BIG BCN') {
				this._profiles[i].dataset.officeId = '2';
				this._blocks[2].appendChild(this._profiles[i]);
				this._blockCounts['2'] += 1;
			} else if (this._profiles[i].dataset.location === 'BIG CPH') {
				this._profiles[i].dataset.officeId = '3';
				this._blocks[3].appendChild(this._profiles[i]);
				this._blockCounts['3'] += 1;
			} else if (this._profiles[i].dataset.location === 'BIG LON') {
				this._profiles[i].dataset.officeId = '4';
				this._blocks[4].appendChild(this._profiles[i]);
				this._blockCounts['4'] += 1;
			} else if (this._profiles[i].dataset.location === 'BIG NYC') {
				this._profiles[i].dataset.officeId = '5';
				this._blocks[5].appendChild(this._profiles[i]);
				this._blockCounts['5'] += 1;
			} else if (this._profiles[i].dataset.location === 'BIG SZN') {
				this._profiles[i].dataset.officeId = '6';
				this._blocks[6].appendChild(this._profiles[i]);
				this._blockCounts['6'] += 1;
			} else if (this._profiles[i].dataset.location === 'BIG LAX') {
				this._profiles[i].dataset.officeId = '7';
				this._blocks[7].appendChild(this._profiles[i]);
				this._blockCounts['7'] += 1;
			} else if (this._profiles[i].dataset.location === 'BIG ZRH') {
				this._profiles[i].dataset.officeId = '8';
				this._blocks[8].appendChild(this._profiles[i]);
				this._blockCounts['8'] += 1;
			} else if (this._profiles[i].dataset.location === 'BIG OSLO') {
				this._profiles[i].dataset.officeId = '9';
				this._blocks[9].appendChild(this._profiles[i]);
				this._blockCounts['9'] += 1;
			} else if (this._profiles[i].dataset.location === 'BIG PARIS') {
				this._profiles[i].dataset.officeId = '10';
				this._blocks[10].appendChild(this._profiles[i]);
				this._blockCounts['10'] += 1;
			} else {
				this._profiles[i].dataset.officeId = '11';
				this._blocks[11].appendChild(this._profiles[i]);
				this._blockCounts['11'] += 1;
			}
		}

		// Move Bjarke to the top
		l = this._partners.length;

		for (let i = 0; i < l; i++) {
			if (this._partners[i].dataset.name === 'Sheela Maini Søgaard') {
				//this._blocks[0].insertBefore(this._partners[i], this._blocks[0].firstChild.nextSibling);

				let title = this._blocks[0].firstChild.nextSibling as HTMLDivElement;
				title.after(this._partners[i]);
				// this._blocks[0].insertBefore(this._partners[i], this._blocks[0].firstChild);
				break;
			}
		}

		for (let i = 0; i < l; i++) {
			if (this._partners[i].dataset.name === 'Bjarke Ingels') {
				//this._blocks[0].insertBefore(this._partners[i], this._blocks[0].firstChild.nextSibling);

				let title = this._blocks[0].firstChild.nextSibling as HTMLDivElement;
				title.after(this._partners[i]);
				// this._blocks[0].insertBefore(this._partners[i], this._blocks[0].firstChild);
				break;
			}
		}

		this.initProfiles();
	}

	private initProfiles = () => {
		this._profiles = this.element.querySelectorAll('.profile');

		let l = this._profiles.length;

		for (let i = 0; i < l; i++) {
			this._partnerEntries.push(new PeoplePartnerProfile(this._profiles[i], this, i));
		}
	}

	public closeInactivePartners = (activeId: number) => {
		let l = this._partnerEntries.length;

		for (let i = 0; i < l; i++) {
			if (i !== activeId) {
				this._partnerEntries[i].close();
			}

		}

		gsap.delayedCall(0.5, this.resize);
	}

	public kill = () => {
		let l = this._partnerEntries.length;

		for (let i = 0; i < l; i++) {
			this._partnerEntries[i].kill();
		}

		this._pagination.kill();

		// window.removeEventListener("scroll", this.onScroll);
		Globals.SCROLL_CONTROLLER.onUpdate.remove(this.onScroll);

		// gsap.ticker.remove(this.render);
	}

	public resize = () => {
		// super.resize();

		let l = this._partnerEntries.length;

		for (let i = 0; i < l; i++) {
			this._partnerEntries[i].resize();
		}

		this._pagination.resize(this._subPageTitle.offsetHeight); // TODO: adjust sizes based on css breakpoints

		this._paddingTop = this._subPageTitle.getBoundingClientRect().height;// + 60;

		this.onScroll();
	}

	public updateID = (setID) => {
		this._currentID = setID;
	}

}
