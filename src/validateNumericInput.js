function validateNumericInput(input) {
    var myEvent = input || window.event;

    // Handle paste
    if (myEvent.type === 'paste') {
        myEvent.returnValue = false;
        return;
    } else {
        // Handle key press
        var key = myEvent.keyCode || myEvent.which;
        key = String.fromCharCode(key);
    }
    var regex = /[0-9]/;
    if( !regex.test(key) ) {
        myEvent.returnValue = false;
        if(myEvent.preventDefault) myEvent.preventDefault();
    }
}

export default validateNumericInput;
