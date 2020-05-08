var App = {
    log: function(msg) {
        console.log(msg);
    },
    init: function(drags) {
        drags.forEach( item => {

        });
    }
} ;

var Main = {
    server: null,
    clients: new Map(),
    clientView:null,
    clientId: '', //clientId
    ownership: new Map(),
    positions: new Map(),
    ownershipView: null,
    items: [],
    originalPos: null,
    x: 0,
    y: 0,
    dragCnt: 0,
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
                            var event = {clientId: Main.clientId, targetId: targetId}
                            Main.server.emit("event_disable_drag",event );
                            App.log("called disable event "+targetId);
                        }
                    },
                    drag: function(ev) {
                        
                        var targetId=ev.target.id;
                        var currPos = $("#"+targetId).position();
                        App.log("drag");  

                        App.log("currPos");  
                        App.log(currPos);                         
                        //App.log(position);
                        //calculate delta since last move
                        
                        if (Main.originalPos != null) {
                            Main.x += currPos.left - Main.originalPos.left ;
                            Main.y += currPos.top - Main.originalPos.top ;
                            Main.originalPos = currPos;
                            App.log(currPos);                         
                            App.log(Main.originalPos);                         
                            App.log(Main.x);                         
                            App.log(Main.y);                         

                          } else {
                            Main.originalPos = currPos;
                          }   

                        var diff = {top: Main.y, left:Main.x};
                        App.log("diff");  
                        App.log(diff);  
                        //update the rest, with timeout?
                        Main.dragCnt++;

                        if (Main.dragCnt == 8) {
                            var event = {clientId: Main.clientId, targetId: targetId, position: diff }
                            Main.server.emit("event_tracking_position", event);
                            Main.dragCnt = 0;
                        }//dragCnt                        

                    },
                    stop: function(ev) {
                        var targetId=ev.target.id;
                        App.log("dropped "+targetId);
                        Main.ownership.delete(targetId);
                        var event = {clientId: Main.clientId, targetId: targetId}
                        App.log(Main.server);
                        Main.originalPos = null;
                        Main.server.emit("event_enable_drag",event );
                        App.log("called enable event "+targetId);
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
                $('#'+data.targetId).css("background-color","grey");

            }
        });        
        this.server.on('event_enable_drag', (data) => {
            if (this.clientId != data.clientId) {
                App.log("event_enable_drag");

                $('#'+data.targetId).draggable('enable');
                $('#'+data.targetId).css("background-color","white");
            }
        });        
        this.server.on('event_tracking_position', (data) => {
            
            if (this.clientId != data.clientId) {
                App.log("event_tracking_position");
                App.log("got position"+data.clientId);
                var element = $('#'+data.targetId);
                //element.animate({top: 200, left:300});
                element.animate(data.position);
            }
        });      
    }//init
}