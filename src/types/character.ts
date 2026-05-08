import type { SubstatKey } from '@/types/echo';

export interface SubstatBuild {
  key: SubstatKey;
}

export interface MainstatCategory {
  recommended: string[];
  acceptable: string[];
}

export interface CharacterBuild {
  id: string;
  name: string;
  element: string;
  weapon: string;
  role: string;

  substats: {
    recommended: SubstatBuild[];
    preferred:   SubstatBuild[];
    acceptable?: SubstatBuild[];
  };

  mainstat: {
    cost4: MainstatCategory;
    cost3: MainstatCategory;
    cost1: MainstatCategory;
  };

  harmonySets: {
    recommended: string[];
    acceptable:  string[];
  };
}
