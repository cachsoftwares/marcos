$(document).ready(function () {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function () {

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");

    });
});

var status;

function ver_senha() {

    if(status % 2 == 0) {
        document.getElementById('senha').setAttribute('type', 'text');        
        status++;
    } else {
        document.getElementById('senha').setAttribute('type', 'password');        
        status++;
    }
    
}


// FORMATAÇÃO DE NÚMBEROS EM ESCALA GOLBAL
var money_number = new Intl.NumberFormat(
    'en-US',
    {
        style: 'currency',
        currency: 'AOA'
    }
);


var money_format_count = document.getElementsByClassName('money_format').length;
var number_format_count = document.getElementsByClassName('number_format').length;
var uni_format_count = document.getElementsByClassName('uni_format').length;

if(money_format_count > 0) {
    for (let cont = 0; cont < money_format_count; cont++) {
        document.getElementsByClassName('money_format')[cont].innerText = money_number.format(
            document.getElementsByClassName('money_format')[cont].textContent
        ).toString()
        .replace('AOA', '')
        .replace('.00', 'KZ');
    }
}

if(number_format_count > 0) {
    for (let cont = 0; cont < number_format_count; cont++) {
        document.getElementsByClassName('number_format')[cont].innerText = money_number.format(
            document.getElementsByClassName('number_format')[cont].textContent
        ).toString()
        .replace('AOA', '')
        .replace('.00', '');
    }
}

if(uni_format_count > 0) {
    for (let cont = 0; cont < uni_format_count; cont++) {
        document.getElementsByClassName('uni_format')[cont].innerText = money_number.format(
            document.getElementsByClassName('uni_format')[cont].textContent
        ).toString()
        .replace('AOA', '')
        .replace('.00', ' uni');
    }
}