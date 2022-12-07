import CanvasRandomNotePlugin from "main";
import { Modal, Setting } from "obsidian";

class InsertModal extends Modal {
	plugin: CanvasRandomNotePlugin;
	confirmed: boolean = false;

	constructor(plugin: CanvasRandomNotePlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: "Add notes settings" });
		const settings = this.plugin.settings;

		new Setting(contentEl).addText((text) =>
			text
				.setPlaceholder("Number of notes")
				.setValue(settings.numNotes)
				.onChange(async (value) => {
					settings.numNotes = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(contentEl).addText((text) =>
			text
				.setPlaceholder("Number of notes per row")
				.setValue(settings.numNotesPerRow)
				.onChange(async (value) => {
					settings.numNotesPerRow = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Add Notes")
				.setCta()
				.onClick(() => {
					this.confirmed = true;
					this.close();
				})
		);
	}
}

export default InsertModal;
