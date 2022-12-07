# Obsidian Canvas RandomNote

This plugin can be used to add notes to the Obsidian canvas view.

There are two commands available

- `Add notes` will select from all markdown files available in your vault
- `Add notes from search` will select notes randomly from the active search

The selected notes will be added in a grid of file nodes to the active canvas. Several settings related to number of notes and their positions are available on running command

<img width="507" alt="image" src="https://user-images.githubusercontent.com/33093632/206282118-f7a2e70c-5fbb-448e-950c-e0a56654bfe8.png">


## Warning

As no official Canvas API is available yet in the Obsidian developer API, this plugin is modifying the underlying data of the Canvas directly. Therefore multiple commands should not be run quickly in succession, or there is a possibility of the data the Canvas consumes being out of sync with what you see in Obsidian.
