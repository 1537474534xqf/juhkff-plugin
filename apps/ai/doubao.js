export class doubao extends plugin {
    constructor() {
        super({
            name: "豆包",
            dsc: "豆包",
            event: "message",
            priority: 9998,
            rule: [
                {
                    reg: "^#豆包$",
                    fnc: "help",
                },
                {
                    // 匹配以 #视频生成豆包 开头的消息
                    reg: "^#视频生成豆包.*",
                    fnc: "videoGenerate",
                }
            ],
        });
        // apiKey 设置
        this.apiKey = "";
        // 视频生成设置
        this.videoGenerateUrl = "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks";
        this.videoGenerateBody = {
            model: "doubao-seaweed-241128",
            content: []
        }
        // 请求体，使用时从此复制
        this.request = {
            method: "",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer "
            },
            body: {}
        }
    }

    async help(e) {
        var helpMsg =
            `可用指令：[]中为可选项\n` +
            `  #视频生成豆包 文本描述 [宽高比] [5|10](视频秒数)\n` +
            `  #视频生成豆包 图片`
        await e.reply(helpMsg);
    }

    async videoGenerate(e) {
        var message = e.message.replace("#视频生成豆包", "").trim();
        message = message.split(" ");
        if (message.length < 1) {
            await e.reply("请添加描述文本或图片");
            return false;
        }
        var describe = message[0];
        var aspectRatio = null;
        var videoSeconds = null;
        if (message.length > 1)
            aspectRatio = message[1];
        if (message.length > 2)
            videoSeconds = message[2];
        var request = JSON.parse(JSON.stringify(this.request));
        request.method = "POST";
        request.headers.Authorization += this.apiKey;
        request.body = JSON.stringify(request.body);
        var response = await fetch(this.videoGenerateUrl, request);
        response = await response.json();
        var id = response.id;
        // 创建线程
        this.createTaskThread(id);
    }

    createTaskThread(id) {
        var getUrl = this.videoGenerateUrl + "/" + id;
        var request = JSON.parse(JSON.stringify(this.request));
        request.method = "GET";
        request.headers.Authorization += this.apiKey;
        var taskThread = setInterval(async () => {
            var response = await fetch(getUrl, request);
            response = await response.json();
            if (response.status == "completed") {
                clearInterval(taskThread);
                // 处理完成
                this.handleCompleted(response);
            } else if (response.status == "failed") {
                clearInterval(taskThread);
                // 处理失败
                this.handleFailed(response);
            }
        }, 5000);
    }
}