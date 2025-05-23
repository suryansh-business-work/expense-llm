export const chatSettings = {
  modelSetting: {
    model: 'gpt-3.5-turbo',
    modelName: 'gpt-3.5-turbo',
    modelType: 'chat',
    modelDescription: 'GPT-3.5 Turbo is a variant of the GPT-3 model that is optimized for chat-based applications.',
    modelVersion: {
      version: 'v1',
      description: 'The latest version of the GPT-3.5 Turbo model.',
      date: '2023-10-01',
      releaseNotes: {
        url: 'https://platform.openai.com/docs/guides/gpt/release-notes',
        description: 'Release notes for the latest version of the GPT-3.5 Turbo model.',
        label: 'Release Notes',
        labelDescription: 'Label for the link to the release notes for the latest version of the GPT-3.5 Turbo model.',
        labelDate: '2023-10-01',
      },
    },
    maxTokens: 1000,
    fileUpload: {
      maxSize: 10,
      unit: 'MB',
      valueInBytes: 1024 * 1024 * 10,
    },
  },
  appearance: {
    font: '',
    chatBackground: '',
    bot: {
      bubble: {
        background: '',
        textColor: '',
        borderRadius: '10px',
        borderWidth: '1px',
        borderColor: '',
        shadow: {
          value: '0 4px 8px rgba(0, 0, 0, 0.1)',
          color: '',
          opacity: '0.1',
          spread: '0px',
          offsetX: '0px',
          offsetY: '0px',
          blur: '0px',
          blurColor: '',
          blurOpacity: '0.1',
          blurSpread: '0px',
          blurOffsetX: '0px',
          blurOffsetY: '0px',
          blurRadius: '0px',
          blurRadiusColor: '',
          blurRadiusOpacity: '0.1',
          blurRadiusSpread: '0px',
          blurRadiusOffsetX: '0px',
          blurRadiusOffsetY: '0px',
        },
      },
      avatar: {
        url: '',
        shape: 'circle',
        size: '50px',
      },
    },
    user: {
      bubble: {
        background: '',
        textColor: '',
        borderRadius: '10px',
        borderWidth: '1px',
        borderColor: '',
        shadow: {
          value: '0 4px 8px rgba(0, 0, 0, 0.1)',
          color: '',
          opacity: '0.1',
          spread: '0px',
          offsetX: '0px',
          offsetY: '0px',
          blur: '0px',
          blurColor: '',
          blurOpacity: '0.1',
          blurSpread: '0px',
          blurOffsetX: '0px',
          blurOffsetY: '0px',
          blurRadius: '0px',
          blurRadiusColor: '',
          blurRadiusOpacity: '0.1',
          blurRadiusSpread: '0px',
          blurRadiusOffsetX: '0px',
          blurRadiusOffsetY: '0px',
        },
      },
      avatar: {
        url: '',
        shape: 'circle',
        size: '50px',
      },
    },
  },
  advanced: {
    autoScroll: true,
    showTypingIndicator: true,
    showTimestamps: true,
    showAvatars: true,
    showMessagePreview: true,
    showMessageActions: true,
    showMessageReactions: true,
    showMessageEditHistory: true,
    showMessagePinning: true,
    showMessageTranslation: true,
    showMessageSearch: true,
    showMessageExport: true,
    showMessagePrinting: true,
    showMessageSharing: true,
    showMessageNotifications: true,
    showMessageMentions: true,
    showMessageReplies: true,
    showMessageThreads: true,
    threadsView: {
      collapsed: true,
      expanded: false,
      expandedCollapsed: false,
      expandedCollapsedExpanded: false,
      expandedCollapsedExpandedCollapsed: false,
      expandedCollapsedExpandedCollapsedExpanded: false,
      expandedCollapsedExpandedCollapsedExpandedCollapsed: false,
      expandedCollapsedExpandedCollapsedExpandedCollapsedExpanded: false,
      expandedCollapsedExpandedCollapsedExpandedCollapsedExpandedCollapsed: false,
    },
  },
  report: {
    format: 'text',
    schedule: 'daily',
    time: '09:00',
    timeZone: 'UTC',
    email: '',
    emailSubject: 'Chatbot Report',
  },
  notification: {
    type: 'email',
    email: '',
    emailSubject: 'Chatbot Notification',
    emailBody: {
      text: 'You have a new message from the chatbot.',
      html: '<p>You have a new message from the chatbot.</p>',
      textPlain: 'You have a new message from the chatbot.',
      textHtml: '<p>You have a new message from the chatbot.</p>',
    },
  },
  share: {
    userEmails: [],
  },
};
