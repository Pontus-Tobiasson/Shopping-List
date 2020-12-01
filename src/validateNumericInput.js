function validateNumericInput(input) {
    let myEvent = input || window.event;

    // Handle paste
    if (myEvent.type === 'paste') {
        myEvent.returnValue = false;
        return;
    }

    // Handle key press
    const key = String.fromCharCode(myEvent.keyCode)

    if(/\d/.test(key)) {
        myEvent.returnValue = false;
        if(myEvent.preventDefault) myEvent.preventDefault();
    }
}

export default validateNumericInput;
