---
created: 2024-03-10T20:22:40 (UTC +08:00)
tags: []
source: https://publish.obsidian.md/
author: 
---

# 视图 - 开发者文档 --- Views - Developer Documentation

> ## Excerpt
> HTML elements - Developer Documentation

---
Views determine how Obsidian displays content. The file explorer, graph view, and the Markdown view are all examples of views, but you can also create your own custom views that display content in a way that makes sense for your plugin.  
视图决定 Obsidian 如何显示内容。文件资源管理器、图形视图和 Markdown 视图都是视图的示例，但您也可以创建自己的自定义视图，以对您的插件有意义的方式显示内容。

To create a custom view, create a class that extends the [ItemView](https://docs.obsidian.md/Reference/TypeScript+API/ItemView) interface:  
要创建自定义视图，请创建一个扩展 ItemView 接口的类：

```ts
import { ItemView, WorkspaceLeaf } from "obsidian"; export const VIEW_TYPE_EXAMPLE = "example-view"; export class ExampleView extends ItemView { constructor(leaf: WorkspaceLeaf) { super(leaf); } getViewType() { return VIEW_TYPE_EXAMPLE; } getDisplayText() { return "Example view"; } async onOpen() { const container = this.containerEl.children[1]; container.empty(); container.createEl("h4", { text: "Example view" }); } async onClose() { // Nothing to clean up. } }
```

For more information on how to use the `createEl()` method, refer to [HTML elements](https://docs.obsidian.md/Plugins/User+interface/HTML+elements).

Each view is uniquely identified by a text string and several operations require that you specify the view you'd like to use. Extracting it to a constant, `VIEW_TYPE_EXAMPLE`, is a good idea—as you will see later in this guide.

-   `getViewType()` returns a unique identifier for the view.
-   `getDisplayText()` returns a human-friendly name for the view.
-   `onOpen()` is called when the view is opened within a new leaf and is responsible for building the content of your view.
-   `onClose()` is called when the view should close and is responsible for cleaning up any resources used by the view.

Custom views need to be registered when the plugin is enabled, and cleaned up when the plugin is disabled:

```ts
import { Plugin } from "obsidian"; import { ExampleView, VIEW_TYPE_EXAMPLE } from "./view"; export default class ExamplePlugin extends Plugin { async onload() { this.registerView( VIEW_TYPE_EXAMPLE, (leaf) => new ExampleView(leaf) ); this.addRibbonIcon("dice", "Activate view", () => { this.activateView(); }); } async onunload() { } async activateView() { const { workspace } = this.app; let leaf: WorkspaceLeaf | null = null; const leaves = workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE); if (leaves.length > 0) { // A leaf with our view already exists, use that leaf = leaves[0]; } else { // Our view could not be found in the workspace, create a new leaf // in the right sidebar for it leaf = workspace.getRightLeaf(false); await leaf.setViewState({ type: VIEW_TYPE_EXAMPLE, active: true }); } // "Reveal" the leaf in case it is in a collapsed sidebar workspace.revealLeaf(leaf); } }
```

The second argument to [registerView()](https://docs.obsidian.md/Reference/TypeScript+API/Plugin/registerView) is a factory function that returns an instance of the view you want to register.

Never manage references to views in your plugin. Obsidian may call the view factory function multiple times. Avoid side effects in your view, and use `getLeavesOfType()` whenever you need to access your view instances.

```ts
this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE).forEach((leaf) => { if (leaf.view instanceof ExampleView) { // Access your view instance. } });
```
