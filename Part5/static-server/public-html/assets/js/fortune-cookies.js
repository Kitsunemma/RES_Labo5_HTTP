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

                let infoCookingTime = 'This fortune cookie was cooked at ' + cookingTime;
                let infoLoadBalancing = 'Browser cookies: ' + document.cookie;
                infos.appendChild( document.createTextNode( infoCookingTime ) );
                infos.appendChild( document.createElement('br') );
                infos.appendChild( document.createTextNode( infoLoadBalancing ) );

                fortuneCookie.classList.replace('out', 'closed');
            })
            .fail(() => {
                while(infos.hasChildNodes())
                    infos.removeChild( infos.firstChild );
                infos.appendChild( document.createTextNode( 'Unable to reach API server! :(' ) );
            });

            setTimeout(cookieTick, 1000);
        }
    };

    cookieTick();
});