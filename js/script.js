var commentUrl = 'api/comment-101.json',
contentUrl = 'api/content-101.json';

var commentDict = [];

function fetchComment() {
    $.get(commentUrl, function (response) {
        var list = $.parseJSON(response).list;
        $.each(list, function (index, comment) {
            commentDict[comment.id] = comment;
            //is comment element exist?
            if ($('#comment-id-' + comment.id)[0] === undefined) {
                //creat comment
                $('#comment-list-frame').append(makeComment(comment));
                $('#comment-id-' + comment.id).click(function() {
                    showComment($(this).attr('data-id'));
                });
                //make it html object but not trigger redraw to reduce render cost
                var balloon = $(makeBalloon(comment));
                balloon.css({
                    "left": comment.x1 * 100 + '%',
                    "top": comment.y1 * 100 + '%',
                    "width": (comment.x2 - comment.x1) * 100 + '%',
                    "height": (comment.y2 - comment.y1) * 100 + '%'
                });
                //maybe better method
                balloon.on({
                    mouseover: function (e) {
                        $(this).fadeTo(300,0.2);
                    },
                    mouseout: function (e) {
                        $(this).fadeTo(300,1);
                    },
                    mousedown: function (e) {
                        mouseDown = true;
                        selected = {};
                        selected.id = $(this).attr('data-id');
                        console.log(selected.id);
                        selected.left = e.pageX;
                        selected.top = e.pageY - $(window).scrollTop();
                    },
                    mousemove: function (e) {
                        if (mouseDown) {
                            var
                            x1 = selected.left,
                            y1 = selected.top,
                            x2 = e.pageX,
                            y2 = e.pageY - $(window).scrollTop();
                            
                            $('#selected').css({
                                "left": Math.min(x1, x2),
                                "top": Math.min(y1, y2),
                                "width": Math.abs(x2 - x1),
                                "height": Math.abs(y2 - y1)
                            });
                            
                            $('#selected').show();
                        }
                    },
                    mouseup: function (e) {
                        mouseDown = false;
                        
                        if ($('#selected').width() * $('#selected').height() <= 100) {
                            if(typeof selected.id != 'undefined') {
                                showComment(selected.id);
                            } else {
                                cancelComment();
                            }
                            selected = {};
                            return;
                        }
                        
                        newComment();
                    }
                });
                //finally append it
                $('#player-scroll').append(balloon);
            }
        });
    });
    
    function makeComment(c) {
        var html = '';
        html = html.concat('<div class="comment" id="comment-id-' + c.id + '" data-id="' + c.id +'">');
        html = html.concat(c.content);
        html = html.concat('</div>');
        return html;
    }
    
    function makeBalloon(c) {
        var html = '';
        html = html.concat('<div class="balloon-laid" id="balloon-laid-id-' + c.id + '" data-id="' + c.id +'">');
        html = html.concat(c.content);
        html = html.concat('</div>');
        return html;
    }
}

function fetchContent() {
    $.get(contentUrl, function (response) {
        var content = $.parseJSON(response).content;
        $.each(content, function (index, content) {
            //is content element exist?
            if ($('#content-page-' + content.page)[0] === undefined) {
                //creat content
                $('#player-scroll').append(makeContent(content));
            }
        });
    });
    
    function makeContent(c) {
        var html = '';
        html = html.concat('<div class="content">');
        html = html.concat('<img id="content-page-' + c.page + '" src="' + c.url + '" class="content-pic">');
        html = html.concat('</div>');
        return html;
    }
}

function showComment(id) {
    $("html,body").animate({scrollTop:$('#balloon-laid-id-' + id).offset().top - 135}, function () {
        $('#a-comment').html(commentDict[id].content);
        $('#selected').hide(300);
        $('#comment-detail-frame').css({"-webkit-transform": "translateY(0px)"});
    });
}

function newComment() {
    $('#comment-detail-frame').css({
        "-webkit-transform": "translateY(" + ( -$('#a-comment').height()) + "px)"
    });
    
    var selectedSize = {height: $("#selected").height(), width: $("#selected").width()},
    playerSize = {height: $("#player-scroll").height(), width: $("#player-scroll").width()},
    selectedPos = $('#selected').offset(),
    playerPos = $("#player-scroll").offset();

    var x1 = (selectedPos.left - playerPos.left) / playerSize.width;
    var x2 = (selectedPos.left - playerPos.left + selectedSize.width) / playerSize.width;
    var y1 = (selectedPos.top - playerPos.top) / playerSize.height;
    var y2 = (selectedPos.top - playerPos.top + selectedSize.height) / playerSize.height;

    console.log('"x1": ' + x1 + ',"x2": ' + x2 + ',"y1": ' + y1 + ',"y2": ' + y2);
}

function cancelComment() {
    $('#selected').hide(300);
    if($('#comment-detail-frame').attr('style') != '') {
        $('#a-comment').html('_Direct Comments_');
        $('#comment-detail-frame').attr('style','');
    }
}
    
var selected = {};
var mouseDown = false;

$(document).ready(function () {
    //Use queue(deferred) instead?
    fetchContent();
    
    fetchComment();

    //Event
    $('#cancel-comment').on("click", cancelComment);
    
    $(window).on({scroll: cancelComment, resize: cancelComment});
    
    $('[data-toggle=offcanvas]').on("click", function () {
        $('.row-offcanvas').toggleClass('active');
    });
    
    $('#canvas-frame').on({
        mousedown: function (e) {
            mouseDown = true;
            selected = {};
            selected.left = e.pageX;
            selected.top = e.pageY - $(window).scrollTop();
        },
        mousemove: function (e) {
            if (mouseDown) {
                var
                x1 = selected.left,
                y1 = selected.top,
                x2 = e.pageX,
                y2 = e.pageY - $(window).scrollTop();
                
                $('#selected').css({
                    "left": Math.min(x1, x2),
                    "top": Math.min(y1, y2),
                    "width": Math.abs(x2 - x1),
                    "height": Math.abs(y2 - y1)
                });
                
                $('#selected').show();
            }
        },
        mouseup: function (e) {
            mouseDown = false;
            
            if ($('#selected').width() * $('#selected').height() <= 100) {
                if(typeof selected.id != 'undefined') {
                    showComment(selected.id);
                } else {
                    cancelComment();
                }
                selected = {};
                return;
            }
            
            newComment();
        }
    });
});
