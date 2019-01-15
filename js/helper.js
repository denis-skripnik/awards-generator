function checkWorkingNode() {
	const NODES = [
	 "wss://ws.viz.ropox.tools", 
	 "wss://viz.lexai.host"
	];
	let node = localStorage.getItem("node") || NODES[0];
	const idx = Math.max(NODES.indexOf(node), 0);
	let checked = 0;
	const find = (idx) => {
	 if(idx >= NODES.length) {
	  idx = 0;
	 }
	 if(checked >= NODES.length) {
	  alert("no working nodes found");
	  return;
	 }
	 node = NODES[idx];
	 viz.config.set("websocket", node);
	 viz.api.getDynamicGlobalPropertiesAsync()
	  .then(props => {
	   console.log("found working node", node);
	   localStorage.setItem("node", node);
	  })
	  .catch(e => {
	   console.log("connection error", node, e);
	   find(idx+1);
	  });
	}
	find(idx);
   }
checkWorkingNode();


var viz_login = '';
var posting_key = '';

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

if (getUrlVars()['target']) {
var award_target = getUrlVars()['target'];
} else if (localStorage.getItem('login')) {
var award_target = localStorage.getItem('login');
}
if (getUrlVars()['energy']) {
var award_energy = getUrlVars()['energy'];
} else {
	var award_energy = 0.01;
}

if (getUrlVars()['custom_sequence']) {
var custom_sequence = getUrlVars()['custom_sequence'];
} else {
	var custom_sequence = 0;
}

if (getUrlVars()['memo']) {
var memo = decodeURIComponent(getUrlVars()['memo']);
} else {
	var memo = '';
}
if (getUrlVars()['beneficiaries']) {
var beneficiaries = decodeURIComponent(getUrlVars()['beneficiaries']);
var benef = beneficiaries.split(',');
var benef_list = [];
benef.forEach(function (el) {
var b = el.split(':');
var benef_login = b[0];
var benef_percent = +b[1]*100;
benef_list.push({account:benef_login,weight:benef_percent});
});
} else {
	var benef_list = [];
}
var redirect = getUrlVars()['redirect'];


function send_award(viz_login, posting_key) {
	return viz.broadcast.award(posting_key,viz_login,award_target,award_energy*100,custom_sequence,memo,benef_list,function(err,result){
if (!err) {
if (redirect) {
	window.location.href = redirect;
} else {
viz.api.getAccounts([viz_login], function (err, res) {
$('#account_energy').html(res[0].energy/100 + '%');
});

	jQuery("#main_award_info").css("display", "block");
	$('#main_award_info').html('<h1>Результат:</h1>\
<p><strong>Вы успешно отправили награду.</strong></p>\
<ul><li>Направление: ' + award_target + '</li>\
<li>Затрачиваемый процент энергии: ' + award_energy + '%</li>\
<li>Номер Custom операции (С каждой операцией он увеличивается в get_accounts): ' + custom_sequence + '</li>\
<li>Заметка (Memo, описание; назначение может быть любым): ' + memo + '</li>\
<li>Бенефициары: ' + JSON.stringify(beneficiaries) + '</li>\
<li>Осталось энергии на момент последней награды: <span id="account_energy"></span></li>\
</ul>');
}
} else {
window.alert(err);
}
});
}

function awardAuth() {
			let login = $('#this_login').val();
			let posting = $('#this_posting').val();
var isSavePosting = document.getElementById('isSavePosting');
			if (isSavePosting.checked) {
		localStorage.setItem('login', login);
			localStorage.setItem('PostingKey', sjcl.encrypt(login + '_postingKey', posting));
			}
			if (localStorage.getItem('PostingKey')) {
		var isPostingKey = sjcl.decrypt(login + '_postingKey', localStorage.getItem('PostingKey'));
} else {
var isPostingKey = posting;
}

			var resultIsPostingWif = viz.auth.isWif(isPostingKey);
console.log(resultIsPostingWif);
			if (resultIsPostingWif === true) {
viz_login = login;
			posting_key = isPostingKey;
} else {
window.alert('Постинг ключ имеет неверный формат. Пожалуйста, попробуйте ещё раз.');
}

if (!viz_login && !posting_key) {
		$('#delete_posting_key').css("display", "none");
		$('#unblock_form').css("display", "block");
} else {
		$('#unblock_form').css("display", "none");
	$('#delete_posting_key').css("display", "block");
	jQuery("#delete_posting_key").html('<p align="center"><a onclick="localStorage.removeItem(\'login\'\); localStorage.removeItem(\'PostingKey\'\);     location.reload();">Выйти</a></p>');
	send_award(viz_login, posting_key);
	}
			} // end awardAuth