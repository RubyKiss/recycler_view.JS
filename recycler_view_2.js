
/**
 * 
 * @param {*} container  装列表项的容器
 * @param {*} template   项的模板，按照page_len克隆出来
 * @param {*} bindview_callback  调用update执行
 * @param {*} list  数据，动态也支持
 * @param {*} item_height  
 * @param {*} page_len 
 * template 模板所在的父元素必须是height:0;overflow: hidden;  用于计算一个item的高度
 */
window.recycler_view = function(scrollcontainer,container,template,node_len,list,render_call){
    this.node_len = node_len
    this.data = []
    this.height_list = []
    this.top_list = []
    this.node_list = []
    
    this._render_call = render_call
    this._template = template
    this._container = container

    this._last_scrolltop = 0

    this._touchIndex = 0

    this.render_type = {
        pushData:1,
        updateData:2,
        init:3,
        scroll:4
    }

    function scroll_func(ev){
        var that_scrollTop = this.scrollTop
        // var that_ContainerHeight = this.offsetHeight
        this.instance._last_scrolltop = that_scrollTop
        var index = 0
        var j=0
        var toppadding = -1
        var bottompadding = 0

        var forindex = this._touchIndex - this.instance.node_len >0 ? this._touchIndex - this.instance.node_len : 0
        for(var i=forindex;i<this.instance.top_list.length;i++){
            var bottom = this.instance.top_list[i]+this.instance.height_list[i]
            // var top = this.instance.top_list[i]
            if(((bottom - that_scrollTop >=0 )) && index < this.instance.node_list.length){
                if(toppadding==-1){
                    toppadding = this.instance.top_list[i]
                }
                this.instance._render_call(this.instance.data[i],this.instance.node_list[index],this.instance.render_type.scroll)
                this.instance.node_list[index]._tag_index = i
                index++
            }
            if(index >= this.instance.node_list.length){
                break
            }
            j++
        }
        if(index<this.instance.node_list.length){
            for(var i=index;i<this.instance.node_list.length;i++){
                this.instance.node_list[i].style.display="none"
            }
            for(var i=0;i<index;i++){
                this.instance.node_list[i].style.display=""
            }
        }
        if(j>=this.instance.data.length){
            j=this.instance.data.length-1
        }
        bottompadding = this.instance.top_list[this.instance.top_list.length-1] - this.instance.top_list[j]
        if(toppadding>=0){
            this.instance._container.style.paddingTop = toppadding+"px"
        }
        if(bottompadding>=0){
            this.instance._container.style.paddingBottom = bottompadding+"px"
        }
    }

    scrollcontainer.instance = this
    scrollcontainer.addEventListener("scroll",scroll_func)
    scrollcontainer.scrollfunc = scroll_func
    this.compute_height_node = template

    /**初始化数据 */
    this.init = function(list){
        this.data = list
        var top = 0
        for(var i=0;i<this.data.length;i++){
            var curdata = this.data[i]
            this._render_call(curdata,this.compute_height_node,this.render_type.init)
            this.height_list[i]= this.compute_height_node.offsetHeight
            this.top_list[i]=top
            top+=this.compute_height_node.offsetHeight

            if(i+1 >node_len){
                continue;
            }
            var node =  this.compute_height_node.cloneNode(true)
            node.addEventListener("touchstart",function(ev){
                this.instance._touchIndex = this._tag_index
            })
            
            node.instance = this
            node._tag_index = i
            this.node_list [i] = node
            // this._render_call(curdata,node,false)
            this._container.appendChild(node)
        }
    }
    this.init(list)

    /**
     * 插入数据进行渲染
     * @param {*} x 
     */
    this.pushData = function(x){
        if(x.length){
            for(var i=0;i<x.length;i++){
                this._render_call(x[i],this.compute_height_node,this.render_type.pushData)
                var last = this.data.length-1
                this.top_list[last+1]=this.top_list[last] + this.height_list[last]
                this.height_list[last+1] = this.compute_height_node.offsetHeight
                this.data.push(x[i])
            }
        }else{
            this._render_call(x,this.compute_height_node,this.render_type.pushData)
            var last = this.data.length-1
            this.top_list[last+1]=this.top_list[last] + this.height_list[last]
            this.height_list[last+1] = this.compute_height_node.offsetHeight
            this.data.push(x)
        }
        scrollcontainer.scrollfunc(null)
    }
    /**
     * 更新某个item的信息到实例
     * @param {*} index 
     */
    this.updateItem = function(index){
        for(var i=0;i<this.node_list.length;i++){
            if(this.node_list[i]._tag_index==index){
                var new_height = this.node_list[i].offsetHeight
                if(this.height_list[index]!=new_height){
                    var px = new_height - this.height_list[index]
                    this.height_list[index]=new_height
                    for(var i=index+1;i<this.top_list.length;i++){
                        this.top_list[i] +=px
                    }
                }
                break
            }
        }
    }
    /**
     * 切换某个item的数据
     * @param {*} index 
     * @param {*} x 
     */
    this.updateData = function(index,x){
        var update = -1
        for(var i=0;i<this.node_list.length;i++){
            if(this.node_list[i]._tag_index==index){
                update = i
            }
        }
        if(!this.data[index]){
            return false
        }
        this._render_call(x, update!=-1 ? this.node_list[update] : this.compute_height_node,this.render_type.updateData)
        var new_height = this.compute_height_node.offsetHeight
        if(this.height_list[index]!=new_height){
            var px = new_height - this.height_list[index]
            this.height_list[index]=new_height
            for(var i=index+1;i<this.top_list.length;i++){
                this.top_list[i] +=px
            }
        }
        this.data[index]=x
        return true
    }

}