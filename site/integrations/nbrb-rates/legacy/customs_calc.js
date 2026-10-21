jQuery( document ).ready(function() {
  if (!document.getElementById('skyclc-calc')) return;
  skyclc_nbrb();
  jQuery('#skyclc_fiz').trigger('click');
  var beforeResult = document.getElementById('skyclc-before_result');
  if (beforeResult) beforeResult.style.display = "block";
});


// One normalized NBRB snapshot is shared by every calculator on the page.
function skyclc_nbrb() {
  var rates = window.AMZ_NBRB || {};
  var valid = isFinite(Number(rates.USD)) && Number(rates.USD) > 0 &&
    isFinite(Number(rates.EUR)) && Number(rates.EUR) > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(rates.date || '');
  jQuery('.currencies_USD').text(valid ? Number(rates.USD).toFixed(4) : '—');
  jQuery('.currencies_EUR').text(valid ? Number(rates.EUR).toFixed(4) : '—');
  jQuery('#amz-nbrb-customs-date').text(valid ? rates.date.split('-').reverse().join('.') : 'недоступны');
  jQuery('#amz-nbrb-customs-status').text(valid ? (rates.stale ? ' · последние доступные данные' : '') : ' · расчёт временно недоступен');
  window.exchangeRates = rates;
  return valid ? rates : null;
}
function skyclc_rate_error(message) {
  var result = document.getElementById('skyclc-result');
  if (result) result.style.display = 'none';
  alert(message || 'Курсы НБРБ временно недоступны. Повторите расчёт позже.');
  return false;
}
function skyclc_check() {
  if (document.getElementById('capacity').value == 0) {
    document.getElementById('capacity').style.backgroundColor = '#fcc';
  }
  if (document.getElementById('capacity').value > 0) {
    document.getElementById('capacity').style.backgroundColor = '#fff';
  }
  if (document.getElementById('capacity').value < 0) {
    document.getElementById('capacity').value = 0;
  }
  if (document.getElementById('price').value >= 0) {
    document.getElementById('price').style.backgroundColor = '#fcc';
  }
  if (document.getElementById('price').value > 0) {
    document.getElementById('price').style.backgroundColor = '#fff';
  }
  if (document.getElementById('price').value < 0) {
    document.getElementById('price').value = 0;
  }
}


function calculate()
{
var rates = skyclc_nbrb();
if (!rates) return skyclc_rate_error();
var currencyInput = document.getElementById('costCurrency');
var selectedCurrency = currencyInput ? currencyInput.value : 'EUR';
var selectedRate = Number(rates[selectedCurrency]);
if (!isFinite(selectedRate) || selectedRate <= 0) {
  return skyclc_rate_error('Курс выбранной валюты НБРБ временно недоступен. Повторите расчёт позже.');
}
skyclc_check();
fizur();
var j_usd = Number(rates.USD);
var j_eur = Number(rates.EUR);
var result0 = document.getElementById('Result0');
var result1 = document.getElementById('Result1');
var result2 = document.getElementById('Result2');
var result3 = document.getElementById('Result3');
var result4 = document.getElementById('Result4');
var Result_exportnoe_oformlenie = document.getElementById('Result_exportnoe_oformlenie');
var Result_dostavka = document.getElementById('Result_dostavka');
var Result_tamozh = document.getElementById('Result_tamozh');
var Result_sklad = document.getElementById('Result_sklad');
var Result_uslugi = document.getElementById('Result_uslugi');
//получаем данные
// Утилизационный сбор: постановление Совмина РБ от 23.04.2026 N 195 "Об утилизации",
// действует с 29.04.2026. Легковые авто, ввоз физлицом для личного пользования,
// независимо от типа и объёма двигателя: до 3 лет - 624.92 руб., свыше 3 лет - 1282.02 руб.
// Обновлено 18.08.2026. Предыдущие значения: 544.5 и 816.7.
var per = document.querySelector('input[name="fizur"]:checked').value;
var car_age = document.getElementById('skyclc_year'); //возраст авто: 3, 35, 5
if (car_age.value == 3) {e = 3;
util = 624.92;}
if (car_age.value == 35) {e = 35;
util = 1282.02;}
if (car_age.value == 5) {e = 5;
util = 1282.02;}
var engineType = document.getElementById('engineType');//двигатель 1-топливо, 2 - электро
var fuel = document.querySelector('input[name="fuel"]:checked').value;//топливо 1-бенз, 2-дизель (для юр только)
var capacity = document.getElementById('capacity').value; //объем двигателя
var enteredPrice = Number(document.getElementById('price').value);
var carPriceEur = enteredPrice * selectedRate / j_eur;
var price = carPriceEur; // Duty thresholds remain denominated in EUR.
var d140 = document.getElementById('calc_discount'); //140 указ 1 или 0,5
if (d140.checked) {
    discont = 0.5;
  }
  else {
    discont = 1;
  }
if (engineType.value == 2) {discont = 0;price = 0;}

//поехали с расчетом
if (per == 1) {//физлицо
  if (e == 3) {//до 3 лет
    if (price <= 8500) {//цена до 8500
      if (capacity*2.5 > price*0.54) {poshlina = capacity*2.5*discont;
      }
      else {
        poshlina = price*0.54*discont;
      }
    }
    if (8500 < price && price <= 16700) {//цена от 8500 до 16700
      if (capacity*3.5 > price*0.48) {poshlina = capacity*3.5*discont;
      }
      else {
        poshlina = price*0.48*discont;
      }
    }
    if (16700 < price && price <= 42300) {//цена от 16700 до 42300
      if (capacity*5.5 > price*0.48) {poshlina = capacity*5.5*discont;
      }
      else {
        poshlina = price*0.48*discont;
      }
    }
    if (42300 < price && price <= 84500) {//цена от 42300 до 84500
      if (capacity*7.5 > price*0.48) {poshlina = capacity*7.5*discont;
      }
      else {
        poshlina = price*0.48*discont;
      }
    }
    if (84500 < price && price <= 169000) {//цена от 84500 до 169000
      if (capacity*15 > price*0.48) {poshlina = capacity*15*discont;
      }
      else {
        poshlina = price*0.48*discont;
      }
    }
    if (169000 < price) {//цена от 84500 до 169000
      if (capacity*20 > price*0.48) {poshlina = capacity*20*discont;
      }
      else {
        poshlina = price*0.48*discont;
      }
    }
  }
  if (e == 35) {//от 3 до 5 лет
    if (capacity <= 1000) {
      poshlina=capacity*1.5*discont;
    }
    if (capacity > 1000 && capacity <= 1500) {
      poshlina=capacity*1.7*discont;
    }
    if (capacity > 1500 && capacity <= 1800) {
      poshlina=capacity*2.5*discont;
    }
    if (capacity > 1800 && capacity <= 2300) {
      poshlina=capacity*2.7*discont;
    }
    if (capacity > 2300 && capacity <= 3000) {
      poshlina=capacity*3*discont;
    }
    if (capacity > 3000) {
      poshlina=capacity*3.6*discont;
    }
  }
  if (e == 5) {//от 5 лет
    if (capacity <= 1000) {
      poshlina=capacity*3*discont;
    }
    if (capacity > 1000 && capacity <= 1500) {
      poshlina=capacity*3.2*discont;
    }
    if (capacity > 1500 && capacity <= 1800) {
      poshlina=capacity*3.5*discont;
    }
    if (capacity > 1800 && capacity <= 2300) {
      poshlina=capacity*4.8*discont;
    }
    if (capacity > 2300 && capacity <= 3000) {
      poshlina=capacity*5*discont;
    }
    if (capacity > 3000) {
      poshlina=capacity*5.7*discont;
    }
    
  }
}
if (per == 2) {//юрлицо
if (engineType.value == 2) {price = 0;}
  if (fuel == 1) {
    if (e == 3) {//до 3 лет
      if (capacity <= 1000) {
        if (price*0.3 > 1.2*capacity) {poshlina = price*0.3;}
        else {poshlina = 1.2*capacity}
      }
      if (capacity > 1000 && capacity <= 1500) {
        if (price*0.3 > 1.45*capacity) {poshlina = price*0.3;}
        else {poshlina = 1.45*capacity}
      }
      if (capacity > 1500 && capacity <= 1800) {
        if (price*0.3 > 1.5*capacity) {poshlina = price*0.3;}
        else {poshlina = 1.5*capacity}
      }
      if (capacity > 1800 && capacity <= 2300) {
        if (price*0.3 > 2.15*capacity) {poshlina = price*0.3;}
        else {poshlina = 2.15*capacity}
      }
      if (capacity > 2300 && capacity <= 3000) {
        if (price*0.3 > 2.15*capacity) {poshlina = price*0.3;}
        else {poshlina = 2.15*capacity}
      }
      if (capacity > 3000) {
        if (price*0.3 > 2.8*capacity) {poshlina = price*0.3;}
        else {poshlina = 2.8*capacity}
      }
      
    }
    if (e == 35) {//от 3 до 5 лет
      if (capacity <= 1000) {
        if (price*0.35 > 1.2*capacity) {poshlina = price*0.35;}
        else {poshlina = 1.2*capacity}
      }
      if (capacity > 1000 && capacity <= 1500) {
        if (price*0.35 > 1.45*capacity) {poshlina = price*0.35;}
        else {poshlina = 1.45*capacity}
      }
      if (capacity > 1500 && capacity <= 1800) {
        if (price*0.35 > 1.5*capacity) {poshlina = price*0.35;}
        else {poshlina = 1.5*capacity}
      }
      if (capacity > 1800 && capacity <= 2300) {
        if (price*0.35 > 2.15*capacity) {poshlina = price*0.35;}
        else {poshlina = 2.15*capacity}
      }

      if (capacity > 2300 && capacity <= 3000) {
        if (price*0.35 > 2.15*capacity) {poshlina = price*0.35;}
        else {poshlina = 2.15*capacity}
      }
      if (capacity > 3000) {
        if (price*0.35 > 2.8*capacity) {poshlina = price*0.35;}
        else {poshlina = 2.8*capacity}
      }
      
    }
    if (e == 5) {//от 5 лет
      if (capacity <= 1000) {poshlina = 2.5*capacity;
      }
      if (capacity > 1000 && capacity <= 1500) {poshlina = 2.7*capacity;
      }
      if (capacity > 1500 && capacity <= 1800) {poshlina = 2.9*capacity;
      }
      if (capacity > 1800 && capacity <= 2300) {poshlina = 4.0*capacity;
      }
      if (capacity > 2300 && capacity <= 3000) {poshlina = 4.0*capacity;
      }
      if (capacity > 3000) {poshlina = 5.8*capacity;
      }
      
    }
  }
  

  if (fuel == 2) {
    if (e == 3) {//до 3 лет
      if (capacity <= 1500) {
        if (price*0.3 > 1.45*capacity) {poshlina = price*0.3;}
        else {poshlina = 1.45*capacity}
      }
      if (capacity > 1500 && capacity <= 2500) {
        if (price*0.3 > 1.9*capacity) {poshlina = price*0.3;}
        else {poshlina = 1.9*capacity}
      }
      if (capacity > 2500) {
        if (price*0.3 > 2.8*capacity) {poshlina = price*0.3;}
        else {poshlina = 2.8*capacity}
      }
    }
    if (e == 35) {//от 3 до 5 лет
      if (capacity <= 1500) {
        if (price*0.35 > 1.45*capacity) {poshlina = price*0.35;}
        else {poshlina = 1.45*capacity}
      }
      if (capacity > 1500 && capacity <= 2500) {
        if (price*0.35 > 2.15*capacity) {poshlina = price*0.35;}
        else {poshlina = 2.15*capacity}
      }
      if (capacity > 2500) {
        if (price*0.35 > 2.8*capacity) {poshlina = price*0.35;}
        else {poshlina = 2.8*capacity}
      }
    }
    if (e == 5) {//от 3 до 5 лет
      if (capacity <= 1500) {poshlina = 2.7*capacity;
      }
      if (capacity > 1500 && capacity <= 2500) {poshlina = 4.0*capacity;
      }
      if (capacity > 2500) {poshlina = 5.8*capacity;
      }
    }
  }
  
  
}
util_eur = util/Number(j_eur);
tamozh_eur = 120/Number(j_eur);
sklad_eur = 200/Number(j_eur);
var uslugi_byn = price*0.025*Number(j_eur);//byn
if (uslugi_byn <= 500*Number(j_eur)) {
	uslugi_byn = 500*Number(j_eur);}
uslugi_eur = uslugi_byn/Number(j_eur);
itogo = (carPriceEur+poshlina+util_eur+tamozh_eur+sklad_eur).toFixed(0);
itogo_usd = (itogo*Number(j_eur)/Number(j_usd)).toFixed(0);
result0.innerHTML = Math.round(poshlina) + ' €'; // результат расчета
result1.textContent = document.getElementById('price').value + ' ' + selectedCurrency;
result2.innerHTML = util + ' руб.';
result3.innerHTML = itogo + ' EUR';
result4.innerHTML = itogo_usd + ' USD';
Result_tamozh.innerHTML = '120 руб';
Result_sklad.innerHTML = '200 руб';

if (engineType.value == 2) {document.getElementById('capacity').style.backgroundColor = '#fff';}
if (document.getElementById('price').style.backgroundColor !== "rgb(255, 204, 204)" && document.getElementById('capacity').style.backgroundColor !== "rgb(255, 204, 204)") {
var beforeResult = document.getElementById('skyclc-before_result');
if (beforeResult) beforeResult.style.display = "none";


jQuery("#skyclc-result").fadeIn(300);

if (window.innerWidth<700){
jQuery('html, body').animate({
                    scrollTop: jQuery("#skyclc-result").offset().top-100
					
                }, 100);
}
}
else {document.getElementById('skyclc-result').style.display = "none";
//document.getElementById('skyclc-before_result').style.display = "block";
alert('Заполните, пожалуйста, корректно данные расчета');
}

}

function fizur()
{
var engineType1 = document.getElementById('engineType');
var ukaz140a = document.getElementById('140ukaz');
if (document.getElementById('skyclc_fiz').checked) {
  ukaz140a.style.display = "block";
  document.getElementById('fuelType').style.display = "none";
  if (engineType1.value == 1) {
  document.getElementById('engineCapacity').style.display = "block";
  }
  else {document.getElementById('engineCapacity').style.display = "none";
  document.getElementById('140ukaz').style.display = "none";
  }
//140ukaz
}
if (document.getElementById('skyclc_ur').checked) {
  ukaz140a.style.display = "none";
  //fuelType
  if (engineType1.value == 1) {
  document.getElementById('fuelType').style.display = "block";
  document.getElementById('engineCapacity').style.display = "block";
  }
  else {document.getElementById('fuelType').style.display = "none";
    document.getElementById('engineCapacity').style.display = "none";
    }
}
}