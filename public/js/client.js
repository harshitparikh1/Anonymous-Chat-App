/*********************************
 *
 * SOCKET IO ON THE CLIENT SIDE
 */

$(document).ready(function () {
    var socket = io();
    var isMatched = false;

    var $chatForm = $('#chat_container form');
    var $chatMessage = $('#chat_container #chat_message');
    var $partnerStatus = $('#chat_container #partner_status');
    var $messageContainer = $('#chat_container #messages');

    var $usernameForm = $('#username_container #username_box form');
    var $nickname = $('#nickname');

    var $usernameContainer = $('#username_container');
    var $waitingContainer = $('#waiting_container');
    var $chatContainer = $('#chat_container');

    var $chatPair = [];
    var $partnerName;

    $usernameContainer.show();
    $waitingContainer.hide();
    $chatContainer.hide();

    // Handle the submit event
    // Submit the username
    $usernameForm.submit(function () {
        if ($nickname.val() != '') {
            socket.emit('new user', $nickname.val());
            if (isMatched == false) {
                $waitingContainer.fadeIn(500);
                $usernameContainer.hide();
                $chatContainer.hide();
            } else {
                $chatContainer.fadeIn(500);
                $waitingContainer.hide();
                $usernameContainer.hide();
            }
            $nickname.val('');
        } else {
            alert('Please enter the correct nickname!');
        }
        return false;
    });

    $('#image_btn').bind('change', function(e){
        var data = e.originalEvent.target.files[0];
        readThenSendFile(data);      
    });
    
    function readThenSendFile(data){
    
        var reader = new FileReader();
        reader.onload = function(evt){
            var msg ={};
            // msg.username = username;
            msg.file = evt.target.result;
            msg.fileName = data.name;
            io.sockets.emit('base64 file', msg);
        };
        reader.readAsDataURL(data);
    }

    // Submit the chatting messages
    $chatForm.submit(function () {
        if ($chatMessage.val() != '') {
            if ($chatPair != null) {
                var dataArray = {
                    msg: $chatMessage.val(),
                    nickname: $nickname,
                    pair: $chatPair
                };
                socket.emit('send message', dataArray);
                $chatMessage.val('');
            }
        } else {
            alert('Please enter the message!');
        }
        return false;
    });

    // Handle the typing status of user
    $chatMessage.focus(function () {
        socket.emit('typing status', 'typing');
    });

    // var uploader = new SocketIOFileUpload(socket);
    // uploader.listenOnInput(document.getElementById("siofu_input"));

    // socket.on('user image', image);

    // $(function () {
    //     $('#image_btn').bind('change', function (e) {
    //         var data = e.originalEvent.target.files[0];
    //         var reader = new FileReader();
    //         reader.onload = function (evt) {
    //             image('me', evt.target.result);
    //             io.sockets.emit('user image', evt.target.result);
    //         };
    //         reader.readAsDataURL(data);

    //     });
    // });

    // Get the typing status from the partner
    socket.on('new typing status', function () {
        if ($partnerName != null) {
            $partnerStatus.text($partnerName);
        }
    });

    // Get the message from server
    socket.on('new message', function (data) {
        if (('/#' + socket.id) == data.id) {
            $('#messages').append('<li><div class = "right_bubble"><b>' + "Me" + ': </b>' + data.msg + '</div></li>');
        } else {
            $('#messages').append('<li><div class = "left_bubble"><b>' + "Stranger" + ': </b>' + data.msg + '</div></li>');
        }

        var chatListHeight = $messageContainer.height();
        var formHeight = $chatForm.height();
        var statusHeight = $partnerStatus.height();
        var winHeight = $(window).height();
        var margin = 10 * 2;

        // Scroll to see the last message
        if (chatListHeight + formHeight + statusHeight + margin > winHeight) {
            var scrollVal = chatListHeight + formHeight + statusHeight + margin - winHeight;
            $('html, body').animate({
                scrollTop: scrollVal
            }, 1000);
        }
    });

    // socket.on('user image', function (data){

    //     if (('/#' + socket.id) == data.id) {
    //         $('#messages').append('<li><div class = "right_bubble"><b>' + "Me" + ': </b>' + data.base64Image + '</div></li>');
    //     } else {
    //         $('#messages').append('<li><div class = "left_bubble"><b>' + "Stranger" + ': </b>' + data.base64Image + '</div></li>');
    //     }

    //     var chatListHeight = $messageContainer.height();
    //     var formHeight = $chatForm.height();
    //     var statusHeight = $partnerStatus.height();
    //     var winHeight = $(window).height();
    //     var margin = 10 * 2;

    //     // Scroll to see the last message
    //     if (chatListHeight + formHeight + statusHeight + margin > winHeight) {
    //         var scrollVal = chatListHeight + formHeight + statusHeight + margin - winHeight;
    //         $('html, body').animate({
    //             scrollTop: scrollVal
    //         }, 1000);
    //     }
    // });

    // function image (base64Image) {
    //     if (('/#' + socket.id) == data.id) {
    //         $('#messages').append('<li><div class = "right_bubble"><b>' + "Me" + ': </b>' + base64Image + '</div></li>');
    //     } else {
    //         $('#messages').append('<li><div class = "left_bubble"><b>' + "Stranger" + ': </b>' + base64Image + '</div></li>');
    //     }
    //     var chatListHeight = $messageContainer.height();
    //     var formHeight = $chatForm.height();
    //     var statusHeight = $partnerStatus.height();
    //     var winHeight = $(window).height();
    //     var margin = 10 * 2;

    //     // Scroll to see the last message
    //     if (chatListHeight + formHeight + statusHeight + margin > winHeight) {
    //         var scrollVal = chatListHeight + formHeight + statusHeight + margin - winHeight;
    //         $('html, body').animate({
    //             scrollTop: scrollVal
    //         }, 1000);
    //     }
        
    // }


    socket.on('chat pair', function (data) {
        if (data) {
            $chatPair = data;
            if (('/#' + socket.id) == $chatPair[0].id) {
                $partnerName = $chatPair[1].name;
            } else if (('/#' + socket.id) == $chatPair[1].id) {
                $partnerName = $chatPair[0].name;
            }
        }
    });

    socket.on('matching status', function (data) {
        if (data) {
            $messageContainer.empty();
            if (data == 'waiting') {
                console.log('waiting');
                $partnerName = null;
                isMatched = false;
            } else if (data == 'matched') {
                console.log('matched');
                // $("#connected").show();
                // setTimeout(function() { $("#connected").hide(); }, 5000);

                $("#alert_template button").after('<span>A stranger connected!</span>');
                $('#alert_template').fadeIn('slow');
                setTimeout(function () { // this will automatically close the alert and remove this if the users doesnt close it in 5 secs
                    $("#alert_template").remove();
                }, 5000);

                if ($partnerStatus != null) {
                    $partnerStatus.text($partnerName);
                }
                isMatched = true;
            }

            if (isMatched == false) {
                $waitingContainer.fadeIn(500);
                $chatContainer.hide();
                $usernameContainer.hide();
            } else {
                $chatContainer.fadeIn(500);
                $waitingContainer.hide();
                $usernameContainer.hide();
            }
        }
    });
});