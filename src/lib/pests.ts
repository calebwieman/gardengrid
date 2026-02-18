// Common garden pests and organic remedies

export interface Pest {
  id: string;
  name: string;
  emoji: string;
  affectedPlants: string[];
  symptoms: string[];
  organicRemedies: string[];
  prevention: string[];
}

export const commonPests: Pest[] = [
  {
    id: 'aphids',
    name: 'Aphids',
    emoji: '🐛',
    affectedPlants: ['tomato', 'pepper', 'lettuce', 'kale', 'cucumber', 'beans', 'rose', 'marigold'],
    symptoms: ['Curled or distorted leaves', 'Sticky honeydew on leaves', 'Black sooty mold', 'Stunted growth'],
    organicRemedies: [
      'Spray with strong water jet to knock off',
      'Apply neem oil spray',
      'Use insecticidal soap',
      'Introduce ladybugs (natural predator)',
      'Plant companion plants like marigolds and nasturtiums',
    ],
    prevention: [
      'Encourage beneficial insects',
      'Avoid over-fertilizing with nitrogen',
      'Use row covers early in season',
      'Interplant with repellent herbs',
    ],
  },
  {
    id: 'tomato-hornworm',
    name: 'Tomato Hornworm',
    emoji: '🟢',
    affectedPlants: ['tomato', 'pepper', 'eggplant', 'potato'],
    symptoms: ['Large irregular holes in leaves', 'Missing leaves entirely', 'Dark green droppings on leaves', 'Defoliated stems'],
    organicRemedies: [
      'Hand-pick and destroy (drop in soapy water)',
      'Apply Bacillus thuringiensis (Bt)',
      'Encourage parasitic wasps (let some hornworms survive)',
      'Till soil after harvest to destroy pupae',
    ],
    prevention: [
      'Rotate crops annually',
      'Till soil in spring to expose pupae',
      'Plant dill or basil nearby as trap crops',
    ],
  },
  {
    id: 'slugs',
    name: 'Slugs & Snails',
    emoji: '🐌',
    affectedPlants: ['lettuce', 'spinach', 'kale', 'cabbage', 'strawberry', 'beans', 'cucumber'],
    symptoms: ['Irregular holes in leaves', 'Silvery slime trails', 'Damage to seedlings', 'Hollowed-out fruits'],
    organicRemedies: [
      'Hand-pick at night with flashlight',
      'Set beer traps (shallow dishes of beer)',
      'Use diatomaceous earth around plants',
      'Apply iron phosphate baits',
      'Encourage natural predators (birds, frogs, hedgehogs)',
    ],
    prevention: [
      'Water in morning so soil dries by evening',
      'Remove hiding spots (debris, boards)',
      'Create copper barriers around beds',
      'Use raised beds with smooth edges',
    ],
  },
  {
    id: 'whiteflies',
    name: 'Whiteflies',
    emoji: '🦟',
    affectedPlants: ['tomato', 'pepper', 'cucumber', 'eggplant', 'squash', 'beans'],
    symptoms: ['Tiny white flying insects under leaves', 'Yellowing leaves', 'Sticky honeydew', 'Sooty mold'],
    organicRemedies: [
      'Use yellow sticky traps',
      'Spray with neem oil',
      'Apply insecticidal soap',
      'Introduce Encarsia formosa parasitic wasps',
    ],
    prevention: [
      'Use reflective mulch',
      'Avoid planting near infested areas',
      'Inspect new plants before adding to garden',
    ],
  },
  {
    id: 'carrot-fly',
    name: 'Carrot Fly',
    emoji: '🪰',
    affectedPlants: ['carrot', 'parsley', 'celery', 'parsnip'],
    symptoms: ['Reddish-brown tunnels in roots', 'Stunted growth', 'Yellowing leaves', 'Maggots in roots'],
    organicRemedies: [
      'Remove and destroy affected plants',
      'Apply parasitic nematodes to soil',
      'Companion plant with onions (confuses fly)',
    ],
    prevention: [
      'Use carrot fly-resistant varieties',
      'Sow thinly to avoid thinning (attracts flies)',
      'Use fine mesh row covers',
      'Companion plant with alliums',
    ],
  },
  {
    id: 'cabbage-worm',
    name: 'Cabbage Worm',
    emoji: '🦋',
    affectedPlants: ['cabbage', 'broccoli', 'cauliflower', 'kale', 'brussels-sprouts'],
    symptoms: ['Large holes in leaves', 'Green caterpillars on leaves', 'Dark green frass (droppings)', 'Damaged heads'],
    organicRemedies: [
      'Hand-pick caterpillars',
      'Apply Bacillus thuringiensis (Bt)',
      'Use row covers to prevent butterflies',
      'Spray with neem oil',
    ],
    prevention: [
      'Use row covers throughout season',
      'Plant companion herbs (thyme, dill)',
      'Encourage parasitic wasps',
    ],
  },
  {
    id: 'spider-mites',
    name: 'Spider Mites',
    emoji: '🕷️',
    affectedPlants: ['tomato', 'pepper', 'eggplant', 'cucumber', 'beans', 'strawberry'],
    symptoms: ['Tiny yellow or white spots on leaves', 'Fine webbing on plants', 'Bronzed leaves', 'Dry, crispy foliage'],
    organicRemedies: [
      'Spray with strong water jet',
      'Apply neem oil',
      'Use insecticidal soap',
      'Increase humidity around plants',
    ],
    prevention: [
      'Keep plants well-watered (stressed plants attract mites)',
      'Avoid dusty conditions',
      'Inspect plants regularly',
      'Encourage predatory mites',
    ],
  },
  {
    id: 'squash-bug',
    name: 'Squash Bug',
    emoji: '🪳',
    affectedPlants: ['zucchini', 'squash', 'pumpkin', 'cucumber', 'melon'],
    symptoms: ['Yellow to brown spots on leaves', 'Wilting plants', 'Egg clusters under leaves', 'Damaged fruit'],
    organicRemedies: [
      'Hand-pick adults and nymphs',
      'Scrape egg masses from leaves',
      'Apply neem oil spray',
      'Use trap crops (leave cull squash for them)',
    ],
    prevention: [
      'Use row covers until flowering',
      'Rotate crops',
      'Clean up debris in fall',
      'Plant resistant varieties',
    ],
  },
  {
    id: 'cucumber-beetle',
    name: 'Cucumber Beetle',
    emoji: '🐞',
    affectedPlants: ['cucumber', 'zucchini', 'squash', 'pumpkin', 'melon', 'corn'],
    symptoms: ['Holes in leaves', 'Scarring on stems and fruit', 'Wilting plants (bacterial wilt)', 'Stunted growth'],
    organicRemedies: [
      'Hand-pick beetles in early morning',
      'Apply neem oil',
      'Use kaolin clay as barrier',
      'Set out trap crops',
    ],
    prevention: [
      'Use row covers until flowering',
      'Companion plant with radishes',
      'Choose resistant varieties',
      'Delay planting until beetle peak passes',
    ],
  },
  {
    id: 'flea-beetle',
    name: 'Flea Beetle',
    emoji: '🔵',
    affectedPlants: ['tomato', 'pepper', 'eggplant', 'potato', 'beans', 'lettuce', 'kale'],
    symptoms: ['Many tiny holes in leaves (shot-hole effect)', 'Stunted seedlings', 'Skeletonized leaves', 'Damage to young plants'],
    organicRemedies: [
      'Dust with diatomaceous earth',
      'Apply neem oil spray',
      'Use row covers',
      'Interplant with trap crops (radish, mustard)',
    ],
    prevention: [
      'Use row covers on seedlings',
      'Delay transplanting until larger',
      'Keep garden weed-free',
      'Add beneficial nematodes to soil',
    ],
  },
];

export function getPestsForPlants(plantIds: string[]): Pest[] {
  const affectedIds = new Set(plantIds);
  return commonPests.filter(pest => 
    pest.affectedPlants.some(plant => affectedIds.has(plant))
  );
}

export function getPestById(id: string): Pest | undefined {
  return commonPests.find(p => p.id === id);
}
