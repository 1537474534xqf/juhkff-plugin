import { config } from "../config/index.js";
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
            const arrayBuffer = await response.arrayBuffer();
            const base64String = Buffer.from(arrayBuffer).toString("base64");
            return base64String;
        }
    }
}
