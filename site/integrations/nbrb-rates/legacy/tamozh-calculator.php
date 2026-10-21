<?php
/*
Plugin Name: Таможенный калькулятор с тарифами и настройками
Plugin URI: https://landing.by
Description: Плагин для WordPress, который реализует таможенный калькулятор с возможностью изменения тарифных ставок через настройки, выбором валюты стоимости, автоматической конвертацией и выводом информации о ставках таможенных пошлин для физических и юридических лиц.
Version: 1.4
Author: foxshit 
Author URI: https://landing.by 
License: GPL2
*/

/**
 * Получение курсов валют через API Национального банка Республики Беларусь.
 * API: https://www.nbrb.by/api/exrates/rates?periodicity=0
 */
function tamozh_calculator_get_exchange_rates() {
    return function_exists('amz_nbrb_snapshot') ? amz_nbrb_snapshot() : false;
}

/**
 * Регистрируем настройки плагина.
 */
function tamozh_calculator_register_settings() {
    register_setting( 'tamozh_calculator_settings_group', 'tamozh_calculator_base_currency' );
    register_setting( 'tamozh_calculator_settings_group', 'tamozh_calculator_individual_rate_percent_under_3' );
    register_setting( 'tamozh_calculator_settings_group', 'tamozh_calculator_individual_min_rate_under_3' );
    register_setting( 'tamozh_calculator_settings_group', 'tamozh_calculator_individual_cost_threshold' );
    register_setting( 'tamozh_calculator_settings_group', 'tamozh_calculator_individual_rate_multiplier_3_5' );
    register_setting( 'tamozh_calculator_settings_group', 'tamozh_calculator_individual_rate_multiplier_over_5' );
    register_setting( 'tamozh_calculator_settings_group', 'tamozh_calculator_legal_rate_multiplier' );
}
add_action( 'admin_init', 'tamozh_calculator_register_settings' );

/**
 * Страница настроек плагина.
 */
function tamozh_calculator_settings_page() {
    // Получаем текущие значения настроек с дефолтными значениями.
    $base_currency      = get_option( 'tamozh_calculator_base_currency', 'EUR' );
    $ind_percent_under3 = get_option( 'tamozh_calculator_individual_rate_percent_under_3', 0.54 );
    $ind_min_under3     = get_option( 'tamozh_calculator_individual_min_rate_under_3', 2.5 );
    $ind_cost_threshold = get_option( 'tamozh_calculator_individual_cost_threshold', 8500 );
    $ind_multiplier_3_5 = get_option( 'tamozh_calculator_individual_rate_multiplier_3_5', 1.5 );
    $ind_multiplier_5   = get_option( 'tamozh_calculator_individual_rate_multiplier_over_5', 3 );
    $legal_multiplier   = get_option( 'tamozh_calculator_legal_rate_multiplier', 2 );
    ?>
    <div class="wrap">
        <h1>Настройки Таможенного калькулятора</h1>
        <form method="post" action="options.php">
            <?php settings_fields( 'tamozh_calculator_settings_group' ); ?>
            <?php do_settings_sections( 'tamozh_calculator_settings_group' ); ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Базовая валюта для расчёта</th>
                    <td>
                        <select name="tamozh_calculator_base_currency">
                            <?php
                            $options = array('EUR' => 'EUR', 'USD' => 'USD', 'RUB' => 'RUB');
                            foreach ( $options as $key => $label ) {
                                echo '<option value="' . esc_attr($key) . '" ' . selected( $base_currency, $key, false ) . '>' . esc_html($label) . '</option>';
                            }
                            ?>
                        </select>
                        <p class="description">Валюта, в которой будут проводиться расчёты (используется для конвертации стоимости авто).</p>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Ставка (в % от стоимости) для авто до 3-х лет</th>
                    <td>
                        <input type="number" step="0.01" name="tamozh_calculator_individual_rate_percent_under_3" value="<?php echo esc_attr( $ind_percent_under3 ); ?>">
                        <p class="description">Например, 0.54 означает 54% от таможенной стоимости.</p>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Минимальная ставка (EUR/см³) для авто до 3-х лет</th>
                    <td>
                        <input type="number" step="0.01" name="tamozh_calculator_individual_min_rate_under_3" value="<?php echo esc_attr( $ind_min_under3 ); ?>">
                        <p class="description">Минимальная ставка таможенной пошлины за см³ объёма двигателя.</p>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Пороговая стоимость авто (EUR) для применения ставки до 3-х лет</th>
                    <td>
                        <input type="number" step="1" name="tamozh_calculator_individual_cost_threshold" value="<?php echo esc_attr( $ind_cost_threshold ); ?>">
                        <p class="description">Если стоимость авто меньше или равна этому значению, применяется расчёт по ставкам до 3-х лет.</p>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Множитель для расчёта для авто от 3 до 5 лет (ФЛ)</th>
                    <td>
                        <input type="number" step="0.01" name="tamozh_calculator_individual_rate_multiplier_3_5" value="<?php echo esc_attr( $ind_multiplier_3_5 ); ?>">
                        <p class="description">Пример: 1.5 умножается на объём двигателя.</p>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Множитель для расчёта для авто свыше 5 лет (ФЛ)</th>
                    <td>
                        <input type="number" step="0.01" name="tamozh_calculator_individual_rate_multiplier_over_5" value="<?php echo esc_attr( $ind_multiplier_5 ); ?>">
                        <p class="description">Пример: 3 умножается на объём двигателя.</p>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Множитель для расчёта для юридических лиц</th>
                    <td>
                        <input type="number" step="0.01" name="tamozh_calculator_legal_rate_multiplier" value="<?php echo esc_attr( $legal_multiplier ); ?>">
                        <p class="description">Применяется для расчёта таможенной пошлины для юридических лиц.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

/**
 * Добавляем страницу настроек в меню «Настройки».
 */
function tamozh_calculator_add_settings_menu() {
    add_options_page(
        'Настройки Таможенного калькулятора',
        'Таможенный калькулятор',
        'manage_options',
        'tamozh-calculator-settings',
        'tamozh_calculator_settings_page'
    );
}
add_action( 'admin_menu', 'tamozh_calculator_add_settings_menu' );

/**
 * Шорткод [customs_calculator] – выводит форму калькулятора, актуальные курсы и блок с тарифами.
 */
function tamozh_calculator_shortcode() {
    $rates = tamozh_calculator_get_exchange_rates();
    
    // Rates are normalized BYN per one currency unit by the shared provider.
    $rates_date = !empty($rates['date']) ? $rates['date'] : '';
    $rates_date_label = preg_match('/^\d{4}-\d{2}-\d{2}$/', $rates_date)
        ? implode('.', array_reverse(explode('-', $rates_date))) : 'недоступны';
    // Получаем базовую валюту из настроек (по умолчанию EUR)
    $base_currency = get_option( 'tamozh_calculator_base_currency', 'EUR' );
    
    // Получаем тарифные настройки
    $ind_percent_under3 = get_option( 'tamozh_calculator_individual_rate_percent_under_3', 0.54 );
    $ind_min_under3     = get_option( 'tamozh_calculator_individual_min_rate_under_3', 2.5 );
    $ind_cost_threshold = get_option( 'tamozh_calculator_individual_cost_threshold', 8500 );
    $ind_multiplier_3_5 = get_option( 'tamozh_calculator_individual_rate_multiplier_3_5', 1.5 );
    $ind_multiplier_5   = get_option( 'tamozh_calculator_individual_rate_multiplier_over_5', 3 );
    $legal_multiplier   = get_option( 'tamozh_calculator_legal_rate_multiplier', 2 );
    
    ob_start();
    ?>
    <!-- Подключение внешних ресурсов -->
    <script src="https://amerika.by/wp-content/themes/amerika/js/customs_calc.js?ver=20261021.1"></script>
    <link rel="stylesheet" href="https://amerika.by/wp-content/themes/amerika/styles/custom_style.css" type="text/css" media="all" />

    <div id="skyclc-calc" style="width: 100%; margin: 0 auto;">
      <!-- Форма калькулятора -->
      <div class="calculations" style="border: 0px solid #ff000040; min-width: 40%; border-radius: 10px; min-height: 300px; text-align: left; float: left; margin-right: 5px;">
        <div class="skyclc_row inputData mainCalculatorInputs">
          <div class="skyclc_col">
            <div class="littleTitle">Кто растамаживает автомобиль:</div>
            <div>
              <input id="skyclc_fiz" checked="checked" name="fizur" type="radio" value="1" onclick="fizur();" /> 
              <label for="skyclc_fiz">Физическое лицо</label>
              <input id="skyclc_ur" name="fizur" type="radio" value="2" onclick="fizur();" /> 
              <label for="skyclc_ur">Юридическое лицо</label>
            </div>
          </div>
          <div class="skyclc_col">
            <div class="littleTitle">Возраст автомобиля:</div>
            <select id="skyclc_year" class="form-control">
              <option value="3">до 3 лет</option>
              <option value="35">от 3 до 5 лет</option>
              <option value="5">более 5 лет</option>
            </select>
          </div>
          <div class="skyclc_col">
            <div class="littleTitle">Тип двигателя:</div>
            <select id="engineType" class="form-control" name="skyclc_engine" onchange="fizur();">
              <option value="1">Бензин / Дизель / Гибрид</option>
              <option value="2">Электро</option>
            </select>
          </div>
          <div id="fuelType" class="skyclc_col" style="display: none;">
            <div class="littleTitle">Вид топлива:</div>
            <div>
              <input id="ben" checked="checked" name="fuel" type="radio" value="1" /> 
              <label for="ben">Бензин</label>
              <input id="diz" name="fuel" type="radio" value="2" /> 
              <label for="diz">Дизель</label>
            </div>
          </div>
          <div id="engineCapacity" class="skyclc_col" style="display: none;">
            <div class="littleTitle">Объем двигателя (см³):</div>
            <input id="capacity" class="j_form_input" type="number" value="" placeholder="Введите объем двигателя" onchange="skyclc_check();"/>
          </div>
          <div class="skyclc_col">
            <div class="littleTitle">Стоимость автомобиля:</div>
            <input id="price" class="j_form_input" type="number" value="" placeholder="Введите стоимость авто" onchange="skyclc_check();"/>
          </div>
          <div class="skyclc_col">
            <div class="littleTitle">Валюта стоимости авто:</div>
            <select id="costCurrency">
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="RUB">RUB</option>
            </select>
          </div>
          <div id="140ukaz" class="skyclc_col hybridCheckboxWrapp pseudoCheckbox" style="display: none;">
            <label style="font-size: 17px;">
              <input id="calc_discount" class="pseudoCheckboxElement" type="checkbox" /> 
              <span class="lgot">Таможенная льгота 50% (Указ №140)</span>
            </label>
          </div>
          <div class="skyclc_col" style="padding-top: 20px; text-align: center;">
            <button onclick="calculate();" class="skyclc_btn" type="submit">Рассчитать таможенные платежи</button>
          </div>
        </div>
      </div>
      
      <!-- Блок результатов расчета -->
      <div id="skyclc-result" style="padding: 8px 20px; border-radius: 0px; width: 58%; text-align: center; float: left; display: none;">
        <h2 style="padding-bottom: 20px;">Таблица расчета растаможки автомобилей</h2>
        <p style="display: flex; justify-content: space-between; border-bottom: 1px inset; padding-bottom: 5px;">Стоимость авто: <span id="Result1"></span></p>
        <p style="display: flex; justify-content: space-between; border-bottom: 1px inset; padding-bottom: 5px;">Таможенная пошлина: <span id="Result0">0 <?php echo esc_html($base_currency); ?></span></p>
        <p style="display: flex; justify-content: space-between; border-bottom: 1px inset; padding-bottom: 5px;">Утилизационный сбор: <span id="Result2">624.92 руб.</span></p>
        <p style="display: flex; justify-content: space-between; border-bottom: 1px inset; padding-bottom: 5px;">Прочие таможенные сборы: <span id="Result_tamozh">120 руб</span></p>
        <p style="display: flex; justify-content: space-between; border-bottom: 1px inset; padding-bottom: 5px;">Услуги склада и декларантов: <span id="Result_sklad">200 руб</span></p>
        <p style="font-weight: bold; margin-top: 10px;">Итоговая стоимость: <span id="Result3">62873 <?php echo esc_html($base_currency); ?></span> (эквивалентно <span id="Result4">68023 USD</span>)</p>
        <div style="font-size: 13px; margin-top: 10px;">
          Курсы НБРБ на <span id="amz-nbrb-customs-date"><?php echo esc_html($rates_date_label); ?></span>: 1 USD = <span id="skyclc_usd" class="currencies_USD">—</span> BYN, 1 EUR = <span id="skyclc_eur" class="currencies_EUR">—</span> BYN<span id="amz-nbrb-customs-status"></span>
        </div>
      </div>
    </div>
    
    <script>
      // Передаем курсы валют, базовую валюту и тарифные ставки в JavaScript
      var exchangeRates = window.AMZ_NBRB || {};
      var baseCurrency = <?php echo json_encode( $base_currency ); ?>;
      
      // Тарифные ставки для физических лиц и юридических лиц
      var indPercentUnder3 = <?php echo json_encode( $ind_percent_under3 ); ?>;
      var indMinUnder3     = <?php echo json_encode( $ind_min_under3 ); ?>;
      var indCostThreshold = <?php echo json_encode( $ind_cost_threshold ); ?>;
      var indMultiplier3_5 = <?php echo json_encode( $ind_multiplier_3_5 ); ?>;
      var indMultiplier5   = <?php echo json_encode( $ind_multiplier_5 ); ?>;
      var legalMultiplier  = <?php echo json_encode( $legal_multiplier ); ?>;
      
      function calculateTamozh() {
        // Функция для расчета на основе значений формы
        var personType = document.getElementById("personType").value;
        var engineType = document.getElementById("engineType").value;
        var engineVolume = parseFloat(document.getElementById("engineVolume").value);
        var releaseDate = new Date(document.getElementById("releaseDate").value);
        var carCost = parseFloat(document.getElementById("price").value);
        var selectedCurrency = document.getElementById("costCurrency").value;
        
        exchangeRates = window.AMZ_NBRB || {};
        if (!(Number(exchangeRates[selectedCurrency]) > 0) || !(Number(exchangeRates[baseCurrency]) > 0)) {
            return skyclc_rate_error();
        }
        // Конвертация стоимости, если валюта отличается от базовой
        if (selectedCurrency !== baseCurrency) {
            carCost = (carCost * exchangeRates[selectedCurrency]) / exchangeRates[baseCurrency];
        }
        
        var currentDate = new Date();
        var age = currentDate.getFullYear() - releaseDate.getFullYear();
        if (currentDate < new Date(releaseDate.getFullYear(), releaseDate.getMonth(), releaseDate.getDate())) {
          age--;
        }
        
        var duty = 0;
        // Расчет для физических лиц
        if (personType === "individual") {
          if (age < 3) {
            if (carCost <= indCostThreshold) {
              var percentCalc = indPercentUnder3 * carCost;
              var minCalc = indMinUnder3 * engineVolume;
              duty = Math.max(percentCalc, minCalc);
            }
            // При необходимости можно добавить другие условия
          } else if (age >= 3 && age < 5) {
            duty = engineVolume * indMultiplier3_5;
          } else {
            duty = engineVolume * indMultiplier5;
          }
        } else if (personType === "legal") { // Расчет для юридических лиц
          duty = engineVolume * legalMultiplier;
        }
        
        document.getElementById("Result0").innerHTML = duty.toFixed(2) + " " + baseCurrency;
        // Здесь можно добавить дополнительное обновление других результатов
      }
    </script>
    
    <!-- Блок с тарифами таможенных пошлин (SEO-оптимизированный контент) -->
    <div id="customs-duty-rates" style="padding: 20px; margin-top: 30px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; clear: both;">
      <h2>Ставки таможенных пошлин для физических лиц</h2>
      <p>Для физических лиц применяется следующий порядок расчёта:</p>
      <ul>
        <li><strong>Автомобили до 3-х лет:</strong> ставка составляет 54% от таможенной стоимости, но не менее 2,5 евро за см³ объёма двигателя (при стоимости авто до 8 500 евро).</li>
        <li>При увеличении таможенной стоимости минимальная ставка растёт – например, от 8 501 до 16 700 евро применяется ставка 48% от стоимости, но не менее 3,5 евро за см³.</li>
      </ul>
      <h2>Ставки таможенных пошлин для юридических лиц</h2>
      <p>Для юридических лиц тарифы рассчитываются следующим образом:</p>
      <ul>
        <li><strong>Автомобили до 3-х лет (новые):</strong> ставка составляет 30% от стоимости, но не менее 1,2 евро за см³ для авто с объемом до 1000 см³. При увеличении объёма минимальная ставка растёт.</li>
        <li><strong>Автомобили от 3 до 5 лет:</strong> применяется ставка 35% от стоимости с соответствующими минимальными значениями за см³ объёма двигателя.</li>
        <li><strong>Автомобили старше 5 лет:</strong> используются фиксированные тарифы, например, 2,5 евро за см³ для авто с объемом до 1000 см³.</li>
      </ul>
      <p style="font-size: 0.9em; color: #555;">Примечание: ставки являются ориентировочными. Для точного расчёта рекомендуем ознакомиться с актуальными нормативными документами или воспользоваться данным калькулятором.</p>
    </div>
    
    <?php
    return ob_get_clean();
}

add_shortcode('customs_calculator', 'tamozh_calculator_shortcode');
?>
