type ColorOptions = {
    titleColor: string;
    labelColor: string;
    copyrightColor: string;
    groupColor: string;
    groupTitleColor: string;
    groupDescColor: string;
    helpNameColor: string;
    helpTitleColor: string;
    helpDescColor: string;
}

type HelpType = "active" | "passive" | "group" | "sub";

type MaunalList = {
    name?: string;
    type: HelpType;
    command?: string;
    dsc?: string;
    enable?: boolean,
    belongTo?: string;
    subMenu?: any;
}

export type HelpGen = {
    useHelpGen: boolean;
    command: string;
    titleZh: string;
    titleEn: string;
    hd: boolean;
    colorOptions: ColorOptions;
    manualList: MaunalList[];
}

const helpGen: HelpGen = {
    useHelpGen: true,
    command: "帮助",
    titleZh: "",
    titleEn: "",
    hd: false,
    colorOptions: {
        titleColor: "rgba(255, 255, 255, 1)",
        labelColor: "rgba(255, 255, 255, 1)",
        copyrightColor: "rgba(255, 255, 255, 1)",
        groupColor: "rgba(206, 183, 139, 1)",
        groupTitleColor: "rgba(240, 197, 43, 1)",
        groupDescColor: "rgba(243, 182, 109, 1)",
        helpNameColor: "rgba(111, 186, 243, 0.946)",
        helpTitleColor: "rgba(240, 197, 43, 1)",
        helpDescColor: "rgba(255, 255, 255, 1)"
    },
    manualList: []
}

export default helpGen;