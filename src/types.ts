import { TFile, View } from "obsidian";

export interface PluginSettings {
	defaultWidth: string;
	defaultHeight: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	defaultWidth: "400",
	defaultHeight: "500",
};

export interface Canvas {
	nodes: any[];
	edges: any[];
}

export interface FileNode {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	color: string;
	type: string;
	file: string;
}

export interface SearchView extends View {
	dom: SearchDOM;
}

export interface SearchDOM {
	getFiles(): TFile[];
}
