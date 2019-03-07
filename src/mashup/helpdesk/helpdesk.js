var Upload = function (file) {
    this.file = file;
};
Upload.prototype.getType = function() {
    return this.file.type;
};
Upload.prototype.getSize = function() {
    return this.file.size;
};
Upload.prototype.getName = function() {
    return this.file.name;
};
Upload.prototype.delete = function (id,callB) {
    var that = this;
    $.ajax({
        type: "DELETE",
        url: "/api/v1/apps/"+id,
        success: function (data) {
            callB(data);
        },
        error: function (error) {
            callB(error);
        },
        async: true,
        cache: false
    });
};
Upload.prototype.doUpload = function (callB) {
    var that = this;
    $.ajax({
        type: "POST",
        url: "/api/v1/apps/import",
        xhr: function () {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                myXhr.upload.addEventListener('progress', that.progressHandling, false);
            }
            return myXhr;
        },
        success: function (data) {
            callB(data);
        },
        error: function (error) {
            callB(error);
        },
        async: true,
        data: this.file,
        cache: false,
        contentType: 'application/octet-stream',  
        processData: false,
        timeout: 60000
    });
};

Upload.prototype.progressHandling = function (event) {
    var percent = 0;
    var position = event.loaded || event.position;
    var total = event.total;
    var progress_bar_id = "#progress-wrp";
    if (event.lengthComputable) {
        percent = Math.ceil(position / total * 100);
    }
    $(progress_bar_id + " .status").text(" -"+ percent + "%");
};
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
    var toDel;
    function popSelect(){
        qlik.getAppList((ret)=>{
            var found=false;
            ret.forEach(function(value) {
                if(value.qDocName==='Helpdesk Management'){
                    showMash(value.qDocId, config);
                    found=true;
                }
                $("#apps").append(`<option value="${value.qDocId}">${value.qDocName}</option>`);
            });
            if(found==false)
                $('#up').show();
        }, config);
    }
    function clearSelect(){
        $('#apps').find('option').remove().end()
    }
	function showMash(id,config){
        var app = qlik.openApp(id, config);
        app.getObject('QV04','hRZaKk');
        app.getObject('QV03','uETyGUP');
        app.getObject('QV02','PAppmU');
        app.getObject('QV01','a5e0f12c-38f5-4da9-8f3f-0e4566b28398');
        $('#up').hide();
        $('#mash').css("display","flex");
    }
	qlik.setOnError( function ( error ) {
		$( '#popupText' ).append( error.message + "<br>" );
		$( '#popup' ).fadeIn( 1000 );
	} );
	$( "#closePopup" ).click( function () {
		$( '#popup' ).hide();
	} );
    $("#apps").on("change", function (e) {
       toDel= e.target.value;
    })
    $("#del").on("click", function (e) {
        var upload = new Upload();
        upload.delete(toDel,(d)=>{
            clearSelect();
            popSelect()
        });
     })
	$("#files").on("change", function (e) {
		var file = $(this)[0].files[0];
        var upload = new Upload(file);
		upload.doUpload((data)=>{
            $(this)[0].value="";
            if(data.attributes){
                showMash(data.attributes.id, config);
                clearSelect();
                popSelect();
                $(".status").text("");
            }
		});
    });
    popSelect();
} );