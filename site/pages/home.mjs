// Главная: дизайн и тексты из new2 + блоки услуг, каталога и блога.
import { calcWidget } from './calc-widget.mjs';

export function homeBody({ u, extra }) {
  return `
<section class="hero">
  <div class="wrap">
    <div class="hero-copy">
      <p class="eyebrow">Copart и IAAI · доставка до Минска</p>
      <h1>Авто из США в Беларусь <mark>под ключ</mark></h1>
      <p class="lead">Пригон авто из Америки: подбор на Copart и IAAI, доставка до Минска и растаможка. Работаем по договору, за машину платите аукциону напрямую, а полную цену до Минска видите до ставки.</p>
      <div class="cta-row">
        <a class="btn btn-red" href="#calc">Посчитать цену до Минска</a>
        <a class="btn btn-line" href="#lead">Подобрать машину</a>
      </div>
      <div class="facts">
        <div><b class="num">9+ лет</b><span>возим авто из США</span></div>
        <div><b class="num">40–70 дней</b><span>от оплаты лота до Минска</span></div>
        <div><b class="num">от 599 BYN</b><span>услуга по договору</span></div>
      </div>
    </div>

    <aside class="guar" aria-label="Три гарантии">
      <div class="guar-head"><p>Три гарантии</p><span>прописаны в договоре</span></div>
      <ol>
        <li>
          <span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 13h6M10 17h4"/></svg></span>
          <div><h3>Официальный договор</h3><p>Офис в Минске, юрлицо в Беларуси. Что мы делаем и сколько это стоит, записано на бумаге.</p></div>
        </li>
        <li>
          <span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/></svg></span>
          <div><h3>За машину платите аукциону сами</h3><p>Деньги за лот уходят банковским переводом напрямую Copart или IAAI. Нам вы платите только за услугу.</p></div>
        </li>
        <li>
          <span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg></span>
          <div><h3>Полная цена до Минска заранее</h3><p>Лот, сборы, доставка, пошлина, утильсбор и наша услуга. Считаем всё до ставки, а не после покупки.</p></div>
        </li>
      </ol>
    </aside>
  </div>
</section>

<section class="calc-sec" id="calc">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Калькулятор</p>
      <h2>Сколько стоит машина в Минске. Все статьи, без звёздочек</h2>
      <p>Введите цену лота, год и объём. Или укажите свой бюджет, и калькулятор скажет, до какой суммы можно ставить на аукционе.</p>
    </div>
    ${calcWidget()}
  </div>
</section>
<section class="white" id="price-inside">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Что входит в цену</p>
      <h2>Каждый платёж видно. И видно, кому он уходит</h2>
      <p>Деньги за машину не проходят через нас. Вы платите каждому участнику напрямую, со своего имени, по его счёту. Нам только фиксированную сумму за услугу.</p>
    </div>
    <div class="inc">
      <article>
        <p class="to"><b>1</b>Аукциону</p>
        <ul>
          <li><strong>Цена лота</strong>Ставка, на которой вы выиграли торги на Copart или IAAI.</li>
          <li><strong>Сборы аукциона</strong>Сбор покупателя, gate fee, оформление документов. Зависят от цены лота.</li>
        </ul>
      </article>
      <article>
        <p class="to"><b>2</b>Перевозчику</p>
        <ul>
          <li><strong>Доставка по США</strong>С площадки аукциона до порта отправки. Зависит от штата.</li>
          <li><strong>Море</strong>Контейнер до Клайпеды или Поти.</li>
          <li><strong>Порт → Минск</strong>Автовоз до таможни в Минске.</li>
        </ul>
      </article>
      <article>
        <p class="to"><b>3</b>Таможне</p>
        <ul>
          <li><strong>Таможенная пошлина</strong>По возрасту машины, объёму двигателя и цене. Для электромобилей отдельные условия.</li>
          <li><strong>Утильсбор, СВХ, декларант</strong>Обязательные платежи при оформлении в Минске.</li>
        </ul>
      </article>
      <article class="ours">
        <p class="to"><b>4</b>Нам</p>
        <ul>
          <li><strong>Услуга по договору</strong>Подбор, проверка, торги, организация доставки и сопровождение до Минска.</li>
          <li><strong>Фиксированная сумма</strong>599, 799 или 1999 BYN по тарифу. Без процента от цены машины.</li>
        </ul>
      </article>
    </div>
    <div class="inc-foot">
      <span><b>Отдельно от расчёта:</b> ремонт повреждений. Его стоимость мы оцениваем по фото и отчёту аукциона до ставки, ремонт можно сделать у нашего партнёрского СТО.</span>
    </div>
  </div>
</section>

<section id="check">
  <div class="wrap check-grid">
    <div class="photos">
      <figure><img src="${u('img/')}nissan-rogue.jpg" alt="Nissan Rogue с повреждением передней части на площадке аукциона" loading="lazy" width="640" height="480"><figcaption>Nissan Rogue · удар спереди</figcaption></figure>
      <figure><img src="${u('img/')}chevrolet-equinox.jpg" alt="Chevrolet Equinox на площадке IAAI" loading="lazy" width="640" height="480"><figcaption>Chevrolet Equinox</figcaption></figure>
      <figure><img src="${u('img/')}alfa-romeo-giulia.jpg" alt="Alfa Romeo Giulia с повреждением двери" loading="lazy" width="640" height="480"><figcaption>Alfa Romeo Giulia · дверь</figcaption></figure>
    </div>
    <div>
      <div class="sec-head" style="margin-bottom:28px">
        <p class="eyebrow">Проверка до ставки</p>
        <h2>Честно о том, что продаётся на аукционе</h2>
        <p>На Copart и IAAI машины чаще всего после страховых случаев, то есть это битые авто из Америки разной степени повреждений. Поэтому мы проверяем лот до того, как вы потратите хоть доллар.</p>
      </div>
      <ul class="ticks">
        <li><div><h3>История по Carfax и AutoCheck</h3><p>Пробег, ДТП, владельцы, сервис. Если история плохая, говорим об этом прямо.</p></div></li>
        <li><div><h3>Фото и отчёт аукциона</h3><p>Смотрим все фото лота и описание повреждений, разбираем, что скрыто за формулировками.</p></div></li>
        <li><div><h3>Оценка ремонта</h3><p>Прикидываем стоимость ремонта с партнёрским СТО и добавляем её к цене до Минска. Если риск высокий, отговорим от покупки.</p></div></li>
        <li><div><h3>Доступ к аукционам без VPN</h3><p>Ставим за вас на Copart и IAAI. Вы видите лот и следите за торгами.</p></div></li>
      </ul>
    </div>
  </div>
</section>

<section class="white" id="compare">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Сравнение</p>
      <h2>Под ключ из США или покупка в Беларуси</h2>
      <p>У каждого пути свои плюсы. Вот в чём разница, без рекламных обещаний.</p>
    </div>
    <div class="cmp" role="table" aria-label="Сравнение способов покупки">
      <div class="cmp-row cmp-h" role="row">
        <div class="k" role="columnheader"></div>
        <div class="us" role="columnheader">Под ключ из США<small>с Amerika.by</small></div>
        <div class="them" role="columnheader">Готовая машина в Беларуси<small>объявления на рынке</small></div>
      </div>
      <div class="cmp-row" role="row">
        <div class="k" role="rowheader">Из чего цена</div>
        <div class="us" role="cell">Цена с аукциона плюс доставка, таможня и услуга. Каждую строку видно в калькуляторе.</div>
        <div class="them" role="cell">Рыночная цена, в которую уже заложены расходы и доход продавца.</div>
      </div>
      <div class="cmp-row" role="row">
        <div class="k" role="rowheader">История машины</div>
        <div class="us" role="cell">Отчёт Carfax и AutoCheck по VIN и фото с аукциона до покупки.</div>
        <div class="them" role="cell">Часто со слов продавца. Историю в США нужно проверять самому.</div>
      </div>
      <div class="cmp-row" role="row">
        <div class="k" role="rowheader">Выбор</div>
        <div class="us" role="cell">Лоты Copart и IAAI по всем США, новые каждый день. Подбираем под бюджет.</div>
        <div class="them" role="cell">Только то, что сейчас продаётся в Беларуси.</div>
      </div>
      <div class="cmp-row" role="row">
        <div class="k" role="rowheader">Состояние</div>
        <div class="us" role="cell">Обычно после страхового случая. Ремонт оцениваем заранее и включаем в бюджет.</div>
        <div class="them" role="cell">Уже на ходу, но как и где ремонтировали, известно не всегда.</div>
      </div>
      <div class="cmp-row" role="row">
        <div class="k" role="rowheader">Срок</div>
        <div class="us" role="cell">40–70 дней от покупки до Минска.</div>
        <div class="them" role="cell">Можно забрать сразу.</div>
      </div>
      <div class="cmp-row" role="row">
        <div class="k" role="rowheader">Защита</div>
        <div class="us" role="cell">Договор с компанией в Минске. За лот платите аукциону напрямую.</div>
        <div class="them" role="cell">Договор купли-продажи с продавцом, часто с частным лицом.</div>
      </div>
    </div>
  </div>
</section>

<section id="how">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Шаги и сроки</p>
      <h2>Где ваша машина и что будет дальше</h2>
      <p>Пять шагов от договора до ключей. На каждом шаге вы знаете, где машина: присылаем фото и номер контейнера, отслеживание по VIN.</p>
    </div>
    <ol class="timeline">
      <li><span class="dot"><b>1</b></span><span class="when">День 1</span><h3>Договор и подбор</h3><p>Обсуждаем бюджет, подписываем договор. В течение часа присылаем до 5 подходящих лотов с расчётом под ключ.</p></li>
      <li><span class="dot"><b>2</b></span><span class="when">До ставки</span><h3>Проверка и торги</h3><p>Carfax, AutoCheck, оценка ремонта. Ставим за вас. После победы вы оплачиваете лот аукциону напрямую.</p></li>
      <li><span class="dot"><b>3</b></span><span class="when">1–2 недели</span><h3>Доставка по США</h3><p>Забираем машину с площадки и везём в порт. Присылаем фото и номер контейнера.</p></li>
      <li><span class="dot"><b>4</b></span><span class="when">4–6 недель</span><h3>Море</h3><p>Контейнер идёт в Клайпеду или Поти. Маршрут зависит от двигателя, подтверждаем при расчёте.</p></li>
      <li><span class="dot"><b>5</b></span><span class="when">Финиш</span><h3>Минск и таможня</h3><p>Привозим на таможню, помогаем с документами и платежами. В тарифе «Премиум» оформляем всё за вас.</p></li>
    </ol>
    <div class="total-time">
      <b class="num">40–70 дней</b>
      <p>Обычный срок от оплаты лота до машины в Минске. Через Поти путь дольше, чем через Клайпеду. Точный срок скажем по вашему лоту.</p>
    </div>
  </div>
</section>

<section class="white" id="logistics">
  <div class="wrap atl">
    <div class="sec-head" style="margin:0">
      <p class="eyebrow">Логистика</p>
      <h2>Логистика: Atlantic Express Corporation</h2>
      <p>Доставку из США организует наш логистический партнёр Atlantic Express Corporation (с 1995 года). Машину забирают с площадки аукциона, грузят в контейнер и отправляют в порт. Оплату за доставку вы переводите напрямую, без посредников.</p>
    </div>
    <div class="atl-card">
      <div class="since"><b class="num">1995</b><span>с этого года работает<br>Atlantic Express Corporation</span></div>
      <div class="path" aria-label="Маршрут"><span>Аукцион в США</span><i>→</i><span>Порт США</span><i>→</i><span>Клайпеда / Поти</span><i>→</i><span>Минск</span></div>
      <div class="routes">
        <div><b>Через Клайпеду</b><span>Литва, через ЕС. Для машин с двигателем до 1,9 л.</span></div>
        <div><b>Через Поти</b><span>Грузия, в обход ЕС. Для машин больше 1,9 л, гибридов и электро.</span></div>
      </div>
    </div>
  </div>
</section>

<section id="prices">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Тарифы</p>
      <h2>Сколько стоит наша работа</h2>
      <p>Фиксированная цена в договоре, оплатить можно через ЕРИП. Выберите по тому, сколько хотите делать сами.</p>
    </div>
    <div class="plans">
      <div class="plan">
        <h3>Проверка лота</h3>
        <p class="for">Для тех, кто уже нашёл машину сам</p>
        <div class="price num">599 <small>BYN</small></div>
        <ul><li>Проверка по Carfax и AutoCheck</li><li>Оценка повреждений и расчёт всех расходов</li><li>Торги на аукционе</li><li>Организация доставки до Минска</li></ul>
        <a class="btn btn-line" href="#lead">Проверить мой лот</a>
      </div>
      <div class="plan hit">
        <span class="tag">Чаще выбирают</span>
        <h3>Подбор</h3>
        <p class="for">Для тех, кто знает бюджет и хочет, чтобы машину нашли</p>
        <div class="price num">799 <small>BYN</small></div>
        <ul><li>Ищем лоты под ваш бюджет</li><li>Консультация эксперта</li><li>Проверка, торги, доставка</li><li>Помощь с запчастями, ремонтом и таможней</li></ul>
        <a class="btn btn-red" href="#lead">Подобрать машину</a>
      </div>
      <div class="plan">
        <h3>Премиум</h3>
        <p class="for">Для тех, кто хочет получить ключи и не заниматься бумагами</p>
        <div class="price num">1999 <small>BYN</small></div>
        <ul><li>Всё из тарифа «Подбор»</li><li>Дополнительный отчёт с аукциона</li><li>Живые торги в любое время</li><li>Оформление на таможне за вас</li></ul>
        <a class="btn btn-line" href="#lead">Выбрать Премиум</a>
      </div>
    </div>
    <p class="plans-note">Доставка, пошлина и сборы в тариф не входят: вы платите их напрямую, суммы видно в калькуляторе.</p>
  </div>
</section>
${extra}
<section id="faq">
  <div class="wrap faq-grid">
    <div class="sec-head" style="margin:0">
      <p class="eyebrow">Вопросы</p>
      <h2>Что обычно спрашивают перед договором</h2>
      <p>Не нашли ответ? Позвоните <a href="tel:+375296332828" class="num" style="font-weight:700;color:var(--ink);white-space:nowrap">+375 (29) 633-28-28</a> или напишите в <a href="https://t.me/amerikaa_by" target="_blank" rel="noopener" style="font-weight:700;color:var(--ink)">Telegram</a>.</p>
    </div>
    <div class="faq">
      <details open><summary>Как я могу быть уверен, что деньги не пропадут?</summary><p>За машину вы платите аукциону напрямую, банковским переводом со своего счёта. За доставку платите перевозчику, пошлину таможне. Нам только фиксированную сумму за услугу по договору. У нас офис в Минске: ул. Большое Стиклево, 83, 3 этаж.</p></details>
      <details><summary>Сколько идёт машина из США в Минск?</summary><p>Обычно 40–70 дней после оплаты лота: около 1–2 недель по США до порта, 4–6 недель морем, затем доставка в Минск. Через Поти путь дольше, чем через Клайпеду.</p></details>
      <details><summary>Почему одни машины едут через Клайпеду, а другие через Поти?</summary><p>Через Евросоюз сейчас можно везти в Беларусь легковые машины с двигателем не больше 1,9 литра. Машины с большим объёмом мы везём через грузинский порт Поти. Электромобили и гибриды обычно тоже идут через Поти. Точный маршрут подтвердим при расчёте.</p></details>
      <details><summary>Могут ли появиться платежи, которых нет в расчёте?</summary><p>В калькуляторе все обязательные статьи: лот, сборы аукциона, доставка, пошлина, утильсбор, СВХ, декларант и наша услуга. Отдельно идёт ремонт повреждений, его мы оцениваем до ставки. Курс валют на день оплаты может немного изменить сумму.</p></details>
      <details><summary>Можно ли купить машину, которую я нашёл сам?</summary><p>Да. Пришлите ссылку на лот или VIN, мы проверим историю и повреждения и посчитаем полную стоимость до ставки. Это тариф «Проверка лота».</p></details>
      <details><summary>Что если машина окажется хуже, чем на фото?</summary><p>Перед ставкой мы проверяем историю по Carfax и AutoCheck, смотрим все фото и отчёт аукциона и оцениваем ремонт. Если риск высокий, честно отговорим от покупки.</p></details>
      <details><summary>Есть ли льготы на растаможку?</summary><p>По Указу № 140 многодетные семьи и инвалиды I и II группы платят 50% таможенных платежей: для легковых авто половину пошлины, для мотоциклов половину пошлины и НДС. Таможенный сбор платится полностью. Для электромобилей действуют отдельные условия и квота, их уточним при расчёте.</p></details>
    </div>
  </div>
</section>
`;
}
