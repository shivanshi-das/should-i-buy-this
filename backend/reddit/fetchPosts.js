import { reddit } from './redditClient.js';
import {
    isReviewLike,
    positiveKeywords,
    negativeKeywords
} from "../reddit/reviewSignals.js";


function mentionsExactProduct(text, productName) {
    const lowerText = text.toLowerCase();
    const base = productName.toLowerCase();

    return lowerText.includes(base) ||
        lowerText.includes(base + 's') ||
        lowerText.includes(base + 'es');
}

function isAskingAboutProduct(text) {
    return /\b(should i|get|buy|worth|opinions?|thoughts?|recommend|anyone (tried|use|have)|how is|is it|how does it|what do you think|has anyone|worth the hype|repurchase|dupe|vs\.?|how’s it compare)\b/i.test(text);
}

function isGenericLookPost(text) {
    const nonReviewSignals = [
        'foty', 'fotd', 'face of the day',
        'did my makeup', 'look i created', 'check out my makeup',
        'today’s glam', 'just playing with makeup', 'today’s beat',
        'soft glam', 'here’s my makeup', "recreating", "used:", "product list:", "wedding makeup",
        "bridal makeup", "wedding look", "bridal look"
    ];
    const body = text.toLowerCase();
    return nonReviewSignals.some(phrase => body.includes(phrase));
}

function isLikelyProductReview(text) {
    return isReviewLike(text) && !isGenericLookPost(text);
}


// function isHighQualityComment(comment) {
//     if (!comment.body) return false;
//     const wordCount = comment.body.trim().split(/\s+/).length;
//     const isStrongReview = isLikelyProductReview(comment.body);
//     return wordCount >= 30 && isStrongReview && comment.score >= 3;
// }


export async function searchFilteredPosts(query, subreddits = [], limit = 10) {
    const allPosts = [];

    for (const sub of subreddits) {
        try {
            const results = await reddit.getSubreddit(sub).search({
                query: `"${query}"`, // forces exact phrase match
                time: 'all',
                sort: 'relevance',
                limit
            });

            for (const post of results) {
                const title = post.title || '';
                const selftext = post.selftext || '';
                const combinedText = `${title} ${selftext}`;
                const isDeleted = title === '[deleted]' || selftext === '[deleted]';
                const hasText = title.trim().length > 0 || selftext.trim().length > 0;

                const mentionsExact = mentionsExactProduct(combinedText, query);
                const isReview = isLikelyProductReview(combinedText);
                const isQuestionAskingForOpinions = isAskingAboutProduct(combinedText);

                if (!isDeleted && hasText && mentionsExact && (isReview || isQuestionAskingForOpinions)) {
                    const fullPost = await reddit.getSubmission(post.id).expandReplies({ limit: Infinity, depth: 2 });

                  //console.log(`Post: ${post.title} → ${fullPost.comments.length} comments loaded`);
                    // fullPost.comments.forEach(c => {
                    //     if (c.body) console.log(`COMMENT:`, c.body);
                    // });




                    const opinionatedComments = fullPost.comments
                        .filter(c => c.body && isLikelyProductReview(c.body))
                        .map(c => ({
                            comment_id: c.id,
                            author: c.author?.name || 'unknown',
                            body: c.body,
                            score: c.score,
                        }));


                    allPosts.push({
                        thread_id: post.id,
                        title: post.title,
                        text: post.selftext,
                        url: `https://reddit.com${post.permalink}`,
                        upvotes: post.ups,
                        numComments: post.num_comments,
                        subreddit: post.subreddit.display_name,
                        opinionatedComments,
                    });
                }
            }
        } catch (err) {
            console.error(`Error fetching from r/${sub}:`, err.message);
        }
    }

    return allPosts;
}

