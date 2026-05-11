/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Stage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type EssayType = 'opinion' | 'discussion' | 'problem-solution' | 'advantages-disadvantages' | 'two-part';

export interface MCQOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
  extension?: string;
}

export interface AnalysisMCQ {
  essayType: MCQOption[];
  requirements: MCQOption[];
}

export interface GuidedQuestion {
  question: string;
  options: MCQOption[];
}

export interface IdeaSelection {
  id: string;
  core: string;
  development: GuidedQuestion[];
  framework?: {
    mainIdea: string;
    why: string;
    impact: string;
    example: string;
  };
}

export interface BodyStepData {
  role: string;
  topicSentenceGuidance: {
     vietnamese: string;
     vocab: { vi: string; en: string }[];
     structures: GrammarStructure[];
     sample: string;
  };
  potentialIdeas: IdeaSelection[];
}

export interface GrammarStructure {
  skeleton: string;
  sample: string;
  explanation: string;
}

export interface GuidedMaterial {
  vietnamese: string;
  vocab: { vi: string; en: string }[];
  structures: GrammarStructure[];
}

export interface StepSelections {
  prompt: string;
  essayType: EssayType | null;
  taskAnalysis: {
    typeId: string | null;
    requirementsId: string | null;
  };
  approach: string | null;
  paragraphs: {
    intro: string;
    body1: string;
    body2: string;
    conclusion: string;
  };
  body1Data: {
    selectedIdeaIds: string[];
    developments: Record<string, string[]>; // ideaId -> selectedOptionTexts
  };
  body2Data: {
    selectedIdeaIds: string[];
    developments: Record<string, string[]>;
  };
}

export interface Feedback {
  score: string;
  criteria: {
    tr: { score: string; comment: string };
    cc: { score: string; comment: string };
    lr: { score: string; comment: string };
    gra: { score: string; comment: string };
  };
  sample: string;
  highValuePhrases: { phrase: string; meaning: string }[];
}

export interface Correction {
  original: string;
  fixed: string;
  explanation: string;
  criterion: 'TR' | 'CC' | 'LR' | 'GRA' | 'SE';
}
