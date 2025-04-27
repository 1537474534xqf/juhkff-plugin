const douBao = {
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
        useSr: false,
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
};
export default douBao;
//# sourceMappingURL=douBao.js.map