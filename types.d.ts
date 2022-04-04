declare namespace API {

    export interface ResourcePacks {
        categories: Category[]
    }

	export interface ZipPacks {
		status: string;
		link: string;
	}

	export interface Category {
		category: string;
		packs: Pack[];
		warning?: Warning;
	}

	export interface Pack {
		name: string;
		display: string;
		previewExtension?: string;
		description: string;
		incompatible: string[];
		video?: string;
	}

	export interface Warning {
		text: string;
		color: string;
	}

	export interface MCMeta {
		pack: {
			pack_format: number;
			description: string;
		}
	}

}

declare type ResourcePack = { category: string; name: string; } & Partial<API.Pack>;
