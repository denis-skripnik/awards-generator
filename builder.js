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


$(document).ready(function() {
	if (target_user) {
		$("#target").val(target_user);
	}
	
	$('#target').change(function() {
		check_login($(this).val());
	});
	$("#energy_slider_value").keyup(function() {
		if ($(this).val().replace(/[^0-9]/g, '') < 101) {
			$("#slider_energy").slider("value", $(this).val().replace(/[^0-9]/g, ''));
		} else {
			$(this).val("100%");
			alert("Значение не может превышать 100%")
		}
	});		
	$("#enegry_back").keyup(function() {
		if ($(this).val().replace(/[^0-9]/g, '') < 101) {
			if ($("#enegry_back_slider").length > 0) {
				$("#enegry_back_slider").slider("value", $(this).val().replace(/[^0-9]/g, ''));
				$("#beneficiaries").val($("#temp_beneficiaries").val() + $("#enegry_back").val().replace(/[^0-9]/g, ''));	
			} else {
				$("#beneficiaries").val($("#temp_beneficiaries").val() + $("#enegry_back").val().replace(/[^0-9]/g, ''));				
			}
		} else {
			$(this).val("100%");
			alert("Значение не может превышать 100%")
		}
	});		
	$("#temp_energy").keyup(function() {
		if ($(this).val().replace(/[^0-9]/g, '') > 100) {
			$(this).val("100%");
			alert("Значение не может превышать 100%");
		}
		$("#send_energy").val($(this).val().replace(/[^0-9]/g, ''));
	});
	
	
	if (localStorage.getItem('login') && localStorage.getItem('PostingKey')) {
		viz_login = localStorage.getItem('login');
		posting_key = sjcl.decrypt(viz_login + '_postingKey', localStorage.getItem('PostingKey'));
		if ($("#temp_beneficiaries").length > 0) {
			$("#temp_beneficiaries").val($("#temp_beneficiaries").val().replace('user_login', viz_login));
		}
		if ($("#beneficiaries").length > 0) {
			$("#beneficiaries").val($("#beneficiaries").val().replace('user_login', viz_login));
		}
	} else if (sessionStorage.getItem('login') && sessionStorage.getItem('PostingKey')) {
		viz_login = sessionStorage.getItem('login');
		posting_key = sjcl.decrypt(viz_login + '_postingKey', sessionStorage.getItem('PostingKey'));send_award(viz_login, posting_key);
		if ($("#temp_beneficiaries").length > 0) {
			$("#temp_beneficiaries").val($("#temp_beneficiaries").val().replace('user_login', viz_login));
		}
		if ($("#beneficiaries").length > 0) {
			$("#beneficiaries").val($("#beneficiaries").val().replace('user_login', viz_login));
		}
	} else {
		$("#send_awards_form").css("display","none");
		if ($("#sortable").length > 0) {
		} else {	
			$("#awards_send_form").append("<form id=\"auth_form\" action=\"index.html\" method=\"GET\"><p class=\"auth_title\"><strong>Пожалуйста авторизируйтесь</strong></p><input type=\"text\" id=\"this_login\" name=\"viz_login\" placeholder=\"Ваш логин\"><br><input type=\"password\" name=\"posting\" id=\"this_posting\" placeholder=\"Приватный постинг ключ\"><br><input type=\"submit\" value=\"Войти\"></form>");
		}
	}
	$("#auth_form").submit(function(e){
		e.preventDefault();
		AuthForm();
	});
	$("#send_awards_form").submit(function(e){
		e.preventDefault();
		send_award();
		/*var m_method=$(this).attr('method');
		var m_action=$(this).attr('action');
		var m_data=$(this).serialize();
		$("#back_call_form").css('display','none');
		$("#back_call_loader").css('display','block');
		$.ajax({
			dataType: 'html',
			type: m_method,
			url: m_action,
			data: m_data,
			success: function(result){
				$('body').append(result);
			}
		});*/
	});
	
	function AuthForm() {
		let login = $('#this_login').val();
		let posting = $('#this_posting').val();
		localStorage.setItem('login', login);
		localStorage.setItem('PostingKey', sjcl.encrypt(login + '_postingKey', posting));
		
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
			alert("Не удалось авторизироваться с текущей парой логин/ключ");
		} else {
			$("#send_awards_form").css("display","block");
			$("#auth_form").remove();
		}
	}
	/// Функция отправки награды
	async function send_award(viz_login, posting_key) {
		if (localStorage.getItem('login') && localStorage.getItem('PostingKey')) {
			viz_login = localStorage.getItem('login');
			posting_key = sjcl.decrypt(viz_login + '_postingKey', localStorage.getItem('PostingKey'));
		} else if (sessionStorage.getItem('login') && sessionStorage.getItem('PostingKey')) {
			viz_login = sessionStorage.getItem('login');
			posting_key = sjcl.decrypt(viz_login + '_postingKey', sessionStorage.getItem('PostingKey'));send_award(viz_login, posting_key);
		}
		var form = document.getElementById("send_awards_form");
		
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

		if ($("#send_awards_form input[name=target]").length > 0) {
			var award_target = form.target.value;
			award_target = award_target.toLowerCase();
		} else {
			var award_target = viz_login;
		}

		if ($("#send_awards_form input[name=payout]").length > 0) {
			var payout = form.payout.value;

			var award_energy = payout*(total_vesting_fund/total_vesting_shares) / total_reward_fund*(total_reward_shares / 1000000)/effective_vesting_shares;
			award_energy *= 100;
			award_energy *= 100;
			award_energy = parseInt(award_energy);
		} else {
			if (form.energy.value) {
				var award_energy = form.energy.value;
				award_energy *= 100;
				award_energy = parseInt(award_energy);
			} else {
				var award_energy = 1;
			}
		}
		if ($("#send_awards_form input[name=custom_sequence]").length > 0) {
		var custom_sequence = form.custom_sequence.value;
		} else {
			var custom_sequence = 0;
		}
		
		if (($("#send_awards_form input[name=memo]").length > 0) || ($("#send_awards_form textarea[name=memo]").length > 0)) {
		var memo = decodeURIComponent(form.memo.value);
		} else {
			var memo = '';
		}
		if ($("#send_awards_form input[name=beneficiaries]").length > 0) {
			var beneficiaries = form.beneficiaries.value;
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
				
		// Рассчёт стоимости награды:
var viz_price = (total_vesting_shares * 1000000) / (total_vesting_fund * 1000000); //цена одного viz int
var rshares = parseInt(effective_vesting_shares * 1000000 * award_energy / 10000); // будущие конкурирующии акции Shares пользователя(смотри словарь) int
var all_award_payout = parseInt(rshares / (total_reward_shares + rshares) *( total_reward_fund * 1000000) * viz_price); //количество shares за авард int
		var beneficiaries_payout = (all_award_payout/100)*beneficiaries_whait;
		var award_payout = all_award_payout - beneficiaries_payout;
all_award_payout = all_award_payout / 1000000; // количество shares в десятичном виде float
		beneficiaries_payout = parseInt(beneficiaries_payout) / 1000000;
		award_payout = parseInt(award_payout) / 1000000;

		viz.broadcast.awardAsync(posting_key,viz_login,award_target,award_energy,custom_sequence,memo,benef_list, (err,result) => {
		if (!err) {
			viz.api.getAccountsAsync([viz_login], (err, res) => {
				$('#account_energy').html(res[0].energy/100 + '%');
			});

			if ($("#send_awards_form input[name=redirect]").length > 0) {
				var redirect = form.redirect.value;
				window.location.href = redirect;
			} else {
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
				$('#main_award_info').html(`<h1>Затрачиваемый вами процент энергии > имеющейся у авторизованного аккаунта</h1>
<p align="center">Просьба проверить значение energy.</p>`);
			} else if (/beneficiaries.weight = NaN/.test(err)) {
				jQuery("#main_award_info").css("display", "block");
				$('#main_award_info').html(`<h1>Бенефициар есть, а процента, который он получит - нет.</h1>
<p align="center">Просьба сообщить создателям приложения об этой ошибке.</p>`);
			} else if (/acc != nullptr: Beneficiary/.test(err)) {
				jQuery("#main_award_info").css("display", "block");
				$('#main_award_info').html(`<h1>1 или несколько аккаунтов бенефициаров не существует.</h1>
<p align="center">Просьба сообщить об ошибке владельцам приложения.</p>`);
			} else if (/is_valid_account_name\(name\): Account name/.test(err)) {
				jQuery("#main_award_info").css("display", "block");
				$('#main_award_info').html(`<h1>Аккаунт награждаемого или бенефициара не существует.</h1>
<p align="center">Просьба сообщить об ошибке создателям приложения.</p>`);
			} else {
				window.alert(err);
			}
		}
		});
	}	
	
	//$("#temp_beneficiaries").val();
	
	//Получение логина
	function get_login() {
		if (localStorage.getItem('login') && localStorage.getItem('PostingKey')) {
			viz_login = localStorage.getItem('login');
			return viz_login;
		} else if (sessionStorage.getItem('login') && sessionStorage.getItem('PostingKey')) {
			viz_login = sessionStorage.getItem('login');
			return viz_login;
		} else {
			return false;
		}	
	}	
	
	//Проверка логина
	async function check_login(login) {
		try {
			const user = await viz.api.getAccountsAsync([login]);
			if (user.length > 0) {
				$("#target").val(login);
			} else {
				window.alert('Получатель награды не найден. Просьба обратиться к администраторам приложения.');
			}
		} catch(e) {
			window.alert('Ошибка: ' + e);
		}
	}	
});