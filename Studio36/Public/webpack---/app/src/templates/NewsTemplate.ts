import {AbstractTemplate} from './AbstractTemplate';
import {TemplateManager} from "../../lib/com/hellomonday/templateManager/TemplateManager";
import {NewsArticle} from "./components/NewsArticle";
import {NewsFilter} from "../ui/NewsFilter/NewsFilter";

export class NewsTemplate extends AbstractTemplate {

	private _articles: Array<NewsArticle> = [];
	private _filter: NewsFilter;

	constructor(element: HTMLElement, templateManager: TemplateManager) {
		super(element, templateManager);

		let articleData = this.element.querySelectorAll('.item');

		let l = articleData.length;

		for (let i = 0; i < l; i++) {
			this._articles.push(new NewsArticle(articleData[i] as HTMLDivElement));
		}

		this._filter = new NewsFilter(this.element.querySelector('.NewsFilter'), this._articles, this.element);

	//	this.sortOnDate();
	}

	private sortOnDate = () => {
		this._articles.sort((a, b) => b.date - a.date);
		// console.log(this._articles);
		let l = this._articles.length;

		for(let i = 0; i < l; i++) {
			// console.log(this._articles[i].date);
			this._articles[i].element.parentNode.appendChild(this._articles[i].element);
		}
	}

	templateIn() {
		super.templateIn();
	}

	kill() {
		super.kill();

		let l = this._articles.length;

		for (let i = 0; i < l; i++) {
			this._articles[i].kill();
		}
	}

	resize() {
		super.resize();

		let l = this._articles.length;

		for (let i = 0; i < l; i++) {
			this._articles[i].resize();
		}
	}

}
