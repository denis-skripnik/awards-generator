$(document).ready(function() {
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
			$("#enegry_back_slider").slider("value", $(this).val().replace(/[^0-9]/g, ''));
		} else {
			$(this).val("100%");
			alert("Значение не может превышать 100%")
		}
	});		
	$("input[name=energy]").keyup(function() {
		if ($(this).val().replace(/[^0-9]/g, '') > 100) {
			$(this).val("100%");
			alert("Значение не может превышать 100%");
		}
	});	
});