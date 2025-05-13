import path from "path";
import fs from "fs";
import { config } from "../config/index.js";
import { PLUGIN_DATA_DIR } from "../model/path.js";
import { Objects } from "../utils/kits.js";
import { siliconflow } from "../apps/ai/siliconflow.js";
export async function transformTextToVoice(e, responseText) {
    if (config.siliconflow.useSF && config.siliconflow.chatTransVoiceResponse) {
        // 使用sf语音生成
        if (Math.random() < config.siliconflow.chatTransVoiceRate) {
            if (Objects.isNull(config.siliconflow.sfApiKey))
                return null;
            if (Objects.isNull(config.siliconflow.voiceGenerateModel))
                return null;
            const request = siliconflow.generateVoiceRequest(responseText);
            const response = await fetch(request.url, request.options);
            // 将response保存为mp3
            const arrayBuffer = await response.arrayBuffer();
            const outputPath = path.join(PLUGIN_DATA_DIR, `${e.group_id}` || `${e.user_id}`, `audio`, `${Date.now()}-siliconflow.mp3`);
            // 确保目录存在
            const dir = path.dirname(outputPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            // 写入文件
            fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
            return outputPath;
        }
    }
}
//# sourceMappingURL=siliconflow.js.map