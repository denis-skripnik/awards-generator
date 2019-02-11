function stroka() {
    var st = unescape(window.location.href );
    var i = false;
    var r = st.substring( st.lastIndexOf('/') + 1, st.length );
return r;
    }
var data_url = stroka();

var fn = 'yandex.ru';
addEvent(document.getElementById('click_ru'), 'click', fn);

var lang = window.navigator.language || navigator.userLanguage
if ( lang  === "en") {
	window.location.href = 'en/' + data_url;
} else if ( lang  === "ru") {
	window.location.href = 'ru/' + data_url;
}