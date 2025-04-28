type GroupRate = {
    groupList: number[];
    replyRate: number;
    emojiRate: number;
}

export type EmojiSave = {
    useEmojiSave: boolean;
    groupRate: GroupRate[];
    defaultReplyRate: number;
    defaultEmojiRate: number;
    expireTimeInSeconds: number;
}

export const emojiSave: EmojiSave = {
    useEmojiSave: false,
    groupRate: [],
    defaultReplyRate: 0.1,
    defaultEmojiRate: 0.1,
    expireTimeInSeconds: 3600 * 24 * 3,
}
