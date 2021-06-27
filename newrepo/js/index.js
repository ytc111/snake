
var sw=20,	//一个方块的宽度
    sh=20,	//一个方块的高度
    tr=30,	//行数
    td=30;	//列数
console.log();

var snake = null; // 蛇的实例
var food = null;  // 食物的实例
var game = null;  // 游戏实例

// 方块构造函数
function Square(x,y,classname) {
    //x,y 为坐标
    // 0, 0 -- > 0,0  乘以20关系
    // 20, 0 -- > 1,0
    // 40, 0 -- > 2,0
    this.x = x * sw;
    this.y = y * sh;
    this.class = classname;

    // 小方块对应的dom元素
    this.viewContent = document.createElement("div");
    this.viewContent.className = this.class;
    // 小方块的父级元素
    this.parent = document.getElementById("snakeWrap");
}
// 创建小方块DOM,并插入到页面
Square.prototype.create = function() {
    this.viewContent.style.position = "absolute";
    this.viewContent.style.width = sw + "px";
    this.viewContent.style.height = sh + "px";
    this.viewContent.style.left = this.x + "px";
    this.viewContent.style.top = this.y + "px";
    this.parent.appendChild(this.viewContent);
}
// 删除小方块
Square.prototype.remove = function() {
    this.parent.removeChild(this.viewContent);
}

// 蛇构造函数
function Snake() {
    this.head = null; //蛇头
    this.tail = null; //蛇尾
    this.pos = []; //存储蛇身上每一个小方块的位置信息

    // 存储蛇走的方向,用一个对象表示
    this.directionNum = {
        // 向左
        left: {
            x: -1,
            y: 0,
            rotate: 180
        },
        // 向右
        right: {
            x: 1,
            y: 0,
            rotate: 0
        },
        // 向上
        up:{
            x: 0,
            y: -1,
            rotate: -90
        },
        // 向下
        down: {
            x: 0,
            y: 1,
            rotate: 90
        }
    }
}
// 初始化蛇
Snake.prototype.init = function() {
    // 创建蛇头
    var snakeHead = new Square(2,0,"snakeHead");
    snakeHead.create();
    this.head = snakeHead; //存储蛇头
    this.pos.push([2,0]); //存储蛇头的位置信息

    // 创建蛇的第一节身体
    var snakeBody1 = new Square(1,0,"snakeBody");
    snakeBody1.create();
    this.pos.push([1,0]); //存储蛇身体1的位置

    // 创建蛇的第二节身体
    var snakeBody2 = new Square(0,0,"snakeBody");
    snakeBody2.create();
    this.tail = snakeBody2; //存储蛇尾信息
    this.pos.push([0,0]); //存储蛇身体的位置

    // 将蛇的身体各个部分使用双向链表链接起来(形成链表关系)
    // prev 上一个 next 下一个
    snakeHead.prev = null; //蛇头没有上一个,所以null
    snakeHead.next = snakeBody1;

    snakeBody1.prev = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.prev = snakeBody1;
    snakeBody2.next = null;//蛇尾没有下一个,所以null

    // 给蛇添加一条属性，用来表示蛇走的方向 默认让蛇往右走
    this.direction = this.directionNum.right;
}
/**
 * 该方法用来获取蛇头的下一个元素,要根据不同元素做相应的操作
 */
Snake.prototype.getNextPos = function() {
    //蛇头要走的下一个点的坐标
    var nextPos = [
        this.head.x/20 + this.direction.x,
        this.head.y/20 + this.direction.y
    ];

    // 位置判断
    // 下一个点是自己,代表撞到了自己,游戏结束
    var isSelf = false; //是否撞到自己
    this.pos.forEach(function(value) {
        // 如果nextPos里的数据恒等于位置数组里的某一个,则代表撞到了自己
        if(value[0] == nextPos[0] && value[1] == nextPos[1]) {
            isSelf = true;
        }
    });
    if(isSelf) {
        console.log("撞到自己了!");
        this.strategies.die.call(this);
        return;
    }

    // 下一个点是围墙 代表撞墙 游戏结束
    if(nextPos[0] < 0 || nextPos[0] > td - 1 || nextPos[1] < 0 || nextPos[1] > tr - 1){
        console.log("撞墙!");
        this.strategies.die.call(this);
        return;
    }
    // 下一个点是食物,则吃掉食物
    if(food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
        this.strategies.eat.call(this);
    }
    // 下一个点什么也不是,则正常走
    this.strategies.move.call(this); //不修改this指向的话,this默认指向this.strategies

}
/**
 * 碰撞检测之后要做的事,不止一个,所以用对象表示
 */
Snake.prototype.strategies = {
    // 移动
    /**
     * 移动的核心逻辑: 掐头去尾
     * 先删除蛇头,在创建一个新的蛇身体,将新的身体放到原来蛇头的位置
     * 再新创建蛇头,放到原来蛇头下一个要走到的位置
     * 再把蛇尾去掉,愿蛇尾前的一个元素成为蛇尾
     */
    move: function(format) {
        //console.log("move");
        // 创建一个新的蛇的身体 位置是原蛇头的位置
        var newBody = new Square(this.head.x/sh, this.head.y/sw, "snakeBody");
        // 更新链表关系
        newBody.next = this.head.next; //新的body的下一个元素是原蛇头的下一个
        newBody.next.prev = newBody; // 原蛇头下一个元素的前一个是newBody
        newBody.prev = null; // 目前newBody的上一个为空
        
        this.head.remove(); //删掉旧的蛇头
        newBody.create();

        // 创建新蛇头 新蛇头的位置是旧蛇头下一个要走到的位置
        var newHead = new Square(this.head.x/sh + this.direction.x,this.head.y/sw + this.direction.y,"snakeHead");
        // 更新链表关系
        newHead.next = newBody;
        newBody.prev = newHead;
        newHead.prev = null;
        newHead.viewContent.style.transform = "rotate("+this.direction.rotate+"deg)";
        newHead.create();

        // 更新蛇身上的坐标
        // 实际上是将新蛇头的位置插入数组最前面
        this.pos.splice(0,0,[this.head.x/sh + this.direction.x,this.head.y/sw + this.direction.y]); 
        // 更新蛇头
        this.head = newHead;

        // 如果format的值为false,则表示需要删除蛇尾(吃食物之外的操作)
        if(!format) {
            this.tail.remove(); //删除蛇尾
            this.tail = this.tail.prev; //新蛇尾是原来旧蛇尾的上一个
            this.pos.pop();
        }
    },
    // 吃
    eat: function() {
        // console.log("eat")
        this.strategies.move.call(this,true);
        game.score++;
        createFood();
    },
    // 游戏结束，蛇死亡
    die: function() {
        console.log("die");
        game.over();
    }
}
snake = new Snake();


/**
 * Game构造函数
 */
function Game() {
    this.timer = null;
    this.score = 0; //游戏得分
}
/**
 * 初始化游戏
 */
Game.prototype.init = function() {
    snake.init();
    createFood();
    /**
     * 
     * 根据用户的方向键控制蛇的方向 
     */
    document.onkeydown = function(ev) {
        ev = ev || window.event;
        // 当用户按下向左时,蛇不能正在向右走
        if(ev.keyCode == 37 && snake.direction != snake.directionNum.right) { //左
            snake.direction = snake.directionNum.left;
        }else if(ev.keyCode == 39 && snake.direction != snake.directionNum.left) { //右
            snake.direction = snake.directionNum.right;
        }else if(ev.keyCode == 38 && snake.direction != snake.directionNum.down) { //上
            snake.direction = snake.directionNum.up;
        }else if(ev.keyCode == 40 && snake.direction != snake.directionNum.up) { // 下
            snake.direction = snake.directionNum.down;
        }
    }
    this.start();
}
/**
 * 开启游戏
 */
Game.prototype.start = function() {
    this.timer = setInterval(function(){
        snake.getNextPos();
    },200);
}
/**
 * 暂停游戏
 */
Game.prototype.pause = function() {
    clearInterval(this.timer);
}
/**
 * 游戏结束
 */
Game.prototype.over = function() {
    clearInterval(this.timer);
    alert("您的得分为:" + game.score);
    var snakeWrap = document.querySelector("#snakeWrap");
    // 清楚容器里的蛇和食物的dom元素
    snakeWrap.innerHTML = "";
    // 初始化游戏和蛇
    snake = new Snake();
    game = new Game();
    startBtn.parentNode.style.display = "block";
}
game = new Game();
var startBtn = document.querySelector(".stratBtn button");
var pauseBtn = document.querySelector(".pauseBtn button");
var snakeWrap = document.getElementById("snakeWrap");
startBtn.onclick = function(){
    this.parentNode.style.display = "none";
    game.init();
}
snakeWrap.onclick = function() {
    pauseBtn.parentNode.style.display = "block";
    game.pause();
}
pauseBtn.onclick = function() {
    pauseBtn.parentNode.style.display = "none";
    game.start();
}
/**
 * 生成食物函数
 */
function createFood() {
    // 食物小方块随机坐标
    var x,y;
    // 跳出循环的条件,true表示食物在蛇的身上,重新循环生成随机数
    // false表示食物没生成在蛇身上,跳出循环
    var include = true;
    while(include) {
        x = Math.round(Math.random()*(td-1));
        y = Math.round(Math.random()*(tr-1));
        snake.pos.forEach(function(value) {
            if(x != value[0] && y != value[1]){
                include = false;
            }
        });
        food = new Square(x,y,"food");
        food.pos = [x,y]; //保存食物的坐标
        var foodDom = document.querySelector(".food");
        // 食物被""吃"后 不创建新的食物 而是变换食物的位置 提高性能
        if(foodDom){
            foodDom.style.left = x * sw + "px";
            foodDom.style.top = y * sh + "px";
        }else {
            food.create();
        }
        
    }
}
