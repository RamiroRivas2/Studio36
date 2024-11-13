import { AbstractCaseBlock } from './AbstractCaseBlock';
import { WindowManager } from '../../../../../utils/WindowManager';
import { Globals } from '../../../../../data/Globals';
import { gsap } from 'gsap';

export class CaseTeam extends AbstractCaseBlock {
	private _content: HTMLDivElement;
	private _marker: HTMLSpanElement;
	private _allEmployees;
	private _employeeArea;

	constructor(element: HTMLDivElement, type: string) {
		super(element, type);

		this._employeeArea = element.querySelector('.allEmployees');
		this._allEmployees = element.querySelectorAll('.employee');
		this._content = element.querySelector('.content');
		this._marker = this._content.querySelector('.marker');

		this.sortEmployeesByRole();
	}

	private sortEmployeesByRole = () => {
		var length = this._allEmployees.length;
		var sortArray = [];

		// Find all different order IDs
		for (var i = 0; i < length; i++) {
			var currentEmployee = this._allEmployees[i];
			var regEx = new RegExp(/(\\)"|(\\n)|(\\t)|>[^<]*(\s)[^>]*</, 'g');
			var storeText = currentEmployee.textContent;
			storeText = storeText.replace('\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t', '');
			storeText = storeText.replace('\n\t\t\t\t\t\t\t\t\t\t\t\t\t', '');
			var object = {
				div: currentEmployee,
				sortOrder: Number(currentEmployee.getAttribute('data-websiteDisplayOrder')),
				name: currentEmployee.getAttribute('data-websiteDisplayOrder') + '_' + storeText,
				role: currentEmployee.getAttribute('data-websiteDisplayRole')
			};
			//var object = {div: currentEmployee, sortOrder: Math.floor(Math.random() * 3 ), role: currentEmployee.getAttribute('data-websiteDisplayRole')}

			sortArray.push(object);
		}

		for (var i = 0; i < length; i++) {
			var currentEmployee = this._allEmployees[i];
			currentEmployee.parentNode.removeChild(currentEmployee);
		}

		// Sort based on sortOrder
		/*sortArray.sort((a, b) => {
			return a.sortOrder - b.sortOrder;
		});*/

		sortArray.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

		//console.log(sortArray);

		var allRoles = [];

		for (var i = 0; i < length; i++) {
			var currentEntry = sortArray[i];
			var getRole = currentEntry.role;
			if (getRole !== _previousRole) {
				var newObject = { role: getRole, employees: [] };
				allRoles.push(newObject);
				_previousRole = getRole;
			}
			newObject.employees.push(currentEntry);
		}
		//console.log(allRoles);

		for (var i = 0; i < allRoles.length; i++) {
			var currentRole = allRoles[i];
			var roleTitle = document.createElement('h3');
			roleTitle.className = 'headline';
			roleTitle.innerHTML = currentRole.role;
			if (i > 0) {
				roleTitle.style.marginTop = '20px';
			}
			this._employeeArea.appendChild(roleTitle);
			for (var j = 0; j < currentRole.employees.length; j++) {
				if (j === 0) {
					/*currentRole.employees.sort((a, b) => {
						return a.name - a.name;
					});

					currentRole.employees.sort((a, b) => {
						return a.sortOrder - b.sortOrder;
					});*/
				}

				var currentEmployee = currentRole.employees[j];
				this._employeeArea.appendChild(currentEmployee.div);
			}
		}

		return;
		var _previousSortOderID = -99999;
		var _previousRole = null;

		var _projectTeamData = [];
		var _projectTeamChildrenCount = [];

		var count = 0;

		var _totalNonPeopleTeam = 0;
		var firstProjectTeamStartsAt = null;

		for (var i = 0; i < length; i++) {
			var currentEntry = sortArray[i];
			var getSortOrder = currentEntry.sortOrder;
			var getRole = currentEntry.role;
			console.log(getRole);
			if (getRole === 'Project Team') {
				if (firstProjectTeamStartsAt === null) {
					firstProjectTeamStartsAt = count;
					//	console.log(' --- firstProjectTeamStartsAt : ' + firstProjectTeamStartsAt);
				}
				_projectTeamChildrenCount.push(count);
				_projectTeamData.push(currentEntry.div.innerHTML.replace(/(\r\n|\n|\r|\t)/gm, ''));
			} else {
				_totalNonPeopleTeam++;
			}

			if (getSortOrder != _previousSortOderID && getRole !== _previousRole) {
				var createHeadline = document.createElement('h3');
				createHeadline.className = 'headline';
				createHeadline.innerHTML = getRole;
				if (i > 0) {
					createHeadline.style.marginTop = '20px';
				}
				this._employeeArea.appendChild(createHeadline);
				_previousSortOderID = getSortOrder;
				_previousRole = getRole;
				_totalNonPeopleTeam++;
				count++;
			}
			this._employeeArea.appendChild(currentEntry.div);
			count++;
		}

		this.sortProjectTeam(_projectTeamData, _projectTeamChildrenCount, firstProjectTeamStartsAt);
	};

	private sortProjectTeam = (dataArray, positionalArray, startAtCount) => {
		// Sort based on sortOrder
		dataArray.sort();
		console.log(dataArray);
		console.dir(this._employeeArea.children);

		for (var i = 0; i < positionalArray.length; i++) {
			var currentCount = positionalArray[i];
			this._employeeArea.children[startAtCount + i + 1].innerHTML = dataArray[i];
		}

		/*sortArray.sort((a, b) => {
			return a.sortOrder - b.sortOrder;
		});*/
	};

	// @ts-ignore
	public resize = (height: number): void => {
		this.delayedResize();
		gsap.delayedCall(0.5, this.delayedResize);
	};

	private delayedResize = () => {
		let columns: number = Math.ceil((this._marker.offsetLeft + 350) / 350) + 1;
		//console.log('this._marker.offsetLeft : ' + this._marker.offsetLeft);
		//console.log('columns : ' + columns);

		// this.element.style.paddingLeft = ((170 * columns + (40 * (columns - 1))) + 190) + 'px';
		if (Globals.MOBILE_LAYOUT) {
			columns = Math.ceil(this._marker.offsetLeft / 225) + 1;
			//console.log(columns);
			this.element.style.paddingLeft = 225 + 225 * columns + 0 + 'px';
		} else {
			this.element.style.paddingLeft = 90 + 350 * columns + 0 + 'px';
		}

		this.element.style.width = this.element.style.paddingLeft;

		//this._content.style.width = this._marker.offsetLeft + 'px';
	};

	public kill = () => {
		// super.kill();
	};
}
