// Калькулятор под ключ (как в new2) + переключатель «Автомобиль / Мотоцикл».
// Логика и цифры — в assets/site.js и assets/config.js.
export function calcWidget({ sendHref = '#lead' } = {}) {
  return `<div class="calc">
      <div class="calc-body">
      <form id="calcForm" autocomplete="off">
        <div class="field wide">
          <label id="vtypeLabel">Что везём</label>
          <div class="seg" role="radiogroup" aria-labelledby="vtypeLabel">
            <label><input type="radio" name="vtype" value="car" checked><span>Автомобиль</span></label>
            <label><input type="radio" name="vtype" value="moto"><span>Мотоцикл</span></label>
          </div>
        </div>
        <div class="tabs wide" role="radiogroup" aria-label="Что считаем">
          <label><input type="radio" name="mode" value="price" checked><span>Цена лота → итого</span></label>
          <label><input type="radio" name="mode" value="budget"><span>Бюджет → до какой ставки</span></label>
        </div>
        <div class="field wide" id="carOnly">
          <label id="pickLabel">Популярные машины: нажмите, чтобы подставить</label>
          <div class="picks" role="group" aria-labelledby="pickLabel">
            <button type="button" data-p="9000,2021,1500,ice">Chevrolet Equinox</button>
            <button type="button" data-p="8000,2021,1300,ice">Chevrolet Trailblazer</button>
            <button type="button" data-p="11000,2021,2500,ice">Nissan Rogue</button>
            <button type="button" data-p="12000,2021,1500,ice">Ford Bronco Sport</button>
            <button type="button" data-p="9000,2024,1200,ice">Chevrolet Trax</button>
            <button type="button" data-p="9000,2022,1400,ice">VW Jetta</button>
          </div>
        </div>
        <div class="field">
          <label for="price" id="priceLabel">Цена лота, $</label>
          <input id="price" type="number" inputmode="numeric" min="100" step="100" value="12000">
        </div>
        <div class="field">
          <label for="year">Год выпуска</label>
          <select id="year"></select>
        </div>
        <div class="field">
          <label for="volume">Объём двигателя, см³</label>
          <input id="volume" type="number" inputmode="numeric" min="0" step="100" value="2000">
        </div>
        <div class="field" id="fuelField">
          <label id="fuelLabel">Двигатель</label>
          <div class="seg" role="radiogroup" aria-labelledby="fuelLabel">
            <label><input type="radio" name="fuel" value="ice" checked><span>Бензин / дизель</span></label>
            <label><input type="radio" name="fuel" value="alt"><span id="fuelAlt">Гибрид / электро</span></label>
          </div>
        </div>
        <p class="hint wide" id="evHint" hidden>Для электромобиля укажите объём 0.</p>

        <button type="button" class="adv-toggle wide" id="advToggle" aria-expanded="false" aria-controls="adv">Точнее: аукцион, площадка, порт <span aria-hidden="true">▾</span></button>
        <div class="adv wide" id="adv" hidden>
          <p class="adv-title">Если лот уже выбран</p>
          <div class="field">
            <label id="aucLabel">Аукцион</label>
            <div class="seg" role="radiogroup" aria-labelledby="aucLabel">
              <label><input type="radio" name="auction" value="copart" checked><span>Copart</span></label>
              <label><input type="radio" name="auction" value="iaai"><span>IAAI</span></label>
            </div>
          </div>
          <div class="field">
            <label for="yard">Площадка</label>
            <input id="yard" list="yardList" placeholder="Начните вводить: Alb…" autocomplete="off">
            <datalist id="yardList"></datalist>
          </div>
          <div class="field">
            <label for="port">Порт прибытия</label>
            <select id="port">
              <option value="auto">Подобрать автоматически</option>
              <option value="klaipeda">Клайпеда (Литва)</option>
              <option value="poti">Поти (Грузия)</option>
            </select>
          </div>
          <div class="field checks">
            <label for="sublot" class="check"><input id="sublot" type="checkbox"> Машина не на площадке аукциона (Sublot / Offsite), +100 $</label>
            <label for="benefit" class="check" id="benefitWrap"><input id="benefit" type="checkbox"> Льгота 50% по Указу № 140</label>
          </div>
        </div>
        <p class="route" id="route"></p>
      </form>
      <div class="bill" aria-live="polite">
        <div class="bill-in">
        <div class="bill-head"><b>Ваш расчёт до Минска</b><span>предварительный</span></div>
        <div class="maxbid" id="maxbid" hidden><span>Можно ставить на аукционе до</span><b class="num" id="r-max"></b></div>
        <div class="grp">Аукцион <i>платите аукциону</i></div>
        <div class="row"><span>Лот на аукционе</span><span class="num" id="r-lot"></span></div>
        <div class="row"><span>Сборы аукциона</span><span class="num" id="r-fee"></span></div>
        <div class="grp">Доставка <i>платите перевозчику</i></div>
        <div class="row"><span id="r-inland-l">Доставка по США до порта</span><span class="num" id="r-inland"></span></div>
        <div class="row" id="r-extra-row" hidden><span id="r-extra-l"></span><span class="num" id="r-extra"></span></div>
        <div class="row"><span id="r-sea-l">Море</span><span class="num" id="r-sea"></span></div>
        <div class="row"><span id="r-last-l">Доставка в Минск</span><span class="num" id="r-last"></span></div>
        <div class="grp">Таможня <i>платите государству</i></div>
        <div class="row"><span id="r-duty-l">Таможенная пошлина</span><span class="num" id="r-duty"></span></div>
        <div class="row"><span id="r-cust-l">Утильсбор, СВХ, декларант</span><span class="num" id="r-cust"></span></div>
        <div class="grp">Мы <i>по договору</i></div>
        <div class="row ours"><span>Наша услуга</span><span class="num" id="r-ours"></span></div>
        <div class="total"><span>Итого в Минске</span><b class="num" id="r-total"></b></div>
        <small class="num" id="r-byn"></small>
        <p class="note warn-note" id="motoNote" hidden><b>Расчёт для мотоциклов ориентировочный.</b> Доставку мотоцикла считаем по вашему лоту: стоимость места в контейнере зависит от размеров техники.</p>
        <p class="note">Расчёт ориентировочный: стоимость зависит от аукциона, площадки и состояния лота. Таможня считает платежи по курсу на день декларации. Точный расчёт по конкретной машине сделает менеджер.</p>
        <div class="actions">
          <a class="btn btn-red" href="${sendHref}" id="sendCalc">Получить точный расчёт</a>
        </div>
        </div>
      </div>
      </div>
    </div>`;
}
