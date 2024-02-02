document.addEventListener('DOMContentLoaded', function() {
    // Función para simular el evento al presionar la tecla "Av Pág"
    function simulatePageDownEvent() {
        var event = new KeyboardEvent('keydown', {
            'key': 'PageDown',
            'keyCode': 34,
            'which': 34
        });
        document.dispatchEvent(event);
    }

    // Función para simular el evento al soltar la tecla "Av Pág"
    function simulatePageUpEvent() {
        var event = new KeyboardEvent('keyup', {
            'key': 'PageDown',
            'keyCode': 34,
            'which': 34
        });
        document.dispatchEvent(event);
    }

    // Función para simular el evento al presionar la tecla "Re Pág"
    function simulatePageUpEventStart() {
        var event = new KeyboardEvent('keydown', {
            'key': 'PageUp',
            'keyCode': 33,
            'which': 33
        });
        document.dispatchEvent(event);
    }

    // Función para simular el evento al soltar la tecla "Re Pág"
    function simulatePageDownEventStart() {
        var event = new KeyboardEvent('keyup', {
            'key': 'PageUp',
            'keyCode': 33,
            'which': 33
        });
        document.dispatchEvent(event);
    }

    // Agregar evento al hacer clic en el enlace con la clase end-button
    var endButton = document.querySelector('.end-button');
    endButton.addEventListener('click', function() {
        simulatePageDownEvent();
    });

    // Agregar evento al soltar clic en el enlace con la clase end-button
    endButton.addEventListener('mouseup', function() {
        simulatePageUpEvent();
    });

    // Agregar evento al hacer clic en el enlace con la clase start-button
    var startButton = document.querySelector('.start-button');
    startButton.addEventListener('click', function() {
        simulatePageUpEventStart();
    });

    // Agregar evento al soltar clic en el enlace con la clase start-button
    startButton.addEventListener('mouseup', function() {
        simulatePageDownEventStart();
    });
});