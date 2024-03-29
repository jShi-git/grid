var currentElement = null;
/**
 * 拖放使用easydrag插件扩展
 * 
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
(function($){

    var isMouseDown    = false;
    var dropCallbacks = {};
    var dragCallbacks = {};

    var lastMouseX;
    var lastMouseY;
    var lastElemTop;
    var lastElemLeft;

    var container;

    $.getMousePosition = function(e){
        var posx = 0;
        var posy = 0;

        if (!e) var e = window.event;

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop  + document.documentElement.scrollTop;
        }

        return { 'x': posx, 'y': posy };
    }

    $.updatePosition = function(e) {
        var pos = $.getMousePosition(e);

        var spanX = (pos.x - lastMouseX);
        var spanY = (pos.y - lastMouseY);

        var targetY = lastElemTop + spanY;
        var targetX = lastElemLeft + spanX;

        //拖动范围在container内部
        if(container) {
	        if(targetY <= 1) {
	        	targetY = 1;
	        	lastElemTop = 1;
	        }
	        if(targetX <= 1) {
	        	targetX = 1;
	        	lastElemLeft = 1;
	        }
        	var maxX = $(container).width() - ($(currentElement).width() + 3);
        	var maxY = $(container).height() - ($(currentElement).height() + 3);
        	if(targetY >= maxY) {
	        	targetY = maxY;
	        	lastElemTop = maxY;
	        }
	        if(targetX >= maxX) {
	        	targetX = maxX;
	        	lastElemLeft = maxX;
	        }
        }

        $(currentElement).css("top",  targetY);
        $(currentElement).css("left", targetX);
    }

    $(document).mousemove(function(e){
        if(isMouseDown){
            $.updatePosition(e);
            if(dragCallbacks[currentElement.id] != undefined){
                dragCallbacks[currentElement.id](e);
            }

            return false;
        }
    });

    $(document).mouseup(function(e){
        if(isMouseDown){
            isMouseDown = false;
            if(dropCallbacks[currentElement.id] != undefined){
                dropCallbacks[currentElement.id](e);
            }
            return false;
        }
    });

    $.fn.ondrag = function(callback){
        return this.each(function(){
            dragCallbacks[this.id] = callback;
        });
    }

    $.fn.ondrop = function(callback){
        return this.each(function(){
            dropCallbacks[this.id] = callback;
        });
    }

    $.fn.easydrag = function(contBox, allowBubbling, handle_ids){
    	if(typeof contBox != "undefined") {
    		container = $(contBox);
    	}

        return this.each(function(){

            if(undefined == this.id) this.id = 'easydrag'+time();

            if (handle_ids) {
                // 修改鼠标光标为移动的形状
                for (var i=0; i<handle_ids.length; i++) {
                    $("#" + handle_ids[i]).css("cursor", "move");
                }
            } else {
                $(this).css("cursor", "move");
            }

            $(this).mousedown(function(e){
                if (handle_ids) {
                    // 判断是否是在拖动某个 handle
                    var srcElement;
                    if (e)
                        srcElement = e.srcElement;
                    else
                        srcElement = window.event.srcElement;
                    
                    var exists = false;
                    if (srcElement.id != undefined) {
                        for (var i=0; i<handle_ids.length; i++) {
                            if (handle_ids[i] == srcElement.id) {
                                exists = true;
                                break;
                            }
                        }
                    }
                    if (!exists)
                        return false;
                }
                $(this).css("position", "absolute");
                $(this).css("z-index", "10001");

                isMouseDown    = true;
                currentElement = this;

                var pos    = $.getMousePosition(e);
                lastMouseX = pos.x;
                lastMouseY = pos.y;

                lastElemTop  = this.offsetTop;
                lastElemLeft = this.offsetLeft;

                $.updatePosition(e);

                return allowBubbling ? true : false;
            });
        });
    }

})(jQuery);



/**
 * 背包格子处理
 * @param  {[type]} ) {	$("img").easydrag($(".wrapper"));	var gridW [description]
 * @return {[type]}   [description]
 */
$(function() {
	$("img").easydrag($(".wrapper"));
	var gridW = gridH = 42;
	$("img").ondrop(function(e) {
		//起点格子
		var ox = ($(currentElement).parent().index() % 4) + 1;
		var oy = Math.ceil(($(currentElement).parent().index() + 1) / 4);

		//目标格子
		var position = $(currentElement).position();
		var tx = Math.round(position.left / gridW) + 1;
		var ty = Math.round(position.top / gridH) + 1;

		//两个格子下标
		var sourceIndex = (oy-1) * 4 + (ox - 1);
		var targetIndex = (ty-1) * 4 + (tx - 1);

		//两个格子的坐标
		var sPos = {left:((ox-1) * 40) + ox * 2-1,top:((oy-1) * 40) + oy * 2-1};
		var tPos = {left:((tx-1) * 40) + tx * 2-1,top:((ty-1) * 40) + ty * 2-1};

		//两个格子
		var source = $(".wrapper li").eq(sourceIndex);
		var target = $(".wrapper li").eq(targetIndex);

		if($(target).has("img").length) {
			//目标格子的图片落入起点格子
			var tImg = $(target).find("img").eq(0);
			$(tImg).css({position:"absolute","z-index":10000,left:tPos.left,top:tPos.top}).animate(sPos, 120, function() {
				$(tImg).appendTo($(source));
			});
			//起点格子图片落入目标格子
			$(currentElement).animate(tPos, 120, function() {
				$(currentElement).appendTo($(target));
			});
			
		} else {
			//图片落入空白格子
			$(currentElement).animate(tPos, 120, function() {
				$(currentElement).appendTo($(target));
			});
		}
		//还原所有图片状态
		setTimeout(function() {
			$(".wrapper li img").css({"z-index":1});
		}, 130);
	});
});