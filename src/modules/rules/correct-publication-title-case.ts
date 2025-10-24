import { DataLoader } from "../../utils/data-loader";
import { functionWords, isFullUpperCase } from "../../utils/str";
import { defineRule } from "./rule-base";

export const CorrectPublicationTitleCase = defineRule({
  id: "correct-publication-title-case",
  scope: "field",

  targetItemTypes: ["journalArticle"],
  targetItemField: "publicationTitle",
  fieldMenu: {
    l10nID: "rule-correct-publication-title-case-menu-field",
  },
  async apply({ item, debug }) {
    const publicationTitle = item.getField("publicationTitle", false, true) as string;

    // If this publicationTitle matches key of build-in data, do not change it
    const data = await DataLoader.load("journalAbbr");
    if (data[publicationTitle]) {
      debug(`Skip capitalize for ${publicationTitle}, it's a standard name in build-in data`);
      return;
    }

    // Else, try to capitalize it
    const newPublicationTitle = capitalizePublicationTitle(publicationTitle);
    if (newPublicationTitle !== publicationTitle) {
      debug(`Capitalize ${publicationTitle} -> ${newPublicationTitle}`);
      item.setField("publicationTitle", newPublicationTitle);
    }
  },
});

const SpecialWords = [
  "AAPG",
  "AAPPS",
  "AAPS",
  "AATCC",
  "ABB",
  "ACA",
  "ACH",
  "ACI",
  "ACM",
  "ACS",
  "AEU",
  "AGSO",
  "AGU",
  "AI",
  "EDAM",
  "AIAA",
  "AICCM",
  "AIMS",
  "AIP",
  "AJOB",
  "AKCE",
  "ANZIAM",
  "APCBEE",
  "APL",
  "APPEA",
  "AQEIC",
  "AQUA",
  "ASAIO",
  "ASCE",
  "OPEN",
  "ASHRAE",
  "ASME",
  "ASN",
  "NEURO",
  "ASSAY",
  "ASTM",
  "ASTRA",
  "AVS",
  "AWWA",
  "DDR",
  "PDE",
  "GIS",
  "ICRP",
  "DLG",
  "PNA",
  "XNA",
  "BBA",
  "BHM",
  "BIT",
  "BMC",
  "BME",
  "BMJ",
  "BMR",
  "BSGF",
  "BT",
  "NMR",
  "AAS",
  "CAAI",
  "CABI",
  "CCF",
  "CCS",
  "CEAS",
  "CES",
  "CEUR",
  "CIM",
  "CIRED",
  "CIRP",
  "CLEAN",
  "CMES",
  "CNL",
  "CNS",
  "COSPAR",
  "CPP",
  "CPSS",
  "CRISPR",
  "CSEE",
  "EEG",
  "DARU",
  "DFI",
  "DIGITAL",
  "HEALTH",
  "DNA",
  "ECS",
  "EES",
  "EFSA",
  "EJNMMI",
  "EMBO",
  "EMS",
  "EPE",
  "EPJ",
  "EPPO",
  "ESA",
  "ESAIM",
  "ESMO",
  "ETRI",
  "EURASIP",
  "EURO",
  "SP",
  "FASEB",
  "FEBS",
  "FEMS",
  "ICT",
  "OA",
  "GAMS",
  "GCB",
  "GEM",
  "GIT",
  "GM",
  "GPS",
  "IGF",
  "HAYATI",
  "HKIE",
  "HRC",
  "HTM",
  "CHP",
  "IAEA",
  "IAHS",
  "IATSS",
  "IAWA",
  "IB",
  "IBM",
  "IBRO",
  "ICES",
  "ICI",
  "ICIS",
  "IDA",
  "IEE",
  "IEEE",
  "RF",
  "RFIC",
  "RFID",
  "IEEJ",
  "IEICE",
  "IERI",
  "IES",
  "IET",
  "IETE",
  "IFAC",
  "IIE",
  "IISE",
  "IJU",
  "IMA",
  "IMPACT",
  "IOP",
  "IPPTA",
  "IRE",
  "ISA",
  "ISCB",
  "ISH",
  "ISIJ",
  "ISME",
  "ISPRS",
  "ISSS",
  "IST",
  "IT",
  "ITE",
  "IUBMB",
  "DATA",
  "COMADEM",
  "PIXE",
  "STEM",
  "JACS",
  "JAMA",
  "JASA",
  "JAWRA",
  "JBI",
  "JBIC",
  "JBMR",
  "JCEM",
  "JCIS",
  "JCO",
  "JDR",
  "JETP",
  "JFE",
  "JMIR",
  "JMM",
  "JMST",
  "JOM",
  "JOT",
  "JPC",
  "TLC",
  "JSME",
  "II",
  "III",
  "IV",
  "AOAC",
  "MMIJ",
  "MEMS",
  "MOEMS",
  "THEOCHEM",
  "TCAD",
  "VLSI",
  "ICRU",
  "UK",
  "KI",
  "KN",
  "KSCE",
  "KSII",
  "LC",
  "GC",
  "LHB",
  "LWT",
  "IGPL",
  "MBM",
  "MPT",
  "MRS",
  "JIM",
  "NACTA",
  "NAR",
  "NATO",
  "ASI",
  "NCSLI",
  "NDT",
  "NEC",
  "NEJM",
  "NFS",
  "NIR",
  "NJAS",
  "NPG",
  "NRIAG",
  "NTM",
  "LIFE",
  "RNA",
  "OENO",
  "OPEC",
  "OR",
  "OSA",
  "PCI",
  "PDA",
  "PGA",
  "PLOS",
  "PMC",
  "PMSE",
  "PPAR",
  "PRX",
  "IUTAM",
  "SPIE",
  "VLDB",
  "QRB",
  "QSAR",
  "RAD",
  "RAIRO",
  "RAP",
  "RAPRA",
  "RAS",
  "REACH",
  "RIAI",
  "RIC",
  "ROBOMECH",
  "RPS",
  "RSC",
  "AG",
  "SAE",
  "NVH",
  "SAIEE",
  "SAMPE",
  "SAR",
  "SEG",
  "SIAM",
  "SICE",
  "SICS",
  "SID",
  "SLAS",
  "SLEEP",
  "SMPTE",
  "SN",
  "SPE",
  "STAR",
  "SUT",
  "SMNS",
  "CT",
  "MRI",
  "RRL",
  "IAOS",
  "NOW",
  "TRAC",
  "TWMS",
  "MBAA",
  "FAMENA",
  "ASABE",
  "AIME",
  "IMF",
  "SAEST",
  "UCL",
  "URSI",
  "WAIMM",
  "WIT",
  "SA",
  "ZDM",
  "ZKG",
  "npj",
];

export function capitalizePublicationTitle(publicationTitle: string) {
  const isFullStringUpperCase = isFullUpperCase(publicationTitle);

  return publicationTitle.split(/(\s+)/).map((word, index) => {
    // Keep spaces
    if (/^\s$/.test(word))
      return word;

    const upperCaseVariant = word.toUpperCase();
    const lowerCaseVariant = word.toLowerCase();
    const capitalizeVariant = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

    // Functions words: use lowercase
    if (functionWords.includes(lowerCaseVariant)) {
      // but if it's the first word, use capitalize variant
      if (index === 0)
        return capitalizeVariant;
      return lowerCaseVariant;
    }

    // Special words: build-in words use its own case
    // e.g. publisher name like "ACS", "IEEE", "npj"
    for (const specialWord of SpecialWords) {
      if (lowerCaseVariant === specialWord.toLowerCase()) {
        return specialWord;
      }
    }

    // If all words are uppercase, use capitalize variant
    if (isFullStringUpperCase) {
      return capitalizeVariant;
    }

    // Special words: if this word is uppercase, keep case
    if (word === upperCaseVariant) {
      return word;
    }

    // Special words: capital letters appear in the middle of words
    // e.g. iScience
    if (word !== upperCaseVariant && word !== lowerCaseVariant && word !== capitalizeVariant) {
      return word;
    }

    // Otherwise, use capitalize variant
    return capitalizeVariant;
  }).join("");
}
