function checkWorkingNode() {
	const NODES = [
	 "wss://ws.viz.ropox.tools", 
	 "wss://viz.lexai.host",
"wss://solox.world/ws"
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

async function accountData(current_user) {
	const [acc] = await viz.api.getAccountsAsync([current_user]);
	const props = await viz.api.getDynamicGlobalPropertiesAsync();
	const vesting_shares = parseFloat(acc.vesting_shares);
	const delegated_vesting_shares = parseFloat(acc.delegated_vesting_shares);
	const received_vesting_shares = parseFloat(acc.received_vesting_shares);
const effective_vesting_shares = vesting_shares + received_vesting_shares - delegated_vesting_shares;
	const total_vesting_fund = parseFloat(props.total_vesting_fund);
	const total_vesting_shares = parseFloat(props.total_vesting_shares);
		const total_reward_fund = parseFloat(props.total_reward_fund);
	const total_reward_shares = parseInt(props.total_reward_shares);

	let last_vote_time=Date.parse(acc.last_vote_time);
	let delta_time=parseInt((new Date().getTime() - last_vote_time+(new Date().getTimezoneOffset()*60000))/1000);
let energy=acc.energy;
let new_energy=parseInt(energy+(delta_time*10000/432000));//CHAIN_ENERGY_REGENERATION_SECONDS 5 days
if(new_energy>10000){
	new_energy=10000;
	}

	var shares1energy = 1*(total_vesting_fund/total_vesting_shares) / total_reward_fund*(total_reward_shares / 1000000)/effective_vesting_shares;
	shares1energy *= 100;
	shares1energy *= 100;
	shares1energy = parseInt(shares1energy);
	shares1energy /= 100;

	$("#now_energy").html('Актуальная энергия пользователя ' + current_user + ': ' + new_energy/100 + '%. 1 SHARES ≈ ' + shares1energy + '% энергии.');

	var max_payout = effective_vesting_shares * new_energy /10000 / (total_reward_shares/1000000) * total_reward_fund / (total_vesting_fund / total_vesting_shares)*1000000;
	max_payout = parseInt(max_payout) / 1000000;
$("#max_payout").html(' (Максимум: ' + max_payout + ')');
$("#max_payout").click(function () {
	$('input[name=payout]').val(max_payout);

	var payout_energy = max_payout*(total_vesting_fund/total_vesting_shares) / total_reward_fund*(total_reward_shares / 1000000)/effective_vesting_shares;
	payout_energy *= 100;
	payout_energy *= 100;
	payout_energy = parseInt(payout_energy);
	payout_energy /= 100;

	$("#awarding_energy").val(payout_energy);
});

$("input[name='energy']").change(function() {
var input_energy = $("input[name='energy']").val();
input_energy *= 100;
input_energy = parseInt(input_energy);
input_energy = input_energy/100;
	var change_payout = effective_vesting_shares * input_energy /100 / (total_reward_shares/1000000) * total_reward_fund / (total_vesting_fund / total_vesting_shares)*1000000;
	change_payout = parseInt(change_payout) / 1000000;
	$("input[name='payout']").val(change_payout);
});
$("input[name='payout']").change(function() {
	var payout = $('input[name=payout]').val();
	var payout_energy = payout*(total_vesting_fund/total_vesting_shares) / total_reward_fund*(total_reward_shares / 1000000)/effective_vesting_shares;
	payout_energy *= 100;
	payout_energy *= 100;
	payout_energy = parseInt(payout_energy);
	payout_energy /= 100;

	$("#awarding_energy").val(payout_energy);
});

}

async function send_award(viz_login, posting_key) {
	const [acc] = await viz.api.getAccountsAsync([viz_login]);
	const props = await viz.api.getDynamicGlobalPropertiesAsync();

	const vesting_shares = parseFloat(acc.vesting_shares);
	const delegated_vesting_shares = parseFloat(acc.delegated_vesting_shares);
	const received_vesting_shares = parseFloat(acc.received_vesting_shares);
const effective_vesting_shares = vesting_shares + received_vesting_shares - delegated_vesting_shares;
	const total_vesting_fund = parseFloat(props.total_vesting_fund);
	const total_vesting_shares = parseFloat(props.total_vesting_shares);
		const total_reward_fund = parseFloat(props.total_reward_fund);
	const total_reward_shares = parseInt(props.total_reward_shares);

	if (getUrlVars()['target']) {
		var award_target = getUrlVars()['target'];
award_target = award_target.toLowerCase();
	} else {
		var award_target = viz_login;
	}

		if (getUrlVars()['payout']) {
			var payout = getUrlVars()['payout'];

		var award_energy = payout*(total_vesting_fund/total_vesting_shares) / total_reward_fund*(total_reward_shares / 1000000)/effective_vesting_shares;
		award_energy *= 100;
		award_energy *= 100;
		award_energy = parseInt(award_energy);
	} else {
		if (getUrlVars()['energy']) {
			var award_energy = getUrlVars()['energy'];
			award_energy *= 100;
			award_energy = parseInt(award_energy);
		} else {
			var award_energy = 1;
		}
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
var beneficiaries_whait = 0;
		benef.forEach(function (el) {
		var b = el.split(':');
		var benef_login = b[0];
		benef_login = benef_login.toLowerCase();
		var benef_percent = +b[1]*100;
		beneficiaries_whait += benef_percent/100;
		benef_list.push({account:benef_login,weight:benef_percent});
		});
		} else {
var beneficiaries_whait = 0;
			var benef_list = [];
		}
		var redirect = getUrlVars()['redirect'];
		

// Рассчёт стоимости награды:
var all_award_payout = effective_vesting_shares * award_energy /10000 / (total_reward_shares/1000000) * total_reward_fund / (total_vesting_fund / total_vesting_shares)*1000000;
var beneficiaries_payout = (all_award_payout/100)*beneficiaries_whait;
var award_payout = all_award_payout - beneficiaries_payout;
all_award_payout = parseInt(all_award_payout) / 1000000;
beneficiaries_payout = parseInt(beneficiaries_payout) / 1000000;
award_payout = parseInt(award_payout) / 1000000;

		viz.broadcast.awardAsync(posting_key,viz_login,award_target,award_energy,custom_sequence,memo,benef_list, (err,result) => {
if (!err) {
if (redirect) {
	window.location.href = redirect;
} else {
viz.api.getAccountsAsync([viz_login], (err, res) => {
$('#account_energy').html(res[0].energy/100 + '%');
});

	jQuery("#main_award_info").css("display", "block");
	$('#main_award_info').html(`<h1>Результат:</h1>
<p><strong>Вы успешно отправили награду.</strong></p>
<ul><li>Направление: ${award_target}</li>
<li>Затрачиваемый процент энергии: ${award_energy/100}%</li>
<li>Примерная награда в SHARES:
общая: ${all_award_payout},
Бенефициарам: ${beneficiaries_payout},
Награждаемому: ${award_payout}</li>
<li>Номер Custom операции (С каждой операцией он увеличивается в get_accounts): ${custom_sequence}</li>
<li>Заметка (Memo, описание; назначение может быть любым): ${memo}</li>
<li>Бенефициары: ${JSON.stringify(beneficiaries)}</li>
<li>Осталось энергии на момент последней награды: <span id="account_energy"></span></li>
</ul>`);
}
} else {
	if (/used_energy <= current_energy/.test(err)) {
		jQuery("#main_award_info").css("display", "block");
		$('#main_award_info').html(`<h1>Указанный вами процент энергии > имеющейся у авторизованного аккаунта</h1>
<p align="center">Просьба проверить значение energy в адресной строке или ввести новое в <a href="https://liveblogs.space/awards/form.html" target="_blank">форме</a>.</p>`);
	} else if (/beneficiaries.weight = NaN/.test(err)) {
		jQuery("#main_award_info").css("display", "block");
		$('#main_award_info').html(`<h1>Вы указали бенефициара, но не указали процент, который он получит</h1>
<p align="center">Просьба проверить значение после двоеточия в beneficiaries (адресная строка) или ввести новое в <a href="https://liveblogs.space/awards/form.html" target="_blank">форме</a>.</p>`);
	} else if (/acc != nullptr: Beneficiary/.test(err)) {
		jQuery("#main_award_info").css("display", "block");
		$('#main_award_info').html(`<h1>1 или несколько аккаунтов бенефициаров не существует.</h1>
<p align="center">Просьба проверить значение beneficiaries в адресной строке или ввести новое в <a href="https://liveblogs.space/awards/form.html" target="_blank">форме</a>.</p>`);
	} else if (/is_valid_account_name\(name\): Account name/.test(err)) {
		jQuery("#main_award_info").css("display", "block");
		$('#main_award_info').html(`<h1>Аккаунт награждаемого или бенефициара не существует.</h1>
<p align="center">Просьба проверить значение target и beneficiaries (Первую часть до двоеточия) в адресной строке.  Также можно ввести новое в <a href="https://liveblogs.space/awards/form.html" target="_blank">форме</a>.</p>`);
} else {
window.alert(err);
}
}
});
}

function awardAuth(IsPageSend) {
			let login = $('#this_login').val();
			let posting = $('#this_posting').val();
var isSavePosting = document.getElementById('isSavePosting');
			if (isSavePosting.checked) {
		localStorage.setItem('login', login);
			localStorage.setItem('PostingKey', sjcl.encrypt(login + '_postingKey', posting));
			} else {
				sessionStorage.setItem('login', login);
				sessionStorage.setItem('PostingKey', sjcl.encrypt(login + '_postingKey', posting));
			}
			if (localStorage.getItem('PostingKey')) {
		var isPostingKey = sjcl.decrypt(login + '_postingKey', localStorage.getItem('PostingKey'));
			} else if (sessionStorage.getItem('PostingKey')) {
				var isPostingKey = sjcl.decrypt(login + '_postingKey', sessionStorage.getItem('PostingKey'));
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
if (IsPageSend === true) {
	send_award(viz_login, posting_key);
} else {
	accountData(viz_login);
}
}
			} // end awardAuth

			var benif = '';
			var maxweightsum = 100;
			var weightsum = 0;
			
			function updateText() {
				document.getElementById('out').innerHTML = 'Итоговый список: ' + benif;
			}
			
			function add() {
				var nick = document.getElementById('nick').value;
				var per = parseFloat(document.getElementById('per').value);
			
				if (weightsum + per > maxweightsum) {
					if (weightsum === 0) {
						alert("Процент превышает " + maxweightsum + "%.");
					} else {
						alert("Сумма процентов превышает " + maxweightsum + "%." +
							" Вы можете ввести максимум " + (maxweightsum - weightsum) + "%.");
					}
				} else {
						benif += nick + ':' + per + ',';
			
					
					weightsum += per;
			

					updateText()
				}
			}
			

			updateText();

// Для furm.html:
async function awardFormSend() {
	benif = benif.replace(/,\s*$/, "");
	var form = document.getElementById('award_user_form');
var data = {target: form.target.value, energy: form.energy.value, custom_sequence: form.custom_sequence.value, memo: form.memo.value, beneficiaries: benif, redirect: form.redirect.value};

var url_str = '';
url_str += 'https://liveblogs.space/awards?';
for (key in data) {
if (data[key]) {
	url_str += key + '=' + data[key] + '&';
}
}
url_str = url_str.replace(/&\s*$/, "");

window.location.href = url_str;
}

// Для url.html:
async function view_url() {
	benif = benif.replace(/,\s*$/, "");
	var form = document.getElementById('AwardUrlForm');
	var data = {target: form.target.value, energy: form.energy.value, custom_sequence: form.custom_sequence.value, memo: form.memo.value, beneficiaries: benif, redirect: form.redirect.value};
	$("#award_url").css("display", "block");
	$("#award_url").html(`<h2>Сформированный url награды:</h2>
	<textarea id="award_textarea"></textarea>`);
	
	var url_str = '';
	url_str += 'https://liveblogs.space/awards?';
	for (key in data) {
	if (data[key]) {
		url_str += key + '=' + data[key] + '&';
	}
	}
	url_str = url_str.replace(/&\s*$/, "");
	
	$("#award_textarea").html(url_str);
	}
	