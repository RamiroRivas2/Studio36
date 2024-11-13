import { CaseInfo } from '../components/CaseInfo';

export class CaseEntryFilters {
	private _searchValues: Array<string> = [];

	private _searchValuesKeywords: Array<string> = [];
	private _searchValuesProjectTitles: Array<string> = [];
	private _searchValuesOthers: Array<string> = [];

	private _projectTitle;
	private _projectURL;

	constructor(info: CaseInfo) {
		let keywords = info.element.dataset.keywords.split(',');
		//console.log(keywords)
		let employees = info.element.dataset.employees.split(',');
		let projectTitle = info.element.querySelector('.projectTitle').innerHTML;
		this._projectTitle = projectTitle;
		let client = info.element.querySelector('.entry.client .value');
		let typology = info.element.querySelector('.entry.typology .value');
		let location: any = info.element.querySelector('.location');
		if (location) {
			location = location.innerHTML;
		}

		// @ts-ignore
		this._projectURL = info.element.parentNode.parentNode.parentNode.getAttribute('data-project-url');
		//console.log(this._projectURL)
		for (let i = 0; i < keywords.length; i++) {
			keywords[i] = keywords[i].toLowerCase();
			keywords[i] = keywords[i].trim();
		}

		//console.log(this._projectTitle);

		this._searchValues.push(...keywords);
		this._searchValuesKeywords.push(...keywords);

		function uniq(a) {
			var prims = { boolean: {}, number: {}, string: {} },
				objs = [];

			return a.filter(function(item) {
				var type = typeof item;
				if (type in prims) return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
				else return objs.indexOf(item) >= 0 ? false : objs.push(item);
			});
		}

		this._searchValuesKeywords = uniq(this._searchValuesKeywords);

		this._searchValues.push(...employees);
		this._searchValuesOthers.push(...employees);

		this._searchValues.push(projectTitle);
		this._searchValuesProjectTitles.push(projectTitle);

		if (client) {
			this._searchValues.push(client.innerHTML.toLowerCase());
			this._searchValuesOthers.push(client.innerHTML.toLowerCase());
		}

		if (typology) {
			//@ts-ignore
			var getTypology = typology.innerText.toLowerCase();
			getTypology.replaceAll('\n', '');
			getTypology.replaceAll('\t', '');
			//	console.log(getTypology);
			var getTypologyArray = getTypology.split(',');
			if (getTypologyArray.length >= 0) {
				for (var i = 0; i < getTypologyArray.length; i++) {
					var currentTypology = getTypologyArray[i];
					//console.log(currentTypology)

					//currentTypology = currentTypology.toLowerCase();
					getTypologyArray[i] = getTypologyArray[i].trim();
				}
				//	console.log('---');
				//	console.log(getTypologyArray);
			}
			this._searchValuesKeywords.push(...getTypologyArray);
			this._searchValues.push(...getTypologyArray);
			//	console.log(this._searchValuesKeywords);

			this._searchValuesOthers.push(...getTypologyArray);
			//	this._searchValuesOthers.push(typology.innerHTML.toLowerCase());
		}

		if (location) {
			this._searchValues.push(location.toLowerCase());
			this._searchValuesOthers.push(location.toLowerCase());
		}

		this._searchValues = this._searchValues.filter(e => {
			return e != '';
		});

		this._searchValues = uniq(this._searchValues);

		//console.log(this._searchValues);
	}

	public checkMatch = (searchParams: Array<string>, projectURL?: string) => {
		if (projectURL != null) {
			if (projectURL === this._projectURL) {
				return true;
			}
		} else {
			if (searchParams.length === 0) {
				return true;
			}

			let l = this._searchValues.length;
			let foundCount = 0;

			for (let i = 0; i < l; i++) {
				let k = searchParams.length;

				for (let j = 0; j < k; j++) {
					if (searchParams[j] === this._searchValues[i].toLowerCase()) {
						foundCount++;
					}
				}
			}
			//foundCount >= searchParams.length; -- Here it would just match 1 - now it needs to match both
			/*console.log('-- projectTitle : ' + this._projectTitle)
				console.log('foundCount : ' + foundCount);
			console.log(searchParams.length);
			console.log(searchParams);
			console.log(this._searchValues);*/
			return foundCount >= searchParams.length;
		}
	};

	public checkMatchSecondaryFilter = searchValue => {
		let l = this._searchValues.length;
		let foundCount = 0;

		for (let i = 0; i < l; i++) {
			if (searchValue === this._searchValues[i].toLowerCase()) {
				foundCount++;
			}
		}

		return foundCount >= 1;
	};

	get searchValues() {
		return this._searchValues;
	}

	get searchValuesKeywords() {
		return this._searchValuesKeywords;
	}

	get searchValuesProjectTitles() {
		return this._searchValuesProjectTitles;
	}

	get searchValuesOthers() {
		return this._searchValuesOthers;
	}
}
