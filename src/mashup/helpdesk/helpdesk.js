const APP_NAME="Helpdesk Management";
const OBJS_TITLES=['Avg Case Resolution Time (Days)','Open Cases by Age','Open & Resolved Cases Over Time','Resource Details'] 

var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );
if(prefix==="")
    prefix="/";
var config = {
	host: window.location.hostname,
	prefix: prefix,
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};
require.config( {
	baseUrl: ( config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources"
} );

require( ["js/qlik"], function ( qlik ) {
    qlik.setOnError( function ( error ) {
		$( '#popupText' ).append( error.message + "<br>" );
		$( '#popup' ).fadeIn( 1000 );
	} );
	$( "#closePopup" ).click( function () {
		$( '#popup' ).hide();
	} );
    qlik.getAppList((ret)=>{
        var found=false;
        ret.forEach(function(value) {
            if(value.qDocName===APP_NAME){
                showMash(value.qDocId, config);
                found=true;
            }
        });
        if(found==false)
            $('#up').show();
    }, config);

	function showMash(id,config){
        $('#mash').css("display","flex");
        var app = qlik.openApp(id, config);
        app.clearAll();
        app.getList('sheet',(res)=>{
            res.qAppObjectList.qItems.forEach( function ( value ) {
            value.qData.cells.forEach( function ( v ) {
                app.getObjectProperties(v.name).then((o)=>{
                    o.getLayout().then((l)=>{
                        var idx=OBJS_TITLES.indexOf(l.title);
                        if(idx!=-1){
                            app.getObject('QV0'+(idx+1),l.qInfo.qId);
                        }	
                    }); 	
                });
            } );
            })
        })
    }
} );