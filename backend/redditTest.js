import { searchFilteredPosts } from './reddit/fetchPosts.js';

const productsToTest = [
  'Rare Beauty blush'
//   'Saie Dew Blush',
//   'Rhode blush',
//   'ELF Putty Blush',
//   'NARS Radiant Creamy Concealer'
];

const subreddits = ['MakeupAddiction', 'SkincareAddiction'];
const limit = 10;

const testAll = async () => {
  for (const product of productsToTest) {
    console.log(`\nSearching for: "${product}"\n`);

    const results = await searchFilteredPosts(product, subreddits, limit);

    console.log(`Found ${results.length} filtered posts for "${product}":\n`);

    results.forEach((post, index) => {
      console.log(`#${index + 1}: ${post.title}`);
      console.log(`Subreddit: ${post.subreddit}`);
      console.log(`URL: ${post.url}`);
      console.log(`Upvotes: ${post.upvotes}, Comments: ${post.numComments}`);
      console.log(`Text: ${post.text.slice(0, 150).replace(/\s+/g, ' ')}...\n`);
    });

    console.log('='.repeat(60)); 
  }
};

testAll();
