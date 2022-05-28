$(() => {
    let fortuneCookie = document.querySelector('.fortune-cookie');
    let paper = document.querySelector('.paper');
    let cookedOn = document.querySelector('.cooked-on');

    function cookieTick() {
        if (fortuneCookie.classList.contains('closed')){
            fortuneCookie.classList.replace('closed', 'open');
            setTimeout(cookieTick, 5000);
        }
        else if (fortuneCookie.classList.contains('open')){
            fortuneCookie.classList.replace('open', 'out');
            setTimeout(cookieTick, 2000);
        }
        else if (fortuneCookie.classList.contains('out')){
            while(paper.hasChildNodes()) {
                paper.removeChild( paper.firstChild );
            }
            while(cookedOn.hasChildNodes()) {
                cookedOn.removeChild( cookedOn.firstChild );
            }
            
            $.getJSON( "/api/fortune-cookies/", ( cookie ) => {
                let cookDate = new Date(cookie.cookedOn);
                let cookTime = cookDate.toLocaleTimeString('fr-CH');
                
                paper.appendChild( document.createTextNode( cookie.paper ) );
                cookedOn.appendChild( document.createTextNode( 'Cooked on ' + cookTime ) );
                fortuneCookie.classList.replace('out', 'closed');
            });

            setTimeout(cookieTick, 1000);
        }
    };

    cookieTick();
});