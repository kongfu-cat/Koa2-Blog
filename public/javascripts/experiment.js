var value = "// The bindings defined specifically in the Sublime Text mode\nvar bindings = {\n";
var map = CodeMirror.keyMap.sublime;
for (var key in map) {
  var val = map[key];
  if (key != "fallthrough" && val != "..." && (!/find/.test(val) || /findUnder/.test(val)))
    value += "  \"" + key + "\": \"" + val + "\",\n";
}
value += "}\n\n// The implementation of joinLines\n";
value += CodeMirror.commands.joinLines.toString().replace(/^function\s*\(/, "function joinLines(").replace(/\n  /g, "\n") + "\n";

$('#jsEditor').val('')
$('#htmlEditor').val(`
<script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
`)
$('#cssEditor').val('')

var defaultTheme = "mbo"
var jsEditor = CodeMirror.fromTextArea(document.getElementById('jsEditor'), {
  lineNumbers: true,
  lineWrapping: true,
  mode: "javascript",
  keyMap: "sublime",
  autoCloseBrackets: true,
  matchBrackets: true,
  showCursorWhenSelecting: true,
  theme: defaultTheme,
  tabSize: 2,
  gutters: ["CodeMirror-lint-markers"],
  styleActiveLine: true,
  lint: true
});
var htmlEditor = CodeMirror.fromTextArea(document.getElementById('htmlEditor'), {
  lineNumbers: true,
  lineWrapping: true,
  mode: "text/html",
  keyMap: "sublime",
  autoCloseBrackets: true,
  matchBrackets: true,
  showCursorWhenSelecting: true,
  theme: defaultTheme,
  tabSize: 2,
  gutters: ["CodeMirror-lint-markers"],
  styleActiveLine: true,
  lint: true,
  matchTags: {bothTags: true}
});
var cssEditor = CodeMirror.fromTextArea(document.getElementById('cssEditor'), {
  lineNumbers: true,
  lineWrapping: true,
  mode: "css",
  keyMap: "sublime",
  autoCloseBrackets: true,
  matchBrackets: true,
  showCursorWhenSelecting: true,
  theme: defaultTheme,
  tabSize: 2,
  gutters: ["CodeMirror-lint-markers"],
  styleActiveLine: true,
  lint: true
});

function selectTheme(inputTheme, flag) {
  var theme;
  if (flag) {
    theme = inputTheme;
  } else {
    theme = this.options[this.selectedIndex].textContent;
  }
  jsEditor.setOption("theme", theme);
  htmlEditor.setOption("theme", theme);
  cssEditor.setOption("theme", theme);

  defaultTheme = theme
}

var firstFlag = true
function showIframe() {
  var previewFrame = document.getElementById('resultIframe');
  var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
  preview.open();
  preview.write(`<style>${cssEditor.getValue()}</style>`);
  preview.write(htmlEditor.getValue());
  if(firstFlag){
    preview.write(`<script>
    var oldLog=console.log;
    console.log=function(){
       window.parent.postMessage(JSON.stringify(arguments), '*');
       oldLog.apply(console,arguments);
    }
    </script>`)
    firstFlag=false
  }
  preview.write(`<script>
    window.addEventListener('message', function(event) {
      var data = event.data;
      var ret = null
      try {
        ret = JSON.stringify(eval(data))
      } catch(e) {
        ret = e.toString()
      }
      window.parent.postMessage(ret, '*');
    }, false);
    </script>`)
  preview.write(`<script>${jsEditor.getValue()}</script>`);
  preview.close();
}

function getExperiment(experimentId) {
  return post('/experiment/get-experiment', {experimentId: experimentId})
}

function handleExperimentClick(experimentId) {
  getExperiment(experimentId).then(function(res) {
    var experiment = res.experiments[0] || {}
    jsEditor.setValue(experiment.js)
    htmlEditor.setValue(experiment.html)
    cssEditor.setValue(experiment.css)

    selectTheme(experiment.theme, true)
  })
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

var zTreeObj;
var nodeSelected = null;
function zTreeOnClick(event, treeId, treeNode) {
  if (treeNode.id) {
    nodeSelected = treeNode
    handleExperimentClick(treeNode.id);
  }
};

function updateNodeData() {
  zTreeObj.reAsyncChildNodes(null, "refresh");
}

function saveEditorData() {
  css = cssEditor.getValue()
  html = htmlEditor.getValue()
  js = jsEditor.getValue()
  if (nodeSelected != null) {
    post('/experiment/update', {
      id: nodeSelected.id, 
      js: js, 
      html: html, 
      css: css, 
      theme: defaultTheme
    })
  } else {
    let tag = prompt('please input the tag')
    let title = prompt('please input the title')
    if (tag && title) {
      post('/experiment/save', {
        js: js, 
        html: html, 
        css: css, 
        tag: tag,
        title: title,
        theme: defaultTheme
      })
    } else {
      alert('tag/title can\'t be empty.')
    }
  }
}

function deleteEditorData() {
  if (nodeSelected != null) {
    if (confirm('delete?')) {
      post('/experiment/delete', {id: nodeSelected.id}).then(function(){
        nodeSelected = null;
      })
    }
  } else {
    alert('no selected node')
  }
}

function newEditorData() {
  nodeSelected = null;
  jsEditor.setValue('')
  cssEditor.setValue('')
  htmlEditor.setValue(`<script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>`)
}

function embedScriptGenerator() {
  if (nodeSelected != null) {
      var host = location.host;
      var scriptTag = `<script src="${host}/experiment/fragment?id=${nodeSelected.id}"></script>`
      copyToClip(scriptTag, scriptTag+'\n复制成功')
  } else {
    alert('no selected node')
  }
}

function copyToClip(content, message) {
  var aux = document.createElement("input"); 
  aux.setAttribute("value", content); 
  document.body.appendChild(aux); 
  aux.select();
  document.execCommand("copy"); 
  document.body.removeChild(aux);
  if (message == null) {
      alert("复制成功");
  } else{
      alert(message);
  }
}

$(function() {
  // 初始化树
  var setting = {
    async: {
      enable: true,
      url: "/experiment/tree"
    },
    callback: {
      onClick: zTreeOnClick
    }
  };
  zTreeObj = $.fn.zTree.init($("#experimentTree"), setting, []);

  // 调整编辑器及结果窗口大小
  jsEditor.setSize('auto', $('.js-editor').css('height'));
  htmlEditor.setSize('auto', $('.html-editor').css('height'));
  cssEditor.setSize('auto', $('.css-editor').css('height'));
  $('#resultIframe').css('height', $('.result-iframe').css('height'))
  
  // 主题选择
  $('#themeSelect').on('change', selectTheme)
  
  // 控制台运行按键
  $('#runBtn').on('click', showIframe)
  var autoInervalHandler = null
  $('#stopBtn').on('click', function() {
    if (autoInervalHandler != null) {
      clearInterval(autoInervalHandler)
    }
  })
  $('#autoBtn').on('click', function(){
    if ($('#autoInput').val()) {
      if (autoInervalHandler != null) {
        clearInterval(autoInervalHandler)
      }
      autoInervalHandler = setInterval(showIframe, $('#autoInput').val()*1000)
    } else {
      alert('please set time')
    }
  })

  // 控制台输入事件
  $("#consoleInput").on('keypress', function(e) {
    if (e.keyCode == 13) {
      var previewFrame = document.getElementById('resultIframe');
      previewFrame.contentWindow.postMessage($("#consoleInput").val(), '*')
      
      $('.console-history').append($('<div>', {'class': 'console-row'}).text(`> ${$("#consoleInput").val()}`))
  
      $("#consoleInput").val('')
    }
  })

  // Iframe通信事件
  window.addEventListener('message', function(event) {
    var data = event.data;
    console.log('接收到子页面信息:', JSON.parse(data));
    $('.console-history').append($('<div>', {'class': 'console-row'}).text(`< ${data}`))
  }, false);

  // 树按键操作
  $('#saveBtn').on('click', function() {
    saveEditorData()
    updateNodeData()
  })
  $('#deleteBtn').on('click', function() {
    deleteEditorData()
    updateNodeData()
  })
  $('#newBtn').on('click', function() {
    newEditorData()
  })
  $('#genBtn').on('click', function() {
    embedScriptGenerator()
  })

  // 注册ctrl+r按键为运行, ctrl+s为保存
  document.addEventListener('keydown', function(e){
    if (e.keyCode == 'S'.charCodeAt() && (e.ctrlKey||e.metaKey)){
        e.preventDefault();
        saveEditorData();
        updateNodeData();
    }
    if (e.keyCode == 'R'.charCodeAt() && (e.ctrlKey||e.metaKey)){
        e.preventDefault();
        showIframe();
    }
  });
  document.getElementById('htmlEditor').addEventListener('click', function() {
    $('.experiment-aside').hide()
    $('.console-aside').hide()
  })
  document.getElementById('jsEditor').addEventListener('click', function() {
    $('.experiment-aside').hide()
    $('.console-aside').hide()
  })
  document.getElementById('cssEditor').addEventListener('click', function() {
    $('.experiment-aside').hide()
    $('.console-aside').hide()
  })
  // 移动端滑动事件
  var startX;
  var startY;
  var pageEl = document.getElementById('page')
  pageEl.addEventListener("touchstart", handleTouchEvent, false);
  pageEl.addEventListener("touchend", handleTouchEvent, false);
  pageEl.addEventListener("touchmove", handleTouchEvent, false);
  function handleTouchEvent(event) {
      switch (event.type){
          case "touchstart":  
              startX = event.touches[0].pageX;
              startY = event.touches[0].pageY;
              break;
          case "touchend":
              var spanX = event.changedTouches[0].pageX - startX;
              var spanY = event.changedTouches[0].pageY - startY;
              if(Math.abs(spanX) > Math.abs(spanY)){      //认定为水平方向滑动
                  if(spanX > 50){         //向右
                    $('.console-aside').hide()
                    $('.experiment-aside').show()
                  } else if(spanX < -50){ //向左
                    $('.experiment-aside').hide()
                    $('.console-aside').show()
                  }
              } else {                                    //认定为垂直方向滑动
                  if(spanY > 50){         //向下
                    $('.experiment-aside').hide()
                    $('.console-aside').hide()
                  } else if (spanY < -50) {//向上
                    $('.experiment-aside').hide()
                    $('.console-aside').hide()
                  }
              }
              break;
          case "touchmove":
              //阻止默认行为
              break;
      }
  }
})