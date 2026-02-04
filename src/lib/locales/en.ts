import { Translation } from '../types';

export const en: Translation = {
  sidebar: {
    title: 'Bible Assistant',
    subtitle: 'Advanced Study Tool',
    languageSettings: 'Language Settings',
    searchSources: 'Search Sources',
    aiInsights: 'AI Insights',
    oldTestament: 'Old Testament',
    newTestament: 'New Testament',
    commentary: 'Commentary',
    recentSearches: 'Recent Searches',
    deleteHistory: 'Delete',
    aboutProject: 'About Project',
    english: 'English',
    polish: 'Polski',
    loading: 'Loading...',
    library: 'Library',
    media: 'Related Media',
    noArticles: 'No articles found in this category.'
  },
  main: {
    discover: 'Discover',
    subtitle: 'Explore scripture with AI-powered insights',
    buyCredits: 'Buy Credits',
    account: 'Account',
    logout: 'Logout',
    creditsOnlyFor: 'Credits are only used for AI-generated insights',
    searchPlaceholder: 'What is love?',
    searchButton: 'Search',
    failedToFetch: 'Failed to fetch',
    aiInsight: 'AI Insight',
    noResults: 'No results found',
    loginRequired: 'Login required',
    bibleResults: 'Bible Results',
    commentaryResults: 'Commentary Results',
    commentary: 'Commentary from Fathers of the Church',
    scriptureMatches: 'Scripture Matches',
    loginSignUp: 'Login / Sign Up',
    whatWouldYouLikeToExplore: 'What would you like to explore?',
    searchDescription: 'Search across multiple translations, commentaries, and get AI-driven insights instantly.',
    exampleQueries: [
      "Sermon on the Mount",
      "Psalms for Anxiety", 
      "Patience of Job",
      "Fruit of the Spirit",
      "Raising Children"
    ],
    readyToSearch: 'Ready to search across scripture and commentary',
    inputLimitReached: 'Character limit reached',
    feedback: 'Was this helpful?'
  },
  account: {
    loadingAccountData: 'Loading account data...',
    myAccount: 'My Account',
    backToHome: '← Back to Home',
    emailAddress: 'Email Address',
    availableCredits: 'Available Credits',
    changePassword: 'Change Password',
    oldPassword: 'Old Password',
    newPassword: 'New Password',
    updatePassword: 'Update Password',
    updating: 'Updating...',
    passwordUpdateSuccess: 'Password updated successfully!',
    passwordUpdateFailed: 'Failed to update password',
    transactionHistory: 'Transaction History',
    date: 'Date',
    amount: 'Amount',
    credits: 'Credits',
    status: 'Status',
    completed: 'Completed',
    canceled: 'Canceled',
    noTransactions: 'No transactions found'
  },
  about: {
    title: 'About Bible Assistant',
    subtitle: 'History & Mission of Bible AI',
    missionTitle: 'Bible-Centric Services',
    missionText: 'Our goal is to make Scripture accessible and understandable for everyone. We provide tools that help you engage deeply with the Bible, supporting your spiritual growth with modern technology.',
    stats: {
        years: '2026',
        yearsDesc: 'Launched',
        qa: 'AI',
        qaDesc: 'Smart Insights',
        accuracy: 'Top',
        accuracyDesc: 'Relevance'
    },
    toolsTitle: 'Scripture-Focused Design',
    toolsText: 'We prioritize the biblical text above all else. Our interface is designed for distraction-free reading and study, with AI features that support rather than replace personal reflection.',
    charityText: 'We are dedicated to building trustworthy digital resources that favor Bible literacy and theological understanding.',
    accessibilityTitle: 'Accessible to All',
    accessibilityText: 'We believe technology should remove barriers. Our platform is built to be inclusive, supporting various accessibility standards to ensure everyone can use our tools effectively.'
  },
  contact: {
    title: 'Contact Us',
    subtitle: 'We are here to help and listen.',
    feedbackTitle: 'Your Feedback Matters',
    feedbackText: 'We represent a community of learners. If you have suggestions, feature requests, or encounter any issues, please let us know. Your input helps us improve.',
    emailSupport: 'Support',
    emailDesc: 'We aim to reply within one business day.',
    socialCommunity: 'Community',
    socialDesc: 'Join the conversation online.',
    office: 'Headquarters',
    faqTitle: 'FAQ',
    faq: {
       free: { question: 'Is it free?', answer: 'The core experience is free for all users.' },
       versions: { question: 'Available Translations?', answer: 'Access a wide range of standard Bible translations.' }
    }
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Protecting your data and privacy.',
    introTitle: '1. Introduction',
    introText: 'We respect your privacy and are committed to protecting your personal data. This policy informs you how we look after your data.',
    dataCollectTitle: '2. Data We Collect',
    dataCollectText: 'We may collect Identity Data (name), Contact Data (email), and Usage Data (how you use our tools).',
    dataUseTitle: '3. How We Use Data',
    dataUseList: [
        'To Provide the Service',
        'To Improve Our Service',
        'To Communicate with You'
    ],
    securityTitle: '4. Data Security',
    securityText: 'We have put in place appropriate security measures to prevent your personal data from being accidentally lost or used in an unauthorized way.',
    contactTitle: '5. Contact Us',
    contactText: 'If you have questions about this policy, please contact us.'
  },
  history: {
    title: 'Search History',
    noHistory: 'No search history yet',
    delete: 'Delete'
  },
  apiErrors: {
    userIdRequired: 'User ID is required',
    userNotFound: 'User not found',
    insufficientCredits: 'Insufficient credits',
    internalError: 'Internal server error',
    networkError: 'Network response was not ok',
    unauthorized: 'Unauthorized access',
    failedToVote: 'Failed to vote',
    rateLimitExceeded: 'Server overloaded, try again tomorrow',
    mediaLimitExceeded: 'Daily media search limit exceeded'
  },
  credits: {
    title: 'Purchase Credits',
    back: '← Back',
    usd: 'USD ($)',
    eur: 'EUR (€)',
    pln: 'PLN (zł)',
    paymentSuccessful: 'Payment successful! Credits have been added to your account.',
    paymentCanceled: 'Payment canceled.',
    aiRequestCredits: 'AI Request Credits',
    processing: 'Processing...',
    buyNow: 'Buy Now',
    loginRequired: 'Please log in first',
    paymentFailed: 'Payment failed',
    creditsWord: 'Credits'
  },
  footer: {
    about: 'About',
    contact: 'Contact',
    privacy: 'Privacy Policy',
    rights: 'All rights reserved.'
  },
  cookies: {
    text: 'This website uses cookies to enhance your experience and secure authentication.',
    accept: 'Got it',
    privacyPolicy: 'Privacy Policy'
  }
};
