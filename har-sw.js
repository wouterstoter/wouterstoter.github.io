var dont = ["https://wouterstoter.github.io/HAR-viewer/","https://wouterstoter.github.io/HAR-viewer/sw.js"]

var har;
var base;
self.addEventListener('message', e => {
    har = e.data;
    base = new URL(har.pages.sort((a,b)=>a.startedDateTime < b.startedDateTime ? 1 : -1)[0].title);
});

self.addEventListener('install', function(event) {
  
});

self.onfetch = function(event) {console.log(event.request);
    try {
        if (dont.indexOf(event.request.url) == -1 && har) {
            var entry;
            var url = event.request.url.replace(location.origin,base.origin);
            for (e = 0; e < har.entries.length; ++e) {
                if (har.entries[e].request.url == url && har.entries[e].response && har.entries[e].response.content && har.entries[e].response.content.text) {entry = har.entries[e];break;}
            }
            if (!entry) throw "Error";
            
            var headers = new Headers();
            for (h = 0; h < entry.response.headers.length; ++h) {
                headers.append(entry.response.headers[h].name,entry.response.headers[h].value)
            }
            var response;
            if (entry.response.content.encoding == "base64") {
                var encoded = atob(entry.response.content.text)
                var n = encoded.length;
                response = new Uint8Array(n);
                while(n--){
                    response[n] = encoded.charCodeAt(n);
                }
            } else {
                response = entry.response.content.text
            }
            event.respondWith(
                new Response(response, {
                    status: entry.response.status,
                    statusText: entry.response.statusText,
                    headers: headers
                })
            );
        } else {
            throw "Error";
        }
    } catch(err) {
        console.error(err);
        event.respondWith(fetch(event.request).then(function (response) {
            console.log(response);
            return response;
        }))
    }
  /*event.respondWith(fetch(event.request).then(function (response) {
    console.log(response);
    return response;
  }));*/
};
