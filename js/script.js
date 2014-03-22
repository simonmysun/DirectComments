commentUrl = '/api/comment-101.json';
contentUrl = '/api/content-101.json';

var commentList = [];
var commentDict = [];
var content;

var selected = {};
var mouseDown;
var contentHeight;
var contentWidth;

function makeComment(c) {
    var html = '';
    html = html.concat('<div class="comment" id="comment-id-' + c.id + '" data-id="' + c.id + '">');
    html = html.concat(c.content);
    html = html.concat('</div>');
    return html;
}

function makeBalloon(c) {
    var html = '';
    html = html.concat('<div class="balloon-laid" id="balloon-laid-id-' + c.id + '" data-id="' + c.id + '">');
    html = html.concat(c.content);
    html = html.concat('</div>');
    return html;
}

function fetchComment() {
    commentList = $.parseJSON($.ajax({url:commentUrl,async:false}).responseText).list;
    for(x in commentList) {
	if($('#comment-id-' + commentList[x].id)[0] === undefined) {
	    $('#comment-list-frame').append(makeComment(commentList[x]));
	    $('#player-scroll').append(makeBalloon(commentList[x]));
	    makeCanvas('#balloon-laid-id-' + commentList[x].id);
            $('#comment-id-' + commentList[x].id).click(function() {
                showComment($(this).attr('data-id'));
                scrollTo($('#balloon-laid-id-' + $(this).attr('data-id')));
            });
            commentDict[commentList[x].id] = commentList[x];
	}
    }
    makeCanvas('#canvas-frame');
    reDraw();
}

function makeContent(c) {
    var html = '';
    html = html.concat('<div class="content">')
    html = html.concat('<img id="content-page-' + c.page + '" src="' + c.url + '" class="content-pic">');
    html = html.concat('</div>');
    return html;
}

function fetchContent() {
    content = $.parseJSON($.ajax({url:contentUrl,async:false}).responseText);
    for(x in content.content) {
	if($('#content-page-' + content.content[x].page)[0] === undefined) {
	    $('#player-scroll').append(makeContent(content.content[x]));
	}
    }
    fetchComment();
}

function reDraw() {
    $("#comment-frame").css({
	"height": $(window).height() - 162
	,"width": $('#comment-row').width()
    });
    $("#canvas-frame").css({
	"height": $(window).height() - 162
	,"width": $('#content-row').width()
    });
    contentHeight = $('#player-scroll').height();
    contentWidth = $('#player-scroll').width();
    for(x in content.content) {
	$('#content-page-' + content.content[x].page).height($('#content-page-' + content.content[x].page).width() * content.content[x].ratio);
    }
    for(x in commentList) {
	var b = $('#balloon-laid-id-' + commentList[x].id);
	b.css({
	    "left": commentList[x].x1 * contentWidth + 'px'
	    ,"top": commentList[x].y1 * contentHeight + 'px'
	    ,"width": ((commentList[x].x2 - commentList[x].x1) * contentWidth) + 'px'
	    ,"height": ((commentList[x].y2 - commentList[x].y1) * contentHeight) + 'px'
	});
    }
}

function newComment() {
    $('#comment-detail-frame').css({"-webkit-transform": "translateY(" + ( - $('#a-comment').height() ) + "px)"});
    var s = $('#selected');
    var x1 = (parseInt(s.css("left")) - $('#canvas-frame')[0].offsetLeft)/ contentWidth;
    var x2 = (parseInt(s.css("left")) + parseInt(s.css("width")) - $('#canvas-frame')[0].offsetLeft) / contentWidth;
    var y1 = (parseInt(s.css("top")) + parseInt($(window).scrollTop()) - $('#canvas-frame')[0].offsetTop) / contentHeight;
    var y2 = (parseInt(s.css("top")) + parseInt(s.css("height")) + parseInt($(window).scrollTop()) - $('#canvas-frame')[0].offsetTop) / contentHeight;
    //console.log(',"x1": ' + x1 + ',"x2": ' + x2 + ',"y1": ' + y1 + ',"y2": ' + y2);
}

function showComment(id) {
    if(id == undefined) {
        $('#a-comment').html('_Direct Comment_');
        $('#selected').hide(300);
        $('#comment-detail-frame').css({"-webkit-transform": "translateY(0px)"});
    } else {
        $('#a-comment').html(commentDict[id].content);
        $('#selected').hide(300);
        $('#comment-detail-frame').css({"-webkit-transform": "translateY(0px)"});
    }
}

function makeCanvas(x) {
    $(x).mousemove(function(e) {
	if(mouseDown == 1) {
	    var x1, y1, x2, y2;
	    x1 = selected.left;
	    y1 = selected.top;
	    x2 = e.pageX;
	    y2 = e.pageY - $(window).scrollTop();
	    $('#selected').css({"left": Math.min(x1, x2), "top": Math.min(y1, y2), "width": Math.abs(x2 - x1), "height": Math.abs(y2 - y1)});
	    $('#selected').show();
	}
    });

    $(x).mouseup(function(e){
	mouseDown = 0;
	if($('#selected').width() * $('#selected').height() <= 100) {
	    if($(selected.item)[0] != $('#canvas-frame')[0]) {
                showComment($(selected.item).attr('data-id'));
	    } else {
	        showComment();
            }
	    selected = {};
	    return;
	}
	newComment();
    });
    
    $(x).mousedown(function(e) {
	mouseDown = 1;
	selected.item = $(x);
	selected.left = e.pageX;
	selected.top = e.pageY - $(window).scrollTop();
	var x1, y1, x2, y2;
	x1 = selected.left;
	y1 = selected.top;
	x2 = e.pageX;
	y2 = e.pageY - $(window).scrollTop();
	$('#selected').css({"left": Math.min(x1, x2), "top": Math.min(y1, y2), "width": Math.abs(x2 - x1), "height": Math.abs(y2 - y1)});
    });
    
    $(x).attr({
	unselectable:"on"
	,style:"-moz-user-select:none;-webkit-user-select:none;"
	,onselectstart:"return false;"
    });
}

function scrollTo(d)  {
    var pos = $(d).offset().top - 135;
    $("html,body").animate({scrollTop:pos});
}

function doAfterLoad() {
    fetchContent();
    $(window).resize(function() {
	setTimeout(reDraw, 100);
	showComment();
    });

    $(window).scroll(function() {
    });

    $('#cancel-comment').click(showComment);

    $('[data-toggle=offcanvas]').click(function() {
	$('.row-offcanvas').toggleClass('active');
    });
}

window.onload = function() {
    $(document).ready(function() {
	doAfterLoad();
    });
};
