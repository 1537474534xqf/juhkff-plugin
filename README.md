<div align="center">

# JUHKFF-PLUGIN

<img src="./resources/images/icon.jpg" width = 200px height = 200px/>
<br>
<img src="https://img.shields.io/badge/Gihub-综合插件-skyblue?style=flat-square&logo=github"/>
<img src ="https://img.shields.io/github/license/juhkff/juhkff-plugin"/>
<img src ="https://img.shields.io/github/languages/top/juhkff/juhkff-plugin?logo=github"/>

<img src ="https://img.shields.io/badge/v3-null?label=TRSS-Yunzai"/>
<img src="https://img.shields.io/badge/v11-null?label=OneBot">

<img src="https://count.getloli.com/@juhkff-plugin?juhkff-plugin&theme=random&padding=7&offset=0&align=top&scale=1&pixelated=0&darkmode=auto" />
</div>

<img decoding="async" align=right width="35%">

一个适用于 [TRSS-Yunzai 框架](https://github.com/TimeRainStarSky/Yunzai) 和 [OneBot-v11 标准](https://onebot.dev) 的 **自用** 综合群机器人插件

> [!WARNING]
> 由于为自用插件，所以其它协议适配性未知，喵崽框架适配性未知（没运行过）

## 安装插件

#### 1. 克隆仓库

```
git clone https://github.com/juhkff/juhkff-plugin.git ./plugins/juhkff-plugin
```

#### 2. 安装依赖

```
pnpm install --filter=juhkff-plugin
```

## ApiKey 相关

- SiliconFlow 官网申请 ApiKey: https://cloud.siliconflow.cn/account/ak
- DeepSeek 官网申请 ApiKey: https://platform.deepseek.com/

## 插件配置

> [!WARNING]
> 不建议手动修改配置文件，本插件已兼容 [Guoba-plugin](https://github.com/guoba-yunzai/guoba-plugin) ，请使用锅巴插件对配置项进行修改 <br>
> 若手动修改配置文件，需首先在启动一次插件，然后可在 `juhkff-plugin/config/default` 目录下的文件内找到配置项说明，据此修改 `juhkff-plugin/config` 目录下的相应文件

## 功能列表

- [x] 主动群聊：支持 DeepSeek API 以及 SiliconFlow 视觉 API
  - [x] 支持上下文
  - [x] 视觉模型开启时，会对图片提取关键内容加入上下文
  - [x] 可以提取分享的 URL 内容并加入上下文
  - [x] 一定程度上支持对分享链接的解析并加入上下文
  - 聊天模型目前只支持 deepseek-chat 和 deepseek-reasoner
  - 视觉模型目前只支持 SiliconFlow 的 Qwen/Qwen2-VL-72B-Instruct
- [x] 生成和推送日报
  - [x] 借鉴 [真寻日报](https://github.com/HibiKier/nonebot-plugin-zxreport) 的样式和代码生成日报
- [x] 表情偷取
  - [x] 借鉴 [鸢尾花插件](https://github.com/logier/logier-plugins) 的思路改进实现
- [ ] TODO...

## 支持与贡献

如果你喜欢这个项目，请不妨点个 Star🌟，这是对开发者最大的动力。

**自用插件，不保证问题追踪和改进**

## 许可证

本项目使用 [GNU GPLv3](https://choosealicense.com/licenses/gpl-3.0/) 作为开源许可证。
