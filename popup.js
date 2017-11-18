function click(e) {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        var url = tabs[0].url;
        if(url.lastIndexOf('https://arxiv.org', 0) !== 0){
            alert('not arxiv');
            return;
        }
        document.body.innerHTML = '';
        url = url.replace('/pdf/', '/abs/');
        if(url.indexOf('.pdf') > 0){
            url = url.replace('.pdf', '');
        }
        var arxhr = new XMLHttpRequest();
        arxhr.open('GET', url);
        arxhr.onreadystatechange = function(){
            if(arxhr.readyState == 4){
                var ardiv = document.createElement('div');
                ardiv.innerHTML = arxhr.responseText;
                var title = ardiv.querySelector('#abs .title');
                title.removeChild(title.firstChild);
                title = title.innerText;
                var firstAuthor = ardiv.querySelector('#abs .authors a').innerText;
                var searchString = title + ' ' + firstAuthor;
                var scholarQuery = encodeURIComponent(searchString);

                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://scholar.google.com/scholar?hl=en&q=' + scholarQuery);
                xhr.onreadystatechange = function(){
                    if(xhr.readyState == 4){
                        var div = document.createElement('div');
                        div.innerHTML = xhr.responseText;
                        var results = div.querySelectorAll('#gs_bdy #gs_bdy_ccl #gs_res_ccl #gs_res_ccl_mid .gs_r');

                        num_results = Math.min(3, results.length);

                        for(var i=0; i<num_results; i++){
                            var result = results[i];
                            var resultTitle = result.querySelector('.gs_rt a').innerText;
                            var resultAuthors = result.querySelector('.gs_a').innerText;
                            var links = result.querySelectorAll('.gs_fl a');
                            for(var ii=0; ii<links.length; ii++){
                                var link = links[ii];
                                if(link.innerText.indexOf('BibTeX') >= 0){
                                    var aurl = link.href;
                                    var xhr2 = new XMLHttpRequest();
                                    xhr2.open('GET', aurl);
                                    xhr2.onreadystatechange = function(xhr, resultTitle, resultAuthors, order){
                                        if(xhr.readyState == 4){
                                            var titlediv = document.createElement('h1');
                                            titlediv.classList.add('title');
                                            titlediv.innerHTML = resultTitle;
                                            var authorsdiv = document.createElement('div');
                                            authorsdiv.classList.add('authors');
                                            authorsdiv.innerHTML = resultAuthors;
                                            var bibdiv = document.createElement('div');
                                            bibdiv.classList.add('force-select');
                                            bibdiv.innerHTML = xhr.responseText;
                                            var btdiv = document.createElement('div');
                                            btdiv.classList.add('result');
                                            btdiv.style.order = order.toString();
                                            btdiv.appendChild(titlediv);
                                            btdiv.appendChild(authorsdiv);
                                            btdiv.appendChild(bibdiv);
                                            document.body.appendChild(btdiv);
                                        }
                                    }.bind(null, xhr2, resultTitle, resultAuthors, i);
                                    xhr2.send();
                                    break;
                                }
                            }
                        }
                    }
                };
                xhr.send();

            }
        };
        arxhr.send();

    });
}

document.addEventListener('DOMContentLoaded', function (e) {
  document.querySelector('#citebutton').addEventListener('click', click);
});
