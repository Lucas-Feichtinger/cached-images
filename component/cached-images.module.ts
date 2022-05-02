import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CachedImagesComponent } from './cached-images.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
	],
	declarations: [
		CachedImagesComponent
	],
	exports: [
		CachedImagesComponent
	]
})
export class CachedImagesModule { }
