import { Injectable } from '@angular/core'
import { ImageModel, ErrorModel } from '../../models'
import { ImageWebservice, ImageListWebservice } from '../../webservices'
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Services } from '../services'

const CACHE_FOLDER = 'CACHED-IMG'

@Injectable({
	providedIn: 'root'
})
export class ImageService {
	private ImageList: Array<ImageModel>
	constructor(
		private imageListWeb: ImageListWebservice,
		private imageWeb: ImageWebservice,) {
	}
	/**
	* Frägt die ImageListe vom Server ab
	* @return {ImageModel} Liste aller verfügbaren Bilder mit zugehöriger versions Identifikation
	*/
	async getImageList(): Promise<Array<ImageModel>> {
		try {
			let imageList: Array<ImageModel> = await this.imageListWeb.requestImageList()
			return imageList
		} catch (e) {
			// TODO: Error handling
		}
	}
	/**
	* Speichert die ImageListe im localStorage ab.
	* @param {Array<ImageModel>} images enthält ein Array vom typ ImageModel
	*/
	saveImageList(images: Array<ImageModel>) {
		let json = ImageModel.serializeList(images)
		localStorage.setItem('ImageList', JSON.stringify(json))
	}
	/**
	* Lädt die ImageListe aus dem LocalStorage.
	* @return {Array<ImageModel>} gibt ein Array vom typ ImageModel zurück
	*/
	async loadImageList(): Promise<Array<ImageModel>> {
		let json: any
		try {
			json = JSON.parse(localStorage.getItem('ImageList'))
		} catch (e) {
			// TODO: Error handling
		}
		if (!json) return
		this.ImageList = ImageModel.deSerializeList(json)
		if (this.ImageList.length === 0) {
			this.ImageList = await this.getImageList()
			this.saveImageList(this.ImageList)
		}
		return this.ImageList
	}
	/**
	* Überprüft den lokalen Speicher und die vom Server gesendeten Bild Versionen ab.
	*/
	async checkStorage() {
		let storedImages = this.ImageList || await this.loadImageList()
		let newImages = await this.getImageList()
		if (!newImages || !storedImages) return
		for (let newImage of newImages) {
			let oldImage = storedImages.find(entry => entry.File === newImage.File)
			if (oldImage.Hash !== newImage.Hash) {
				this.storeImage(newImage.File)
				oldImage.Hash = newImage.Hash
			}
		}
		this.saveImageList(storedImages)
	}
	/**
	* Speichert das Bild als Base64 im Cache der anwendung ab.
	* @param {string} fileName enthält den Dateinamen für die zu speichernde Datei
	*/
	async storeImage(fileName: string) {
		// retrieve the image as Blob
		const responseBlob = await this.imageWeb.requestImageData(fileName)
		// convert to base64 data, which the Filesystem plugin requires
		const base64Data = await this.convertBlobToBase64(responseBlob);
		const savedFile = await Filesystem.writeFile({
			path: `${CACHE_FOLDER}/${fileName}`,
			data: base64Data,
			directory: Directory.Cache,
			recursive: true
		});
		return savedFile
	}
	/**
	* Helper Function welche den vom Server erhaltenen Blob mit den Bilddaten zu einem Base64 Image convertiert welches der Browser anzeigen kann.
	* @param {Blob} blob der die encodeden Daten vom Bild enthält
	* @return {Promise<string>}
	*/
	convertBlobToBase64(blob: Blob): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			let reader = this.getFileReader();
			reader.readAsDataURL(blob);
			reader.onload = () => resolve(reader.result.toString());
			reader.onerror = error => reject(error);
		})
	}
	/**
	* Wird für Capacitor benötigt um die Funktionalität zu gewährleisten
	* @return {FileReader} Capacitor FileReader Element
	*/
	getFileReader(): FileReader {
		const fileReader = new FileReader();
		const zoneOriginalInstance = (fileReader as any)["__zone_symbol__originalInstance"];
		return zoneOriginalInstance || fileReader;
	}
	/**
	* Durchsucht die gespeicherte ImageListe wenn vorhanden, oder lädt sie neu, nach dem gesuchten Bild.
	* @param {string} name FileName vom bild über das es identifiziert wird.
	* @return {Promise<ImageModel>} Promise vom ImageModel mit allen benötigten Daten
	*/
	async getFileByName(name: string): Promise<ImageModel> {
		let storedImages = this.ImageList || await this.loadImageList()
		let image = storedImages.find(entry => entry.File === name)
		return image
	}
}
