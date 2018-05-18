// ==UserScript==
// @name          DJ City - Epic User Script
// @namespace     http://localhost.localdomain
// @icon          http://djcity.com/favicon.ico
// @description   Epic user script for DJ City
// @version       1.13
//
// @include   http://www.djcity*
// @include   https://www.djcity*
// @require   //ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// @require   http://williammuff.us/djcity/includes/nprogress.js
// @require   //cdnjs.cloudflare.com/ajax/libs/remodal/1.1.1/remodal.min.js
// @require   http://williammuff.us/djcity/includes/jquery.modal.js
// @require   https://use.fontawesome.com/ca420a7d85.js
// @require   https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.2/jquery-confirm.min.js
// require   file:///C:/djcityuserscript/djcity.user.js
// @grant    GM_openInTab
//
// ==/UserScript==
var cver = 1.13
var releaseNotes = [
    {'id':1.13,"notes":["Added Banner Message To Show Changes","Added Bug Report section in settings pane","Changed host to williammuff.us"]}
]

var cUrl = window.location.href;
var cPage;
var tracks = [];
var email;
var queuePage = '/mydjcity';
var hosted_url = 'http://williammuff.us/djcity/';
var djcity_host;
var cpTrack;
var debugLogging
//debugLogging = true;

//PROGRESS BAR FUNCTIONALITY
NProgress.configure({ showSpinner: false });
$(document).ajaxStart(function() { NProgress.start(); });
$(document).ajaxStop(function() { NProgress.done(); });

run();

function run()
{
    djcity_host = getLocation(document.URL);
    addStyleCSS();
	showBanner();
    setUserEmail(0);
    autoRateAttempt();
    loadJPlayer();
    buildTrackArray();
    queueDataLoad();
    autoPlayInit();
    pageVisuals();
    getTrackData();
    hotboxTopPicksAddInfo();
}

function hotboxTopPicksAddInfo()
{
 $('.chart_list').each(function(k,v){
    chart_data = []
    //SET EMAIL for first record
    chart_data.push([{'tid':email},{'c_flg':''},{'d_cnt':''},{'p_cnt':''},{'dpid':''}]);
    //SNAG TID's IN CHART
    if ($(this).is(":visible")) {
        $(this).find('li').each(function(kk,vv){
            cn = $(vv).children()
            trackurl = $(cn[0]).attr('href')
            st = trackurl.indexOf('----') + 4
            ed = trackurl.length
            tid = trackurl.substring(st,ed).replace('.htm','')
            $(vv).attr('id',k + '_' + tid)
            chart_data.push([{'tid':tid},{'c_flg':''},{'d_cnt':''},{'p_cnt':''},{'dpid':''}]);
        })

       $.ajax({
            url: hosted_url + 'info.php',
            type: "POST",
            crossDomain: true,
            data: JSON.stringify(chart_data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success:function(result){
                $(result).each(function(kkk,vvv){
                    tr_obj = $('#' + k + '_' + vvv[0]['tid'])

                    if (vvv[2]['d_cnt'] > 0) tr_obj.addClass('dlBoxSide')
                    if (vvv[3]['p_cnt'] > 0) tr_obj.find('.pool_txt').addClass('played')
                })
            }
        });
    }
})
}

function autoRateAttempt()
{
    $("#ctl00_PageContent_rating").val(3);
    $("#ctl00_PageContent_submit").trigger('click');
}

function buildTrackArray()
{
    //BUILD TRACK ARRAY
    tracks = [];
    tracks.push([{'tid':email},{'c_flg':''},{'d_cnt':''},{'p_cnt':''},{'dpid':''}]);
    //loads tracks on page to array
    $('[id^=t_]').each(function(){
        if ($(this).is(':visible'))
        {
            var tid = $(this).attr('id').replace('t_','');
            var dpid = $(this).attr('data-pid');
            tracks.push([{'tid':tid},{'c_flg':''},{'d_cnt':''},{'p_cnt':''},{'dpid':dpid}]);
        }
    });
}

function addCSS(url){
    $("head").append ('<link ' + 'href="' + url + '" ' + 'rel="stylesheet" type="text/css">');
}

function addStyleCSS()
{
    //Custom Style Classes (generic)
    $("<style>").prop("type", "text/css").html("div.jp-progress_active  { z-index: 4; }")
    $("<style>").prop("type", "text/css").html(".releaseNotesBanner  { list-style-type:square; }")
    $("<style>").prop("type", "text/css").html(".record_pool_listing li .pool_icon li{float:left;width:25px;height:35px;text-align:center;border-bottom:0px dotted #000000;border-left:1px dotted #000000;}").appendTo("head");
    $("<style>").prop("type", "text/css").html(".played { opacity: 0.5; }").appendTo("head");
    $("<style>").prop("type", "text/css").html(".dlBoxSide { border-bottom: 2px solid red;").appendTo("head");
    $("<style>").prop("type", "text/css").html(".righttop {        position: absolute;        top: 0px;        right: 25px;        }").appendTo("head");
    $("<style>").prop("type", "text/css").html('.clearHistoryBtn {\r\n    float: left;\r\n    display: block;\r\n    background: url(data:image\/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAyCAYAAAC6VTBiAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN\/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz\/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH\/w\/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA\/g88wAAKCRFRHgg\/P9eM4Ors7ONo62Dl8t6r8G\/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt\/qIl7gRoXgugdfeLZrIPQLUAoOnaV\/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl\/AV\/1s+X48\/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H\/LcL\/\/wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93\/+8\/\/UegJQCAZkmScQAAXkQkLlTKsz\/HCAAARKCBKrBBG\/TBGCzABhzBBdzBC\/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD\/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q\/pH5Z\/YkGWcNMw09DpFGgsV\/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY\/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4\/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L\/1U\/W36p\/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N\/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26\/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE\/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV\/MN8C3yLfLT8Nvnl+F30N\/I\/9k\/3r\/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt\/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi\/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a\/zYnKOZarnivN7cyzytuQN5zvn\/\/tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO\/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3\/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA\/0HIw6217nU1R3SPVRSj9Yr60cOxx++\/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3\/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX\/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8\/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb\/1tWeOT3dvfN6b\/fF9\/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR\/cGhYPP\/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF\/6i\/suuFxYvfvjV69fO0ZjRoZfyl5O\/bXyl\/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o\/2j5sfVT0Kf7kxmTk\/8EA5jz\/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5\/wAAgOkAAHUwAADqYAAAOpgAABdvkl\/FRgAAANFJREFUeNrslsEKglAQRc+omyBb1Ie2bvPEQeh\/TXAjTIsUUtNM04q8y3m8w+VefYyYHx6BM7DhdeXAScwPL8CW8crE\/NCYKI836IMQkYGQIu2emQ2EBLs6qEhvs7kyeV5x5abDxULtVDk081nOyWHfbqPHzfrvPIZkExmZB0TlMzdGORCJmbG2s0J+BhKo6uStwAOSkQDKe4k3ca0A2P5Lxc65QbNeiKrWLjnnUNUZP7a+w3s3XS6WaafKoZnPck5EpNVGnxuJ43jdCr51K7gOAIgqTtg\/xWFHAAAAAElFTkSuQmCC);\r\n    width: 17px;\r\n    height: 20px;\r\n    overflow: hidden;\r\n    margin: 7px 0 0 -50px;\r\n    display: none;\r\n}\r\n\r\n.clearHistoryBtn:hover {\r\n    background-position: 0 -30px;\r\n}').appendTo("head");
    $("<style>").prop("type", "text/css").html(".crt_icon_lit { color:red; }").appendTo("head")
    $("<style>").prop("type", "text/css").html('.dlBox {float:right; width:100%; height:1px; background:red; margin-top:34px;}').appendTo("head");

    //CSS files added to page
    addCSS(hosted_url + 'includes/nprogress.css')
    addCSS(hosted_url + 'includes/jquery.modal.css')
    addCSS('https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.2/jquery-confirm.min.css')

	//Modal HTML
	shtml = '<div id="ex1"style="display:none;"><h1>Settings</h1><br>'
    shtml += 'Download All Versions(when download is initiated)<select id="downloadAllFlag"style="width:100%"><option disabled selected value></option><option value="No">No</option><option value="Yes">Yes</option></select>'
    shtml += 'Skip Into Track(if set player will seek that%into the track)<input type="text"id="skipIntoPCT"style="width:100%"/>'
    shtml += '<div style="width:100%;"><input style="margin-top:20px;float:right;" type="button" id="saveSettings" value="Save"/></div>'
    shtml += '<br><br>'
    shtml += '<br>Report a bug<textarea name="message" rows="10" id="bugMessage"style="width:100%"/>'
    shtml += '<input style="margin-top:20px;float:right;" type="button" id="sendBug" value="Send Bug"/>'
    shtml += '<div><br><br><a target="_blank" href="https://github.com/williammuff/djcityuserscript/blob/master/README.md">Click here for full usage guide</a></div>'
    shtml += '</div>'
    $('body').append(shtml)

    //Previously used for file downloads
    //$('body').append('<a id="fileDownload" download style="display:none;"></a>');
}

function autoPlayInit()
{
 //autoplay
    ap_dir = getUrlParameter('autoplay');
    if (ap_dir)
    {
        if (ap_dir == 'forward')
        {
            tid = tracks[1][0]['tid'];
            playTrack(tid);
        }
        else
        {
            tid = tracks[tracks.length-1][0]['tid'];
            playTrack(tid);
        }
    }
}

function pageVisuals()
{
    //Crate icon
    $('li').find('[id^=c_]').parent().remove();
    $('ul.pool_icon').each(function(){
        if (!($(this).parent().prev().children().hasClass('ignore'))) {
            var tid = $(this).parent().prev().children().attr('id').replace('t_','');
            var dpid = $(this).parent().prev().children().attr('data-pid');
            var pText = $(this).parent().prev().children().children().find('.player_txt');
            $(this).append('<li><i id="c_' + tid + '" data-pid="' + dpid + '" class="fa fa-plus-square fa-lg crt_icon" style="margin-top:45%"></i></li>')
            $(pText).after('<div id="dl_' + tid + '"></div>');
        }
    });

    //Checks for "main record pool BPM tag and adds crate text if main page"
    $('.float_right.w210.bmp_txt').find('div').addClass('float_left')
    $('.float_right.w210.bmp_txt').find('div').append(' | VERSIONS')
    $('.float_right.w210.bmp_txt').append('<div class="float_right">CRATE</div>')
    $('.float_right.w210.bmp_txt').css('font-weight','bold')
    $('.float_left.w410.day_time').css('font-weight','bold')


    //Song page Crate management
    if (tracks.length == 2)
    {
        tid = tracks[1][0].tid;
        dpid = tracks[1][4].dpid;
        dlcnt = tracks[1][2].d_cnt;
        crate_html = '<i id="c_' + tid + '" data-pid="' + dpid + '" class="fa fa-plus-square fa-lg crt_icon" style="margin-top:45%"></i>'
        $('.content_social').before('<div class="float_right reltive">' + crate_html + '</div>');
    }

     //Crate toggle click hook
    $('[id^=c_]').click(function(){
        c_flg = crateFlip($(this).attr('id').replace('c_',''),$(this).attr('data-pid'),true);

        if (cUrl.indexOf(queuePage) > 0)
        {
            if ($('#customCrateContent').find('[id^=c_]').length == 0) clearCrateVisuals();
        }
    });

    //Addding Clear History Icon
    $('.downloadBtn').each(function(){
        var cHistHtml =  ' <a class="clearHistoryBtn" target="_blank" style="display: none;">clear</a>'
        $(this).before(cHistHtml);

        if ($(this).css('margin-top') == '14px')
        {

            $(this).css('margin-top','7px');
        }
    });

    $('.clearHistoryBtn').click(function(){
        var tid = $(this).parents().find('[id^=t_]').attr('id').replace('t_','');
        clearHistory(tid);
    });

    //Clear all history
    $('#ctl00_PageContent_pnlOrderHistory').append('<p align="center"><input value="Clear All History" class="UpdateAccountButton" id="clearAllHistory" type="submit"></p>');
    $('#clearAllHistory').click(function(e){
       clearHistory();
       e.preventDefault();
       window.location.reload();
    });

    $('#saveSettings').click(function(){
        setSettings(true);
        bindOnPlay()
        $.modal.close();
    })

    $('#sendBug').click(function(){
        burl = hosted_url + 'bug.php?email=' + encodeURIComponent(email) + '&bug=' + encodeURIComponent($('#bugMessage').val())
        $.getJSON(burl,function(data){
            console.log(data)
            $.alert({
                title: 'Success',
                useBootstrap: false,
                boxWidth: '30%',
                content: 'Your bug was reported',
                type: "green"
            });
        })
    })

    //Click icon support for instant downloads of specific version
    $('a.dot_icon').click(function(){
        var tid = $(this).parents('li').children().find('[id^=t_]').attr('id').replace('t_','');
        downloadTrack(tid,'Main',email);
    });
    $('a.hash_icon').click(function(){
        var tid = $(this).parents('li').children().find('[id^=t_]').attr('id').replace('t_','');
        downloadTrack(tid,'Dirty',email);
    });
    $('a.c_icon').click(function(){
        var tid = $(this).parents('li').children().find('[id^=t_]').attr('id').replace('t_','');
        downloadTrack(tid,'Clean',email);
    });
    $('a.music_icon').click(function(){
        var tid = $(this).parents('li').children().find('[id^=t_]').attr('id').replace('t_','');
        downloadTrack(tid,'Inst',email);
    });
    $('a.record_icon').click(function(){
        var tid = $(this).parents('li').children().find('[id^=t_]').attr('id').replace('t_','');
        downloadTrack(tid,'Acap',email);
    });
    $('a.info_icon').click(function(){
        var tid = $(this).parents('li').children().find('[id^=t_]').attr('id').replace('t_','');
        downloadTrack(tid,'Intro',email);
    });

    $('.downloadBtn').attr('target','_blank');
    $('.clearHistoryBtn').attr('target','_blank');

    $('a').each(function(){
        var linkT = $(this).attr('href');
        if(linkT)
        {
            if(linkT.indexOf('/digital/') > -1 && linkT.indexOf('record-pool.aspx') == -1 && linkT.indexOf(queuePage) == -1 && $(this).parents('li').parents('ul.paging_listing').length == 0 && (!($(this).hasClass('btn_link'))) )
            {
                $(this).attr('target','_blank');
            }
        }
    });
}

function getTrackData()
{
    $.ajax({
        url: hosted_url + 'info.php',
        type: "POST",
        crossDomain: true,
        data: JSON.stringify(tracks),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success:function(result){
            tracks = result;
            updateTracks();
        }
    });
}

function updateTracks()
{
    //Updates track with tooltip play/download info.
    $(tracks).each(function(i){
        var tid = tracks[i][0]['tid'];
        var c_flg = tracks[i][1]['c_flg'];
        var d_cnt = tracks[i][2]['d_cnt'];
        var p_cnt = tracks[i][3]['p_cnt'];

        if (d_cnt == '') d_cnt = 0;
        if (p_cnt == '') p_cnt = 0;

        //Adds tooltip text to indicate download and play count
        $('#t_' + tid).attr('title','Download Count: ' + d_cnt + ' Play Count: ' + p_cnt);

        //Setting additional details
        if (c_flg == 1) crateFlip(tid,null,false);
        if (p_cnt > 0) playSetVisual(tid);
        if (d_cnt > 0) downloadVisual(tid);

        //Adds Downloads/plays if single track
        if ($(tracks).length == 1)
        {
            $('#artist_details').append('<li><div class="float_left artist_label">Downloads</div><div class=" float_right artist_details">' + d_cnt + '</div><div class="clear"></div></li>');
            $('#artist_details').append('<li><div class="float_left artist_label">Plays</div><div class=" float_right artist_details">' + p_cnt + '</div><div class="clear"></div></li>');
        }
    });
}

function playSetVisual(tid, forceRemove)
{
    lbar = $('#t_' + tid).children().find(".player_txt");
    rbar = $('#t_' + tid).parent("div").parent("li").children().next('.float_right.w210').children();

    if (forceRemove)
    {
        $(lbar).removeClass('played');
        $(rbar).removeClass('played');
    }
    else
    {
        if (!($(lbar).hasClass('.played'))) $(lbar).addClass('played');
        if (!($(rbar).hasClass('.played'))) $(rbar).addClass('played');
    }
}

function downloadVisual(tid,flg)
{
    dlW = $('#dl_'+tid);
    if (flg == null) {
        if (!($(dlW).hasClass('dlBox'))) $(dlW).addClass('dlBox');
    }
    else {
        if (flg == false) $(dlW).removeClass('dlBox');
    }
}

function crateFlip(tid,dpid,upd_flg)
{
    var c_flg;
    cobj = $('#c_'+tid);

    if ($(cobj).hasClass('crt_icon_lit'))
    {
        $(cobj).removeClass('crt_icon_lit');
        $(cobj).addClass('crt_icon');
        c_flg = 0;
    }
    else
    {
        $(cobj).removeClass('crt_icon');
        $(cobj).addClass('crt_icon_lit');
        c_flg = 1;
    }

    if (cPage && upd_flg && tid != null) //On queue Page
    {
        clearPlayer();
        $('#t_'+tid).parents('li').remove();
        var ap = findTrackInArray(tid)

        if (ap > -1)
        {
            tracks.splice(ap, 1);
        }

        crateTracks = $('#customCrateContent').find('[id^=t_]')
        $('#crate_count').html(crateTracks.length)
        if (crateTracks.length == 0) clearCrateVisuals();
    }

    if (cPage && tid == null)
    {
        $('#customCrateContent').find('[id^=t_]').each(function() {
            var tk = $(this).attr('id').replace('t_','');
            $.get(hosted_url + 'crate.php?email=' + email + '&tid=' + tk + '&dpid=');
        });
        clearCrateVisuals();
    }

    if (upd_flg && tid)
    {
        $.get(hosted_url + 'crate.php?email=' + email + '&tid=' + tid + '&dpid=' + dpid);
    }
    return c_flg;
}

function clearCrateVisuals()
{
    $('.bb_doted').remove(0);
    $('#crate_count').remove();
    $('#customCrateContent').html('No track/s in your custom crate');
    $('#downloadAll').remove();
    $('#removeAll').remove();
}

function findTrackInArray(tid)
{
    var fi;
    $.each(tracks, function(index, obj) {
        var aI = index;
        $.each(obj,function(i,o){
            if (tid == o.tid){
             fi = aI;
            }
        });
    });
    return fi;
}
//-------------COOKIE FUNCTIONS--------------
function setSettings(flg)
{
    if(flg) {
       eraseCookie('downloadAllFlag');
       eraseCookie('skipIntoPCT');
       createCookie('downloadAllFlag',$("#downloadAllFlag").val(),365);
       createCookie('skipIntoPCT',$('#skipIntoPCT').val(),365);
    }

    var download_all_flg = readCookie('downloadAllFlag')
    var skip_into_percentage = readCookie('skipIntoPCT')
    if (!(download_all_flg)) {
        download_all_flg = 'No'
        createCookie('downloadAllFlag',download_all_flg,365);
    }
    if (!(skip_into_percentage)) skip_into_percentage = 0
    if (debugLogging) console.log('setSettings:','download_all_flg',download_all_flg,'skip_into_percentage',skip_into_percentage)
    $("#downloadAllFlag").val(download_all_flg);
    $('#skipIntoPCT').val(skip_into_percentage)
}

function showBanner() {
    user_id = readCookie("userEmail");

    if(user_id != null)
    {
        var pver = readCookie("bannerVersion");
        if (!(isNumeric(pver))) pver = 0.00
        else pver = parseFloat(pver)
        if (Math.abs(pver) != cver || pver > 0) {
            var releaseNotesContent = ''
            $(releaseNotes).each(function(k,v) {
                if (v['id'] == cver) {
                    $(v['notes']).each(function(kk,vv) {
                        releaseNotesContent = releaseNotesContent + '<li>' + vv + '</li>'
                    })
                }
            })
            if (releaseNotesContent != '') {
                releaseNotesContent = '<ul class="releaseNotesBanner">' + releaseNotesContent + '</ul>';
                $.confirm({
                    title: 'Version (' + cver + ') Updates',
                    boxWidth: '30%',
                    useBootstrap: false,
                    backgroundDismiss: true,
                    type: 'red',
                    content: releaseNotesContent,
                    buttons: {
                        close: {
                            text: "Don't Show This Again",
                            keys: ['enter'],
                            action: function(){
                                eraseCookie('bannerVersion');
                                createCookie('bannerVersion',cver * -1,365);
                                console.log('cookie set with',cver * -1)
                            }
                        }
                    }
                });
            }
        }
    }
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function setUserEmail(flg)
{
    user_id = readCookie("userEmail");

    if(user_id == null || flg == 1)
    {
        user_id = prompt('Please enter your email address for "crate tracking" purposes');
        if (user_id) {
            eraseCookie('userEmail');
            createCookie('userEmail',user_id,365);
            location.reload();
        }
        else if (!(readCookie("userEmail"))) {
            user_id = prompt('Please enter your email address for "crate tracking" purposes');
        }
    }
    else {

        $('#navigation_right').append('<li><a id="userNameUpdate" href="#">' + user_id + '</a></li>');
        $('#navigation_right').append('<a href="#ex1" rel="modal:open"><i style="color:white;" class="fa fa-cogs fa-2x" aria-hidden="true"></i></a>')
        $("#userNameUpdate").mouseup(function(event){
            setUserEmail(1);
        });
        email = readCookie('userEmail');
        if (debugLogging) console.log('setUserEmail:','email',email)
        setSettings()
    }
}

function createCookie(name,value,days)
{
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name)
{
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];

        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0)
        {
            return c.substring(nameEQ.length,c.length);
        }
    }
    return null;
}

function eraseCookie(name)
{
    createCookie(name,"",-1);
}

//Jplayer Code====================================================================================================
var timer=false;
var allowTrackMovement = 1;
var currentTrackIndex;
function loadJPlayer()
{
    //INIT REAL JPLAYER
    $("#jquery_jplayer").jPlayer({
        ready: function () {},
        swfPath: "http://djshmrulmvjbw.cloudfront.net/App_Templates/Skin_1/obj/",
        supplied: "mp3",
        preload: "auto"
    });

    //ADD & INIT SECOND JPLAYER FOR CACHING (hopefully)
    $('#jquery_jplayer').after('<div id="jquery_jplayer_cache" class="jp-jplayer" style="width: 0px; height: 0px;"></div>')
    $("#jquery_jplayer_cache").jPlayer({
        ready: function () {},
        swfPath: "http://djshmrulmvjbw.cloudfront.net/App_Templates/Skin_1/obj/",
        supplied: "mp3",
        preload: "auto",
        load: function (e) { console.log(e) }
    });
    //CACHE TESTING
    /*
    $("#jquery_jplayer_cache").bind($.jPlayer.event.loadeddata, function(event) {
        //console.log('loaded some dater',event)
    });
    */
    bindOnPlay()

    $(".jp-play").click(function (event) {
        if (!($(this).closest('[id^="t_"]').hasClass('ignore'))) {
            $(".jp-progress").removeClass("jp-progress_active");
            $(".downloadBtn").css('display', 'none');
            $(".clearHistoryBtn").css('display', 'none');

            //STOLEN FROM DJ CITY (what the actual FUCK)......
            function az(a) { return String(a).replace(/(.)/g, "$1/"); }
            var c = $("#jquery_jplayer");
            d = $(this).closest('[id^="t_"]');
            e = d.attr("id").match(/[\d]+$/);
            f = d.data("pid");
            g = "http://preview.pool.djcity.com/" + az(e) + f + ".mp3";

            var player = $('#jquery_jplayer');
            var id = $(this).closest('[id^="t_"]').attr('id').match(/[\d]+$/);
            var nmp3 = "http://preview.cdn.djcity.com/" + id + ".mp3";
            if (player.data("jPlayer").status.media.mp3 === g) {
                player.jPlayer("play");
                cpTrack = id;
            } else {
                player.jPlayer("setMedia", {
                    mp3: g
                }).jPlayer("play");
                cpTrack = id;
                var ancestor = $(this).closest('[id^="jp_container_"]').attr('id');
                player.jPlayer({
                    cssSelectorAncestor: '#' + ancestor
                });
            }
            id = id[0];
            logPlay(id);
            //----END STOLEN SHIT.
            $(this).parents(".jp-interface").find(".jp-progress").addClass("jp-progress_active");
            $(this).parents(".jp-interface").find(".downloadBtn").css('display', 'block');
            $(this).parents(".jp-interface").find(".clearHistoryBtn").css('display', 'block');
        }
    });
}

//ABILITY TO REBIND PLAYER AFTER EACH "SETTINGS SAVE"
function bindOnPlay(){
    skip_pct = readCookie('skipIntoPCT')
    if (skip_pct) {
        $("#jquery_jplayer").bind($.jPlayer.event.loadeddata, function(event) {
        //ONPLAY
            $("#jquery_jplayer").jPlayer("playHead", skip_pct);
        });
    }

    $("#jquery_jplayer").bind($.jPlayer.event.ended, function(event) {
    skipPlayer('forward');
    });
}

function seekPlayer(direction, seconds_to_skip)
{
    if($("#jquery_jplayer").data("jPlayer").status.paused) {} //do nothing
    else
    {
        duration = $("#jquery_jplayer").data("jPlayer").status.duration;
        currentTime = $("#jquery_jplayer").data("jPlayer").status.currentTime;
        if (direction == 'forward')
        {
            if (currentTime + seconds_to_skip < duration)
            {
                percent = ((currentTime + seconds_to_skip)/duration)*100;
                $("#jquery_jplayer").jPlayer("playHead", percent);
            }
            else
            {
                skipPlayer('forward');
            }
        }
        if (direction == 'backward')
        {
            if (currentTime - seconds_to_skip > 0)
            {
                percent = ((currentTime - seconds_to_skip)/duration)*100;
                $("#jquery_jplayer").jPlayer("playHead", percent);
            }
            else
            {
                skipPlayer('backward');
            }
        }
    }

}


function skipPlayer(direction)
{
    currentTrackSrc = $("#jquery_jplayer").data("jPlayer").status.src.replace('http://preview.cdn.djcity.com/', '');
    currentTrack = currentTrackSrc.replace('.mp3','');
    currentTrack = cpTrack;

    currentTrackIndex = findTrackInArray(currentTrack)

    if (currentTrackSrc != '');
    {

        if (direction == 'forward')
        {
            if (currentTrackIndex + 1 <= tracks.length - 1)
            {
                newTrack = tracks[currentTrackIndex + 1][0]['tid'];
                playTrack(newTrack);
            }
            else
            {
                skipPage('forward');
            }
        }
        if (direction == 'backward')
        {
            if (currentTrackIndex - 1 > -1)
            {
                newTrack = tracks[currentTrackIndex - 1][0]['tid'];
                playTrack(newTrack);
            }
            else
            {
                skipPage('backward');
            }
        }
    }
}

function skipPage(dir)
{
    var url = window.location.href;
    var pg = getUrlParameter('p');
    var nurl = null;
    var ap_text = '';
    var c_dir;

    if (cPage || url.indexOf('search.aspx') > 0){
        dir = '';
    }

    if (dir == 'forward')
    {
        if (pg == null)
        {
            if (url.indexOf('?') > 0)
            {
                nurl = url + '&p=2';
            }
            else
            {
                nurl = url + '?p=2';
            }
        }
        else
        {
            np = parseInt(pg) + 1;
            nurl = url.replace('p='+pg,'p='+np);
        }
    }
    else if (dir == 'backward')
    {
        if (pg != null)
        {
            if(pg == 2)
            {
                nurl = url.replace('p='+pg,'');
            }
            else
            {
                np = parseInt(pg) - 1;
                nurl = url.replace('p='+pg,'p='+np);
            }
        }
    }

    c_dir = getUrlParameter('autoplay');

    if (nurl != null)
    {
        if (c_dir)
        {
            nurl = nurl.replace('autoplay='+c_dir,'autoplay='+dir);
        }
        else
        {
            nurl = nurl + '&autoplay='+dir;
        }
        nurl = nurl.replace('record-pool.aspx','records.aspx');
        window.location = nurl;
    }
}

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function clearPlayer()
{
    $("#jquery_jplayer").jPlayer("clearMedia");
}

function pausePlayer()
{
    if($("#jquery_jplayer").data("jPlayer").status.paused) {
        $("#jquery_jplayer").jPlayer("play");
    } else {
        $("#jquery_jplayer").jPlayer("pause");
    }
}

function cacheRoutine(tid) {
    var cachePlayer = $('#jquery_jplayer_cache');
    cindex = findTrackInArray(tid) + 1
    cacheAhead  = 1

    $(tracks).each(function(k,vv) {
        if (k + 1 > cindex & k + 1 <= cindex + cacheAhead) {
            mlp = k + 1 - cindex

            setTimeout(function(){
                cacheID = tracks[k][0]['tid']
                cachePlayer.jPlayer("setMedia", { mp3: getMP3URL(cacheID) }).jPlayer("load")
                //console.log(cacheID,cachePlayer.data("jPlayer"))
            }, 0 * mlp);

            //$.ajax({url: getMP3URL(cacheID)});
        }
    })
}

function getMP3URL(tid)
{
    var idDiv = $('#t_' + tid);
    //STOLEN FROM DJ CITY PAGE
    function az(a) {
        return String(a).replace(/(.)/g, "$1/");
    }

      var c = $("#jquery_jplayer");
            d = idDiv;
            e = d.attr("id").match(/[\d]+$/);
            f = d.data("pid");
            g = "http://preview.pool.djcity.com/" + az(e) + f + ".mp3";
    //------------END STOLEN
    return g
}

function playTrack(track_id,force_play = 1)
{
    cacheRoutine(track_id)
    $(".jp-progress").removeClass("jp-progress_active");
    $(".downloadBtn").css('display', 'none');
    $(".clearHistoryBtn").css('display', 'none');
    var player = $('#jquery_jplayer');
    var id = track_id;
    
    var nmp3 = "http://preview.cdn.djcity.com/" + id + ".mp3";

    cpTrack = id;
    player.jPlayer("setMedia", {
        mp3: getMP3URL(track_id)
    }).jPlayer("play");
    cpTrack = id;

    var ancestor = $("#t_" + track_id).children('[id^="jp_container_"]').attr('id');
    player.jPlayer({
        cssSelectorAncestor: '#' + ancestor
    });

    $("#t_" + track_id).find(".jp-progress").addClass("jp-progress_active");
    $("#t_" + track_id).find(".downloadBtn").css('display', 'block');
    $("#t_" + track_id).find(".clearHistoryBtn").css('display', 'block');

    //focus track
    $(window).scrollTop($('#t_'+track_id).offset().top - ($(window).height() / 2));
    logPlay(track_id);
}

//Arrow Key functionality
//Hold of arrow keys for seek functionality
$('html').on({
    keydown: function(e) {
        var charCode = (e.which) ? e.which : event.keyCode, keyP;
        tag = e.target.tagName.toLowerCase();
        if (!timer) timer = setTimeout(function() {
            clearTimeout(timer);
            timer=false;

            if (charCode == 37 && tag != 'input' && tag != 'textarea')
            {
                e.preventDefault();
                seekPlayer('backward', 15);//Seek backward
                allowTrackMovement = 0;
            }
            if (charCode == 39 && tag != 'input' && tag != 'textarea')
            {
                e.preventDefault();
                seekPlayer('forward', 15);//Seek forward
                allowTrackMovement = 0;
            }
        }, 150);

        if(e.keyCode == 32 && tag != 'input' && tag != 'textarea')
        { // space
            e.preventDefault();
            pausePlayer();
        }
        if(e.keyCode == 40 && tag != 'input' && tag != 'textarea')
        {
            e.preventDefault();
        }
        if(e.keyCode == 38 && tag != 'input' && tag != 'textarea')
        {
            e.preventDefault();
        }
    },
    keyup: function(e) {
        tag = e.target.tagName.toLowerCase();
        clearTimeout(timer);
        timer=false;
        if(e.keyCode == 37 && tag != 'input' && tag != 'textarea')
        { // left
            if (allowTrackMovement == 1)
            {
                skipPlayer('backward');//Previous Song
            }
            allowTrackMovement = 1;
        }
        else if(e.keyCode == 39 && tag != 'input' && tag != 'textarea')
        { // right
            if (allowTrackMovement == 1)
            {
                skipPlayer('forward');//Next Song
            }
            allowTrackMovement = 1;
        }
        else if(e.keyCode == 38 && tag != 'input' && tag != 'textarea')
        { // up
            if (cpTrack) {
                dpid = $('#t_' + cpTrack).attr('data-pid');
                c_flg = crateFlip(cpTrack,dpid,true);
            }
            //CRATE toggle
        }
        else if(e.keyCode == 40 && tag != 'input' && tag != 'textarea')
        { // down
            if (cpTrack) downloadTrack(cpTrack, '', email);
            //DOWNLOAD
        }
        else if(e.keyCode == 83 && tag != 'input' && tag != 'textarea')
        { // S (key)
            $('input[name=searchterm]').get(0).focus();
            //SEARCH
        }
        else if(e.keyCode == 13 && tag != 'input' && tag != 'textarea')
        { //ENTER
            if (cpTrack) $('#t_'+ cpTrack).children().find('.downloadBtn')[0].click();
        }
        else if(e.keyCode == 88 && tag != 'input' && tag != 'textarea')
        { //C

            if (cpTrack) $('#t_'+ cpTrack).children().find('.clearHistoryBtn').click();
        }
        else if(e.keyCode == 81 && tag != 'input' && tag != 'textarea')
        { //Q
            if (!(cPage))
            {
                window.location.href = "http://www." + djcity_host + queuePage;
            }
        }
    }
});

function logPlay(tid)
{
    ctid = $("#jquery_jplayer").data("jPlayer").status.src.replace('http://preview.cdn.djcity.com/', '').replace('.mp3','');
    ctid = cpTrack;

    setTimeout(function(){
        if (ctid == tid && $("#jquery_jplayer").data("jPlayer").status.paused == false)
        {
            playSetVisual(tid);
            $.get(hosted_url + 'play.php?email=' + email + '&tid=' + tid);
        }
    }, 2000);
}

function clearHistory(tid)
{
    if (tid)
    {
        playSetVisual(tid,true);
        downloadVisual(tid,false);
        $.get(hosted_url + 'clearhistory.php?email=' + email + '&tid=' + tid);
    }
    else
    {
        $.get(hosted_url + 'clearhistory.php?email=' + email);
    }
}

function trackVersionDownload(pdata)
{
    var verTypes = [];
    var sPage = $(pdata);
    $(sPage).find('#ad_sublisting').children('li').each(function(k,v){ //LOOP THROUGH EACH VERSON

        t = $(this)
        dlink = t.find('.float_right.reviw_tdonw').find('a').attr('href')
        t_ver = t.find('.float_left').text()
        p_pos = t_ver.indexOf('(')
        if (p_pos > -1) t_ver = t_ver.substring(0,p_pos - 1)
        //FIND VERSION IN MASTER
        var item = versionInfo.find(item => item.vName == t_ver);

        if (item)
        {
            t_vid = item['vID']
            if (!(t_vid)) t_vid = null
            verTypes.push({'vtype':t_ver, 'vid':t_vid, 'dlink':dlink});
        }

    })
    if (verTypes.length == 0) {
        console.log('There were no versions found for this track')
    }
    return verTypes
}

function getTrackLabel(pdata){
    sPage = $(pdata);
    artist = $($(sPage).find('.float_right.artist_details')[0]).text()
    title =  $($(sPage).find('.float_right.artist_details')[1]).text()
    return {'title':title,'artist':artist}
}

function downloadTrack(track_id, version, email)
{
    var pdata = rateTrack(track_id);
    var t_info = getTrackLabel(pdata);
    var vt = trackVersionDownload(pdata);
    var dlAll = readCookie('downloadAllFlag')

    // DISABLING UNTIL I CNA BEAT RECAPTCHA
    if (dlAll == 'Yes') {
        $(vt).each(function(k,v){
            //download_url = 'http://media.' + djcity_host + '/dd2.aspx?r=' + track_id + '&t=' + v['vid'];
            download_url = 'http://' + djcity_host + this.dlink
            $.get(hosted_url + 'download.php?email=' + email + '&tid=' + track_id);
            downloadVisual(track_id);
            console.log(download_url);
            downloadFile(download_url);
        })
    }
    else
    {
        verd = findVersionID(vt,version);
        if (verd){
            dlink = verd['dlink']
            if (dlink != '#') {
                download_url = 'http://' + djcity_host + dlink
                $.get(hosted_url + 'download.php?email=' + email + '&tid=' + track_id);
                downloadVisual(track_id);
                console.log(download_url);
                downloadFile(download_url);
            }
            else {
                $.confirm({
                    title: 'Too Many Downloads!',
                    boxWidth: '30%',
                    useBootstrap: false,
                    type: 'red',
                    content: 'You have reached the max number of downloads for the (' + verd['vtype'] + ') version of this the (' + t_info['title'] + ' | ' + t_info['artist']+ ') track.',
                    buttons: {
                        close: {
                            text: 'Ok',
                            keys: ['enter','esc'],
                            action: function(){
                            }
                        }
                    }
                  });
            }
        }
    }
}

function downloadFile(url)
{
    GM_openInTab(url) //RECAPTCHA THAT!!!
    //$('#fileDownload').attr('href',url);
    //$("#fileDownload")[0].click();
    //$('#fileDownload').attr('href','');
}

function findVersionID(vt, version)
{
    var vid;
    var robj;

    if (version) {
      m = findObjectByKey(vt,'vtype',version)
      if (m) robj = m
    }
    else {
     //routine to find the highest "HIT"
        $(versionInfo).each(function(k,v){
            m = findObjectByKey(vt,'vtype',v['vName'])
            if (!robj && m) robj = m
        })

        if (!robj) {
            console.log('Version Not Found','Version Types->',vt,'Version->',version)
            $.getJSON(hosted_url + 'missing_version.php?version=' + encodeURIComponent(version));
        }

    }
    return robj;
}

function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key].indexOf(value) > -1) {
            return array[i];
        }
    }
    return null;
}

function logDownload(sid,email)
{
    $.ajax({
        url: hosted_url + '/download.php',
        type: "GET",
        data: "uid=" + email + "&sid=" + sid,
        success: function(data, textStatus, jqXHR) {
            //data - response from server
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('Error with download logging');
        }
    });
}

function rateTrack(track_id)
{
    var track_url = 'http://www.' + djcity_host + '/record-pool_track.aspx?rid=' + track_id;
    $.ajaxSetup({async:false});
    $.get(track_url, function(data) {content = data;});

    //Viewstate
    vs_start = content.indexOf('id="__VIEWSTATE" value="') + 'id="__VIEWSTATE" value="'.length;
    vs_end = content.indexOf('"', vs_start);
    vs = content.substring(vs_start, vs_end);

    //Event Argument
    ea_start = content.indexOf('id="__EVENTVALIDATION" value="') + 'id="__EVENTVALIDATION" value="'.length;
    ea_end = content.indexOf('"', ea_start);
    ea = content.substring(ea_start, ea_end);

    post_data = '__EVENTTARGET=&__EVENTARGUMENT=&__VIEWSTATE=' + encodeURIComponent(vs) + '&__EVENTVALIDATION=' + encodeURIComponent(ea) + '&ctl00%24PageContent%24rating=3&ctl00%24PageContent%24like=&ctl00%24PageContent%24submit=';
    url = '/record-pool_track.aspx?rid=' + track_id;

    if (content.indexOf('>download now</a>') == -1)
    {
        $.ajax({
            url : url,
            type: "POST",
            data : post_data,
			async:false,
            success: function(data, textStatus, jqXHR)
            {
                //track rated - data
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                console.log('Error with post request to rate track (Url :' + url + ' Post Data:' + post_data);
            }
        });
    }
    //GET PAGE AGAIN WITH LINKS....
    $.get(track_url, function(data) {content = data;});
    $.ajaxSetup({async:true});
    return content;
}

//Version Managemnent=========================================================================
var versionInfo = [];

//Put these in the order you want everything downloaded
//VID is not used anymore, but it could come back.. so i'm not removing it. 200 + VID's are just added to keep everything functioning correctly and aren't accruate.
versionInfo.push({'vName':"Intro - Dirty", 'vID':11});
versionInfo.push({'vName':"Intro", 'vID':12});
versionInfo.push({'vName':"Intro - Clean", 'vID':10});
versionInfo.push({'vName':"Dirty", 'vID':3});
versionInfo.push({'vName':"Main", 'vID':7});
versionInfo.push({'vName':"Clean", 'vID':2});
versionInfo.push({'vName':"Instrumental", 'vID':4});
versionInfo.push({'vName':"Inst Loop", 'vID':13});
versionInfo.push({'vName':"Acapella", 'vID':5});
versionInfo.push({'vName':"Acap - Clean", 'vID':8});
versionInfo.push({'vName':"Acap - Dirty", 'vID':9});
versionInfo.push({'vName':"Acap - DIY Dirty", 'vID':15});
versionInfo.push({'vName':"Acap - DIY Clean", 'vID':16});
versionInfo.push({'vName':"Inst", 'vID':17});
versionInfo.push({'vName':"Acap - DIY", 'vID':18});
versionInfo.push({'vName':"Short Edit", 'vID':19});
versionInfo.push({'vName':"Acap", 'vID':200});

function queueDataLoad()
{
    if (cUrl.indexOf(queuePage) > 0)
    {
        //Check users crate
        vurl = hosted_url + 'crate.php?email='+encodeURIComponent(email)
            $.ajax({
                url: vurl,
                type: "GET",
                crossDomain: true,
                dataType: 'json',
                async:false,
                success:function(data)
            {
                var jpcnt = $('div[id^=jp_container_]').length;
                if (data.length > 0)
                {
                    cPage = true;
                    //Add crate layout section to page along with appropriate buttons
                    var cPageHtml = '<div class=\"spacer20\"><\/div>\r\n<div class=\"spacer20\"><\/div>\r\n\r\n<div class=\"header_border_bottom\">\r\n                  <div style=\"position:absolute;bottom:0;\"><h1><span class=\"SectionTitleText\">Custom Crate<\/span><\/h1><\/div><div class=\"float_right\" style=\"margin-bottom:5px;\"><span id=\"crate_count\" style=\"color:red;font-weight:bold;\"><\/span><\/div>\r\n                  <div class=\"float_right\" style=\"margin-bottom:5px;\">\r\n                     \r\n               \r\n                  <\/div>\r\n                  <div class=\"clear\"><\/div>\r\n               <\/div>\r\n\r\n<div class=\"spacer20\"><\/div>\r\n<div class=\"bb_doted\"><div class=\"spacer5\"><\/div><\/div>\r\n\r\n<div>\r\n<ul class=\"record_pool_listing\">\r\n    <div id=\"customCrateContent\">\r\n   \r\n\t<\/div>\r\n<\/ul>\r\n<\/div>\r\n'
                    cPageHtml += '<input type=\"submit\" value=\"Download All\" onclick=\"return confirm(\'Are you sure you would like to download all the tracks in your custom crate?\');\" id=\"downloadAll\" class=\"btn\">\r\n'
                    cPageHtml += '<input type=\"submit\" value=\"Delete All\" onclick=\"return confirm(\'Are you sure you would like to remove all of the tracks in your custom crate?\');\" id=\"removeAll\" class=\"btn\">\r\n<input type=\"submit\" value=\"Clear All History\" onclick=\"return confirm(\'Are you sure you would like to remove all of your play\/download statistics?\');\" id=\"clearAllHistory\" class=\"btn\">';
                    $(".float_left.page_left").append(cPageHtml);
                    $('#crate_count').html(data.length);
                    $(window).scrollTop($('#customCrateContent').offset().top - ($(window).height() / 2));

                    //REMOVE TOP PICKS FROM SCRIPT FUNCTIONALITY
                    $('[id^=t_]').each(function(k,v){
                        $(this).addClass('ignore')
                        $(this).find('.jp-play').remove()
                    })

                    $(data).each(function(){
                        var tid = this.tid;
                        var dpid = this.dpid;
                        var url = '/record-pool_track.aspx?rid=' + tid;
                        var trackHTML = '<li>\r\n        <div class=\"float_left w410\">\r\n            <div id=\"t_[TID]\" data-pid=\"[DPID]\">\r\n                <div id=\"jp_container_[JPNUM1]\" class=\"jp-audio\">\r\n                    <div class=\"jp-type-single\">\r\n                        <div id=\"jp_interface_[JPNUM2]\" class=\"jp-interface\">\r\n                            <ul class=\"jp-controls\">\r\n                                <li>\r\n                                    <a href=\"[LINK1]\" class=\"downloadBtn\" target=\"_blank\">download<\/a>\r\n                                <\/li>\r\n                                <li>\r\n                                    <a href=\"javascript:void(0);\" class=\"jp-play\">play<\/a>\r\n                                <\/li>\r\n                                <li>\r\n                                    <a href=\"javascript:void(0);\" class=\"jp-pause\">pause<\/a>\r\n                                <\/li>\r\n                            <\/ul>\r\n                            <div class=\"jp-progress\">\r\n                                <div class=\"player_txt\">\r\n                                    <h2>\r\n                                        <a href=\"[LINK2]\">[TITLE]<\/a>\r\n                                    <\/h2>[ARTIST]\r\n                                <\/div>\r\n                                <div class=\"jp-seek-bar\">\r\n                                    <div class=\"jp-play-bar\"><\/div>\r\n                                <\/div>\r\n                            <\/div>\r\n                        <\/div>\r\n                    <\/div>\r\n                <\/div>\r\n            <\/div>\r\n        <\/div>\r\n        <div class=\"float_right w210\">\r\n            <ul class=\"pool_icon\">\r\n\t\t\t\t<li>\r\n\t\t\t\t\t<a class=\"dot_icon\" style=\"visibility:hidden\"><\/a>\r\n\t\t\t\t<\/li>\r\n\t\t\t\t<li>\r\n\t\t\t\t\t<a class=\"hash_icon\" style=\"visibility:hidden\"><\/a>\r\n\t\t\t\t<\/li>\r\n\t\t\t\t<li>\r\n\t\t\t\t\t<a class=\"c_icon\" style=\"visibility:hidden\"><\/a>\r\n\t\t\t\t<\/li>\r\n\t\t\t\t<li>\r\n\t\t\t\t\t<a class=\"music_icon\" style=\"visibility:hidden\"><\/a>\r\n\t\t\t\t<\/li>\r\n\t\t\t\t<li>\r\n\t\t\t\t\t<a class=\"record_icon\" style=\"visibility:hidden\"><\/a>\r\n\t\t\t\t<\/li>\r\n\t\t\t\t<li>\r\n\t\t\t\t\t<a class=\"info_icon\" style=\"visibility:hidden\"><\/a>\r\n\t\t\t\t<\/li>\r\n                <li class=\"last\">\r\n                    <input class=\"customCrateDeleteButton\" type=\"checkbox\">\r\n                    <\/li>\r\n                <\/ul>\r\n            <\/div>\r\n            <div class=\"clear\"><\/div>\r\n<\/li>';
                        $.ajax({
                            url: url,
                            success: function(dt) {
                                t_info = getTrackLabel(dt)
                                title = t_info['title']
                                artist = t_info['artist']

                                //Add track to crate div
                                $("#customCrateContent").append(trackHTML.replace("t_[TID]","t_" + tid).replace('[DPID]',dpid).replace('[TITLE]',title).replace('[ARTIST]',artist).replace('[JPNUM1]',$('[id^=t_]').length).replace('[JPNUM2]',$('[id^=t_]').length).replace('[LINK1]',url).replace('[LINK2]',url));
                                var vTypes = trackVersionDownload(dt);
                                //Check Specific Versions | Main,Dirty,Clean,Instrumental,Acca,Into
                                $(vTypes).map(function(i,val){
                                    if (val.vtype.indexOf('Main') > -1) $('#t_'+tid).parents('li').find('a.dot_icon').css('visibility','visible');
                                    if (val.vtype.indexOf('Dirty') > -1) $('#t_'+tid).parents('li').find('a.hash_icon').css('visibility','visible');
                                    if (val.vtype.indexOf('Clean') > -1) $('#t_'+tid).parents('li').find('a.c_icon').css('visibility','visible');
                                    if (val.vtype.indexOf('Inst') > -1) $('#t_'+tid).parents('li').find('a.music_icon').css('visibility','visible');
                                    if (val.vtype.indexOf('Acca') > -1) $('#t_'+tid).parents('li').find('a.record_icon').css('visibility','visible');
                                    if (val.vtype.indexOf('Intro') > -1) $('#t_'+tid).parents('li').find('a.info_icon').css('visibility','visible');
                                });
                                //hide play button
                                $('#t_'+tid).find('.jp-play').hide();
                                if (data.length == $('#customCrateContent').find('[id^=t_]').length)
                                {
                                    loadJPlayer();
                                    buildTrackArray();
                                    pageVisuals();
                                    $('#customCrateContent').find('.jp-play').fadeIn(1000);
                                }
                            }
                        });
                        jpcnt = jpcnt + 1;
                    });
                }
                //else clearCrateVisuals()
            }
        });

        if ($('#jquery_jplayer').length == 0)
        {
            $('#container').append('<div id="jquery_jplayer" class="jp-jplayer" style="width: 0px; height: 0px;"><img id="jp_poster_0" style="width: 0px; height: 0px; display: none;"><audio id="jp_audio_0" preload="auto"></audio></div>');
        }

        $('#downloadAll').click(function(){
            time = 0;
            $('#customCrateContent').find('[id^=t_]').each(function(a,b) {
                setTimeout( function(){
                     var tid = $(b).attr('id').replace('t_','');
                    downloadTrack(tid, '', email);
                }, time)
                time += 750;
            });
            time = 0;
        });

        $('#removeAll').click(function(){
            crateFlip(null,null,true);
        });
    }
}

function reverse(s){
    return s.split("").reverse().join("");
}

function getLocation(href) {
    var l = document.createElement("a");
    l.href = href;
    return l.hostname.replace('www.','');
};