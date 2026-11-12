// Copyright (c) 2026 Devin Hunt contact@devinhunt.com

import { APPS, LANGUAGES, pageHref, type AppKey } from '@/lib/stanscribe';

/** A run of an answer's words, or a run that is also a link. */
export type AnswerPart = string | { text: string; href: string };

export interface FaqItem {
  question: string;
  answer: AnswerPart[];
}

export const answerText = (answer: AnswerPart[]): string => answer.map((part) => (typeof part === 'string' ? part : part.text)).join('');

const ACCURACY = 'How accurate are the captions?';
const accuracy = (app: AppKey): FaqItem => ({
  question: ACCURACY,
  answer: [
    `The captions come from ${app === 'light' ? 'an open speech model that runs' : 'open speech models that run'} on your iPhone or iPad, credited by name on the `,
    { text: 'Acknowledgements page', href: pageHref(app, 'acknowledgements') },
    `. Captions are automatic, so they can be wrong, especially with background noise, accents, people talking over each other, and names. Please don’t rely on them for emergencies, or for medical, legal or safety decisions. ${APPS[app].name} is not a medical device and doesn’t replace a professional interpreter or captioner.`,
  ],
});

const ASK_FIRST: FaqItem = {
  question: 'Do I need to ask people before I start captions?',
  answer: ['Yes. Tell people the app is on. In some places, everyone in a conversation must agree before it is captured. Set up someone’s voice only with their permission.'],
};

const WHAT_YOU_NEED: FaqItem = {
  question: 'What do I need?',
  answer: ['An iPhone or iPad with iOS 18 or later. You don’t need the internet or an account.'],
};

const scribe = (): FaqItem[] => [
  {
    question: 'What is Stan Scribe?',
    answer: ['Stan Scribe is an app for iPhone and iPad that shows live captions of the conversation around you. Each speaker gets a color and a name, and you can make the words as large as you need. It works without the internet.'],
  },
  {
    question: 'I have trouble following my family’s conversations. Will Stan Scribe help?',
    answer: ['That is what it was built for. Put your iPhone on the table and tap Start. What each person says appears in large text, in their own color, so you can read what you missed and answer. Captions can be wrong when several people talk at once or the room is loud.'],
  },
  {
    question: 'My hearing makes it hard to stay part of a conversation. Is this for me?',
    answer: ['If you can read a screen, it can help you keep up. Stan Scribe does not change what you hear. It puts the words in front of you as people speak, with a name and a color for each speaker, at whatever size you can read comfortably. My grandpa uses it every day at dinner.'],
  },
  {
    question: 'Can I use it at a doctor’s appointment?',
    answer: ['Yes. Ask the doctor first, then put the iPhone where it can hear you both. My grandpa took it to an appointment, and my mom didn’t have to shout and repeat what the doctor said. Captions can be wrong, especially with names, so check anything important, such as a medicine or a dose, with the doctor. Use the captions to follow the conversation, not to make medical decisions.'],
  },
  {
    question: 'I want it for a parent or grandparent. Is it easy to use?',
    answer: ['It was made for that. There is no account to set up. Every button is large and says what it does: Smaller, Larger, Save, Stop. Tap Start and the captions begin.'],
  },
  {
    question: 'Does it need the internet?',
    answer: ['No. The speech models are built into the app, so captions work in airplane mode. The first caption after installing takes a little longer while your iPhone prepares the speech model.'],
  },
  {
    question: 'Does it record audio?',
    answer: ['No. The app turns sound into captions as you listen and never saves the sound. It saves only the words of conversations you keep, on your device.'],
  },
  accuracy('scribe'),
  {
    question: 'Is there a subscription?',
    answer: ['No. Stan Scribe is a one-time purchase, and Stan Scribe Light is free. Neither has in-app purchases, ads or subscriptions.'],
  },
  {
    question: 'What is the difference between Stan Scribe and Stan Scribe Light?',
    answer: ['Both have live captions that work offline, speaker colors and names, 25 languages and big text. Stan Scribe adds the Advanced speech model, 28 color themes including painted ones, and themes from your own photos. Stan Scribe Light has one speech model and a black or a white page, and it is a smaller download.'],
  },
  WHAT_YOU_NEED,
  {
    question: 'Which languages does it caption?',
    answer: [`${LANGUAGES.slice(0, -1).join(', ')} and ${LANGUAGES[LANGUAGES.length - 1]}. Choose one in Settings, or leave it on Auto.`],
  },
  ASK_FIRST,
  {
    question: 'Where are my conversations kept?',
    answer: ['On your device, until you delete them: delete a conversation or a voice in the app, or delete the app to remove everything it kept. If you turn on iCloud backup, a copy of the text goes to your own iCloud. I can’t see it.'],
  },
  {
    question: 'Who makes Stan Scribe?',
    answer: ['I do. I’m Devin Hunt, a water resources engineer in Sacramento. I built it for my grandpa Stan, who is hard of hearing. Stan Scribe is an independent app.'],
  },
];

const light = (): FaqItem[] => [
  {
    question: 'What is Stan Scribe Light?',
    answer: ['Stan Scribe Light is the free, simple edition of Stan Scribe. It shows live captions of the conversation around you on your iPhone or iPad, with a color and a name for each speaker. It works without the internet.'],
  },
  {
    question: 'Is it really free?',
    answer: ['Yes. Stan Scribe Light is free, with no in-app purchases and no ads.'],
  },
  {
    question: 'How is it different from Stan Scribe?',
    answer: ['Light has one speech model and a black or a white page, and it is a smaller download. Stan Scribe adds the Advanced speech model, 28 color themes including painted ones, and themes from your own photos. Both have the same live captions, speaker colors and 25 languages.'],
  },
  {
    question: 'Does it need the internet?',
    answer: ['No. The speech model is built into the app, so captions work in airplane mode.'],
  },
  accuracy('light'),
  ASK_FIRST,
  WHAT_YOU_NEED,
];

/** One page's questions, in the order it shows them. */
export const faq = (app: AppKey): FaqItem[] => (app === 'light' ? light() : scribe());
