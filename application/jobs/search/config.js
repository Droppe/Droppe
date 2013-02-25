var BING_API_KEY = 'wzn26jC2yGeUBi3N3aT2ipBCYUeQ2gCfoAoPg75VGlQ=',
  BING_API_LIMIT = 5000/30.4368,
  TWITTER_API_LIMIT = 5000/30.4368;

module.exports.bing = {
  KEY: BING_API_KEY,
  URL: 'https://user:' + BING_API_KEY + '@api.datamarket.azure.com/Bing/Search/v1/Composite',
  SETTINGS: {
    '$format': 'json',
    'Sources': "'news'",
    'VideoSortBy': "'Relevance'",
    'NewsSortBy': "'Relevance'",
    'Adult': "'Moderate'"
  },
  //ms * s * m = ms/h 
  QUERY_THROTTLE: 1000 * 60 * 60 * 24,
  API_THROTTLE: (1000 * 60 * 60 * 24) / BING_API_LIMIT
};

module.exports.twitter = {
  URL: 'http://search.twitter.com/search.json?q=',
  EXTRA: ' source:tweet_button filter:links',
  QUERY_THROTTLE: 1000 * 60 * 60 * 1,
  API_THROTTLE: (1000 * 60 * 60 * 24) / TWITTER_API_LIMIT
}