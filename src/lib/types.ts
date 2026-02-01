export interface Translation {
  sidebar: {
    title: string;
    subtitle: string;
    languageSettings: string;
    searchSources: string;
    aiInsights: string;
    oldTestament: string;
    newTestament: string;
    commentary: string;
    recentSearches: string;
    deleteHistory: string;
    aboutProject: string;
    english: string;
    polish: string;
    loading: string;
    library: string;
    media: string;
  };
  main: {
    discover: string;
    subtitle: string;
    buyCredits: string;
    account: string;
    logout: string;
    creditsOnlyFor: string;
    searchPlaceholder: string;
    searchButton: string;
    failedToFetch: string;
    aiInsight: string;
    noResults: string;
    loginRequired: string;
    bibleResults: string;
    commentaryResults: string;
    commentary: string;
    scriptureMatches: string;
    loginSignUp: string;
    whatWouldYouLikeToExplore: string;
    searchDescription: string;
    exampleQueries: string[];
    readyToSearch: string;
    inputLimitReached: string;
    feedback: string;
  };
  account: {
    loadingAccountData: string;
    myAccount: string;
    backToHome: string;
    emailAddress: string;
    availableCredits: string;
    changePassword: string;
    oldPassword: string;
    newPassword: string;
    updatePassword: string;
    updating: string;
    passwordUpdateSuccess: string;
    passwordUpdateFailed: string;
    transactionHistory: string;
    date: string;
    amount: string;
    credits: string;
    status: string;
    completed: string;
    canceled: string;
    noTransactions: string;
  };
  about: {
    title: string;
    subtitle: string;
    missionTitle: string;
    missionText: string;
    stats: {
        years: string;
        yearsDesc: string;
        qa: string;
        qaDesc: string;
        accuracy: string;
        accuracyDesc: string;
    };
    toolsTitle: string;
    toolsText: string;
    charityText: string;
    accessibilityTitle: string;
    accessibilityText: string;
  };
  contact: {
    title: string;
    subtitle: string;
    feedbackTitle: string;
    feedbackText: string;
    emailSupport: string;
    emailDesc: string;
    socialCommunity: string;
    socialDesc: string;
    office: string;
    faqTitle: string;
    faq: {
       free: { question: string; answer: string; };
       versions: { question: string; answer: string; };
    };
  };
  privacy: {
    title: string;
    subtitle: string;
    introTitle: string;
    introText: string;
    dataCollectTitle: string;
    dataCollectText: string;
    dataUseTitle: string;
    dataUseList: string[];
    securityTitle: string;
    securityText: string;
    contactTitle: string;
    contactText: string;
  };
  history: {
    title: string;
    noHistory: string;
    delete: string;
  };
  apiErrors: {
    userIdRequired: string;
    userNotFound: string;
    insufficientCredits: string;
    internalError: string;
    networkError: string;
    unauthorized: string;
    failedToVote: string;
  };
  credits: {
    title: string;
    back: string;
    usd: string;
    eur: string;
    pln: string;
    paymentSuccessful: string;
    paymentCanceled: string;
    aiRequestCredits: string;
    processing: string;
    buyNow: string;
    loginRequired: string;
    paymentFailed: string;
    creditsWord: string;
  };
  footer: {
    about: string;
    contact: string;
    privacy: string;
    rights: string;
  };
  cookies: {
    text: string;
    accept: string;
    privacyPolicy: string;
  };
}

export interface User {
  username?: string;
  email?: string;
  id?: string;
  [key: string]: any; // Allow other properties for flexibility but enforce basic structure
}
