var App = {
    log: function(msg) {
        console.log(msg);
    }
} ;

var Main = {
    server: null,
    clients: new Map(),
    clientView:null,
    clientId: '', //clientId
    ownership: new Map(),
    ownershipView: null,
    items: [],
    initDrag: function(drags) {
        this.items = drags;
        drags.forEach(item => {
            App.log(item)+":";
            var position;
            $('#'+item).draggable(
                {
                    start: function(ev) {
                        var targetId=ev.target.id;
                        App.log("started dragging "+targetId);
                        if (Main.ownership.get(targetId) == null) {
                            Main.ownership.set(targetId,Main.clientId);
                            //call oter clients to do this
                            var event = {clientId: Main.clientId, targetId: targetId}
                            Main.server.emit("event_disable_drag",event );
                            App.log("called disable event "+targetId);
                            //item.draggable.draggable({disabled: true});
                        }
                    },
                    drag: function(ev) {
                        var targetId=ev.target.id
                        position = $(this).position();
                        //App.log(position);
                        //update the rest, with timeout?

                        var event = {clientId: Main.clientId, targetId: targetId, position: position }
                        Main.server.emit("event_tracking_position", event);

                    },
                    stop: function(ev) {
                        var targetId=ev.target.id;
                        App.log("dropped "+targetId);
                        Main.ownership.delete(targetId);
                        var event = {clientId: Main.clientId, targetId: targetId}
                        App.log(Main.server);
                        Main.server.emit("event_enable_drag",event );
                        App.log("called enable event "+targetId);

                        //after letting go, call clients to enable draggble again
                            //item.draggable.draggable({disabled: false});
                        }
                }
            );
        });//for each

    },
    init:function(url) {
        this.server = io(url);
        this.server.on('connect', (data) => {
            //this.log("connected to server "+Object.keys(data));
            App.log("connected to server ");
            App.log(this.server);
            this.server.emit("REFRESH","TEST");   
        });
        this.server.on('disconnect', (data) => {
            App.log("disconnect from server "+data);
        });
        this.server.on('CLIENTID', (data) => {
            console.log("my client id " + data);
            this.clientId = data;

        });        
        this.server.on('CLIENT_ADD', (data) => {
            App.log("All clients connected to the same session, total "+data.length);
            this.clientView = data;
            App.log(this.clientView);
        });
        this.server.on('CLIENT_LEFT', (data) => {
            App.log("Client left the session, total "+data.length);
            this.clientView = data;
            App.log(this.clientView);
        });
        this.server.on('event_disable_drag', (data) => {

            if (this.clientId != data.clientId) {
                App.log("event_disable_drag");
                $('#'+data.targetId).draggable('disable');
                //$('#owner').text("disabled");
                $('#'+data.targetId).css("background-color","grey");

            }
        });        
        this.server.on('event_enable_drag', (data) => {
            if (this.clientId != data.clientId) {
                App.log("event_enable_drag");

                $('#'+data.targetId).draggable('enable');
                //$('#owner').text("enabled");
                $('#'+data.targetId).css("background-color","white");


            }
        });        
        this.server.on('event_tracking_position', (data) => {
            
            if (this.clientId != data.clientId) {
                App.log("event_tracking_position");
                App.log("got position"+data.clientId);

            }
        });      
    }//init
}