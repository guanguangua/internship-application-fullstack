/**
 * The html rewritter
 * @type {HTMLRewriter}
 */
const rewriter = new HTMLRewriter()
    .on('title', { element: e => e.setInnerContent("Cloudflare is awesome") })
    .on('h1#title', { element: e => e.prepend("**2020 Summer Internship Application**") })
    .on('p#description', { element: e => e.setInnerContent("Guancheng Ren") })
    .on('a#url', { 
      element: e => e.setInnerContent("Check out my Github!")
        .setAttribute("href", "https://github.com/guanguangua") 
    });


/**
 * Grabs the cookie with name from the request headers
 * @param {Request} request incoming Request
 * @param {string} name of the cookie to grab
 */
function getCookie(request, name) {
  let result = null
  let cookieString = request.headers.get('Cookie')
  if (cookieString) {
    let cookies = cookieString.split(';')
    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim()
      if (cookieName === name) {
        let cookieVal = cookie.split('=')[1]
        result = cookieVal
      }
    })
  }
  return result
}


/**
 * Rewrite the webpage and return to user
 * @param {Request} request
 */
async function handleRequest(request) {
  const api_url = "https://cfw-takehome.developers.workers.dev/api/variants";
  let variant_urls = (await fetch(api_url).then(res => res.json()))["variants"];  // get the urls from the API

  let variant_url = getCookie(request, "variant_url");  // if the variant do not exist in cookies, generate a random one
  if (!variant_url) {
    let variant_id = Math.floor(Math.random() * variant_urls.length); 
    variant_url = variant_urls[variant_id];
  }

  let rewritten_webpage = await fetch(variant_url).then(res => rewriter.transform(res));  // fetch the variant webpage and rewrite it
  rewritten_webpage.headers.append("Set-Cookie", `variant_url=${variant_url}`);  // set cookie on client side
  return rewritten_webpage
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
