// Registro central das regras. Este é o ÚNICO ponto que precisa ser tocado
// para adicionar ou remover uma regra do motor — princípio aberto/fechado
// do SOLID: o motor está fechado para modificação e aberto para extensão.

import { thresholdRules } from './threshold.rules.js';
import { trendRules } from './trend.rules.js';
import { rankingRules } from './ranking.rules.js';

export const growthRules = [...thresholdRules, ...trendRules, ...rankingRules];
