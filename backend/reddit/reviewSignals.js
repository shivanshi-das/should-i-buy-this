
export const reviewSignals = [
  // opinion/recomendation 
  'i love', 'i hate', 'i like', 'i regret', 'i use', 'i tried', 'i own', 'i have',
  'my favorite', 'holy grail', 'not for me', 'i wouldn’t repurchase', 'i’d repurchase',
  'worth trying', 'not worth it', 'must have', 'game changer',
  'would recommend', 'would not recommend', 'highly recommend', "is the best", "is the worst",

  // performance 
  'lasts all day', 'didn’t last', 'fade fast', 'wore off quickly', 'wear time is',
  'held up well', 'patchy', 'blends well', 'hard to blend', 'easy to blend', 'dries quickly',
  'flaked off', 'clumped', 'smudged', 'stayed put', 'wore off', 'melted off',
  'lengthens', 'adds volume', 'holds a curl', 'natural look', 'dramatic look',

  // formula/texture/usability
  'cream-to-powder', 'too dry', 'too wet', 'dries out', 'dried out', 'stiff in the pot',
  'melting helped', 'creamy formula', 'too pigmented', 'buildable', 'blendable',
  'lightweight', 'sticky', 'tacky', 'sheer', 'feels heavy', 'comfortable to wear',

  // application 
  'applied with brush', 'applied with fingers', 'spooly', 'needs warming', 'works better warmed',
  'easy to remove', 'hard to remove', 'with primer', 'over powder', 'under foundation',

  // context
  'used in hot weather', 'used to work', 'wore it all day', 'made me look cute',
  'didn’t look good', 'looked patchy', 'accentuated texture', 'didn’t blend',
  'shade pulled orange', 'shade range needs improvement',

  // comparison signals
  'better than', 'worse than', 'dupe for', 'reminds me of', 'similar to', 'prefer it over',
  'like [brand]', 'like my [other product]',

  // meta signals
  'holy grail', 'HG', 'every time I try something else I come back', 'doesn’t live up to the hype',
  'the hype is real', 'de-influenced me', 'influenced me to buy', 'saw it on TikTok'
];

export const reviewRegex = new RegExp(`\\b(${reviewSignals.join("|")})\\b`, "i");

export function isReviewLike(text) {
  return reviewRegex.test(text);
}
