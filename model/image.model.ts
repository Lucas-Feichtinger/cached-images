export class ImageModel {
	public File: string
	public Hash: string;


	public static serialize(model: ImageModel): Object {
		let obj = {}

		obj['file'] = model.File
		obj['hash'] = model.Hash

		return obj
	}

	// List
	public static serializeList(modelList: ImageModel[]): Array<Object> {
		let list: Array<Object> = []
		if (modelList && Array.isArray(modelList)) {
			for (let model of modelList) {
				list.push(ImageModel.serialize(model))
			}
		}
		return list
	}

	// Obj
	public static deSerialize(obj: Object): ImageModel {
		let mdl = new ImageModel()
		mdl.File = obj['file']
		mdl.Hash = obj['hash']
		return mdl
	}

	// List
	public static deSerializeList(objList: Array<Object>): ImageModel[] {
		let list: Array<ImageModel> = []
		if (objList && Array.isArray(objList)) {
			for (let obj of objList) {
				list.push(ImageModel.deSerialize(obj))
			}
		}
		return list
	}
}
