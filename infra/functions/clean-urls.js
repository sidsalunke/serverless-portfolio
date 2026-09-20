// CloudFront Function (viewer-request) — clean URL routing.
//
// The site is served as static .html objects from S3, but the canonical,
// indexable URLs are the extensionless form (/testing, /ai-engineering).
// This function does two things at the edge, before origin is contacted:
//
//   1. 301-redirects the old .html URL to its clean equivalent, so search
//      engines consolidate ranking signal onto the one canonical URL
//      instead of treating both as separate/duplicate pages.
//   2. Rewrites a clean-URL request to the underlying .html object name
//      so S3 (which only has the .html objects) can still serve it.
//
// Only the two real content pages need this — index.html is already served
// extension-free via CloudFront's default_root_object, and 404.html is only
// ever reached through the distribution's custom_error_response, never a
// direct link, so neither needs an entry here.
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  var fileToClean = {
    "/index.html": "/",
    "/testing.html": "/testing",
    "/ai-engineering.html": "/ai-engineering"
  };

  if (fileToClean[uri]) {
    var location = fileToClean[uri];
    var qs = request.querystring;
    var qsKeys = Object.keys(qs);
    if (qsKeys.length > 0) {
      var parts = [];
      for (var i = 0; i < qsKeys.length; i++) {
        var key = qsKeys[i];
        parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(qs[key].value));
      }
      location += "?" + parts.join("&");
    }
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: {
        location: { value: location }
      }
    };
  }

  var cleanToFile = {
    "/testing": "/testing.html",
    "/ai-engineering": "/ai-engineering.html"
  };

  if (cleanToFile[uri]) {
    request.uri = cleanToFile[uri];
  }

  return request;
}
