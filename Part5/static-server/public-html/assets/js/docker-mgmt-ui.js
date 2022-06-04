$(() => {

    function stop(containerId) {
        console.log('STOP ' + containerId );
        $.getJSON( "/api/docker/container/stop/", {id: containerId}, ( result ) => {
            list();
        });
    }
    function start(containerId) {
        console.log('START ' + containerId );
        $.getJSON( "/api/docker/container/start/", {id: containerId}, ( result ) => {
            list();
        });
    }
    function list() {
        console.log('LIST CONTAINERS');
        $.getJSON( "/api/docker/container/ls/", ( containers ) => {
            if (containers) {
                let table = '<table class="container-list">';
                table += '<tr><th>Name</th><th>State</th><th>Status</th><th>Actions</th></tr>';
                table += '</table>';
    
                $('main').empty();
                $('main').append(table);

                containers.forEach(container => {
                    let running = container.State === 'running';
        
                    let row = '<tr>';
                    row += '<td>'+container.Names[0]+'</td>';
                    row += '<td>'+container.State+'</td>';
                    row += '<td>'+container.Status+'</td>';
                    row += '<td id="actions-'+container.Id+'"></td>';
                    row += '</tr>';

                    $('table.container-list').append(row);

                    // creating button
                    let btn = document.createElement('button');
                    btn.appendChild(document.createTextNode( running ? 'Stop' : 'Start' ));
                    btn.addEventListener('click',
                        running ? () => stop( container.Id )
                        : () => start( container.Id )
                    );

                    // adding button
                    $('#actions-'+container.Id).append(btn);
                });
            }
            else {
                $('main').empty();
                $('main').append('<p>Unable to reach Docker Engine API! :(</p>');
            }
        })
        .fail(() => {
            $('main').empty();
            $('main').append('<p>Unable to reach API server! :(</p>');
        });
    }

    setInterval(list, 3000);
});