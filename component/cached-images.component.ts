import { Component, Input } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Services } from '../../services/services'
const CACHE_FOLDER = 'CACHED-IMG'

@Component({
	selector: 'cached-image',
	templateUrl: './cached-images.component.html',
	styleUrls: ['./cached-images.component.scss']
})

export class CachedImagesComponent {
	public _src
	// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
	constructor(
		private sanitization:DomSanitizer
	) {
	}
	// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
	@Input()
	set src(imageName: string) {
		this._src="../../../../assets/loading.jpg"

		if (imageName) {
			const fileType = imageName.split('.').pop()

			Filesystem.readFile({
				directory: Directory.Cache,
				path: `${CACHE_FOLDER}/${imageName}`
			}).then(readFile => {
				let imgUrl = `data:image/${fileType};base64,${readFile.data}`
				this._src = this.sanitization.bypassSecurityTrustUrl(imgUrl)
			}).catch(async _e => {
				await Services.ImageService.storeImage(imageName)
				Filesystem.readFile({
					directory: Directory.Cache,
					path: `${CACHE_FOLDER}/${imageName}`
				}).then(readFile => {
					let imgUrl = `data:image/${fileType};base64,${readFile.data}`
					this._src = this.sanitization.bypassSecurityTrustUrl(imgUrl)
				}).catch(async _e => {
					this._src="../../../../assets/loaderr.jpg"
				})
			})
		}
	}
}
