var userElement = document.getElementById('user');
var projectElement = document.getElementById('project');
var user = userElement ? userElement.innerHTML : 'all'
var project = projectElement ? projectElement.innerHTML: 'all'

var own = {owner: user, name: project};
console.log(own);

var socket = io.connect();
socket.emit('online', own);
socket.on('online', function(data) {
  for (var i = 0; i < data.length; i++) {
    addListToDOM(data[i]);
  }
});
socket.on('addList', function(data) {
  console.log(data.project.name);
  console.log(data.project.owner);
  if (data.project.name == project && data.project.owner.indexOf(user) != -1) {
    addListToDOM(data.list);
  }
});
socket.on('delete', function(data) {
  removeListFromDOM(data);
});
socket.on('done', function(data) {
  var list = document.getElementById(data);
  list.style.background = 'url(img/done.png) center no-repeat';
  list.style.color = '#aaa';
});
socket.on('color', function(data) {
  var list = document.getElementById(data.key);
  list.style.background = colors[data.color];
});


var colors = ['pink', 'palegreen', 'lightblue', '#FC9', '#C03',
    'yellow', 'orange', 'brown', 'Magenta', 'DeepSkyBlue', 'DarkKhaki']
var lists = document.getElementById('todolists');
var input = document.getElementById('input');
var sendBtn = document.getElementById('send');
sendBtn.onclick = addList;
document.addEventListener('keydown', function(event) {
  if (event.keyCode == 13) addList();
}, false);

function addList() {
  var value= input.value;
  if (!value) value = ' ';
  var color = parseInt(Math.random() * 11 - 0.2);

  var list = {
    content: value,
    done: false,
    color: color,
    date: Date.now(),
  };

  addListToDOM(list);
  socket.emit('addList', {list: list, own: own});
  input.value = '';
  input.focus();
};

function addListToDOM(list) {
  var li = document.createElement('li');
  li.style.background = colors[list.color];
  li.setAttribute('id', list.date);
  li.innerHTML = '<button class="done">Done</button>' +
    '<button class="del">Del</button><p>' + list.content + '</p>';
  lists.insertBefore(li, lists.firstChild);
  li.firstChild.style.display = 'none';
  li.childNodes[1].style.display = 'none';
  if (list.done === true) {
    li.style.background = 'url(img/done.png) center no-repeat';
    li.style.color = '#aaa';
  }

  li.onmouseenter = function(event) {
    li.firstChild.style.display = '';
    li.childNodes[1].style.display = '';
    
  };
  li.onmouseleave = function(event) {
    li.firstChild.style.display = 'none';
    li.childNodes[1].style.display = 'none';
  };
  li.onclick = clickEventHandle;
}

function clickEventHandle(event) {
  var key = event.target.parentNode.id.toString();
  if (event.target.className == 'del') {
    removeListFromDOM(key);
    socket.emit('delete', key);
  } else if (event.target.className == 'done') {
    var li = event.target.parentNode;
    li.style.background = 'url(img/done.png) center no-repeat';
    li.style.color = '#aaa';
    socket.emit('done', key);
  } else {
    if (event.target.tagName.toLowerCase() == 'li') {
      var li = event.target;
      var key = event.target.id.toString();
    } else {
      var li = event.target.parentNode;
    }
    var color = parseInt(Math.random() * 11 - 0.5);
    li.style.background = colors[color];
    socket.emit('color', {key: key, color: color});
  }
}

function removeListFromDOM(key) {
  var li = document.getElementById(key);
  lists.removeChild(li);
}


var addUserButton = document.getElementById('addUserButton');
addUserButton.onclick = function(event) {
  var addUsername = document.getElementById('addUser').value;
  console.log(addUsername);
  socket.emit('addUser', {name: addUsername, own: own});
  alert('Add success...');
  document.getElementById('addUser').value = '';
};