import path from "path";
import { PLUGIN_RESOURCES_DIR } from "./javascript/model/path.js";
import { autoReplySchema } from "./javascript/guoba/autoReply/index.js";
import { dailyReportSchema } from "./javascript/guoba/dailyReport/index.js";
import { emojiSaveSchema } from "./javascript/guoba/emojiSave/index.js";
import { douBaoSchema } from "./javascript/guoba/ai/douBao/index.js";
import { sfSchema } from "./javascript/guoba/ai/siliconflow/index.js";
import { helpGenSchema } from "./javascript/guoba/helpGen/index.js";
import { beforeUpdate, afterUpdate } from "./javascript/guoba/handler.js";
import { updateConfig } from "./javascript/config/index.js";
import { config } from "./javascript/config/index.js";
import { transformDataToType } from "./javascript/guoba/handler.js";
// 支持锅巴
export function supportGuoba() {
    return {
        // 插件信息，将会显示在前端页面
        // 如果你的插件没有在插件库里，那么需要填上补充信息
        // 如果存在的话，那么填不填就无所谓了，填了就以你的信息为准
        pluginInfo: {
            // name 为插件唯一标识，尽量不要与其他插件重复
            name: "juhkff-plugin",
            // title 为显示名称
            title: "综合插件 (juhkff-plugin)",
            // 插件描述
            description: "主动回复群聊、表情偷取、日报推送等综合功能插件",
            // 作者可以为字符串也可以为数组，当有多个作者时建议使用数组
            author: ["@扎克芙芙"],
            // 作者主页地址。若author为数组，则authorLink也需要为数组，且需要与author一一对应
            authorLink: ["https://github.com/juhkff"],
            // 仓库地址
            link: "https://github.com/juhkff/juhkff-plugin",
            isV3: true,
            isV2: false,
            // 是否显示在左侧菜单，可选值：auto、true、false
            // 当为 auto 时，如果配置项大于等于 3 个，则显示在左侧菜单
            showInMenu: "auto",
            // 显示图标，此为个性化配置
            // 图标可在 https://icon-sets.iconify.design 这里进行搜索
            icon: "material-symbols:robot-2-rounded",
            // 图标颜色，例：#FF0000 或 rgb(255, 0, 0)
            iconColor: "#288ac3",
            // 如果想要显示成图片，也可以填写图标路径（绝对路径）
            iconPath: path.join(PLUGIN_RESOURCES_DIR, "images/icon.jpg"),
        },
        // 配置项信息
        configInfo: {
            // 配置项 schemas
            // 【组件类型】，可参考
            // https://doc.vvbin.cn/components/introduction.html
            // https://3x.antdv.com/components/overview-cn/
            schemas: [
                ...autoReplySchema(),
                ...dailyReportSchema(),
                ...emojiSaveSchema(),
                ...douBaoSchema(),
                ...sfSchema(),
                ...helpGenSchema(),
            ],
            // 获取配置数据方法（用于前端填充显示数据）
            getConfigData: () => config,

            // 设置配置的方法（前端点确定后调用的方法）
            setConfigData(data, { Result }) {
                const previous = {
                    autoReply: config.autoReply, dailyReport: config.dailyReport, emojiSave: config.emojiSave,
                    douBao: config.douBao, siliconflow: config.siliconflow, helpGen: config.helpGen
                };
                //将 data 变成递归嵌套而非两层嵌套
                data = transformDataToType(data);
                // 更新前校验和处理
                var beforeResult = beforeUpdate(data);
                if (beforeResult.code != 0) return Result.error(beforeResult.code, null, beforeResult.message);
                updateConfig(data);
                // 更新后校验和处理
                var afterResult = afterUpdate(previous);
                if (afterResult.code != 0) return Result.error(afterResult.code, null, afterResult.message);
                return Result.ok({}, "保存成功~");
            },
        },
    };
}

