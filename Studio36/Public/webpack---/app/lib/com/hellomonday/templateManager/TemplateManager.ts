import axios, { CancelTokenSource } from 'axios';
import { Globals } from '../../../../src/data/Globals';
import { AbstractTemplate } from '../../../../src/templates/AbstractTemplate';
import { Signal } from '../signals/Signal';

export class TemplateManager {
	public signalHashChange: Signal = new Signal();

	private _passedVariables;

	private _templateRegister: { templateName: string; template: typeof AbstractTemplate }[] = [];
	private _activeTemplates: {
		path: string;
		data: object;
		template: AbstractTemplate;
	}[] = [];

	private _blocked = false;

	private _useCachedVersion: boolean = false;
	private _newPath = '';
	private _defaultPath = '';
	private _curPath = '';

	private _initial = true;

	private _initialData;

	private _queue = [];

	private _loadProgresses = [];

	private _prevFullUrl;
	private _newFullUrl;

	private _loadQue = [];

	private _loading = false;

	public asyncLoad = true;
	public trackGoogleAnalytics = true;
	public useHistoryApi = true;
	public defaultUrl = document.location.protocol + '//' + window.location.host;
	public defaultSubfolder = '';
	public prevPath = '';

	private http = axios.create();
	private cancelRequest: CancelTokenSource = null;

	public init(data, defaultPath: string) {
		this._initialData = data;

		if (defaultPath) {
			this._defaultPath = defaultPath;
		}

		if (window.history === null) {
			this.useHistoryApi = false;
		}

		if (this.useHistoryApi === true) {
			history.scrollRestoration = 'manual';
			window.addEventListener('popstate', this.onHashChange);
		} else {
			window.addEventListener('hashchange', this.onHashChange);
		}

		this._curPath = 'initialLoad';
		this._newPath = this._curPath;
		this._prevFullUrl = this._curPath;

		// force initial hash change
		this.onHashChange();
	}

	onHashChange = (e = null) => {
		// Parse the current url
		var url = this.getPath();
		this._newFullUrl = url;

		var loadWasAborted = false;

		url = url.split('?')[0];

		if (this.useHistoryApi) {
			url = url.split('#')[0];
		}

		this._newPath = this.extractPath(url);
		// if the new path is empty, set it to the default path
		if (this._newPath === '') {
			this._newPath = this._defaultPath;
		}

		if (Globals.CASE_CONTROLLER && (this._newPath.indexOf('projects/') > -1 || this._newPath === 'home')) {
			if (Globals.CASE_CONTROLLER) {
				Globals.CASE_CONTROLLER.handleProjectDeeplink(this._newPath);
			} else {
				// If the case controller is not yet initialized, we need to set the 'path' via: this.onHashChange('/'); -and then manually initialize the case controller
			}
		} else {
			// If the path has changed then load the corresponding data
			if (this._curPath !== this._newPath) {
				this.prevPath = this._curPath;
				this._curPath = this._newPath;

				/*	Globals.RESET_FILTER_AFTER_TRANSITION = true;
			Globals.MAIN_MENU.filter.toggle(this._newPath === this._defaultPath);
			Globals.MAIN_MENU.resetFilter();*/

				// If there is an active template, run template out on it
				if (this._activeTemplates.length > 0) {
					// && !_blocked)
					this._blocked = true;

					var oldTemplateObj;

					var l = this._activeTemplates.length;

					for (var i = 0; i < l; i++) {
						oldTemplateObj = this._activeTemplates.pop();
						oldTemplateObj.template.templateOut(this._newPath);
					}
				}

				// Abort any load progress
				if (this._loadProgresses.length > 0) {
					let process = this._loadProgresses.pop();
					this.cancelRequest.cancel();
					loadWasAborted = true;
				}

				if (this._queue.length > 0) {
					this._queue = [];
				}

				// The data for the initial page is pre rendered by the server
				if (this._initial) {
					this.dataLoaded(this._initialData, this._newPath);
				} else {
					if (this.asyncLoad) {
						this.loadData(this._newPath);
					} else {
						if (loadWasAborted) {
							this.loadData(this._newPath);
						} else {
							this._loadQue.push(this._newPath);
						}
					}
				}
			}

			this._prevFullUrl = this._newFullUrl;

			this.signalHashChange.dispatch({ fullUrl: this._newFullUrl });
		}
	};

	loadData(path) {
		document.body.classList.add('busy');

		Globals.MAIN_MENU.closeBurgerMenu();

		var finalPath;

		if (path === 'home') {
			path = '';
		}
		finalPath = this.defaultUrl + '/' + path; // + '?ajax=1';

		this.cancelRequest = axios.CancelToken.source();

		if (path === '' && Globals.CACHE_FRONTPAGE) {
			this._useCachedVersion = true;
			this.dataLoaded(Globals.CACHE_FRONTPAGE, finalPath, path);
		} else {
			var request = this.http
				.get(finalPath, {
					cancelToken: this.cancelRequest.token
				})
				.then(result => this.dataLoaded(result.data, finalPath, path))
				.catch(this.onLoadError);
			this._loadProgresses.push(request);
		}
	}

	onLoadError = error => {
		window.location.reload();
	};

	dataLoaded = (data, path: string, rawPath?) => {
		document.body.classList.remove('busy');

		if (!this.asyncLoad) {
			this._loading = false;
		}

		if (this._loadProgresses.length > 0) {
			var process = this._loadProgresses.pop();
			process = null;
		}

		// Parse data
		if (this._initial) {
			data = data.querySelector('.template');
		} else {
			if (this._useCachedVersion === false) {
				var html = document.createElement('div');
				html.innerHTML = data;

				data = html;
			}
			this._useCachedVersion = false;
			data = data.querySelector('.template');
		}

		// Globals.MAIN_MENU.toggleMobileMenu(false);

		// console.log(this._initial, data, path, this._blocked);

		// If there is no active templates, create a new and run templateIn
		if (this._initial) {
			var template = this.initTemplate(data, path);
			template.templateIn();

			this._initial = false;
		} else if (this._blocked) {
			this._queue.push({
				path: path,
				data: data
			});
		} else {
			var template = this.initTemplate(data, path);
			template.templateIn();

			this._blocked = true;
		}
	};

	initTemplate(data: HTMLElement, path: string) {
		this.updateTitle(data);

		let template = this.getTemplate(data, data.getAttribute('data-template'));
		template.path = path;

		//Gooogle Analytics
		if (this.trackGoogleAnalytics === true && !this._initial) {
			// Google Analytics tracking
			if (typeof (window as any).ga !== 'undefined') {
				if (path === '') {
					path = '/';
				}

				if (path.substring(0, 1) !== '/') {
					path = '/' + path;
				}

				(window as any).ga('event', 'page_view', path);
			}

			if (typeof (window as any).gtag !== 'undefined') {
				if (path === '') {
					path = '/';
				}

				if (path.substring(0, 1) !== '/') {
					path = '/' + path;
				}

				let base = window.location.protocol + '//' + window.location.host + '/';
				(window as any).gtag('event', 'page_view', { page_path: path.replace(base, '') });
			}
		}

		this._activeTemplates.push({
			path: path,
			data: data,
			template: template
		});

		return template;
	}

	updateTitle(data) {
		// let title = data.getAttribute('data-title');
		//
		// if (title.toLowerCase() === 'big') {
		// 	title = null;
		// }
		//
		// if (!title) {
		// 	title = 'Big';
		// } else {
		// 	title += ' - Big';
		// }
		//
		// document.head.querySelector('title').textContent = title;
	}

	public getTemplate = (data: HTMLElement, templateName: string, isOverlay?) => {
		let l = this._templateRegister.length;
		let template: AbstractTemplate;
		let found = false;

		for (let i = 0; i < l; i++) {
			if (this._templateRegister[i].templateName === templateName) {
				template = new this._templateRegister[i].template(data, this);
				found = true;
				break;
			}
		}

		if (!found) {
			console.error('Template with name: ' + templateName + ' not found');
		}

		return template;
	};

	public getCurrentActiveTemplate = () => {
		return this._activeTemplates[0];
	};

	/**
	 * Format the url
	 * Ex. if you pass "http://www.hellomonday.com/#/this/is/path"
	 * you will get "this/is/path"
	 *
	 * @param str {string} - the path which should be converted
	 * @private
	 */
	public extractPath = str => {
		var arr1 = str.split('#');
		var arr2 = arr1[arr1.length - 1].split('/');
		var arr3 = [];
		var l = arr2.length;
		var currPart;

		for (var i = 0; i < l; i += 1) {
			currPart = arr2[i];
			if (currPart !== null && currPart !== '') {
				arr3.push(currPart);
			}
		}
		var newPath = arr3.join('/');
		return newPath;
	};

	public getPath() {
		var url = '';
		if (this.useHistoryApi === true) {
			var fullURL = window.location.href;
			url = fullURL.substring(this.defaultUrl.length + this.defaultSubfolder.length, fullURL.length);
		} else {
			url = window.location.hash;
		}

		return url;
	}

	public path = (newPath: string, subPath?: string) => {
		if (this.useHistoryApi === true) {
			newPath = '/' + newPath;
			history.pushState(newPath, newPath, newPath);
		} else {
			window.location.hash = '/' + newPath;
		}

		if (this.useHistoryApi) {
			this.onHashChange(subPath);
		}
	};

	public isInitial() {
		return this._initial;
	}

	public addTemplate(templateName: string, template: typeof AbstractTemplate) {
		this._templateRegister.push({
			templateName: templateName,
			template: template
		});
	}

	/**
	 * Function for allowing next template to be added
	 * You should call this function after templateIn() and templateOut()
	 */
	public nextTemplate = (passedVars?) => {
		this._passedVariables = passedVars || {};

		if (this.asyncLoad) {
			if (this._queue.length > 0) {
				var que = this._queue.pop();
				var template = this.initTemplate(que.data, que.path);

				template.templateIn();

				this._blocked = true;
			} else {
				this._blocked = false;
			}
		} else if (this._loadQue.length > 0) {
			this.loadData(this._loadQue.shift());
			this._blocked = false;
			this._loading = true;
		}
	};

	public resize = () => {
		var i = 0;
		var l = this._activeTemplates.length;

		for (i; i < l; i++) {
			this._activeTemplates[i].template.resize();
		}
	};

	public getCurrentPath() {
		return this._curPath;
	}
}
