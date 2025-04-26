import { CronExpression } from "../../type";

type GroupChatRate = {
    groupList: number[];
    chatRate: number;
    replyAtBot: boolean;
}

export type AutoReply = {
    useAutoReply: boolean;
    attachUrlAnalysis: boolean;
    useContext: boolean;
    maxHistoryLength: number;
    chatApi: string;
    chatApiKey: string
    chatModel: string
    apiCustomUrl: string
    defaultChatRate: number
    defaultReplyAtBot: boolean
    groupChatRate: GroupChatRate[];
    useVisual: boolean;
    visualReplaceChat: boolean;
    visualApi: string;
    visualApiKey: string;
    visualModel: string;
    visualApiCustomUrl: string;
    // textToPaintPrompt: string;
    chatPrompt: string;
    oldPrompt: string[];
    useEmotion: boolean;
    emotionGenerateTime: CronExpression;
    emotionGeneratePrompt: string;
}

const autoReply: AutoReply = {
    useAutoReply: false,
    attachUrlAnalysis: false,
    useContext: false,
    maxHistoryLength: 5,
    chatApi: "",
    chatApiKey: "",
    chatModel: "",
    apiCustomUrl: "",
    defaultChatRate: 0.1,
    defaultReplyAtBot: true,
    groupChatRate: [],
    useVisual: false,
    visualReplaceChat: false,
    visualApi: "",
    visualApiKey: "",
    visualModel: "",
    visualApiCustomUrl: "",
    // textToPaintPrompt:  "",
    chatPrompt: "",
    oldPrompt: [],
    useEmotion: false,
    emotionGenerateTime: "0 0 4 * * ?",
    emotionGeneratePrompt: ""
};

export default autoReply;
