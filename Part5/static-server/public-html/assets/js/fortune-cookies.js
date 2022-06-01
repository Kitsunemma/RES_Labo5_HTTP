$(() => {
    let fortuneCookie = document.querySelector('.fortune-cookie');
    let paper = document.querySelector('.paper');
    let infos = document.querySelector('.infos');

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

            
            $.getJSON( "/api/fortune-cookies/", ( freshCookie ) => {
                while(paper.hasChildNodes())
                    paper.removeChild( paper.firstChild );
                while(infos.hasChildNodes())
                    infos.removeChild( infos.firstChild );

                let cookingDate = new Date(freshCookie.cookedOn);
                let cookingTime = cookingDate.toLocaleTimeString('fr-CH');
                
                paper.appendChild( document.createTextNode( freshCookie.paper ) );

                let strInfos = 'Fortune cookie cooked at ' + cookingTime;
                strInfos += ' / Session cookie: ' + document.cookie;
                infos.appendChild( document.createTextNode( strInfos ) );
                fortuneCookie.classList.replace('out', 'closed');
            });

            setTimeout(cookieTick, 1000);
        }
    };

    cookieTick();
});