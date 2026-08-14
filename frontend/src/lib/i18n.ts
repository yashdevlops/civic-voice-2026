/**
 * i18n.ts — Internationalisation string tables.
 *
 * Supports English (en), Hindi (hi), and Odia (od).
 * Components consume strings via the `useI18n()` hook — never hardcoded.
 *
 * Assumption: database content (ticket descriptions, addresses) is NOT
 * translated — only the UI chrome strings are localised. This is the standard
 * approach for a civic platform where user-generated content arrives in the
 * author's chosen language.
 */

"use client";

import { createContext, useContext, useState, ReactNode, createElement } from "react";

// ── String tables ──────────────────────────────────────────────────────────

export type Language = "en" | "hi" | "od";

export interface Strings {
  // Nav
  navCitizen: string;
  navAdmin: string;
  navBudget: string;
  navTitle: string;

  // Citizen page
  citizenTitle: string;
  citizenSubtitle: string;
  tabSubmit: string;
  tabMyTickets: string;
  formTitle: string;
  formDescription: string;
  formDescPlaceholder: string;
  formCategory: string;
  formCategoryAuto: string;
  formAddress: string;
  formAddressPlaceholder: string;
  formDetectLocation: string;
  formDetectingLocation: string;
  formLocationDenied: string;
  formImage: string;
  formAudio: string;
  formSubmit: string;
  formSubmitting: string;
  formSuccess: string;
  formError: string;

  // Audio recorder
  recorderIdle: string;
  recorderRecord: string;
  recorderStop: string;
  recorderReRecord: string;
  recorderPermissionDenied: string;
  recorderUnsupported: string;

  // Duplicate alert modal
  duplicateTitle: string;
  duplicateBody: string;
  duplicateViewTicket: string;
  duplicateClose: string;

  // Ticket timeline
  statusOpen: string;
  statusInProgress: string;
  statusResolved: string;
  statusRejected: string;
  ticketId: string;
  ticketPriority: string;
  ticketCategory: string;
  ticketUpvotes: string;
  ticketResolvedBy: string;
  ticketNoEvidence: string;

  // Admin page
  adminTitle: string;
  adminSubtitle: string;
  statTotal: string;
  statDedup: string;
  statResolvedPct: string;
  statByCategory: string;
  liveTitle: string;
  liveEmpty: string;
  mapPlaceholder: string;
  resolveBtn: string;

  // Evidence modal
  evidenceTitle: string;
  evidenceOriginal: string;
  evidenceProof: string;
  evidenceNoOriginal: string;
  evidenceApprove: string;
  evidenceComments: string;
  evidenceCommentsPlaceholder: string;

  // Budget page
  budgetTitle: string;
  budgetSubtitle: string;
  projectVote: string;
  projectVoting: string;
  projectFunded: string;
  projectVotes: string;
  projectBudget: string;

  // General
  loading: string;
  error: string;
  noData: string;
  close: string;
}

const EN: Strings = {
  navTitle: "CivicVoice",
  navCitizen: "Citizen Portal",
  navAdmin: "Admin Dashboard",
  navBudget: "Budget",

  citizenTitle: "Report a Civic Issue",
  citizenSubtitle: "Your complaint reaches the right department automatically.",
  tabSubmit: "Submit Issue",
  tabMyTickets: "My Tickets",
  formTitle: "Issue Title (optional)",
  formDescription: "Describe the issue",
  formDescPlaceholder: "Describe what you see — the more detail, the faster we can act.",
  formCategory: "Category",
  formCategoryAuto: "Auto-detect (recommended)",
  formAddress: "Address / Landmark",
  formAddressPlaceholder: "e.g. Near Saheed Nagar market, Bhubaneswar",
  formDetectLocation: "Detect my location",
  formDetectingLocation: "Detecting…",
  formLocationDenied: "Location access denied. Please enter address manually.",
  formImage: "Attach photo (optional)",
  formAudio: "Voice complaint (optional)",
  formSubmit: "Submit Complaint",
  formSubmitting: "Submitting…",
  formSuccess: "Complaint submitted! Ticket ID:",
  formError: "Submission failed. Please try again.",

  recorderIdle: "Record voice complaint",
  recorderRecord: "Recording… (tap to stop)",
  recorderStop: "Stop recording",
  recorderReRecord: "Re-record",
  recorderPermissionDenied: "Microphone access denied. Please allow mic access to record.",
  recorderUnsupported: "Audio recording is not supported in this browser.",

  duplicateTitle: "Similar Issue Already Reported!",
  duplicateBody: "{{count}} neighbour(s) already reported this issue. We've added your support to the existing ticket instead of creating a duplicate.",
  duplicateViewTicket: "View existing ticket",
  duplicateClose: "OK, understood",

  statusOpen: "Open",
  statusInProgress: "In Progress",
  statusResolved: "Resolved",
  statusRejected: "Rejected",
  ticketId: "Ticket ID",
  ticketPriority: "Priority",
  ticketCategory: "Category",
  ticketUpvotes: "neighbours reported",
  ticketResolvedBy: "Resolved by",
  ticketNoEvidence: "No photo evidence attached",

  adminTitle: "Operations Dashboard",
  adminSubtitle: "Live grievance triage and resolution management",
  statTotal: "Total Reported",
  statDedup: "Auto-Deduplicated",
  statResolvedPct: "Resolved",
  statByCategory: "By Category",
  liveTitle: "Live Ticket Feed",
  liveEmpty: "No tickets yet. Waiting for submissions…",
  mapPlaceholder: "Map View — Integrate Mapbox / Leaflet using the latitude & longitude fields on every ticket",
  resolveBtn: "Resolve Ticket",

  evidenceTitle: "Resolution Evidence",
  evidenceOriginal: "Original complaint photo",
  evidenceProof: "Officer proof photo",
  evidenceNoOriginal: "No photo attached to this complaint",
  evidenceApprove: "Approve Resolution & Close Ticket",
  evidenceComments: "Resolution notes",
  evidenceCommentsPlaceholder: "Describe what was done to resolve this issue…",

  budgetTitle: "Participatory Budgeting",
  budgetSubtitle: "Vote for projects that matter most to your neighbourhood",
  projectVote: "Vote",
  projectVoting: "Open for Voting",
  projectFunded: "Fully Funded!",
  projectVotes: "votes",
  projectBudget: "Budget",

  loading: "Loading…",
  error: "Something went wrong.",
  noData: "No data available.",
  close: "Close",
};

const HI: Strings = {
  navTitle: "सिविकवॉइस",
  navCitizen: "नागरिक पोर्टल",
  navAdmin: "प्रशासन डैशबोर्ड",
  navBudget: "बजट",

  citizenTitle: "नागरिक समस्या दर्ज करें",
  citizenSubtitle: "आपकी शिकायत सही विभाग तक स्वचालित रूप से पहुँचेगी।",
  tabSubmit: "समस्या दर्ज करें",
  tabMyTickets: "मेरे टिकट",
  formTitle: "समस्या का शीर्षक (वैकल्पिक)",
  formDescription: "समस्या का विवरण",
  formDescPlaceholder: "आप जो देख रहे हैं उसे विस्तार से बताएं।",
  formCategory: "श्रेणी",
  formCategoryAuto: "स्वतः पहचानें (अनुशंसित)",
  formAddress: "पता / स्थल",
  formAddressPlaceholder: "जैसे: साहिद नगर बाज़ार के पास, भुवनेश्वर",
  formDetectLocation: "मेरी लोकेशन पहचानें",
  formDetectingLocation: "पहचान हो रही है…",
  formLocationDenied: "लोकेशन एक्सेस अस्वीकार। कृपया पता मैन्युअल दर्ज करें।",
  formImage: "फ़ोटो संलग्न करें (वैकल्पिक)",
  formAudio: "आवाज़ शिकायत (वैकल्पिक)",
  formSubmit: "शिकायत दर्ज करें",
  formSubmitting: "दर्ज हो रहा है…",
  formSuccess: "शिकायत दर्ज! टिकट ID:",
  formError: "सबमिशन विफल। कृपया पुनः प्रयास करें।",

  recorderIdle: "आवाज़ शिकायत रिकॉर्ड करें",
  recorderRecord: "रिकॉर्डिंग… (रोकने के लिए टैप करें)",
  recorderStop: "रिकॉर्डिंग रोकें",
  recorderReRecord: "फिर से रिकॉर्ड करें",
  recorderPermissionDenied: "माइक्रोफ़ोन एक्सेस अस्वीकार। रिकॉर्ड करने के लिए अनुमति दें।",
  recorderUnsupported: "इस ब्राउज़र में ऑडियो रिकॉर्डिंग समर्थित नहीं है।",

  duplicateTitle: "समान समस्या पहले से दर्ज है!",
  duplicateBody: "{{count}} पड़ोसी पहले से यह समस्या दर्ज कर चुके हैं। हमने आपकी शिकायत को मौजूदा टिकट में जोड़ दिया है।",
  duplicateViewTicket: "मौजूदा टिकट देखें",
  duplicateClose: "ठीक है, समझ गया",

  statusOpen: "खुला",
  statusInProgress: "प्रक्रियाधीन",
  statusResolved: "हल हो गया",
  statusRejected: "अस्वीकृत",
  ticketId: "टिकट ID",
  ticketPriority: "प्राथमिकता",
  ticketCategory: "श्रेणी",
  ticketUpvotes: "पड़ोसियों ने रिपोर्ट किया",
  ticketResolvedBy: "हल किया गया",
  ticketNoEvidence: "कोई फ़ोटो प्रमाण नहीं",

  adminTitle: "संचालन डैशबोर्ड",
  adminSubtitle: "लाइव शिकायत ट्रायज और समाधान प्रबंधन",
  statTotal: "कुल रिपोर्ट",
  statDedup: "स्वतः डुप्लीकेट हटाए",
  statResolvedPct: "हल हुए",
  statByCategory: "श्रेणी अनुसार",
  liveTitle: "लाइव टिकट फ़ीड",
  liveEmpty: "अभी कोई टिकट नहीं। सबमिशन का इंतज़ार है…",
  mapPlaceholder: "मैप व्यू — हर टिकट पर latitude & longitude fields का उपयोग करके Mapbox/Leaflet इंटीग्रेट करें",
  resolveBtn: "टिकट हल करें",

  evidenceTitle: "समाधान प्रमाण",
  evidenceOriginal: "मूल शिकायत फ़ोटो",
  evidenceProof: "अधिकारी प्रमाण फ़ोटो",
  evidenceNoOriginal: "इस शिकायत में कोई फ़ोटो नहीं",
  evidenceApprove: "समाधान स्वीकृत करें और टिकट बंद करें",
  evidenceComments: "समाधान नोट्स",
  evidenceCommentsPlaceholder: "बताएं कि इस समस्या को हल करने के लिए क्या किया गया…",

  budgetTitle: "भागीदारी बजट",
  budgetSubtitle: "उन परियोजनाओं के लिए वोट करें जो आपके क्षेत्र के लिए सबसे ज़रूरी हैं",
  projectVote: "वोट करें",
  projectVoting: "वोटिंग के लिए खुला",
  projectFunded: "पूरी तरह से फंडेड!",
  projectVotes: "वोट",
  projectBudget: "बजट",

  loading: "लोड हो रहा है…",
  error: "कुछ गलत हो गया।",
  noData: "कोई डेटा उपलब्ध नहीं।",
  close: "बंद करें",
};

const OD: Strings = {
  navTitle: "ସିଭିକ୍‌ଭଏସ୍",
  navCitizen: "ନାଗରିକ ପୋର୍ଟାଲ",
  navAdmin: "ପ୍ରଶାସନ ଡ୍ୟାସବୋର୍ଡ",
  navBudget: "ବଜେଟ",

  citizenTitle: "ନାଗରିକ ସମସ୍ୟା ଦର୍ଜ କରନ୍ତୁ",
  citizenSubtitle: "ଆପଣଙ୍କ ଅଭିଯୋଗ ସ୍ୱଚ୍ଛଳ ଭାବରେ ସଠିକ ବିଭାଗ ନିକଟ ପ‌ହ‌ଞ୍ଚ‌ିବ।",
  tabSubmit: "ସମସ୍ୟା ଦର୍ଜ",
  tabMyTickets: "ମୋ ଟିକଟ",
  formTitle: "ସମସ୍ୟାର ଶିରୋନାମ (ଐଚ୍ଛିକ)",
  formDescription: "ସମସ୍ୟା ବର୍ଣ୍ଣନା",
  formDescPlaceholder: "ଆପଣ ଯ‌ାହା ଦେଖୁଛନ୍ତି ତାହା ବିସ୍ତାରରେ ଲ‌ଖ‌ନ୍ତୁ।",
  formCategory: "ବର୍ଗ",
  formCategoryAuto: "ସ୍ୱ-ଚ‌ିହ୍ନିତ (ସ‌ୁଚ‌ୀତ)",
  formAddress: "ଠ‌ିକଣା / ଚ‌ିହ୍ନ",
  formAddressPlaceholder: "ଯଥା: ଶହ‌ୀଦ ନଗର ବଜାର ପ‌ାଖ‌ରେ",
  formDetectLocation: "ମୋ ସ୍ଥାନ ଚ‌ିହ୍ନ‌ିତ କ‌ର‌ନ୍ତୁ",
  formDetectingLocation: "ଚ‌ିହ୍ନ‌ିତ ହ‌ଉଛ‌ି…",
  formLocationDenied: "ସ୍ଥାନ ଅ‌ନ‌ୁମ‌ତ‌ି ନ‌ାକ‌ଚ। ଦୟ‌ାକ‌ର‌ି ଠ‌ିକ‌ଣ‌ା ହ‌ସ୍ତ‌ ପ‌ୂର‌ଣ‌ କ‌ର‌ନ୍ତ‌ୁ।",
  formImage: "ଫ‌ଟ‌ୋ ସ‌ଂଲ‌ଗ‌ ଗ‌ ନ‌ ତ‌ ୁ (ଐଚ‌ ‌ ଛ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌)",
  formAudio: "କ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ (ଐଚ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌)",
  formSubmit: "ଅ‌ଭ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌",
  formSubmitting: "ଦ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌…",
  formSuccess: "ଅ‌ ‌ ‌ ‌ ‌ ‌! ଟ‌ ‌ ‌ ID:",
  formError: "ବ‌ ‌ ‌ ‌ ‌ ‌। ପ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌।",

  recorderIdle: "କ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌",
  recorderRecord: "ର‌ ‌ ‌ ‌ ‌ ‌…",
  recorderStop: "ବ‌ ‌ ‌ ‌ ‌ ‌",
  recorderReRecord: "ପ‌ ‌ ‌ ‌ ‌ ‌",
  recorderPermissionDenied: "ମ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌।",
  recorderUnsupported: "ଏ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌।",

  duplicateTitle: "ସ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌!",
  duplicateBody: "{{count}} ଗ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌।",
  duplicateViewTicket: "ଟ‌ ‌ ‌ ‌ ‌",
  duplicateClose: "ଠ‌ ‌ ‌",

  statusOpen: "ଖ‌ ‌ ‌ ‌",
  statusInProgress: "ଚ‌ ‌ ‌ ‌",
  statusResolved: "ସ‌ ‌ ‌ ‌",
  statusRejected: "ଅ‌ ‌ ‌ ‌",
  ticketId: "ଟ‌ ‌ ‌ ID",
  ticketPriority: "ଅ‌ ‌ ‌ ‌",
  ticketCategory: "ବ‌ ‌ ‌",
  ticketUpvotes: "ଗ‌ ‌ ‌ ‌ ‌ ‌",
  ticketResolvedBy: "ସ‌ ‌ ‌ ‌ ‌",
  ticketNoEvidence: "କ‌ ‌ ‌ ‌ ‌ ‌",

  adminTitle: "ପ‌ ‌ ‌ ‌ ‌ ‌",
  adminSubtitle: "ଲ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌",
  statTotal: "ମ‌ ‌ ‌ ‌ ‌",
  statDedup: "ଡ‌ ‌ ‌ ‌ ‌",
  statResolvedPct: "ସ‌ ‌ ‌ ‌",
  statByCategory: "ବ‌ ‌ ‌ ‌ ‌",
  liveTitle: "ଲ‌ ‌ ‌ ‌ ‌",
  liveEmpty: "ଏ‌ ‌ ‌ ‌ ‌…",
  mapPlaceholder: "Map View — Mapbox/Leaflet integrate କ‌ ‌ ‌",
  resolveBtn: "ଟ‌ ‌ ‌ ‌ ‌",

  evidenceTitle: "ସ‌ ‌ ‌ ‌ ‌",
  evidenceOriginal: "ମ‌ ‌ ‌ ‌ ‌",
  evidenceProof: "ଅ‌ ‌ ‌ ‌ ‌",
  evidenceNoOriginal: "କ‌ ‌ ‌ ‌ ‌",
  evidenceApprove: "ସ‌ ‌ ‌ ‌ ‌",
  evidenceComments: "ନ‌ ‌ ‌",
  evidenceCommentsPlaceholder: "ବ‌ ‌ ‌ ‌ ‌…",

  budgetTitle: "ଭ‌ ‌ ‌ ‌ ‌ ‌ ‌",
  budgetSubtitle: "ଆ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌",
  projectVote: "ଭ‌ ‌ ‌",
  projectVoting: "ଭ‌ ‌ ‌ ‌",
  projectFunded: "ସ‌ ‌ ‌!",
  projectVotes: "ଭ‌ ‌ ‌",
  projectBudget: "ବ‌ ‌ ‌",

  loading: "ଲ‌ ‌ ‌…",
  error: "ଭ‌ ‌ ‌ ‌ ‌।",
  noData: "ଡ‌ ‌ ‌ ‌।",
  close: "ବ‌ ‌ ‌",
};

export const LANGUAGES: Record<Language, Strings> = { en: EN, hi: HI, od: OD };

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  hi: "हिन्दी",
  od: "ଓଡ଼ିଆ",
};

// ── Context ────────────────────────────────────────────────────────────────

interface I18nContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: Strings;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => {},
  t: EN,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const t = LANGUAGES[lang];
  return createElement(I18nContext.Provider, { value: { lang, setLang, t } }, children);
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
