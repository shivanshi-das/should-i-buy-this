// reviewSignals.js

// opinion/recommendation
export const positiveKeywords = [
  'i love', 'i like', 'my favorite', 'holy grail', 'worth trying', 'must have',
  'game changer', 'would recommend', 'highly recommend', 'is the best',
  'the hype is real', 'prefer it over', 'influenced me to buy', 'HG',
  'adds volume', 'holds a curl', 'natural look', 'blendable', 'buildable',
  'lightweight', 'comfortable to wear', 'easy to remove', 'creamy formula',
  'easy to blend', 'used in hot weather', 'every time I try something else I come back',
  'used for over', 'been using it', 'ride or die'
];

export const negativeKeywords = [
  'i hate', 'i regret', 'not for me', 'not worth it', 'would not recommend',
  'i wouldn’t repurchase', 'is the worst', 'too dry', 'too wet', 'dries out',
  'stiff in the pot', 'too pigmented', 'sticky', 'tacky', 'feels heavy',
  'hard to remove', 'hard to blend', 'didn’t last', 'wore off quickly',
  'fade fast', 'patchy', 'flaked off', 'clumped', 'smudged', 'melted off',
  'looked patchy', 'accentuated texture', 'shade pulled orange',
  'shade range needs improvement', 'doesn’t live up to the hype', 'too intense',
  'de-influenced me'
];

// neutral context rich words
export const contextKeywords = [
  'i use', 'i tried', 'i own', 'i have', 'applied with brush', 'applied with fingers',
  'spooly', 'needs warming', 'with primer', 'over powder', 'under foundation',
  'used to work', 'wore it all day', 'made me look cute', 'similar to', 'like [brand]',
  'like my [other product]', 'reminds me of', 'dupe for', 'better than', 'worse than', 'cheaper than'
];

export const reviewSignals = [
  ...positiveKeywords,
  ...negativeKeywords,
  ...contextKeywords
];

// export const reviewRegex = new RegExp(`\\b(${reviewSignals.join("|")})\\b`, "i");
const reviewRegex = new RegExp(`\\b(${reviewSignals.join("|")})\\b`, "i");

export function isReviewLike(text) {
  return reviewRegex.test(text.toLowerCase());
}
