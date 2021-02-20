console.log(ROOM_ID);

$('#btn_create_group').click(() => {
    $.ajax({
        type: 'POST',
        data: {
            'roomId' : ROOM_ID
        },
        url: 'room',
    }).done((roomId) => {
        window.location.href = '/' + roomId
    })
})

$('#btn-join-room').click(() => {
    let roomId = $('#input-room-id').val()
    if (roomId != '') {
        $.ajax({
            type: 'POST',
            data: {
                'roomId' : roomId
            },
            url: 'join',
        }).done((data) => {
            if (data.exist == true) {
                window.location.href = '/' + data.roomId
            }
        })
    }
})
