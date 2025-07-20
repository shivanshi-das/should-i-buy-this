export function flattenToReviewCandidates(posts) {
  const candidates = [];

  for (const post of posts) {
    // main post added as review candidate
    candidates.push({
      platform: "Reddit",
      author: "OP",
      content: `${post.title} ${post.text}`,
      url: post.url,
      upvotes: post.upvotes
    });

    // qualifying comments added as review candidate
    for (const comment of post.opinionatedComments) {
      candidates.push({
        platform: "Reddit",
        author: comment.author,
        content: comment.body,
        url: post.url + comment.comment_id, // thread + anchor
        upvotes: comment.score
      });
    }
  }

  return candidates;
}

