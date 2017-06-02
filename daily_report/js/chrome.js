$(function() {
	
	// 初期値
	var now = new Date();
	var target= now.getFullYear() + '-' + (now.getMonth() + 1)  +'-' + now.getDate();
	view(target);
	$('#date').val((now.getMonth() + 1)  +'/' + now.getDate() + '/' + now.getFullYear());
	
	// カレンダー選択
	$('#date').datepicker()
	.on('changeDate', function(e){
		$(this).datepicker("hide");
		var dates = $('#date').val().split("/");
		target= dates[2]+'-'+dates[0]+ '-' + dates[1];
		view(target);
	});
	
	// ダウンロード実行
	$(document).on('click', "#download_link", function() {
	    var report='';
	    report += "--- 業務内容 ---\n";
	    report += $('#download_text').html();
	    report += "\n";
	    report += "--- 感想 / 今日の一言\n";
	    report += $('#report_coment').val();
	    var blob = new Blob([report]);
	    var url = window.URL || window.webkitURL;
	    var blobURL = url.createObjectURL(blob);
	    var a = document.createElement('a');
	    a.download = 'daily_report'+target+'.txt';
	    a.href = blobURL;
	    a.click();  		
	});

});

function view(tgt){
	var html='',text_data='';
	var query = {
		text: '',
		startTime: (new Date(tgt + ' 00:00')).getTime() ,
		endTime: (new Date(tgt + ' 23:59')).getTime(),
		maxResults: 1000
	};
	chrome.history.search(query, function (results) {
		var badge=0;
		var sites = {},sites_text = {};
		results.forEach(function (result) {
			var date = new Date(result.lastVisitTime);
			var domain = result.url.split('/')[2] ;
			domain = (domain == '') ? 'unknown' : domain ;

			if ( !sites[domain] ) {sites[domain] = '';}
			if ( !sites_text[domain] ) {sites_text[domain] = '';}
			sites[domain] += '<li>' + 
                '<a href="' + result.url + '" target="_blank">' +
                  date.toLocaleTimeString() +
                  result.title +
                '</a>' +
              '</li>';
			sites_text[domain] += ' '+ date.toLocaleTimeString() + ' '+ result.title+"\n" ;
            badge++;
		});
		for (var key in sites) {
			html += '<div class="panel panel-success"><div class="panel-heading">'+key+'</div>';
			html += '<div class="panel-body"><ul>'+sites[key]+'</ul></div></div>';
			key = (key == 0) ? '' : key ;
			sites_text[key] = (sites_text[key] == 0) ? '' : sites_text[key] ;
			text_data += "\n・" + key + "\n";
			text_data += sites_text[key]+ + "\n";
		}
		chrome.browserAction.setBadgeText({"text":String(badge)});
		$('#history-list').html(html);
		$('#download_link').show();
		$('#download_text').text(text_data);
		$('#download_text').hide();
	});
	

}