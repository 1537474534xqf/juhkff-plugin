type VideoGenerate = {
    apiKey: string;
    url: string;
    model: string;
}

type ImageService = {
    host: string;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    service: string;
    action: string;
    version: string;
}

type WithImgControlnetArgs = {
    type: string;
    strength: number;
}

type ImageGenerate = {
    host: string;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    service: string;
    action: string;
    version: string;
    reqKey: string;
    modelVersion: string;
    reqScheduleConf: string;
    usePreLlm: boolean;
    useSrc: boolean;
    returnUrl: boolean;
    withImgReqKey: boolean;
    withImgModelVersion: "";
    withImgUseRephraser: boolean;
    withImgReturnUrl: boolean;
    withImgControlnetArgs: WithImgControlnetArgs;
}

type ImageImitate = {
    reqKey: string;
    useSr: boolean;
    returnUrl: boolean;
}

type ImageStyle = {
    reqKeyMap: Record<string, string>[];
    subReqKeyMap: Record<string, string>[];
    returnUrl: boolean;
}

export type DouBao = {
    useDouBao: boolean;
    useVideoGenerate: boolean;
    videoGenerate: VideoGenerate;
    imageService: ImageService;
    useImageGenerate: boolean;
    imageGenerate: ImageGenerate;
    useImageImitate: boolean;
    imageImitate: ImageImitate;
    useImageStyle: boolean;
    imageStyle: ImageStyle;
}

const douBao: DouBao = {
    useDouBao: false,
    useVideoGenerate: false,
    videoGenerate: {
        apiKey: "",
        url: "",
        model: ""
    },
    imageService: {
        host: "",
        accessKeyId: "",
        secretAccessKey: "",
        region: "",
        service: "",
        action: "",
        version: ""
    },
    useImageGenerate: false,
    imageGenerate: {
        host: "",
        accessKeyId: "",
        secretAccessKey: "",
        region: "",
        service: "",
        action: "",
        version: "",
        reqKey: "",
        modelVersion: "",
        reqScheduleConf: "",
        usePreLlm: false,
        useSrc: false,
        returnUrl: false,
        withImgReqKey: false,
        withImgModelVersion: "",
        withImgUseRephraser: false,
        withImgReturnUrl: false,
        withImgControlnetArgs: {
            type: "",
            strength: 0
        }
    },
    useImageImitate: false,
    imageImitate: {
        reqKey: "",
        useSr: false,
        returnUrl: false
    },
    useImageStyle: false,
    imageStyle: {
        reqKeyMap: [],
        subReqKeyMap: [],
        returnUrl: false
    }
}

export default douBao;