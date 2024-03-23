import {
  HoverParent,
  HoverPopover,
  Menu,
  TextFileView,
  WorkspaceLeaf,
  TFile,
  Notice,
  Platform
} from "obsidian";

import MindMapPlugin from './main'
import { FRONT_MATTER_REGEX } from './constants'
import MindMap from "./mindmap/mindmap";
import { INodeData } from './mindmap/INode'
import { Transformer } from './markmapLib/markmap-lib';
import randomColor from "randomcolor";
import { t } from './lang/helpers'

import domtoimage from './domtoimage.js'
import { GanttChartView } from './dGantte/GanttChartView';
import Gantt from './frappe/index';
import { GanttChartHourlyView } from "./GantteHourly/GanttChartHourlyView";

import moment from 'moment';


export function uuid(): string {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + '-' + S4() + '-' + S4());
}
const transformer = new Transformer();


export const mindmapViewType = "mindmapView";
export const mindmapIcon = "blocks";

export class MindMapView extends TextFileView implements HoverParent {
  plugin: MindMapPlugin;
  hoverPopover: HoverPopover | null;
  id: string = (this.leaf as any).id;
  mindmap: MindMap | null;
  colors: string[] = [];
  timeOut: any = null;
  fileCache: any;
  firstInit: boolean = true;
  gantt: any;
  private savedScrollPosition: { x: number; y: number } | null = null;

  getViewType() {
    return mindmapViewType;
  }
  getIcon() {
    return mindmapIcon;
  }

  getDisplayText() {
    return this.file?.basename || "mindmap";
  }

  setColors() {
    var colors:any[] = []
    try{
      if( this.plugin.settings.strokeArray){
         colors = this.plugin.settings.strokeArray.split(',')
      }
    }catch(err){
       console.log(err,'stroke array is error');
    }

    this.colors = this.colors.concat(colors);

    for (var i = 0; i < 50; i++) {
      this.colors.push(randomColor());
    }
  }

  exportToSvg(){
    if(!this.mindmap){
      return;
    }

   // this.mindmap.contentEL.style.visibility='hidden';
    var nodes:any[] = [];
    this.mindmap.traverseDF((n:any)=>{
       if(n.isShow()){
         nodes.push(n)
       }
    });

 

    var oldScrollLeft = this.mindmap.containerEL.scrollLeft;
    var oldScrollTop = this.mindmap.containerEL.scrollTop;
  
    var box  = this.mindmap.getBoundingRect(nodes);
    var rootBox = this.mindmap.root.getPosition();

    var disX =0,disY=0;
    if(box.x>60){
      disX = box.x - 60;
    }

    if(box.y>60){
       disY = box.y - 60;
    }

    this.mindmap.root.setPosition(rootBox.x-disX,rootBox.y-disY);
    this.mindmap.refresh();

    var w = box.width + 120;
    var h = box.height + 120;

    this.mindmap.contentEL.style.width=w+'px';
    this.mindmap.contentEL.style.height=h+'px';

    setTimeout(()=>{
      domtoimage.toPng(this.mindmap.contentEL).then(dataUrl=>{  
        var img = new Image()
        img.src = dataUrl;
        var str = img.outerHTML;
  
         var p= this.mindmap.path.substr(0,this.mindmap.path.length-2);
        try{
          new Notice(p+'html');
          this.app.vault.adapter.write(p+'html', str);
          this.restoreMindmap(rootBox,oldScrollLeft,oldScrollTop)
        }catch(err){
          this.restoreMindmap(rootBox,oldScrollLeft,oldScrollTop)
          new Notice(err);
        }
        
      }).catch(err=>{
        this.restoreMindmap(rootBox,oldScrollLeft,oldScrollTop)
        new Notice(err);
      })
    },200);

  }

  restoreMindmap(rootBox:any,left:number,top:number){
       if(this.mindmap){
        var size = this.plugin.settings.canvasSize;
         this.mindmap.contentEL.style.width=size+'px';
         this.mindmap.contentEL.style.height=size+'px';
         this.mindmap.containerEL.scrollTop=top;
         this.mindmap.containerEL.scrollLeft=left;
         this.mindmap.root.setPosition(rootBox.x,rootBox.y);
         this.mindmap.refresh();
      //   this.mindmap.contentEL.style.visibility='visible';
       }
  }

  mindMapChange() {
    console.log('mindMapChange')

    if (this.mindmap) {

       // 功能: 在脑图刷新前保存滚动位置
      //const scrollPosition = this.saveScrollPosition();

      var md = this.mindmap.getMarkdown();
      //功能: 刷新数据
      this.mindmap.data = this.mdToData(md);

      var matchArray: string[] = []
      var collapsedIds: string[] = []
      const idRegexMultiline = /.+ \^([a-z0-9\-]+)$/gim
      while ((matchArray = idRegexMultiline.exec(md)) != null) {
        collapsedIds = [...collapsedIds, ...matchArray.slice(1, 2)];
      }
      this.fileCache.frontmatter.collapsedIds='';
      if (collapsedIds.length > 0) {
        this.fileCache.frontmatter.collapsedIds = collapsedIds;
      }
      var frontMatter = this.getFrontMatter();
      this.data = frontMatter + md;
      // console.log(this.mindmap.path);
     // this.app.vault.adapter.write(this.mindmap.path, this.data);
       try{
        this.requestSave();
        //new Notice(`${t("Save success")}`);
       }catch(err){
        console.log(err);
        new Notice(`${t("Save fail")}`)
      }
      console.log('this.mindmapdata',this.mindmap.data)

      // 转换脑图数据为甘特图格式
      //const ganttData = transformAndSyncData(this.mindmap.getMarkdown());

      // 获取甘特图视图实例并更新数据
      
      const ganttView = this.getGanttChartView();
      console.log('mindmap-ganttview',ganttView)
      if (ganttView) {
          ganttView.updateGanttChart();
      }


      // 功能: 获取小时甘特图视图实例并更新数据
      const ganttHourlyView = this.getGanttChartHourlyView();
      console.log('mindmap-getGanttChartHourlyView',ganttHourlyView)
      if (ganttHourlyView) {
        ganttHourlyView.updateGanttChart();
      }

        // 刷新操作完成后，恢复滚动位置
      //this.restoreScrollPosition(scrollPosition);
          
    }
  }

  /**
   * 功能: 在脑图刷新前保存滚动位置
   * 如果没有有效的滚动位置，则返回 null
   */
  saveScrollPosition(): void {
    if (this.mindmap && this.mindmap.containerEL) {
      const x = this.mindmap.containerEL.scrollLeft;
      const y = this.mindmap.containerEL.scrollTop;
  
     // console.log('truexy', { x, y });
  
      // 当x和y都为0时，不更新保存的滚动位置
      if (x === 0 && y === 0) {
        return;
      }
  
      // 更新保存的滚动位置
      this.savedScrollPosition = { x, y };
    }
  }
  
  /**
   * 功能: 在脑图刷新后恢复滚动位置
   * 如果保存的位置为 null，则不执行任何操作
   */
  restoreScrollPosition(): void {
    if (this.savedScrollPosition && this.mindmap && this.mindmap.containerEL) {
      console.log('this.savedScrollPosition', this.savedScrollPosition);
      this.mindmap.containerEL.scrollLeft = this.savedScrollPosition.x;
      this.mindmap.containerEL.scrollTop = this.savedScrollPosition.y;
    }
  }




  // 功能: 获取甘特图视图实例
  // 功能: 获取甘特图视图实例
  getGanttChartView() {
    // 获取所有打开的视图（leaves）
    const leaves = this.app.workspace.getLeavesOfType("gantt-chart-view");
   // console.log('getgantt-chart-view-leaves',leaves)
    
    // 遍历并找到第一个甘特图视图实例
    for (const leaf of leaves) {
        if (leaf.view instanceof GanttChartView) {
            return leaf.view;
        }
    }
    return null;
  }

    // 功能: 获取小时甘特图视图实例
  getGanttChartHourlyView() {
    // 获取所有打开的视图（leaves）
    const leaves = this.app.workspace.getLeavesOfType("gantt-chart-hourly-view");
  //  console.log('getGanttChartHourlyView-leaves',leaves)


    
    
    // 遍历并找到第一个小时甘特图视图实例
    for (const leaf of leaves) {
      if (leaf.view instanceof GanttChartHourlyView) {
        return leaf.view;
      }
    }
    return null;
  }


  // 功能: 在甘特图视图中更新甘特图
  updateGanttChart(data:any) {
    // 使用新数据重新渲染甘特图
    this.gantt = new Gantt('#gantt-svg', data);
  }

  getFrontMatter() {
    var frontMatter = '---\n\n';
    var v: any = '';
    if (this.fileCache.frontmatter) {
      for (var k in this.fileCache.frontmatter) {
        if (k != 'position') {
          if (Object.prototype.toString.call(this.fileCache.frontmatter[k]) == '[object Array]' || Object.prototype.toString.call(this.fileCache.frontmatter[k]) == '[object Object]') {
            v = JSON.stringify(this.fileCache.frontmatter[k]);
          } else if (Object.prototype.toString.call(this.fileCache.frontmatter[k]) == '[object Number]' || Object.prototype.toString.call(this.fileCache.frontmatter[k]) == "[object String]") {
            v = this.fileCache.frontmatter[k];
          }

          if (v) {
            frontMatter += `${k}: ${v}\n`;
          }
        }
      }
    }

    frontMatter += `\n---\n\n`;
    return frontMatter
  }

  constructor(leaf: WorkspaceLeaf, plugin: MindMapPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.setColors();

    this.fileCache = {
      'frontmatter': {
        'mindmap-plugin': 'basic'
      }
    }



  }


  async onClose() {
    // Remove draggables from render, as the DOM has already detached
    //this.plugin.removeView(this);
    if (this.mindmap) {
      this.mindmap.clear();
      this.contentEl.innerHTML = '';
      this.mindmap = null;
    }


  }

  clear() {

  }

  getViewData() {
    return this.data;
  }

  setViewData(data: string) {

    if (this.mindmap) {
      this.mindmap.clear();
      this.contentEl.innerHTML = '';
    }

    this.data = data;

    var mdText = this.getMdText(this.data);
    var mindData = this.mdToData(mdText);
    mindData.isRoot = true;

    const frontmatterContentRegExResult = /^---$(.+?)^---$.+?/mis.exec(data)

    if (frontmatterContentRegExResult != null && frontmatterContentRegExResult[1]) {
      frontmatterContentRegExResult[1].split('\n').forEach((frontmatterLine) => {
        const keyValue = frontmatterLine.split(': ')
        if (keyValue.length === 2) {
          const value = /^[{\[].+[}\]]$/.test(keyValue[1]) ? JSON.parse(keyValue[1]) : keyValue[1]
          this.fileCache.frontmatter[keyValue[0]] = value
        }
      })
    }

    this.mindmap = new MindMap(mindData, this.contentEl, this.plugin.settings);
    this.mindmap.path = this.app.workspace.getActiveFile()?.path || '';
    this.mindmap.colors = this.colors;
    if (this.firstInit) {
      setTimeout(() => {
        var leaf = this.app.workspace.activeLeaf;
        if (leaf) {
          var view = leaf.view as MindMapView;
          this.mindmap.path = view?.file.path;
          if (view.file) {
            this.fileCache = this.app.metadataCache.getFileCache(view.file);
          }
        }
        this.mindmap.init(this.fileCache.frontmatter.collapsedIds);
        this.mindmap.refresh();
        this.mindmap.view = this;
        this.firstInit = false;
      }, 100);
    } else {
      this.mindmap.init(this.fileCache.frontmatter.collapsedIds);
      this.mindmap.refresh();
      this.mindmap.view = this;
    }
  }

  onunload() {
    this.app.workspace.offref("quick-preview");
    this.app.workspace.offref("resize");

    if (this.mindmap) {
      this.mindmap.clear();
      this.contentEl.innerHTML = '';
      this.mindmap = null;
    }

    this.plugin.setMarkdownView(this.leaf);


  }

  onload() {
    super.onload();
    this.registerEvent(
      this.app.workspace.on("quick-preview", () => this.onQuickPreview, this)
    );
    this.registerEvent(
      this.app.workspace.on('resize', () => {
        // 功能: 在更新脑图之前保存滚动位置
        this.saveScrollPosition();
        this.updateMindMap()
                // 功能: 更新脑图后恢复滚动位置
        this.restoreScrollPosition();
      }, this)
    );


  }

  onQuickPreview(file: TFile, data: string) {
    if (file === this.file && data !== this.data) {
      this.setViewData(data);
      this.fileCache = this.app.metadataCache.getFileCache(file);
    }
  }

  updateMindMap() {
    if (this.mindmap) {
      if(Platform.isDesktopApp){
        this.mindmap.center();
      }
    }
  }

  async onFileMetadataChange(file: TFile) {
    var path = file.path;
    let md = await this.app.vault.adapter.read(path);
    this.onQuickPreview(file, md);
  }

  getMdText(str: string) {
    var md = str.trim().replace(FRONT_MATTER_REGEX, '');
    return md.trim();
  }

  mdToData(str: string) {
    function transformData(mapData: any) {
      var flag = true;
      if (mapData.t == 'blockquote') {
        mapData = mapData.c[0];
        flag = false;
        mapData.v = '> ' + mapData.v;
      }
  
      // 解析 ID
      const regexResult = /^.+ \^([a-z0-9\-]+)$/gim.exec(mapData.v);
      const id = regexResult != null ? regexResult[1] : null
  
      // 解析日期
      // 功能: 解析单独一行的日期或以空格分隔的日期部分，提取开始和结束日期
      const dateRegex = /(?:^|\s)(\d{4}-\d{2}-\d{2}(?:-\d{2}:\d{2})?)(?:-(\d{4}-\d{2}-\d{2}(?:-\d{2}:\d{2})?))?(?:\s|$)/;
      const dateMatch = dateRegex.exec(mapData.v);
      const startDate = dateMatch ? dateMatch[1] : null;
      const endDate = dateMatch && dateMatch[2] ? dateMatch[2] : null;
    
      // 解析特殊日期格式
      const specialDateTimeRegex = /(\d{4}-\d{2}-\d{2})-(\d{2}):(\d{2})-(\d+h|\d+m)/;
      const specialDateTimeMatch = specialDateTimeRegex.exec(mapData.v);
      let actionStartDate = null;
      let actionEndDate = null;

      if (specialDateTimeMatch) {
        const datePart = specialDateTimeMatch[1];
        const hourPart = specialDateTimeMatch[2];
        const minutePart = specialDateTimeMatch[3];
        const duration = specialDateTimeMatch[4];

        // 使用 Moment.js 解析开始日期和时间，指定为北京时间
        actionStartDate = moment(`${datePart} ${hourPart}:${minutePart}`, 'YYYY-MM-DD HH:mm').utcOffset('+08:00');

        // 增加时间间隔
        if (duration.endsWith('h')) {
          actionEndDate = moment(actionStartDate).add(parseInt(duration), 'hours');
        } else if (duration.endsWith('m')) {
          actionEndDate = moment(actionStartDate).add(parseInt(duration), 'minutes');
        }

        // 格式化为特定字符串格式
        actionStartDate = actionStartDate.format('YYYY-MM-DD-HH:mm');
        actionEndDate = actionEndDate.format('YYYY-MM-DD-HH:mm');
      }

      

      if (specialDateTimeMatch) {
        console.log('specialDateTimeMatch',actionStartDate,actionEndDate)
      }


      var map: INodeData = {
        id: id || uuid(),
        text: mapData.v,
        startDate: startDate, // 现有开始日期字段
        endDate: endDate, // 现有结束日期字段
        actionStartDate: actionStartDate, // 新增字段
        actionEndDate: actionEndDate, // 新增字段
        children: []
      };

  
      if (flag && mapData.c && mapData.c.length) {
        mapData.c.forEach((data: any) => {
          map.children.push(transformData(data));
        });
      }
  
      return map;
    }
  
    if (str) {
      const { root } = transformer.transform(str);
      const data = transformData(root);
      return data;
  
    } else {
      return {
        id: uuid(),
        text: this.app.workspace.getActiveFile()?.basename || `${t('Untitled mindmap')}`
      }
    }
  }
  
  


  onMoreOptionsMenu(menu: Menu) {
    // Add a menu item to force the board to markdown view
    menu
      .addItem((item) => {
        item
          .setTitle(`${t("Open as markdown")}`)
          .setIcon("document")
          .onClick(() => {
            this.plugin.mindmapFileModes[this.id || this.file.path] = "markdown";
            this.plugin.setMarkdownView(this.leaf);
          });
      });
    // 添加设置日期的菜单项
    menu.addItem((item) => {
          item.setTitle('设置日期')
              .setIcon('calendar')
              .onClick(() => {
                  // 显示日期选择器并处理日期选择
                  this.showDatePicker();
              });
      });

      // 添加打开甘特图的菜单项
    menu.addItem((item) => {
      item.setTitle('打开甘特图')  // 设置菜单项标题
          .setIcon('line-chart')  // 设置图标，此处假设有个类似甘特图的图标
          .onClick(() => {
              // 调用打开甘特图的方法
              this.openGanttChart();
          });
    });
    menu.addItem((item) => {
      item.setTitle('打开小时甘特图')
          .setIcon('line-chart') // 设置图标
          .onClick(() => {
              this.openGanttChartHourlyView();
          });
  });

    // .addItem((item)=>{
    //    item
    //    .setTitle(`${t("Export to opml")}`)
    //    .setIcon('image-file')
    //    .onClick(()=>{
    //       const targetFolder = this.plugin.app.fileManager.getNewFileParent(
    //        this.plugin.app.workspace.getActiveFile()?.path || ""
    //       );
    //       if(targetFolder){
    //         console.log(targetFolder,this.plugin.app.fileManager);

    //       }
    //    })

    // })

    super.onMoreOptionsMenu(menu);
  }

  // 功能: 打开甘特图视图并处理滚动位置
  async openGanttChart() {
    // 在打开甘特图视图前保存当前滚动位置
    this.saveScrollPosition();

    const existingGanttChartView = this.app.workspace.getLeavesOfType('gantt-chart-view')[0];
    if (existingGanttChartView) {
      this.app.workspace.setActiveLeaf(existingGanttChartView);
    } else {
      let activeLeaf = this.app.workspace.activeLeaf;
      if (activeLeaf) {
        const newLeaf = this.app.workspace.createLeafBySplit(activeLeaf, 'horizontal');
        await newLeaf.setViewState({
          type: "gantt-chart-view",
        });
      }
    }

    // 在新视图加载完成后恢复滚动位置
    setTimeout(() => this.restoreScrollPosition(), 100);
  }

  // 功能: 打开小时甘特图视图并处理滚动位置
  async openGanttChartHourlyView() {
    // 在打开小时甘特图视图前保存当前滚动位置
    this.saveScrollPosition();

    const existingView = this.app.workspace.getLeavesOfType('gantt-chart-hourly-view')[0];
    if (existingView) {
      this.app.workspace.setActiveLeaf(existingView);
    } else {
      let activeLeaf = this.app.workspace.activeLeaf;
      if (activeLeaf) {
        const newLeaf = this.app.workspace.createLeafBySplit(activeLeaf, 'horizontal');
        await newLeaf.setViewState({
          type: "gantt-chart-hourly-view",
        });
      }
    }

    // 在新视图加载完成后恢复滚动位置
    setTimeout(() => this.restoreScrollPosition(), 100);
  }

  
  showDatePicker() {
    // 显示日期选择器的逻辑
    // 选择日期后，将日期添加到Markdown文本中
  }

// 获取脑图的根节点
  getRootNode(): INodeData {
    // 你的逻辑实现，返回根节点
    // 例如：
    if (this.mindmap) {
      //@ts-ignore
        return this.mindmap.root ;
    }
    return null;
  }

}