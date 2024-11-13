import { divIcon as DivIcon, map as Map, marker as Marker, popup as Popup, tileLayer } from 'leaflet';
import { Globals } from '../../../../../data/Globals';
import { CaseEntry } from '../CaseEntry';
import { AbstractCaseBlock } from './AbstractCaseBlock';

export class CaseMap extends AbstractCaseBlock {
	private _mapContainer: HTMLDivElement;
	private _element: HTMLDivElement;
	private _caseEntry: CaseEntry;

	constructor(element: HTMLDivElement, caseEntry: CaseEntry) {
		super(element, 'map');
		this._element = element;
		this._caseEntry = caseEntry;
		this._mapContainer = element.querySelector('.map-container');

		setTimeout(() => {
			if (this._mapContainer) {
				if (!this._caseEntry.projectLocation.latitude || !this._caseEntry.projectLocation.longitude) {
					return;
				}

				const map = Map(this._mapContainer, {
					keyboard: false,
					zoomControl: true,
					dragging: true,
					boxZoom: false,
					scrollWheelZoom: true
				}).setView([this._caseEntry.projectLocation.latitude, this._caseEntry.projectLocation.longitude], 7);

				map.on('mouseover', () => {
					map.scrollWheelZoom.enable();
					this._caseEntry._wheelController.dragActive = false;
					this._caseEntry._draggable[0].disable();
				});

				map.on('mouseout', () => {
					map.scrollWheelZoom.disable();
					this._caseEntry._wheelController.dragActive = true;
					this._caseEntry._draggable[0].enable();
				});

				map.on('dragstart', () => {
					this._caseEntry._wheelController.dragActive = false;
					this._caseEntry._draggable[0].disable();
				});

				map.on('dragend', () => {
					this._caseEntry._wheelController.dragActive = true;
					this._caseEntry._draggable[0].enable();
				});

				tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
				}).addTo(map);

				const markerIcon = DivIcon({
					className: 'map-marker-icon',
					iconSize: [40, 40],
					iconAnchor: [20, 40],
					html: `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path></svg>`
				});

				const markerPopupContent = document.createElement('div');
				markerPopupContent.innerHTML = `<strong>${this._caseEntry.projectTitle}</strong>${this._caseEntry.projectPopuplocation ? `${this._caseEntry.projectPopuplocation}` : ''}`;

				const markerPopup = Popup({
					offset: [0, -26],
					autoPan: true
				}).setContent(markerPopupContent);

				const mainMarker = Marker([this._caseEntry.projectLocation.latitude, this._caseEntry.projectLocation.longitude], {
					icon: markerIcon,
					zIndexOffset: 100
				})
					.addTo(map)
					.bindPopup(markerPopup);

				if (!Globals.MOBILE_LAYOUT) {
					mainMarker.openPopup();
				}

				const caseEntries = Globals.CASE_CONTROLLER.getAllCaseEntries();
				for (const caseEntry of caseEntries) {
					if (caseEntry._id === this._caseEntry._id) {
						continue;
					}

					const caseEntryMarkerIcon = DivIcon({
						className: 'map-marker-icon-neutral',
						iconSize: [30, 30],
						iconAnchor: [15, 30],
						html: `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path></svg>`
					});

					if (!caseEntry.projectLocation.latitude || !caseEntry.projectLocation.longitude) {
						continue;
					}

					const caseEntryMarkerPopupContent = document.createElement('div');
					caseEntryMarkerPopupContent.classList.add('cursor-pointer');
					caseEntryMarkerPopupContent.innerHTML = `<strong>${caseEntry.projectTitle}</strong>${caseEntry.projectPopuplocation ? `${caseEntry.projectPopuplocation}` : ''}`;
					const caseEntryMarkerPopup = Popup({
						offset: [0, -14],
						autoPan: true
					}).setContent(caseEntryMarkerPopupContent);

					caseEntryMarkerPopupContent.addEventListener('click', e => {
						e.stopPropagation();
						e.preventDefault();
						Globals.CASE_CONTROLLER.goToProjectUrl('/projects/' + caseEntry.projectUrl);
					});

					Marker([caseEntry.projectLocation.latitude, caseEntry.projectLocation.longitude], {
						icon: caseEntryMarkerIcon
					})
						.addTo(map)
						.bindPopup(caseEntryMarkerPopup);
				}
			}
		}, 800);
	}

	public resize = (height: number): void => {
		const width = Math.round(height * 1.2);

		this.element.dataset.useWidth = width.toString();
		this.element.style.width = width + 'px';
		this._mapContainer.style.width = width + 'px';
	};

	public kill = () => {};
}
