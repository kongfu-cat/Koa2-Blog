function clearBlog() {
    $('#articleWrap').empty()
}

function setBlog(articles) {
    var str = ''
    for (let article of articles) {
        var imgHtml = ''
        if (article.img) {
            imgHtml = 
`<div class="article-img">
    <img src="/images/${article.img || 'default.png'}"/>
</div>`
        }
        if (article.tags && article.tags.length > 0) {
            tagHtml = 
`<div class="article-tag">
    ${article.tags[0]}
</div>`
        }
        str +=
`<article class="article">
<header class="article-header">
    <h2>${tagHtml}<a class="article-header-a" target="blank" href='/blog/${article.bid}'>${article.title}</a></h2>
</header>
<div class="article-header-border"></div>
<section class="article-section">
${imgHtml}
<div class="article-abstract">
    <span>${article.abs}</span>
</div>
</section>
<div class="article-info">
    <span>${article.author}</span>
    <span>${article.date.toString().split('T')[0]}</span>
    <span>view: ${article.view || 0}</span>
</div>
</article>`
    }
    $('#articleWrap').append(str)
}

function post(url, data, callback, options) {
    options = options || {}
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "POST",
            dataType: options.dataType || "json",
            contentType: options.contentType || 'application/json',
            url: url,
            data: JSON.stringify(data),
            success: function (result) {
                if (typeof callback == "function") {
                    callback(result);
                }
                resolve(result)
            },
            error: function (e) {
                console.log(e.status);
                console.log(e.responseText);
                reject(e)
            }
        })
    })
}

function startPage(url, data) {
    return (function () {
        var page = 1
        var pageSize = 12
        return function () {
            return post(url, Object.assign(data || {}, {
                page: page,
                pageSize: pageSize
            }), function () {
                page++;
            })
        }
    })()
}

// 点击后显示loading
function handleLoadMoreWithLoading(e) {
    var btn = e.currentTarget;
    if (btn) {
        var defaultText = $(btn).val();
        $(btn).val('Loading...');
        // loading动画
        var handler = setInterval(function(){
            switch ($(btn).val().length) {
                case 7: $(btn).val('Loading.');break;
                case 8: $(btn).val('Loading..');break;
                case 9: $(btn).val('Loading...');break;
                case 10: $(btn).val('Loading');break;
                default: break;
            }
        }, 500)
        getBlog().then(res => {
            $(btn).val(defaultText);
            setBlog(res.articles);
            clearInterval(handler);

            // 延时模拟数据传输
            // setTimeout(function(){
            //     $(btn).val(defaultText);
            //     setBlog(res.articles);
            //     clearInterval(handler);
            // }, 5000);
        })
    }
}

var throttleFlag = false
function handleLoadMore() {
    // 节流操作
    if (!throttleFlag) {
        throttleFlag = true;
        getBlog().then(res => {
            setBlog(res.articles)
            throttleFlag = false;
        }).catch(e=>{
            throttleFlag = false;
        })
    }
}

//滚动加载
function bindScrollLoadMore() {
    $(window).scroll(function() {
    var distance = 10; // 滚动条距离底部的距离
    var scrollTop = $(this).scrollTop(),
        scrollHeight = $(document).height(),
        windowHeight = $(this).height();
        
    var positionValue = (scrollTop + windowHeight) - scrollHeight;
    if (positionValue >= -distance) {
        handleLoadMore()
    }
    });
}

function handleTagItemClick() {
    clearBlog()
    let tag = $(this).attr('data-id') || ''
    getBlog = startPage('/blog/get-blog-by-tag', {
        tag: tag
    })
    handleLoadMore()
}

function handleDateItemClick() {
    clearBlog()
    let date = $(this).attr('data-id') || ''
    getBlog = startPage('/blog/get-blog-by-date', {
        date: date
    })
    handleLoadMore()
}


