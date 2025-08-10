import { config, updateConfig } from "../config/index.js";
import { Objects } from "../utils/kits.js";
import { randomInt } from "crypto";
export const help = () => {
    return {
        name: "骰子",
        type: "active",
        command: "#1d6格式\n#dice [类型名称]\n#dice -add",
        dsc: "投掷默认骰子、投掷特定骰子、添加骰子类型",
        enable: config.dice.useDice,
    };
};
export class dice extends plugin {
    constructor() {
        super({
            name: "[扎克芙芙]骰子",
            dsc: "随机掷骰",
            event: "message",
            priority: 5000, //优先级，越小越先执行
            rule: [
                {
                    reg: "^#(\\d+)d(\\d+)$", //通用掷骰命令
                    fnc: "commonDice",
                    log: false,
                },
                {
                    reg: "^#dice -add$",
                    fnc: "diceAdd",
                    log: false
                },
                {
                    reg: "^#dice", //预置掷骰命令
                    fnc: "dice",
                    log: false
                }
            ],
        });
    }
    async commonDice(e) {
        const rawMessage = e.message?.[0]?.text?.trim(); // 获取用户输入的原始文本
        if (!rawMessage)
            return false;
        const match = rawMessage.match(/^#(\d+)d(\d+)/i); // 使用正则提取参数
        if (!match)
            return false;
        const count = parseInt(match[1], 10); // 骰子数量
        const sides = parseInt(match[2], 10); // 骰子面数
        if (isNaN(count) || isNaN(sides) || count <= 0 || sides <= 0) {
            await e.reply("骰子参数错误，请使用 #数量d面数 的格式，例如 #2d6");
            return true;
        }
        // 开始掷骰子
        const results = [];
        let total = 0;
        for (let i = 0; i < count; i++) {
            const result = Math.floor(Math.random() * sides) + 1;
            results.push(result);
            total += result;
        }
        const replyMsg = `🎲 掷得结果：[${results.join(", ")}]，总和：${total}`;
        await e.reply(replyMsg);
        return true;
    }
    async dice(e) {
        if (!config.dice.useDice)
            return false;
        const rawMessage = e.message?.[0]?.text?.trim();
        const args = rawMessage.split(/\s+/);
        if (args.length < 2 && Objects.isNull(config.dice.default)) {
            await e.reply("由于未设置默认骰子类型，请输入 `#dice [骰子类型]`");
            return true;
        }
        const name = args[1] || config.dice.default;
        if (config.dice.presets.find(preset => preset.name === name) === undefined && config.dice.packs.find(pack => pack.name === name) === undefined) {
            await e.reply(`未找到 ${name} 骰子类型`);
            return true;
        }
        // 找到
        const preset = config.dice.presets.find(preset => preset.name === name);
        if (preset) {
            // 基本骰子
            const result = preset.faces[randomInt(preset.faces.length)];
            await e.reply(`🎲 ${preset.name} —> ${result}`);
            return true;
        }
        const pack = config.dice.packs.find(pack => pack.name === name);
        if (pack) {
            // 组合骰子
            const results = [];
            const presets = [];
            // roll
            for (let index = 0; index < pack.bundle.length; index++) {
                const { name, count } = pack.bundle[index];
                const resultBatch = [];
                const preset = config.dice.presets.find(preset => preset.name === name);
                if (!preset) {
                    await e.reply(`未找到 ${name} 骰子`);
                }
                presets.push(preset);
                for (let i = 0; i < count; i++) {
                    const result = preset.faces[randomInt(preset.faces.length)];
                    resultBatch.push(result);
                }
                results.push({ name: name, results: resultBatch });
            }
            // 拼结果
            const replyText = [];
            const replyNumber = [];
            let totalSum = 0;
            let total = 0;
            for (let i = 0; i < results.length; i++) {
                const bundle = pack.bundle[i];
                const preset = presets[i];
                const result = results[i];
                if (preset.isNumber) {
                    // 挑出数字类型
                    const numericResults = result.results.filter(f => !isNaN(Number(f))).map(f => Number(f));
                    // 剩余的 String 类型
                    const strResults = result.results.filter(f => isNaN(Number(f)));
                    const sum = numericResults.reduce((a, b) => a + b, 0);
                    totalSum += sum;
                    const rangeMax = Math.max(...preset.faces.filter(f => !isNaN(Number(f))).map(f => Number(f)), 0);
                    total += rangeMax * bundle.count;
                    let curResult = numericResults.join("+");
                    if (!Objects.isNull(strResults)) {
                        if (curResult.length > 0)
                            curResult += "，" + strResults.join("，");
                        else
                            curResult += strResults.join("，");
                    }
                    if (config.dice.briefMode) {
                        replyNumber.push(`${result.name}：(${curResult})/(${rangeMax}×${bundle.count})`);
                    }
                    else {
                        replyNumber.push(`(${curResult})/(${rangeMax}×${bundle.count})`);
                    }
                    replyText.push(`🎲\t${bundle.count} × ${result.name}\t —> ${result.results.join(" + ")} = ${sum}`);
                }
                else {
                    if (config.dice.briefMode) {
                        replyNumber.push(`${preset.name}：${result.results.join("，")}`);
                    }
                    else {
                        replyText.push(`\t${bundle.count} × ${result.name}\t —> ${result.results.join("，")}`);
                    }
                }
            }
            if (Objects.isNull(replyText))
                return true;
            if (config.dice.briefMode) {
                if (total != 0)
                    replyNumber.push(`Total: ${totalSum}/${total}`);
                await e.reply(replyNumber.join(" | "));
                return true;
            }
            if (!Objects.isNull(replyNumber)) {
                replyText.push(`Total：${replyNumber.join(" + ")} = ${totalSum}/${total}`);
            }
            await e.reply(replyText.join("\n"));
            return true;
        }
        await e.reply(`未找到 ${name} 骰子类型`);
        return true;
    }
    async diceAdd(e) {
        const REQ_TIMEOUT = 60;
        const msgEmptyCheck = async (e) => {
            if (Objects.isNull(e.message?.[0]?.text)) {
                await e.reply("输入不可为空");
                return false;
            }
            return true;
        };
        const ctxCheck = async (e, ue) => {
            this.finish("resolveContext", true);
            if (typeof ue === "boolean" && ue === false) {
                await e.reply("添加骰子超时");
                return false;
            }
            if (ue.msg === '#结束') {
                await e.reply("已结束添加骰子");
                return false;
            }
            return true;
        };
        // const userName = e.member?.card || e.member?.nickname || e.sender.nickname;
        if (!config.dice.useDice)
            return false;
        let ue;
        let isPack;
        await e.reply("添加基础骰子还是组合骰子？请输入 0（基础骰子）或 1（组合骰子）");
        while (true) {
            ue = await this.awaitContext(false, REQ_TIMEOUT);
            if (!await ctxCheck(e, ue) || !await msgEmptyCheck(ue))
                return true;
            isPack = ue.message?.[0]?.text?.trim();
            if (!["0", "1"].includes(isPack))
                await e.reply(`请输入·0·或·1·`);
            else
                break;
        }
        if (isPack === "1")
            isPack = true;
        else
            isPack = false;
        let name;
        await e.reply(`请输入骰子名称（可输入\`#结束\`中止添加）`);
        while (true) {
            ue = await this.awaitContext(false, REQ_TIMEOUT);
            if (!await ctxCheck(e, ue) || !await msgEmptyCheck(ue))
                return true;
            name = ue.message?.[0]?.text?.trim();
            if ([...config.dice.presets, ...config.dice.packs].find(each => each.name === name))
                await e.reply(`已存在同名骰子组合，请重新输入`);
            else
                break;
        }
        if (isPack) {
            const bundle = [];
            while (true) {
                await e.reply(`请输入使用到的基础骰子（输入\`继续\`结束该环节并进入下一步），可用基础骰子：${config.dice.presets.map(each => each.name).join("，")}`);
                ue = await this.awaitContext(false, REQ_TIMEOUT);
                if (!await ctxCheck(e, ue) || !await msgEmptyCheck(ue))
                    return true;
                const presetName = ue.msg.trim();
                if (presetName === "继续")
                    break;
                if (!config.dice.presets.find(each => each.name === presetName)) {
                    await e.reply(`请输入正确的基础骰子名称`);
                    continue;
                }
                await e.reply(`请输入该骰子使用的数量`);
                let num;
                while (true) {
                    ue = await this.awaitContext(false, REQ_TIMEOUT);
                    if (!await ctxCheck(e, ue) || !await msgEmptyCheck(ue))
                        return true;
                    num = ue.msg.trim();
                    if (isNaN(Number(num)) || Number(num) < 1) {
                        await e.reply(`请输入有效的数字`);
                        continue;
                    }
                    num = Number(num);
                    break;
                }
                bundle.push({ name: presetName, count: num });
            }
            if (Objects.isNull(bundle)) {
                await e.reply(`未作修改，结束`);
                return true;
            }
            config.dice.packs.push({ name: name, bundle: bundle });
            updateConfig(config);
            await e.reply(`${name} 骰子已添加`);
            return true;
        }
        else {
            let isNum;
            await e.reply(`骰子是否为数字类型骰？请输入·是·或·否·`);
            while (true) {
                ue = await this.awaitContext(false, REQ_TIMEOUT);
                if (!await ctxCheck(e, ue) || !await msgEmptyCheck(ue))
                    return true;
                isNum = ue.message?.[0]?.text?.trim();
                if (!["是", "否"].includes(isNum))
                    await e.reply(`请输入·是·或·否·`);
                else
                    break;
            }
            if (isNum === "是")
                isNum = true;
            else
                isNum = false;
            await e.reply("请输入各面值，形式为：`值1,值2,值3`（英文逗号），需严格遵循格式，不可带多余空格");
            let faces;
            while (true) {
                ue = await this.awaitContext(false, REQ_TIMEOUT);
                if (!await ctxCheck(e, ue) || !await msgEmptyCheck(ue))
                    return true;
                faces = ue.message?.[0]?.text?.trim();
                if (faces.includes('，') || faces.includes(" ")) {
                    await e.reply("你的输入含有中文逗号或空格，若非误输入，请再输入一遍各面值；若为误输入，请重新输入正确格式");
                    while (faces.includes('，') || faces.includes(" ")) {
                        ue = await this.awaitContext(false, REQ_TIMEOUT);
                        if (!await ctxCheck(e, ue) || !await msgEmptyCheck(ue))
                            return true;
                        const again = ue.message?.[0]?.text?.trim();
                        if (faces === again)
                            break;
                        faces = again;
                    }
                }
                break;
            }
            config.dice.presets.push({
                name: name,
                isNumber: isNum,
                faces: faces.split(",")
            });
            updateConfig(config);
            await e.reply(`${name} 骰子已添加`);
            return true;
        }
    }
}
//# sourceMappingURL=dice.js.map