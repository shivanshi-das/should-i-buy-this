import { searchFilteredPosts } from './reddit/fetchPosts.js';
import { isReviewLike } from './reddit/reviewSignals.js';


const productsToTest = [
  'Rare Beauty blush'
  // 'Saie Dew Blush',
  // 'Rhode blush',
  // 'ELF Putty Blush',
  // 'NARS Radiant Creamy Concealer'
];

const subreddits = [
  "MakeupAddiction", "SkincareAddiction", "beautytalkph", 
  "AsianBeauty", "oliveMUA", "MakeupReviews", 
  "MakeupRehab", "drugstoreMUA"
];

const limit = 10;

const testAll = async () => {
  for (const product of productsToTest) {
    console.log(`\n🔍 Searching for: "${product}"\n`);

    const results = await searchFilteredPosts(product, subreddits, limit);

    console.log(`✅ Found ${results.length} review-like threads for "${product}":\n`);

    results.forEach((post, index) => {
      console.log(`\n#${index + 1}: ${post.title}`);
      if (post.text?.trim()) {
        console.log(`📄 Post: ${post.text.trim().slice(0, 300)}${post.text.length > 300 ? '...' : ''}`);
      }

      if (post.opinionatedComments.length > 0) {
        console.log(`💬 Top Comments:`);
        post.opinionatedComments.slice(0, 3).forEach((c, i) => {
          console.log(`  • (${c.score} upvotes): ${c.body.trim().slice(0, 300)}${c.body.length > 300 ? '...' : ''}`);
        });
      } else {
        console.log(`💬 No high-quality comments found.`);
      }

      console.log(`🔗 ${post.url}`);
      console.log('-'.repeat(60));
    });

    console.log('\n' + '='.repeat(80) + '\n');
  }
};

testAll();
