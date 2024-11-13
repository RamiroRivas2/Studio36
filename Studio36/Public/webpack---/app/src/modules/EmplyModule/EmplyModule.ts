import { AbstractModule } from '../../../lib/com/hellomonday/templateManager/AbstractModule';
import { AbstractTemplate } from '../../templates/AbstractTemplate';

export class EmplyModule extends AbstractModule {
	private _locations = ['All'];
	private _jobAreas = ['All'];

	private _currentlySelectedJobArea = 'All';
	private _currentlySelectLocation = 'All';

	private _allJobListings;

	constructor(element: HTMLElement, template: AbstractTemplate) {
		super(element, template);

		let listings = [...element.querySelectorAll('.jobListing')];

		listings = listings.sort((a: HTMLDivElement, b: HTMLDivElement) => {
			let x = a.dataset.location.toUpperCase();
			let y = b.dataset.location.toUpperCase();
			return x == y ? 0 : x > y ? 1 : -1;
		});

		this._allJobListings = listings;

		let l = listings.length;
		for (let i = 0; i < l; i++) {
			listings[i].parentNode.appendChild(listings[i]);
		}

		for (let q = 0; q < l; q++) {
			var currentListing = listings[q] as HTMLDivElement;
			var getTitle = currentListing.querySelector('.content');
			var getText = getTitle.innerHTML;

			getText = getText.replace('â', '&');
			getText = getText.replace('Ã¥', 'Å');
			getText = getText.replace('sâ', "'");
			//
			getTitle.innerHTML = getText;
			var getLocation = currentListing.dataset.location;
			var getJobArea = currentListing.dataset.jobarea;
			this.checkIfItemsExistsInArrayIfNotAddItToTheArray(this._locations, getLocation);
			this.checkIfItemsExistsInArrayIfNotAddItToTheArray(this._jobAreas, getJobArea);
		}

		var locationDropdown = element.querySelector('#location');
		var jobAreaDropdown = element.querySelector('#jobArea');
		this.buildSelectElement(locationDropdown, this._locations, this.onChangeLocation);
		this.buildSelectElement(jobAreaDropdown, this._jobAreas, this.onChangeJobArea);
	}

	private onChangeLocation = event => {
		var selectedValue = event.currentTarget.value;
		this._currentlySelectLocation = selectedValue;

		this.checkDropdownMatches();
	};

	private onChangeJobArea = event => {
		var selectedValue = event.currentTarget.value;
		this._currentlySelectedJobArea = selectedValue;

		this.checkDropdownMatches();
	};

	private checkDropdownMatches = () => {
		// Show or hide all locations that match
		var length = this._allJobListings.length;
		for (var i = 0; i < length; i++) {
			var currentJob = this._allJobListings[i];
			var getJobArea = currentJob.dataset.jobarea;
			var getLocation = currentJob.dataset.location;

			var allowLocation = true;
			if (getLocation !== this._currentlySelectLocation) {
				allowLocation = false;
				if (this._currentlySelectLocation === 'All') {
					allowLocation = true;
				}
			}

			var allowJobArea = true;
			if (getJobArea !== this._currentlySelectedJobArea) {
				allowJobArea = false;
				if (this._currentlySelectedJobArea === 'All') {
					allowJobArea = true;
				}
			}

			if (allowLocation === true && allowJobArea === true) {
				currentJob.style.display = 'flex';
			} else {
				currentJob.style.display = 'none';
			}
		}
	};

	private buildSelectElement = (element, array, onChangeCallback) => {
		element.addEventListener('change', onChangeCallback);

		for (var i = 0; i < array.length; i++) {
			var opt = array[i];
			var optionElement = document.createElement('option');
			optionElement.textContent = opt;
			optionElement.value = opt;
			element.appendChild(optionElement);
		}
	};

	private checkIfItemsExistsInArrayIfNotAddItToTheArray = (arrayName, itemName: string) => {
		var itemsExistsInArray = false;
		var arrayLength = arrayName.length;
		for (var i = 0; i < arrayLength; i++) {
			var currentItem = arrayName[i];
			if (itemName === currentItem) {
				itemsExistsInArray = true;
			}
		}
		if (itemsExistsInArray === false) {
			arrayName.push(itemName);
		}
	};

	resize() {
		super.resize();
	}

	kill() {
		super.kill();
	}
}
