// CloudFront Function (viewer-request) — clean URL routing.
//
// The site is served as static .html objects from S3, but the canonical,
// indexable URLs are the extensionless form (/testing, /writing/some-post).
// This function does two things at the edge, before origin is contacted:
//
//   1. 301-redirects any .html URL (and any trailing-slash URL) to its clean
//      equivalent, so search engines consolidate ranking signal onto the one
//      canonical URL instead of treating both as separate/duplicate pages.
//   2. Rewrites a clean-URL request to the underlying .html object name so
//      S3 (which only has the .html objects) can still serve it.
//
// The rules are generic on purpose: a new page or article needs no change
// here and no infrastructure deploy. A path that has no matching object
// still reaches S3, which answers 403, which the distribution's
// custom_error_response turns into a real 404 with the 404 page.
//
// Left alone:
//   /            → served via CloudFront's default_root_object (index.html)
//   /404.html    → only ever reached through custom_error_response; /404 is
//                  not rewritten either, so it stays a real 404 rather than
//                  a 200 copy of the error page
//   anything with a file extension other than .html (css, js, images, txt…)
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri === "/" || uri === "/404.html" || uri === "/404") {
    return request;
  }

  var target = null;
  if (uri === "/index.html") {
    target = "/";
  } else if (uri.endsWith("/index.html")) {
    target = uri.slice(0, -"/index.html".length);
  } else if (uri.endsWith(".html")) {
    target = uri.slice(0, -".html".length);
  } else if (uri.endsWith("/")) {
    target = uri.replace(/\/+$/, "");
  }

  if (target !== null) {
    // Only redirect to a plain same-site path. A URI such as "//evil.example/"
    // would otherwise produce "Location: //evil.example", which browsers
    // treat as another host (an open redirect). Anything unusual is passed
    // through untouched and ends as a 404.
    if (/^\/[A-Za-z0-9\-._~\/]*$/.test(target) && target.indexOf("//") === -1) {
      return redirect(target, request.querystring);
    }
    return request;
  }

  // Clean URL → underlying .html object. Only when the last path segment has
  // no extension, so assets and files like robots.txt are never touched.
  var lastSegment = uri.substring(uri.lastIndexOf("/") + 1);
  if (lastSegment.indexOf(".") === -1) {
    request.uri = uri + ".html";
  }

  return request;
}

function redirect(location, qs) {
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
