//https://chat.openai.com/c/33749cbc-2312-4c9b-9df1-5c5115ba14ec
import {
  Plugin,
  WorkspaceLeaf,
  TFile,
  TFolder,
  ViewState,
  MarkdownView,
  ItemView
} from 'obsidian';
// import DEFAULT_SETTINGS from './setting'
import { around } from 'monkey-around'
import { MindMapSettings } from './settings';
import { MindMapSettingsTab } from './settingTab'

import { MindMapView, mindmapViewType } from "./MindMapView";
import { frontMatterKey, basicFrontmatter } from './constants';
import { t } from './lang/helpers'
import { transformAndSyncData } from './dGantte/transformAndSyncData';
import { GanttChartView } from './dGantte/GanttChartView';
import { GanttChartHourlyView } from './GantteHourly/GanttChartHourlyView';


export default class MindMapPlugin extends Plugin {
  settings: MindMapSettings;
  mindmapFileModes: { [file: string]: string } = {};
  _loaded: boolean = false;
  timeOut: any = null;
  mindmap: any;

  async onload() {

    await this.loadSettings();
    //await this.loadStylesheet("path/to/dhtmlxgantt.css");

    this.addCommand({
      id: 'Create New MindMap',
      name: `${t('Create new mindmap')}`,
      checkCallback: (checking: boolean) => {
        let leaf = this.app.workspace.activeLeaf;
        if (leaf) {
          if (!checking) {
            const targetFolder = this.app.fileManager.getNewFileParent(
              this.app.workspace.getActiveFile()?.path || ""
            );
            if (targetFolder) {
              this.newMindMap(targetFolder);
            }
          }
          return true;
        }
        return false;
      }
    });
    
    this.addCommand({
      id: 'Toggle to markdown or mindmap',
      name: `${t('Toggle mardkown/mindmap')}`,
      mobileOnly: false,
      callback: () => {
          const mindmapView = this.app.workspace.getActiveViewOfType(MindMapView);
          const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
          if(mindmapView!=null){
            this.mindmapFileModes[(mindmapView.leaf as any).id || mindmapView.file.path] = 'markdown'; 
            this.setMarkdownView(mindmapView.leaf);
          }else if(markdownView!=null){
            this.mindmapFileModes[(markdownView.leaf as any).id || markdownView.file.path] = mindmapViewType;
            this.setMarkdownView(markdownView.leaf);
          }
      }
    });

    this.addCommand({
      id: 'Copy Node',
      name: `${t('Copy node')}`,
      callback: () => {
        const mindmapView = this.app.workspace.getActiveViewOfType(MindMapView);
        if(mindmapView){
            var mindmap = mindmapView.mindmap;
            navigator.clipboard.writeText('');
            var node = mindmap.selectNode;
            if(node){
              var text = mindmap.copyNode(node);
              navigator.clipboard.writeText(text);
            }
        }
      
      }
    });

    this.addCommand({
      id: 'Paste Node',
      name: `${t('Paste node')}`,
      callback: () => {
        const mindmapView = this.app.workspace.getActiveViewOfType(MindMapView);
        if(mindmapView){
          var mindmap = mindmapView.mindmap;
            navigator.clipboard.readText().then(text=>{
                mindmap.pasteNode(text);
            });
        }
      }
    });

    this.addCommand({
      id: 'Export to html',
      name: `${t('Export to html')}`,
      callback: () => {
        const mindmapView = this.app.workspace.getActiveViewOfType(MindMapView);
        if(mindmapView){
            mindmapView.exportToSvg();
        }
      }
    });


    this.registerView(mindmapViewType, (leaf) => new MindMapView(leaf, this));
    
    this.registerEvents();
    this.registerMonkeyAround();

    this.registerView("gantt-chart-view", (leaf) => new GanttChartView(leaf));

    this.registerView("gantt-chart-hourly-view", (leaf) => new GanttChartHourlyView(leaf));


    this.addCommand({
        id: 'open-gantt-chart-view',
        name: '打开脑图连接甘特图',
        callback: async () => {
            let activeLeaf = this.app.workspace.activeLeaf;
            if (activeLeaf) {
              console.log('打开脑图连接甘特图')
                // Create a new leaf by splitting the active leaf horizontally
                const newLeaf = this.app.workspace.createLeafBySplit(activeLeaf, 'horizontal');
                await newLeaf.setViewState({
                    type: "gantt-chart-view",
                });
            }
        }
    });

  


    this.addSettingTab(new MindMapSettingsTab(this.app, this));


    // 注册视图变化监听器
      this.registerEvent(
        this.app.workspace.on('active-leaf-change', this.handleActiveLeafChange.bind(this))
    );


  }

  // 当活动叶子（视图）变化时的处理函数
  private handleActiveLeafChange() {
    const activeView = this.app.workspace.getActiveViewOfType(MindMapView);
    if (activeView) {
        // 如果当前激活的视图是脑图视图，则更新甘特图
        const ganttView = activeView.getGanttChartView();
        if (ganttView) {
            ganttView.updateGanttChart();
        }

        const ganttHourlyView = activeView.getGanttChartHourlyView();
        if (ganttHourlyView) {
            ganttHourlyView.updateGanttChart();
        }
    }
  }

  getMindMapView(): MindMapView {
      // 此处的 `this.app` 应指向 Obsidian 应用程序实例
      // 可能需要通过插件实例或其他方式访问它
      return this.app.workspace.getActiveViewOfType(MindMapView);
  }
  // 功能: 获取甘特图视图实例
  getGanttChartView() {
    // 获取所有打开的视图（leaves）
    const leaves = this.app.workspace.getLeavesOfType("gantt-chart-view");
    
    // 遍历并找到第一个甘特图视图实例
    for (const leaf of leaves) {
        if (leaf.view instanceof GanttChartView) {
            return leaf.view;
        }
    }
    return null;
  }

  onunload() {
   
    this.app.workspace.detachLeavesOfType(mindmapViewType);
    
    //this.app.workspace.unregisterHoverLinkSource(frontMatterKey);

  }

  async newMindMap(folder?: TFolder) {
    const targetFolder = folder || this.app.fileManager.getNewFileParent(
        this.app.workspace.getActiveFile()?.path || ""
    );

    try {
        // 创建新的 Markdown 文件作为脑图
        //@ts-ignore
        const mindmap: TFile = await this.app.fileManager.createNewMarkdownFile(
            targetFolder,
            `${t('Untitled mindmap')}`
        );

        await this.app.vault.modify(mindmap, basicFrontmatter);

        // 创建一个新的 leaf 在新标签中
        let newLeaf = this.app.workspace.getLeaf(true);
        
        // 设置新 leaf 的视图状态
        await newLeaf.setViewState({
            type: mindmapViewType,
            state: { file: mindmap.path },
        });
    } catch (e) {
        console.error("Error creating mindmap board:", e);
    }
}


  async loadSettings() {
    this.settings = Object.assign({
      canvasSize: 8000,
      headLevel: 2,
      fontSize: 16,
      background: 'transparent',
      layout: 'mindmap',
      layoutDirect: 'mindmap'
    }, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async setMarkdownView(leaf: WorkspaceLeaf) {
    await leaf.setViewState(
      {
        type: "markdown",
        state: leaf.view.getState(),
        popstate: true,
      } as ViewState,
      { focus: true }
    );
  }

  async setMindMapView(leaf: WorkspaceLeaf) {
    await leaf.setViewState({
      type: mindmapViewType,
      state: leaf.view.getState(),
      popstate: true,
    } as ViewState);
  }

  registerEvents() {
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file: TFile,source:string,leaf?:WorkspaceLeaf) => {
        // Add a menu item to the folder context menu to create a board
        if (file instanceof TFolder) {
          menu.addItem((item) => {
            item
              .setTitle(`${t('New mindmap board')}`)
              .setIcon('document')
              .onClick(() => this.newMindMap(file));
          });
        }

        //add markdown view menu  open as mind map view

        if(leaf&&this.mindmapFileModes[leaf.id||file.path] == 'markdown'){
             const cache = this.app.metadataCache.getFileCache(file);
             if(cache?.frontmatter && cache.frontmatter[frontMatterKey]){
                  menu.addItem((item) => {
                   item
                   .setTitle(`${t('Open as mindmap board')}`)
                   .setIcon("document")
                   .onClick(() => {
                     this.mindmapFileModes[leaf.id || file.path] = mindmapViewType;
                     this.setMindMapView(leaf);
                   });
                 }).addSeparator();
            }
        }
      })
    );

    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        this.app.workspace.getLeavesOfType(mindmapViewType).forEach((leaf) => {
          const view = leaf.view as MindMapView;
          view.onFileMetadataChange(file);
        });
      })
    );

    // @ts-ignore
    // this.app.workspace.registerHoverLinkSource(frontMatterKey, {
    //   display: mindmapViewType,
    //   defaultMod: true,
    // });
  }

  registerMonkeyAround() {
    const self = this;

    this.register(
      around(WorkspaceLeaf.prototype, {
        // Kanbans can be viewed as markdown or kanban, and we keep track of the mode
        // while the file is open. When the file closes, we no longer need to keep track of it.
        detach(next) {
          return function () {
            const state = this.view?.getState();

            if (state?.file && self.mindmapFileModes[this.id || state.file]) {
              delete self.mindmapFileModes[this.id || state.file];
            }

            return next.apply(this);
          };
        },

        setViewState(next) {

          return function (state: ViewState, ...rest: any[]) {
            // new Notice( state.type);
            if (
              self._loaded &&
              state.type === "markdown" &&
              state.state?.file &&
              // And the current mode of the file is not set to markdown
              self.mindmapFileModes[this.id || state.state.file] !== "markdown"
            ) {
              // Then check for the kanban frontMatterKey
              const cache = self.app.metadataCache.getCache(state.state.file);

              //   new Notice(cache.frontmatter[frontMatterKey]);

              if (cache?.frontmatter && cache.frontmatter[frontMatterKey]) {
                // If we have it, force the view type to kanban
                const newState = {
                  ...state,
                  type: mindmapViewType,
                };

                self.mindmapFileModes[state.state.file] = mindmapViewType;

                return next.apply(this, [newState, ...rest]);
              }
            }

            return next.apply(this, [state, ...rest]);
          };
        },
      })
    );



    // this.register(
    //   around(MarkdownView.prototype, {
    //     onMoreOptionsMenu(next) {
    //       return function (menu: Menu) {
    //         const file = this.file;
    //         const cache = file
    //           ? self.app.metadataCache.getFileCache(file)
    //           : null;

    //         if (
    //           !file ||
    //           !cache?.frontmatter ||
    //           !cache.frontmatter[frontMatterKey]
    //         ) {
    //           return next.call(this, menu);
    //         }



    //         menu
    //           .addItem((item) => {
    //             item
    //               .setTitle(`${t('Open as mindmap board')}`)
    //               .setIcon("document")
    //               .onClick(() => {
    //                 self.mindmapFileModes[this.leaf.id || file.path] =
    //                   mindmapViewType;
    //                 self.setMindMapView(this.leaf);
    //               });
    //           })
    //           .addSeparator();

    //         next.call(this, menu);
    //       };
    //     },
    //   })
    // );


  }


}

