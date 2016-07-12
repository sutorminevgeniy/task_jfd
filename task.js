var mouse = { x : 0,    
              y : 0 };

var selected = false, // Выбранный объект
    flVectr = false,
    nameCooks = 'cookShars',
    cookProp;

var cnv = document.getElementById('canvas'),
    ctx = cnv.getContext('2d'),
    width = 500,
    height = 700;
cnv.width = width;
cnv.height = height;

// Класс прямоугольник
var Rect = function (x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
};
Rect.prototype.draw = function () {
    ctx.fillStyle = '#F4F4F4';
    ctx.fillRect(this.x, this.y, this.w, this.h);
};
Rect.prototype.stroke = function () {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.w, this.h);
};
Rect.prototype.isCursorInRect = function () {
    return mouse.x > this.x && mouse.x < this.x + this.w && mouse.y > this.y && mouse.y < this.y + this.h;
};
Rect.prototype.isCircleInRect = function (circle) {
    return circle.x > this.x + circle.radius && circle.x < this.x + this.w -circle.radius && circle.y > this.y +circle.radius && circle.y < this.y + this.h - circle.radius;
};
// объект поле для движения
var fildDrive = new Rect(0, 200, 500, 500);


// Класс окружность
var Circle = function (x, y, radius, color, vx, vy, vl, mass) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.vx = vx || 0;
    this.vy = vy || 0;
    this.vl = vl || 0;
    this.mass = mass || Math.pow(this.radius/40, 3);
    this.st = 0;
};
Circle.prototype.getProp = function () {
    return [this.x,
            this.y,
            this.radius,
            this.color,
            this.vx,
            this.vy,
            this.vl,
            this.mass].join('*');
};
Circle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
};
Circle.prototype.stroke = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
    ctx.strokeStyle = '#001EFF';
    ctx.lineWidth = 3;
    ctx.stroke();
};
Circle.prototype.drawVectr = function () {
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.stroke();
};
Circle.prototype.isCursorInCircle = function () {
    var distanceFromCenter = Math.sqrt(Math.pow(this.x - mouse.x, 2) + Math.pow(this.y - mouse.y, 2));
    return distanceFromCenter < this.radius;
};
Circle.prototype.step = function () {
    if(this.st < 2) {
        this.x += (this.vx * 0.008);
        this.y += (this.vy * 0.008);
    } else {
        console.log(this.st);
    }
};
Circle.prototype.checkWall = function (rect) {
    this.st = 0;
    if(this.x <= (rect.x + this.radius) || this.x >= (rect.x + rect.w - this.radius)) {
        this.vx = -this.vx;
        this.st = 1;
    }
    if(this.y <= (rect.y + this.radius) || this.y >= (rect.y + rect.h - this.radius)) {
        this.vy = -this.vy;
        this.st = 1;
    }
};
Circle.prototype.checkCircle = function (circle) {
    if ( Math.sqrt(Math.pow(this.x - circle.x, 2) + Math.pow(this.y - circle.y, 2)) <= (this.radius + circle.radius) ) {
        if(this.st == 1) this.st = 2;
        // задаем переменные массы шаров
        var mass1 = this.mass;
        var mass2 = circle.mass;
        // задаем переменные скорости
        var xVel1 = this.vx;
        var xVel2 = circle.vx;
        var yVel1 = this.vy;
        var yVel2 = circle.vy;
        var run = (this.x-circle.x);
        var rise = (this.y-circle.y);
        //Угол между осью х и линией действия
        var Alfa = Math.atan2(rise, run);
        var cosAlfa = Math.cos(Alfa);
        var sinAlfa = Math.sin(Alfa);
        // находим скорости вдоль линии действия
        var xVel1prime = xVel1*cosAlfa+yVel1*sinAlfa;
        var xVel2prime = xVel2*cosAlfa+yVel2*sinAlfa;
        // находим скорости перпендикулярные линии действия
        var yVel1prime = yVel1*cosAlfa-xVel1*sinAlfa;
        var yVel2prime = yVel2*cosAlfa-xVel2*sinAlfa;
        // применяем законы сохранения
        var P = (mass1*xVel1prime+mass2*xVel2prime);
        var V = (xVel1prime-xVel2prime);
        var v2f = (P+mass1*V)/(mass1+mass2);
        var v1f = v2f-xVel1prime+xVel2prime;
        xVel1prime = v1f;
        xVel2prime = v2f;
        // Проецируем обратно на оси Х и У.
        xVel1 = xVel1prime*cosAlfa-yVel1prime*sinAlfa;
        xVel2 = xVel2prime*cosAlfa-yVel2prime*sinAlfa;
        yVel1 = yVel1prime*cosAlfa+xVel1prime*sinAlfa;
        yVel2 = yVel2prime*cosAlfa+xVel2prime*sinAlfa;
        // ставим новые скорости шаров
        this.vx = xVel1;
        circle.vx = xVel2;
        this.vy = yVel1;
        circle.vy = yVel2;
    }
};

// создание массива изаполнение объектов окружносей для выбора
var i, r,
    x = 30,
    colors = ['#985D5D', '#00836e', '#2F6C80', '#6C456F', '#456F48', '#84291B'], 
    circleChange = [];
for (i = 0; i < 6; i++) {
    r = 25 + i * 5;
    circleChange.push( new Circle(x, 60, r, colors[i]) );
    x += r * 2 + 12;
}

// создание массива объектов окружносей для движения
var circleDrive = [];
if (!navigator.cookieEnabled) {
  alert( 'Включите cookie' );
}
cookProp = getCookie(nameCooks);
if(cookProp) {
    cookProp = cookProp.split('$');
    for(i = 0; i < cookProp.length; i++){
        cookProp[i] = cookProp[i].split('*');
        circleDrive.push( new Circle(+cookProp[i][0], 
                                    +cookProp[i][1], 
                                    +cookProp[i][2], 
                                    cookProp[i][3], 
                                    +cookProp[i][4], 
                                    +cookProp[i][5], 
                                    +cookProp[i][6], 
                                    +cookProp[i][7]) );
    }
}

// Рабочии цикл
gameEngineStart(function () {
    var i, j;
    cookProp = [];

    // Очистка
    ctx.clearRect(0, 0, width, height);

    // отрисовка поля для движения
    fildDrive.draw();
    fildDrive.stroke();

    // Прорисовка окружностей для выбора
    for (i in circleChange) {
        circleChange[i].draw();

        if (circleChange[i].isCursorInCircle()) {
            circleChange[i].stroke();
        }
    }

    // прорисовка движущихся окружностей
    for (i = 0; i < circleDrive.length; i++) {
        circleDrive[i].draw();
        circleDrive[i].step();
        circleDrive[i].checkWall(fildDrive); // проверка удара о стену
        // проверка на соодарение шариков
        for(j=i+1; j < circleDrive.length; j++) {
            circleDrive[i].checkCircle(circleDrive[j]);
        }
        cookProp.push(circleDrive[i].getProp());
    }
    cookProp = cookProp.join('$');
    setCookie(nameCooks, cookProp);

    // прорисовка претаскиваемой окружности
    if (selected) {
        selected.draw();
        selected.stroke();
        selected.x = mouse.x;
        selected.y = mouse.y;
    } else if(circleDrive.length > 0 && flVectr) {
        circleDrive[circleDrive.length - 1].drawVectr();
    }
});

// обработчик движения курсора мыши
window.onmousemove = function (e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
};

// обработчик нажатия мыши
window.onmousedown = function () {
    if (!selected) {
        var i;

        for (i in circleChange) {
            if (circleChange[i].isCursorInCircle()) {
                selected = new Circle(circleChange[i].x, circleChange[i].y, circleChange[i].radius, circleChange[i].color);
            }
        }
    }

    var lastCircleDrive = circleDrive[circleDrive.length - 1]
    if (flVectr) {

        lastCircleDrive.vx = mouse.x - lastCircleDrive.x;
        lastCircleDrive.vy = mouse.y - lastCircleDrive.y;
        lastCircleDrive.vl = Math.sqrt(Math.pow(lastCircleDrive.vx, 2) + Math.pow(lastCircleDrive.vy, 2));
        flVectr = false;
    }
};

// обработчик отпускания мыши
window.onmouseup = function () {
    if (selected) {
        if(fildDrive.isCircleInRect(selected)) {
            circleDrive.push(selected);
            flVectr = true;
        }
        selected = false;
    }
};

// Очистка поля
addEvent(document.getElementById('clearCircle'), 'click', function(e){
    e = e || event;
    circleDrive = [];
    removeDefault(e);
});
