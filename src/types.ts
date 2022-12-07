import { TFile, View } from "obsidian";

export interface PluginSettings {
	noteWidth: string;
	noteHeight: string;
	noteMargin: string;
	x: string;
	y: string;
	numNotes: string;
	numNotesPerRow: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	noteWidth: "400",
	noteHeight: "500",
	noteMargin: "50",
	x: "0",
	y: "0",
	numNotes: "9",
	numNotesPerRow: "3",
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
