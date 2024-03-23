import moment from 'moment';
export namespace DataViewModule {
    export async function getTargetListItems(app:any): Promise<any[]> {
        if (!app.plugins.enabledPlugins.has('dataview')) {
            console.error('Dataview plugin is not enabled.');
            return [];
        }

        const dataview = app.plugins.plugins.dataview.api;
        let targetListItems: any[] = [];
        // 匹配有时间和无时间的日期格式
        const dateTimeRegex = /(\d{4}-\d{2}-\d{2}(?:-\d{2}:\d{2})?)-(\d{4}-\d{2}-\d{2}(?:-\d{2}:\d{2})?)/;

        try {
            const pages = dataview.pages();
            for (let page of pages) {
                if (!page.file || !page.file.lists) continue;
                const lists = page.file.lists;
                const filteredLists = lists.filter((list: any) => {
                    const dateTimeMatch = dateTimeRegex.exec(list.text);
                    if (dateTimeMatch) {
                        const startDateTimeStr = dateTimeMatch[1];
                        const endDateTimeStr = dateTimeMatch[2];
                        const format = startDateTimeStr.includes(':') ? "YYYY-MM-DD-HH:mm" : "YYYY-MM-DD";
                        const startDateTime = moment(startDateTimeStr, format);
                        const endDateTime = moment(endDateTimeStr, format);
                        // 检查时间差是否在24小时内
                        const duration = moment.duration(endDateTime.diff(startDateTime));
                        return list.text.includes("#目标") && duration.asHours() <= 24;
                    }
                    return false;
                }).map((list: any) => {
                    // 提取文件名，去掉扩展名
                    const filename = list.path.split('/').pop().split('.').shift();
                    return {
                        ...list,
                        filename: filename
                    };
                });
                targetListItems.push(...filteredLists);
            }
        } catch (e) {
            console.error('Error accessing Dataview API:', e);
        }

        return targetListItems;
    }

    export function addDateInfoToListItems(listItems: any[]): any[] {
        const dateRegex = /(?:^|\s)(\d{4}-\d{2}-\d{2}(?:-\d{2}:\d{2})?)-(\d{4}-\d{2}-\d{2}(?:-\d{2}:\d{2})?)(?:\s|$)/;
    
        return listItems.map(item => {
            const dateMatch = dateRegex.exec(item.text);
            const name=item.text
            const start = dateMatch ? dateMatch[1] : null;
            const end = dateMatch && dateMatch[2] ? dateMatch[2] : start; // 如果没有结束日期，使用开始日期
            return { ...item, start, end ,name};
        });
    }

    export async function filterTasksForTargetDays(tasks: any[]): Promise<any[]> {
        return tasks.filter((task: any) => {
            if (task.start && task.end) {
                const format = task.start.includes(':') ? "YYYY-MM-DD-HH:mm" : "YYYY-MM-DD";
                const startDateTime = moment(task.start, format);

                // 检查开始日期是否是昨天、今天或明天
                const isTargetDay = startDateTime.isSame(moment(), 'day') || 
                                startDateTime.isSame(moment().subtract(1, 'day'), 'day') || 
                                startDateTime.isSame(moment().add(1, 'day'), 'day');

                return isTargetDay;
            }
            return false;
        });
    }

    // 功能: 处理任务，确保日期包含具体的时间
    export  function ensureFullDateTimeForTasks(tasks: any[]): any[] {
        return tasks.map((task: any) => {
            if (task.start && task.end) {
                // 检查是否含有具体时间，如果没有，则添加时间
                task.start = task.start.length === 10 ? `${task.start}-00:00` : task.start;
                task.end = task.end.length === 10 ? `${task.end}-24:00` : task.end;
            }
            return task;
        });
    }
}
/*!SECTION
getTargetListItems 函数文档
功能描述：
该函数用于从 Obsidian 插件 Dataview API 获取满足特定条件的列表项。它筛选出带有 "#目标" 标签且时间跨度在24小时内的列表项。

参数：
无

返回值：

返回 Promise<any[]>，即一个异步 Promise，包含筛选后的列表项数组。
如果 Dataview 插件未启用，返回空数组。
实现细节：

检查 Dataview 插件是否启用，未启用则返回空数组。
使用正则表达式匹配带时间和不带时间的日期格式。
遍历所有页面，对每个页面的列表进行筛选，选择符合条件的列表项。
对每个筛选出的列表项提取文件名，并组成新对象返回。
filterTasksForTargetDays 函数文档
功能描述：
该函数用于筛选给定任务数组中，起始日期为昨天、今天或明天的任务。

参数：

tasks: 任意类型数组，每个元素包含 start 和 end 属性，表示任务的开始和结束日期。
返回值：

返回 Promise<any[]>，即一个异步 Promise，包含过滤后的任务数组。
如果任务的起始日期不是昨天、今天或明天，则不包含在返回数组中。
实现细节：

函数接受一个任务数组，每个任务都有一个起始和结束日期。
检查每个任务的起始日期是否为昨天、今天或明天。
如果是，则保留该任务在返回的数组中。
注意：

该函数假定日期格式为 "YYYY-MM-DD" 或 "YYYY-MM-DD-HH:mm"，并根据是否包含时间来确定使用哪种格式解析日期。
*/