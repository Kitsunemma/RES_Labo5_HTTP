$(function() {
    console.log("Loading cookie");

    function loadCookie() {
        $.getJSON( "/api/fortune-cookies/", function( cookie ) {
            console.log(cookie);

        });
    };

    loadCookie();
    setInterval(loadCookie, 5000);
})