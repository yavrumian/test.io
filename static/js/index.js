let socket,
    connected = false,
    active = 1,
    id = 0,
    listeners = [];

$('button').click(function(e){
    if($(e.target).attr('id') == 'connect') return 0
    if(!connected) e.preventDefault()
})

const setListener = (num) => {
    function insertInto(str, input){
        var val = input.value, s = input.selectionStart, e = input.selectionEnd;
        input.value = val.slice(0,e)+str+val.slice(e);
        if (e==s) input.selectionStart += str.length - 1;
        input.selectionEnd = e + str.length -1;
    }
    var closures = {40:')',91:']', 123:'}', 34:'"', 39:'\''};
    $(".editable").keypress(function(e) {
        if (kk = closures[e.which]) insertInto(kk, this);
    });

    $('#close' + num).click(e => {
        $(e.target).parent().remove()
        $('#body'+num).remove()
        const first  = parseInt($('.tabs input').last().attr('num'))

        $('#body'+first).addClass('show')
        active = first
    })
    $('#event' + num).click(function(e){
        active = $(this).attr('num')
        $('.show').removeClass('show');
        $('#body' + active).addClass('show')
    })
}
setListener(1)

const render = () => {
    $('.card-body').html('')
    listeners.forEach(el => {
        $('.card-body').append(`<div class="card-item" id="item${el.id}">${el.name}<span item-id="${el.id}" class="item-close"><i class="fas fa-times"></i></span></div>`)
        $('#item' + el.id).click(function(e){
            $('.active').removeClass('active')
            $('.event-show').removeClass('event-show')
            $('[event-id=' + el.id + ']').addClass('event-show')
            $(this).addClass('active')
            $('.card-name').text($(this).contents().get(0).nodeValue)
        })
        $('[item-id='+ el.id + ']').click(function(e){
            socket.off($(this).parent().contents().get(0).nodeValue)
            const id = $(this).attr('item-id')
            listeners = listeners.filter(el => el.id != id)
            $('[event-id=' + el.id + ']').remove()
            if($('.card-name').text() == el.name) $('.card-name').text('Select event to see data')
            render()
        })

    })
}

$('#listener').keypress(e =>{
    if(e.originalEvent.keyCode == 13) $('#listen').click()
})

$('#connect').click((e) => {
  e.preventDefault()
  const url = $('#address').val()
  const np = $('#namespace').val()

  if(socket) socket.close()
  socket = io.connect(`${url}/${np}`, {
    forceNew: true,
    transports: ['websocket', 'polling'],
    reconnection: $('#rec').prop('checked')
  })
  socket.on('connect', () => {
    if(socket.connected){
        if(listeners.length != 0){
            listeners.forEach(el => {
                socket.on(el.name, (msg) => {
                    $('[event-name=' + el.name + ']').append(msg +'\n')
                    $('#info').text(el.name)
                })
            })
        }
        connected = true
        $('#status').css('color', 'lime')
        $('#err').text('')
    }
  })

  socket.on('connect_error', (e) => {
    connected = false
    $('#status').css('color', 'red')
    $('#err').text('*Connection error, details in console')
  })

  socket.on('disconnect', (e) => {
    console.error(e);
    connected = false
    $('#status').css('color', 'red')
    $('#err').text('*Socket disconnected, details in console')
  })

  if(!socket.connected){
    connected = false;
    $('#status').css('color', 'red')
    $('#err').text('*Connection error, details in console')
  }
})

$('#send').click((e) => {
  e.preventDefault()
  const ev = $('#event' + active).val()
  const text = $('#body' + active).val()
  let body;
  try{
    body = JSON.parse(text)
  }catch(e){
    $('#status').css('color', 'red')
    $('#err').text('*Invalid body')
  }
  if(connected){
    if(typeof body == 'object'){
      socket.emit(ev, body)
    }else{
        $('#status').css('color', 'red')
        $('#err').text('*Invalid body')
    }
  }
  else{
    $('#status').css('color', 'red')
    $('#err').text('*Not Connected')
  }
})

$('#add').click((e) => {
  let num = parseInt($('.tabs input').last().attr('num'))+1
  if(isNaN(num)) num = 1
  $('.tabs').append(`<div class="tab">
      <input type="text" id="event${num}" placeholder="event name" class="event" num="${num}"><span id="close${num}" class="close"><i class="fas fa-times"></i></span>
  </div>`)
  $('.bodies').append(`<textarea class="body" rows="8" cols="20" id="body${num}" class="editable"></textarea>`)
  setListener(num)
})

$('#card-toggle').click(e => {
    $('.card-body').toggle()
})

$('html').click(e => {
    if ($(e.target).attr('class') != 'card-head' && $('.card-head').has(e.target).length == 0 && $(e.target).attr('class') != 'item-close') $('.card-body').hide()
})

$('#listen').click((e) => {
    e.preventDefault()
    if(!connected) return $('#err').text('*Not Connected')

    const ev = $('#listener').val()
    $('#listener').val('')

    listeners.push({id: ++id, name: ev})
    $('#event-bodies').append(`<textarea event-id="${id}" event-name="${ev}"  class="event-body"  rows="8" cols="50" readonly></textarea>`)
    render()

    socket.on(ev, (msg) => {
        $('[event-name=' + ev + ']').append(msg+'\n')
        $('#info').text(ev)
    })
})
