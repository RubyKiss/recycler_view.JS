
/**
 * 
 * @param {*} container  装列表项的容器
 * @param {*} template   项的模板，按照page_len克隆出来
 * @param {*} bindview_callback  调用update执行
 * @param {*} list  数据，动态也支持
 * @param {*} item_height  
 * @param {*} page_len 
 */
window.recycler_view = function(container,template,bindview_callback,list,item_height,page_len){
    
    this.curpage = -1;
    this.item_height = item_height;
    this.page_len = page_len;
    this._container =  container;
    this._template = template;
    this._bindview_callback = bindview_callback; //bindview   (node,firstload,index)
    this._list = list;
    this._updated = false;

    this.node_list = {};

    //设置新的列表，可以是动态的。
    this.setList = function(list){
        this._list = list
    }

    //更新页面 forcereload 强制更新   page 显示第几页
    this.update = function(page=false,forcereload=false){
        var pageindex = (page*1);

        if(this.curpage==pageindex && forcereload ==false){
            return
        }
        var len = Math.ceil(this._list.length/this.page_len);
        if(pageindex>len){
            pageindex=len
            if( this.curpage==pageindex && forcereload ==false){//超出不更新
                return
            }
        }
        this.curpage = pageindex


        var top = (pageindex-1)*(this.item_height*1)*(this.page_len*1);
        this._container.style.paddingTop = top >0 ? top+"px" : "0px";
        var bottom =(this.item_height*1)*(this._list.length - ((pageindex+1)*(this.page_len*1)));
        this._container.style.paddingBottom = bottom >0 ? bottom+"px" : "0px";
        for(var i=0;i<this.page_len+this.page_len;i++){
            var index = (pageindex-1)*(this.page_len*1) +i
            if(this._updated==false){
                var node = this._template.cloneNode(true);
                this.node_list[i]=node
                this._container.appendChild(node)
            }
            if(this._list[index]){
                this.node_list[i].style.display="";
                this._bindview_callback(this.node_list[i],this._updated,index,this._list);
            }else{
                this.node_list[i].style.display="none";
            }
        }
        this._updated= true;
    }

    //一页的高度（滚动使用）
    this.pageHeight = function(){ 
        return this.page_len*this.item_height;
    }
    
}