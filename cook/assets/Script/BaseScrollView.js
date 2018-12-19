import Global from "./Global";

cc.Class({
    extends: cc.Component,

    properties: {
        itemPrefab: cc.Prefab, // 预制件
        content: cc.Node, // 内容节点
        mask: cc.Node, // 遮罩节点
        itemHeight: 100,// 节点高度
        itemWidth: 100,// 节点宽度
        len: 100, // 总数量
        vertical: true, // 垂直渲染
        reverseDir:true, // 反向
    },

    // LIFE-CYCLE CALLBACKS:

    init(start = 0, itemSetter) {

        this.dir = "x";
        if(this.vertical){
            this.dir = "y"
        }

        this.itemSetter = itemSetter;

        // 垂直列表
        if (this.vertical) {
            // 设置滚动列表高度
            this.content.height = this.len * this.itemHeight;
            //this.node.height = this.content.height;
            // 滚动到底部时的Y值
            this.bottomY = (this.content.height - this.mask.height) / 2;
            // 默认显示底部
            this.content.y = this.bottomY - start * this.itemHeight;
            // 同屏显示个数
            this.size = Math.round(this.mask.height / this.itemHeight)
        }
        // 水平列表
        else {
            // 设置滚动列表宽度
            this.content.width = this.len * this.itemWidth;
            this.node.width = this.content.width;
            // 滚动到左边时的X值
            this.leftX = (this.content.width - this.mask.width) / 2;
            // 默认显示左边
            this.content.x = this.leftX -  start * this.itemWidth;
            // 同屏显示个数
            this.size = Math.round(this.mask.width / this.itemWidth)
        }

        let bottomY = this.content.height / 2 - this.itemHeight / 2;
        let leftX = this.content.width / 2 - this.itemWidth / 2;

        this.pool = new cc.NodePool();
        for (let _i = 0; _i < this.size + 4; _i++) {
            let _node = cc.instantiate(this.itemPrefab);
            this.pool.put(_node)
        }

        // 坐标
        this.items = [];
        for (let i = 0; i < this.len; i++) {
            let o = {};
            o.x = -leftX + i * this.itemWidth;
            o.y = -bottomY + i * this.itemHeight;
            this.items.push(o)
        }

        for (let i = 0; i < this.size + 2; i++) {

            let _node = null;
            if (this.pool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
                _node = this.pool.get();
            } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
                _node = cc.instantiate(this.itemPrefab);
            }
            _node.active = false;
            _node.parent = this.content;

            // 动态设置位置
            if (this.vertical) {
                _node.setPosition(0, -bottomY + i * this.itemHeight)
            } else {
                _node.setPosition(-leftX + i * this.itemWidth, 0)
            }
            // 执行回调
            typeof itemSetter === "function" && itemSetter(_node, i);
        }

        // 监听滚动
        this.node.on("scrolling", this.onScroll, this)
        this._startIndex = start;
        this.content.children.forEach((e, i) => {
            e.active = true;
        })

        // 设置渲染初始点
        if (start) {
            this.setList(start);
        }
    },

    onScroll() {
        this.renderList();
    },

    setList(start) {
        for (let i = 1; i <= this.size; i++) {
            this.content.children[i][this.dir] = this.items[start + i - 1][this.dir];
            this.itemSetter(this.content.children[i], start + i - 1);
        }
    },

    // 列表渲染 只渲染处于当前可视化区域的列表
    renderList() {
        let start;
        if (this.vertical) {
            start = Math.ceil((this.bottomY - this.content.y) / this.itemHeight) - 1
        } else {
            start = Math.ceil((this.leftX - this.content.x) / this.itemWidth) - 1
        }
        if (start <= 0) {
            start = 0;
        }

        if (start > this._startIndex) {
            start = this._startIndex + 1;
        } else if (start < this._startIndex) {
            start = this._startIndex - 1;
        }
        //console.log("start:", start, " this._startIndex", this._startIndex)
        if (start === this._startIndex || start > this.len - this.size - 1) {
            return;
        }

        let stop = start + this.size;
        if (start > this._startIndex) {
            if (this.content.childrenCount) {
                this.pool.put(this.content.children[0])
            }
            let _node = this.pool.get();
            this.content.addChild(_node);
            _node[this.dir] = this.items[stop][this.dir];
            this.itemSetter(_node, stop);
        } else {
            this.pool.put(this.content.children[this.content.childrenCount - 1])
            let _node = this.pool.get();
            this.content.insertChild(_node, 0);
            _node[this.dir] = this.items[start][this.dir];
            this.itemSetter(_node, start);
        }
        this._startIndex = start;
    },

    // update (dt) {},
});
