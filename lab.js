// Наследует методы родительского класса в дочерний
function extend(Child, Parent) {
    Child.prototype = inherit(Parent.prototype);
    Child.prototype.constructor = Child;
    Child.parent = Parent.prototype;
}
// Создает объект наследник от данного
function inherit(proto) {
    function F() {}
    F.prototype = proto;
    return new F;
}


// Привязывает обработчик к событию элемента
function addEvent(element, event_name, handler){ 
    if (element.addEventListener) {
        element.addEventListener(event_name, handler, false); 
    } else if (element.attachEvent) {
        element.attachEvent('on' + event_name, handler); 
    } else {
        element['on' + event_name] = handler; 
    } 
}
// Удаляет обработчик к событию элемента
function removeEvent(element, event_name, handler){ 
    if (element.removeEventListener) {
        element.removeEventListener(event_name, handler, false); 
    } else if (element.detachEvent) {
        element.detachEvent('on' + event_name, handler); 
    } else {
        element['on' + event_name] = null; 
    } 
}
// Отмена события по умолчанию
function removeDefault(event){ 
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }
}
